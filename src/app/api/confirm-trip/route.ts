import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
const resend = new Resend(process.env.RESEND_API_KEY || 'default');
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.split(' ')[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
    }

    const { tripData, itineraryData } = await req.json();

    // 1. Save Trip to DB
    const trip = await prisma.trip.create({
      data: {
        userId: decoded.id,
        source: tripData.source || 'Unknown',
        destination: tripData.destination || 'Unknown',
        days: tripData.days || 1,
        nights: tripData.nights || 1,
        budget: tripData.budget || 0,
        travelers: tripData.travelers || 1,
        preferences: Array.isArray(tripData.preferences) ? tripData.preferences.join(', ') : (tripData.preferences || ''),
        travelStyle: tripData.travelStyle || 'Standard',
      }
    });

    // 2. Save Itinerary to DB
    const totalCostRaw = itineraryData.estimated_cost?.total || "0";
    const firstCostPart = totalCostRaw.split('-')[0].replace(/\D/g, '');
    const totalCost = Math.min(parseInt(firstCostPart, 10) || 0, 2000000000);

    // PDF generation removed for Vercel compatibility.
    const mockPdfUrl = 'https://navibharat.temp/pdf/placeholder.pdf';

    const itinerary = await prisma.itinerary.create({
      data: {
        tripId: trip.id,
        fullItineraryJson: itineraryData,
        totalCost,
        pdfUrl: mockPdfUrl
      }
    });

    // 3. Send Email via Resend (Only if a real API key is configured)
    if (decoded.email && process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'default') {
      resend.emails.send({
        from: 'NaviBharat <onboarding@resend.dev>',
        to: decoded.email,
        subject: 'Your NaviBharat Itinerary is Confirmed!',
        html: `<p>Hi there,</p>
               <p>Your trip to <strong>${trip.destination}</strong> is fully planned and confirmed.</p>
               <p>You can view your detailed timeline on your dashboard.</p>
               <br/>
               <p>Safe travels,<br/>The NaviBharat Team</p>`,
      }).catch(err => console.error("Silent email fail:", err));
    }

    return NextResponse.json({ message: 'Trip Confirmed successfully', tripId: trip.id }, { status: 200 });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
