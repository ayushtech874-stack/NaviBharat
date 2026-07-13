import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'default' });
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

/** Optionally decode the JWT — returns null if missing / invalid (not an error) */
function tryDecodeToken(req: Request): any | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { source, days, budget, travelers, preferences, travel_style } = body;
    const destination = body.destination || (body.places && body.places.map((p: any) => p.name).join(', '));

    // ── 1. Fetch known places from DB for the destination ──────────────────────
    const knownPlaces = destination
      ? await prisma.place.findMany({
          where: { city: { contains: destination } },
        })
      : [];

    const knownPlacesContext =
      knownPlaces.length > 0
        ? `\n\nKNOWN PLACES IN ${destination.toUpperCase()} (use these for cost accuracy):\n` +
          knownPlaces
            .map(
              (p) =>
                `- ${p.name} [${p.category}]: ${p.description} | Avg visit cost: ₹${p.avgCost}`
            )
            .join('\n')
        : '';

    // ── 2. Build AI prompt ─────────────────────────────────────────────────────
    const prompt = `You are a smart travel planner AI. Generate a detailed travel itinerary based on:
Source: ${source || 'Anywhere'}
Destination: ${destination || 'Anywhere'}
Days: ${days || 3}
Budget: ₹${budget || 'Standard'} total for ${travelers || 2} traveler(s)
Preferences: ${preferences ? preferences.join(', ') : 'General Exploration'}
Travel Style: ${travel_style || 'Standard'}
${knownPlacesContext}

RULES:
- ANTI-HALLUCINATION STRICT RULE: DO NOT invent, hallucinate, or make up any places, restaurants, or hotels. ALL locations mentioned MUST be real, verifiable, and currently existing places in the specific destination city. If you do not know enough real places to fill the itinerary, space out the activities or explicitly say "Free time" instead of creating fake names.
- PRIORITIZE KNOWN PLACES when relevant (use Avg visit cost for entry_fees/food).
- PACK EACH DAY with approximately 12 HOURS of engaging activities (usually 4-6 distinct places/events) to ensure a full day of travel.
- For each activity, specify the 'historical_significance' or fun fact, and the 'transport_to_place' method.
- Generate realistic 'transit_options' from Source to Destination (Flight, Train, Bus/Car) with cost approximations.
- Make the 'time_of_day' explicit (e.g., '09:00 AM - Morning').
- All estimated local costs must be in Indian Rupees (₹) and realistic for the budget. (Source-to-Destination travel scale is separate).
- VERY IMPORTANT: Construct the itinerary and 'estimated_cost' so that it utilizes approximately 90% to 100% of the given budget (₹${budget || 'Standard'} per person * ${travelers} travelers = ₹${(budget || 0) * travelers}). DO NOT generate a cheap itinerary if the user provides a high budget. Upgrade hotel styles, recommend premium dining, and include expensive activities if the budget allows!
- Provide realistic 'budget_saving_tips' on how the user could minimize costs and save money everywhere possible, offering clever travel hacks especially tailored to the destination and the chosen Travel Style (Backpacker, Standard, or Luxury).

You MUST respond ONLY with a valid JSON object matching the exact structure below. Do not include markdown codeblocks or any conversational text.
{
  "transit_options": [
    {
      "mode": "string (e.g. Flight, Train, Bus)",
      "estimated_cost": "string",
      "duration": "string"
    }
  ],
  "itinerary": [
    {
      "day": 1,
      "activities": [
        {
          "time_of_day": "string",
          "place": "string",
          "description": "string",
          "historical_significance": "string",
          "transport_to_place": "string (e.g. Approx 1.5 km - 15 min walk from prev)",
          "travel_time_from_prev": "string",
          "time_to_spend_there": "string"
        }
      ]
    }
  ],
  "hidden_gems": ["string"],
  "food_recommendations": ["string"],
  "cultural_experiences": ["string"],
  "budget_saving_tips": ["string"],
  "estimated_cost": {
    "stay": "string",
    "food": "string",
    "transport": "string",
    "entry_fees": "string",
    "total": "string"
  }
}`;

    // ── 3. Call Groq (with fallback for invalid keys) ────────────────────────
    let jsonStr = '';
    try {
      const response = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      let content = response.choices[0]?.message?.content || '{}';
      
      // Safety check: Extract substring from first '{' to last '}'
      const jsonStart = content.indexOf('{');
      const jsonEnd = content.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        jsonStr = content.slice(jsonStart, jsonEnd + 1);
      } else {
        jsonStr = content;
      }
    } catch (apiError) {
      console.warn("Groq API call failed. Using fallback mock data.", apiError);
      jsonStr = JSON.stringify({
        transit_options: [
          { mode: "Flight", estimated_cost: "₹5500", duration: "2 hrs" },
          { mode: "Train", estimated_cost: "₹1500", duration: "12 hrs" },
          { mode: "Bus", estimated_cost: "₹1200", duration: "14 hrs" }
        ],
        itinerary: [
          {
            day: 1,
            activities: [
              { time_of_day: "09:00 AM - Morning", place: "City Central Square", description: `Explore the vibrant local markets and central square of ${destination || 'the city'}.`, historical_significance: "Established centuries ago as the main trading hub.", transport_to_place: "Take a taxi from your hotel", travel_time_from_prev: "0 mins", time_to_spend_there: "2.5 hours" },
              { time_of_day: "12:30 PM - Afternoon", place: "Heritage Museum", description: `Visit the most famous historical landmark in ${destination || 'the city'} and enjoy a local lunch.`, historical_significance: "Houses rare artifacts from the region's ancient dynasties.", transport_to_place: "10 mins rickshaw ride", travel_time_from_prev: "20 mins", time_to_spend_there: "3 hours" },
              { time_of_day: "04:00 PM - Late Afternoon", place: "Botanical Gardens", description: "Take a tranquil afternoon walk in the botanical gardens.", historical_significance: "Features over 500 species of indigenous flora.", transport_to_place: "Short walk from the museum", travel_time_from_prev: "10 mins", time_to_spend_there: "2 hours" },
              { time_of_day: "07:30 PM - Night", place: "Rooftop Restaurant", description: `Relax at a popular rooftop restaurant with views of the city skyline.`, historical_significance: "A modern culinary staple blending traditional and contemporary architecture.", transport_to_place: "Cab back to the city center", travel_time_from_prev: "15 mins", time_to_spend_there: "2.5 hours" }
            ]
          },
          {
            day: 2,
            activities: [
              { time_of_day: "08:00 AM - Morning", place: "Historical Fort", description: "Begin early to beat the crowds at the massive architectural wonder.", historical_significance: "Stood unconquered during three major medieval invasions.", transport_to_place: "Hire a local guide and vehicle", travel_time_from_prev: "30 mins", time_to_spend_there: "4 hours" },
              { time_of_day: "01:00 PM - Afternoon", place: "Cultural Tour & Lunch", description: "Experience an authentic cultural tour and workshop followed by traditional lunch.", historical_significance: "Keeps a 500-year-old weaving tradition alive.", transport_to_place: "Tour bus provided", travel_time_from_prev: "30 mins", time_to_spend_there: "3 hours" },
              { time_of_day: "05:00 PM - Evening", place: "Sunset Point", description: "Watch a breathtaking sunset over the valley.", historical_significance: "Historically used as a watchtower point for incoming caravans.", transport_to_place: "Hike or take a specialized jeep", travel_time_from_prev: "20 mins", time_to_spend_there: "1.5 hours" },
              { time_of_day: "08:00 PM - Night", place: "Street Food Alley", description: "Enjoy a street food walking tour.", historical_significance: "A vibrant market that has evolved over decades.", transport_to_place: "Walking distance from lower town", travel_time_from_prev: "15 mins", time_to_spend_there: "2 hours" }
            ]
          }
        ],
        hidden_gems: ["Secret local cafe tucked in an alleyway", "A quiet sunset viewpoint away from tourists"],
        food_recommendations: ["Spicy local street food", "Traditional homestyle thali/platter"],
        cultural_experiences: ["Attending a local evening ceremony", "Crafting workshop with local artisans"],
        budget_saving_tips: ["Use local buses instead of cabs", "Eat at local dhabas instead of tourist restaurants", "Book attraction tickets online in advance"],
        estimated_cost: {
          stay: `₹${(budget ? Math.round(budget * travelers * 0.4) : 15000).toLocaleString()}`,
          food: `₹${(budget ? Math.round(budget * travelers * 0.3) : 8000).toLocaleString()}`,
          transport: `₹${(budget ? Math.round(budget * travelers * 0.15) : 5000).toLocaleString()}`,
          entry_fees: `₹${(budget ? Math.round(budget * travelers * 0.15) : 3000).toLocaleString()}`,
          total: `₹${(budget ? (budget * travelers) : 31000).toLocaleString()}`
        }
      });
    }

    const itineraryData = JSON.parse(jsonStr);

    // ── 4. Log chat history (fire-and-forget, only if authenticated) ───────────
    const decoded = tryDecodeToken(req);
    if (decoded?.id) {
      try {
        const session = await prisma.chatSession.create({
          data: { userId: decoded.id },
        });
        await prisma.chatMessage.createMany({
          data: [
            { chatSessionId: session.id, role: 'user', content: prompt },
            {
              chatSessionId: session.id,
              role: 'ai',
              content: jsonStr,
            },
          ],
        });
      } catch (logErr) {
        // Non-fatal — log but don't fail the request
        console.error('Failed to log chat history:', logErr);
      }
    }

    return NextResponse.json(itineraryData, { status: 200 });
  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate itinerary' },
      { status: 500 }
    );
  }
}
