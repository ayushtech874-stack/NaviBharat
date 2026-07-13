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
    const { city, date, presentLocation, vibes, messages, sessionId } = body;

    const session = sessionId || uuidv4();
    if (!memoryStore[session]) {
      memoryStore[session] = [
        {
          role: "system",
          content: `You are an expert local guide for the city of ${city || 'India'}. 
The user wants to plan a day trip on ${date || 'a selected day'}. 
Their vibes/interests: ${vibes && vibes.length > 0 ? vibes.join(', ') : 'General exploration'}.
Their starting location is: ${presentLocation || 'Unknown'}.

CRITICAL INSTRUCTIONS:
1. ALWAYS format your responses using bullet points for readability. DO NOT write long paragraphs.
2. If the user hasn't specified them yet, PROACTIVELY ASK follow-up questions to refine the plan, such as:
   - What is their budget for the day?
   - What type of restaurants do they prefer (expensive, budget-friendly, street food)?
   - How many hours do they want to spend (half day, full day, specific hours)?
3. Keep your replies concise, enthusiastic, and highly localized.`
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
