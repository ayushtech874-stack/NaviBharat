import { NextResponse } from 'next/server';
import Groq from "groq-sdk";

export const maxDuration = 60;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'default' });

export async function POST(req: Request) {
  try {
    const { currentItinerary, prompt } = await req.json();

    if (!currentItinerary || !prompt) {
      return NextResponse.json({ error: 'Missing current itinerary or prompt' }, { status: 400 });
    }

    const sysPrompt = `You are an AI travel assistant. You are given a current detailed JSON itinerary and a user's prompt asking to tweak or adjust it (e.g. swap an activity, change a restaurant).
You MUST respond ONLY with the newly adjusted JSON object matching the EXACT same structure as the current itinerary.
Even if the user asks a question (like "where is the 3rd day plan"), you MUST STILL output the entire valid JSON itinerary, possibly appending the missing day or addressing their question by modifying the itinerary.
Do not output any markdown code blocks, explanations, or conversational text. ONLY output the valid JSON payload.

Current Itinerary:
${JSON.stringify(currentItinerary, null, 2)}

User Request: "${prompt}"`;

    let finalJsonStr = '';
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: sysPrompt }],
        model: "llama-3.1-70b-versatile",
        temperature: 0.5,
        max_tokens: 5000,
        response_format: { type: "json_object" }
      });

      let content = chatCompletion.choices[0]?.message?.content || '{}';
      
      const jsonStart = content.indexOf('{');
      const jsonEnd = content.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        finalJsonStr = content.slice(jsonStart, jsonEnd + 1);
      } else {
        finalJsonStr = content;
      }
    } catch (apiErr) {
      console.error("Groq API error during tweak", apiErr);
      return NextResponse.json({ error: 'AI tuning failed. Try again via a different prompt.' }, { status: 502 });
    }

    let newItineraryData = {};
    try {
      newItineraryData = JSON.parse(finalJsonStr);
    } catch (e) {
      console.error("Failed to parse", finalJsonStr, e);
      return NextResponse.json({ error: 'Failed to process AI response' }, { status: 500 });
    }
    
    return NextResponse.json(newItineraryData, { status: 200 });

  } catch (error: any) {
    console.error('Adjust API Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to adjust itinerary' },
      { status: 500 }
    );
  }
}
