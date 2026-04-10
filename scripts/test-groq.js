require('dotenv').config();
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
  const prompt = `You are a smart travel planner AI. Generate a detailed travel itinerary for:
Source: Mumbai
Destination: Goa
Days: 2
Budget: ₹15000 total for 2 traveler(s)
Preferences: Party, Beach
Travel Style: Standard

You MUST respond ONLY with a valid JSON object matching the exact structure below. Do not include markdown codeblocks or any conversational text.
{
  "itinerary": [
    {
      "day": 1,
      "morning": "string",
      "afternoon": "string",
      "night": "string",
      "places": [
        { "name": "string", "description": "string", "type": "string" }
      ]
    }
  ],
  "hidden_gems": ["string"],
  "food_recommendations": ["string"],
  "cultural_experiences": ["string"],
  "estimated_cost": {
    "stay": "string",
    "food": "string",
    "transport": "string",
    "entry_fees": "string",
    "total": "string"
  }
}`;

  try {
    const response = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    let jsonStr = response.choices[0]?.message?.content || '{}';
    if (jsonStr.trim().startsWith('\`\`\`')) {
      jsonStr = jsonStr.replace(/^\`\`\`(json)?\n?/i, '').replace(/\`\`\`\n?$/i, '').trim();
    }
    
    const parsed = JSON.parse(jsonStr);
    console.log("Success! Generated Valid JSON Structure:");
    console.log(Object.keys(parsed));
    console.log(`Itinerary length: ${parsed.itinerary?.length} days`);
  } catch (err) {
    console.error("Groq generation failed:");
    console.error(err);
  }
}

main();
