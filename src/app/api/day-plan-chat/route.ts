import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { v4 as uuidv4 } from 'uuid';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'default' });

// In-memory store for chat history just for simplicity right now
// For production, store in DB or Redis.
const memoryStore: Record<string, any[]> = {};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { city, date, presentLocation, messages, sessionId } = body;

    const session = sessionId || uuidv4();
    if (!memoryStore[session]) {
      memoryStore[session] = [
        {
          role: "system",
          content: `You are an expert, alternative local guide for the city of ${city || 'India'}, specializing in offbeat and hidden gems. 
The user wants to plan a day trip on ${date || 'a selected day'}. 
Their starting location is: ${presentLocation || 'Unknown'}.

CRITICAL INSTRUCTIONS:
1. ALWAYS format your responses using bullet points for readability. DO NOT write long paragraphs.
2. FOLLOW THIS STRICT 3-PHASE INTERACTION:
   - PHASE 1 (Vibe Selection): Wait for the user to answer your initial greeting about what vibe they want. (e.g., Historical, Food, Nature, etc., or a custom vibe).
   - PHASE 2 (Proximity Suggestions): Once you know their vibe, suggest 3-4 places fitting that vibe. YOU MUST list them sorted by their estimated distance from the user's starting location (${presentLocation || 'Unknown'}), starting with the closest one first. Mention the estimated distance/transit time and the exact vibe each place offers. Ask them to pick one or type their own.
   - PHASE 3 (Refinement): Once they pick a location, ask exactly ONE follow-up question at a time (e.g., budget, duration, or restaurant preferences) to refine the itinerary details.
   **CRITICAL RULE:** YOU MUST ASK EXACTLY ONE QUESTION AT A TIME. DO NOT ask multiple questions in a single response.
3. NEVER GENERATE A FULL ITINERARY YOURSELF. Your ONLY job is to chat, ask questions, and collect preferences. A separate system will generate the final itinerary later. If the user asks for the itinerary, tell them to click the "Generate Final Plan" button on their screen.
4. STRICT LOCATION BOUNDARY: You must ONLY discuss and suggest places located strictly in or around ${city}. Do not hallucinate or suggest places in other cities (e.g. Bengaluru, Delhi) unless ${city} is that city.
5. PRIORITY ON UNDERRATED GEMS: Actively guide the user away from mainstream social media traps and suggest deeply localized, highly underrated spots.
6. Keep your replies concise, enthusiastic, and highly localized.`
        }
      ];
    }

    // append new messages from the request
    const latestUserMsg = messages[messages.length - 1];
    memoryStore[session].push(latestUserMsg);

    const completion = await groq.chat.completions.create({
      messages: memoryStore[session],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = completion.choices[0]?.message?.content || "Sorry, I couldn't process that.";
    memoryStore[session].push({ role: 'assistant', content: reply });

    return NextResponse.json({ reply, sessionId: session }, { status: 200 });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to chat' },
      { status: 500 }
    );
  }
}
