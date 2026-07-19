const Groq = require("groq-sdk");
require('dotenv').config({ path: 'd:/navibharat/.env.local' });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const itinerary = {
  "transit_options": [
    { "mode": "Flight", "estimated_cost": "₹5000", "duration": "2 hrs" }
  ],
  "itinerary": [
    {
      "day": 1,
      "activities": [
        { "time_of_day": "Morning", "place": "Place 1", "description": "Desc", "historical_significance": "Hist", "transport_to_place": "Walk", "time_to_spend_there": "2 hrs" }
      ]
    }
  ],
  "hidden_gems": ["Gem 1"],
  "top_3_places": [{"name": "Place 1", "reason": "Reason"}],
  "food_recommendations": ["Food 1"],
  "cultural_experiences": ["Culture 1"],
  "budget_saving_tips": ["Tip 1"],
  "estimated_cost": { "stay": "100", "food": "100", "transport": "100", "entry_fees": "100", "total": "400" }
};

const sysPrompt = `You are an AI travel assistant. You are given a current detailed JSON itinerary and a user's prompt asking to tweak or adjust it (e.g. swap an activity, change a restaurant).
You MUST respond ONLY with the newly adjusted JSON object matching the EXACT same structure as the current itinerary.
Even if the user asks a question (like "where is the 3rd day plan"), you MUST STILL output the entire valid JSON itinerary, possibly appending the missing day or addressing their question by modifying the itinerary.
Do not output any markdown code blocks, explanations, or conversational text. ONLY output the valid JSON payload.

Current Itinerary:
${JSON.stringify(itinerary, null, 2)}

User Request: "i already visited all the places on day 1"`;

async function test() {
    try {
        console.log("Calling Groq API...");
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: sysPrompt }],
            model: "llama3-70b-8192",
            temperature: 0.5,
            max_tokens: 5000,
            response_format: { type: "json_object" }
        });
        
        let content = chatCompletion.choices[0]?.message?.content || '{}';
        console.log("Response successful.");
        console.log("Length of response:", content.length);
        console.log(content.slice(0, 500));
        
        JSON.parse(content);
        console.log("Valid JSON!");
    } catch (e) {
        console.error("API Error:", e);
    }
}

test();
