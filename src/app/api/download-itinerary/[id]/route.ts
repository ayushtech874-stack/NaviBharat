import puppeteer from 'puppeteer';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

function verifyToken(req: Request): any | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  try {
    return jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
  } catch {
    return null;
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const decoded = verifyToken(req);
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const trip = await prisma.trip.findUnique({
      where: { id, userId: decoded.id },
      include: { itineraries: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });

    if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    const itinerary = trip.itineraries[0];
    if (!itinerary) return NextResponse.json({ error: 'No itinerary generated yet' }, { status: 404 });

    const itineraryData = typeof itinerary.fullItineraryJson === 'string' 
      ? JSON.parse(itinerary.fullItineraryJson as string) 
      : itinerary.fullItineraryJson as any;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; background: white; padding: 20px; line-height: 1.6; }
          h1 { color: #d97706; border-bottom: 2px solid #fde68a; padding-bottom: 10px; margin-bottom: 30px; font-size: 32px; }
          .summary { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin-bottom: 40px; display: flex; flex-wrap: wrap; gap: 15px; }
          .summary p { margin: 0; min-width: 200px; color: #475569; }
          .day-container { margin-bottom: 40px; page-break-inside: avoid; }
          .day-header { background: #0f172a; color: white; padding: 12px 20px; border-radius: 8px 8px 0 0; font-weight: bold; font-size: 20px; }
          .time-slot { border: 1px solid #e2e8f0; border-top: none; padding: 15px 20px; background: white; }
          .time-slot:last-child { border-radius: 0 0 8px 8px; }
          .time-title { font-weight: bold; color: #d97706; text-transform: capitalize; margin-bottom: 5px; font-size: 18px; }
          
          /* PAGE BREAK CONTEXT HERE */
          .page-break { page-break-before: always; }
          
          .budget-section { background: #ecfdf5; padding: 25px; border-radius: 12px; border: 1px solid #a7f3d0; margin-top: 40px; }
          .budget-item { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px dashed #d1fae5; padding-bottom: 8px; font-size: 16px; }
          .budget-total { font-weight: 900; font-size: 24px; color: #047857; margin-top: 20px; border-bottom: none; padding-top: 10px; border-top: 2px solid #34d399; }
          .footer { margin-top: 60px; text-align: center; color: #94a3b8; font-size: 14px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        </style>
      </head>
      <body>
        <h1>NaviBharat Trip to ${trip.destination}</h1>
        
        <div class="summary">
          <p><strong>Duration:</strong> ${trip.days} Days</p>
          <p><strong>Style:</strong> ${trip.travelStyle}</p>
        </div>

        ${itineraryData.itinerary?.map((day: any) => `
          <div class="day-container">
            <div class="day-header">Day ${day.day} Plan</div>
            ${day.activities?.map((activity: any) => `
              <div class="time-slot">
                <div class="time-title">${activity.time_of_day} - ${activity.place}</div>
                <div style="font-size: 15px;">${activity.description}</div>
                <div style="font-size: 13px; color: #64748b; margin-top: 8px; padding: 6px; background: #f1f5f9; border-radius: 4px;">
                  <b>Travel:</b> ${activity.transport_to_place || activity.travel_time_from_prev} <br/> <b>Duration:</b> ${activity.time_to_spend_there}
                </div>
              </div>
            `).join('')}
          </div>
        `).join('')}

        <!-- SECONDS PAGE: OVERVIEW AND COST BREAKDOWN -->
        <div class="page-break"></div>

        <h1>Trip Overview & Cost Breakdown</h1>
        
        <div class="summary" style="margin-bottom: 20px;">
          <h3 style="width: 100%; margin-top: 0; color: #0f172a;">Source to Destination Transit Options</h3>
          ${itineraryData.transit_options ? itineraryData.transit_options.map((opt: any) => `
            <div style="padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; flex: 1; text-align: center; background: white;">
               <strong style="color: #64748b; display: block;">${opt.mode}</strong>
               <span style="font-size: 20px; font-weight: bold; color: #d97706;">${opt.estimated_cost}</span>
               <div style="font-size: 12px; color: #94a3b8;">${opt.duration}</div>
            </div>
          `).join('') : '<p>No transit approximations listed.</p>'}
          <div style="width: 100%; font-size: 12px; color: #d97706; margin-top: 10px;">* Note: The local budget below DOES NOT include the Source-to-Destination inbound transit cost.</div>
        </div>

        <div class="budget-section">
          <h2 style="margin-top: 0; padding-top: 0; border-bottom: 1px solid #6ee7b7; color: #047857;">Local Estimated Cost Breakdown</h2>
          <div class="budget-item"><span>Stay & Accommodation</span> <span>${itineraryData.estimated_cost?.stay || 'N/A'}</span></div>
          <div class="budget-item"><span>Food & Dining</span> <span>${itineraryData.estimated_cost?.food || 'N/A'}</span></div>
          <div class="budget-item"><span>Local Transport</span> <span>${itineraryData.estimated_cost?.transport || 'N/A'}</span></div>
          <div class="budget-item"><span>Entry Fees</span> <span>${itineraryData.estimated_cost?.entry_fees || 'N/A'}</span></div>
          <div class="budget-item budget-total"><span>Total Local Estimate</span> <span>${itineraryData.estimated_cost?.total || 'N/A'}</span></div>
        </div>

        <div class="footer">
          Generated specially for you by NaviBharat AI.
        </div>
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const uint8ArrayPdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' } });
    const pdfBuffer = Buffer.from(uint8ArrayPdf);
    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="NaviBharat_Itinerary_${trip.destination.replace(/\s+/g, '_')}.pdf"`
      }
    });
  } catch (error: any) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
