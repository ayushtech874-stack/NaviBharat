import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'default' });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { city, date, presentLocation, chatHistory } = body;

    // We can extract what they discussed from the chat history
    const discussionContext = chatHistory 
      ? chatHistory.map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join('\n')
      : '';

    const prompt = `You are a masterful, alternative local itinerary generator for ${city}.
A user wants a detailed single-day plan for ${date || 'today'}.
Starting Location: ${presentLocation || 'City Center'}

Context from their discussion with the local guide AI (which contains their vibe and preferences):
"""
${discussionContext}
"""

Based on this, generate a highly structured JSON day itinerary.
CRITICAL RULES:
1. STRICT LOCATION BOUNDARY: You MUST ONLY generate places located physically inside or around the exact destination: ${city}. DO NOT hallucinate or generate itineraries for default cities like Bengaluru or Delhi unless the user explicitly chose them.
2. HIDDEN GEMS FIRST: You must prioritize highly underrated gems, offbeat places, localized markets, and places hidden from social media trends. Strongly penalize generic "top 10 tourist traps" unless specifically requested in the context.
3. Rate each place on a scale of 1 to 10 for popularity (e.g. 8.5).
4. Assign one tag to each place: "Must Visit", "Underrated", or "Can be skipped". AT LEAST 60% OF PLACES MUST BE TAGGED "Underrated".
5. Provide deep 'significance' (e.g. "Shot in movie X", "Built by Y in 14th century").
6. Include 'estimated_transit_time' and 'transit_mode' (Auto, Metro, Walk, Cab) from the PREVIOUS place (or from Starting Location for the first place), simulating real-time traffic delays.
7. Include 'opening_hours' and 'ticket_cost' (in ₹).
8. Calculate an 'estimated_budget' strictly based ONLY on place tickets and average local transit fees. Do NOT include food or shopping. You must also include a 'budget_includes' string stating exactly what is included (e.g. "Includes entry tickets and approx local transport. Food/Shopping excluded.")

Output strictly valid JSON matching this schema:
{
  "day_title": "string",
  "estimated_budget": "string (e.g. ₹800)",
  "budget_includes": "string (e.g. Includes entry tickets and approx local transport)",
  "places": [
    {
      "time": "string (e.g. 10:00 AM - 12:30 PM)",
      "name": "string",
      "popularity_rating": number,
      "tag": "Must Visit" | "Underrated" | "Can be skipped",
      "description": "string",
      "significance": "string",
      "transit_from_previous": {
        "mode": "string",
        "duration": "string",
        "traffic_note": "string"
      },
      "opening_hours": "string",
      "ticket_cost": "string (e.g. ₹50 or Free)"
    }
  ]
}`;

    const response = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    let content = response.choices[0]?.message?.content || '{}';
    
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      content = content.slice(jsonStart, jsonEnd + 1);
    }

    const dayPlanData = JSON.parse(content);
    return NextResponse.json(dayPlanData, { status: 200 });
  } catch (error: any) {
    console.error('Day Plan API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate day plan' },
      { status: 500 }
    );
  }
}
