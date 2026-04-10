import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'default');

export async function POST(req: Request) {
  try {
    const { email, destination, itineraryData, tripParams } = await req.json();

    if (!email || !itineraryData) {
      return NextResponse.json({ error: 'Missing email or itinerary data' }, { status: 400 });
    }

    // Build the itinerary HTML sections
    const daysSections = itineraryData.itinerary?.map((day: any) => {
      const activities = day.activities?.map((act: any) => `
        <tr>
          <td style="padding: 16px 20px; border-bottom: 1px solid #1e293b;">
            <div style="display: flex; align-items: flex-start; gap: 16px;">
              <div style="background: #0f766e; color: white; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: bold; white-space: nowrap; min-width: 90px; text-align: center;">${act.time_of_day?.split(' - ')[0] || 'Morning'}</div>
              <div>
                <div style="font-weight: bold; font-size: 16px; color: #f59e0b; margin-bottom: 4px;">${act.place}</div>
                <div style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin-bottom: 8px;">${act.description}</div>
                ${act.historical_significance ? `<div style="background: #1e293b; border-left: 3px solid #f59e0b; padding: 8px 12px; border-radius: 4px; font-size: 13px; color: #94a3b8; margin-bottom: 8px;"><strong style="color: #f59e0b;">✦ Did you know?</strong> ${act.historical_significance}</div>` : ''}
                <div style="display: flex; gap: 16px; flex-wrap: wrap;">
                  ${act.travel_time_from_prev ? `<span style="font-size: 12px; color: #2dd4bf; background: rgba(20,184,166,0.1); padding: 3px 8px; border-radius: 4px;">🚗 ${act.travel_time_from_prev} travel</span>` : ''}
                  ${act.time_to_spend_there ? `<span style="font-size: 12px; color: #60a5fa; background: rgba(59,130,246,0.1); padding: 3px 8px; border-radius: 4px;">⏱ ${act.time_to_spend_there}</span>` : ''}
                  ${act.transport_to_place ? `<span style="font-size: 12px; color: #a78bfa; background: rgba(139,92,246,0.1); padding: 3px 8px; border-radius: 4px;">🚌 ${act.transport_to_place}</span>` : ''}
                </div>
              </div>
            </div>
          </td>
        </tr>
      `).join('') || '';
      
      return `
        <div style="margin-bottom: 32px; background: #0f172a; border-radius: 12px; overflow: hidden; border: 1px solid #1e293b;">
          <div style="background: linear-gradient(135deg, #0f766e, #0e7490); padding: 14px 20px;">
            <h2 style="margin: 0; color: white; font-size: 18px; letter-spacing: 1px;">📅 DAY ${day.day}</h2>
          </div>
          <table style="width: 100%; border-collapse: collapse;">${activities}</table>
        </div>
      `;
    }).join('') || '<p style="color: #94a3b8;">No itinerary data available.</p>';

    // Budget section
    const cost = itineraryData.estimated_cost || {};
    const budgetSection = `
      <div style="background: #0f172a; border-radius: 12px; padding: 24px; border: 1px solid #1e293b; margin-bottom: 24px;">
        <h2 style="color: #2dd4bf; margin-top: 0; font-size: 18px; border-bottom: 1px solid #1e293b; padding-bottom: 12px; margin-bottom: 16px;">💰 Estimated Budget Breakdown</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #1e293b; color: #94a3b8;">🏨 Stay &amp; Accommodation</td><td style="padding: 10px 0; border-bottom: 1px solid #1e293b; color: white; text-align: right; font-weight: bold;">${cost.stay || 'N/A'}</td></tr>
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #1e293b; color: #94a3b8;">🍽️ Food &amp; Dining</td><td style="padding: 10px 0; border-bottom: 1px solid #1e293b; color: white; text-align: right; font-weight: bold;">${cost.food || 'N/A'}</td></tr>
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #1e293b; color: #94a3b8;">🚗 Local Transport</td><td style="padding: 10px 0; border-bottom: 1px solid #1e293b; color: white; text-align: right; font-weight: bold;">${cost.transport || 'N/A'}</td></tr>
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #1e293b; color: #94a3b8;">🎟️ Entry Fees &amp; Activities</td><td style="padding: 10px 0; border-bottom: 1px solid #1e293b; color: white; text-align: right; font-weight: bold;">${cost.entry_fees || 'N/A'}</td></tr>
          <tr><td style="padding: 14px 0 0; color: #f59e0b; font-size: 18px; font-weight: bold;">Total</td><td style="padding: 14px 0 0; color: #f59e0b; text-align: right; font-size: 20px; font-weight: 900;">${cost.total || 'N/A'}</td></tr>
        </table>
      </div>
    `;

    // Gems & Food sections
    const extrasSection = `
      <div style="display: grid; gap: 16px; margin-bottom: 24px;">
        ${itineraryData.hidden_gems?.length ? `
          <div style="background: #0f172a; border-radius: 12px; padding: 20px; border: 1px solid #1e293b;">
            <h3 style="color: #f59e0b; margin-top: 0;">💎 Hidden Gems</h3>
            <ul style="margin: 0; padding-left: 20px;">${itineraryData.hidden_gems.map((g: string) => `<li style="color: #cbd5e1; margin-bottom: 8px;">${g}</li>`).join('')}</ul>
          </div>
        ` : ''}
        ${itineraryData.food_recommendations?.length ? `
          <div style="background: #0f172a; border-radius: 12px; padding: 20px; border: 1px solid #1e293b;">
            <h3 style="color: #fb923c; margin-top: 0;">🍜 Must-Try Food</h3>
            <ul style="margin: 0; padding-left: 20px;">${itineraryData.food_recommendations.map((f: string) => `<li style="color: #cbd5e1; margin-bottom: 8px;">${f}</li>`).join('')}</ul>
          </div>
        ` : ''}
        ${itineraryData.budget_saving_tips?.length ? `
          <div style="background: #0f172a; border-radius: 12px; padding: 20px; border: 1px solid #1e293b;">
            <h3 style="color: #4ade80; margin-top: 0;">💡 Budget Saving Tips</h3>
            <ul style="margin: 0; padding-left: 20px;">${itineraryData.budget_saving_tips.map((t: string) => `<li style="color: #cbd5e1; margin-bottom: 8px;">${t}</li>`).join('')}</ul>
          </div>
        ` : ''}
      </div>
    `;

    const htmlEmail = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NaviBharat - Your ${destination} Itinerary</title>
</head>
<body style="margin: 0; padding: 0; background: #020617; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="max-width: 680px; margin: 0 auto; padding: 24px 16px;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1e293b, #0f172a); border-radius: 16px; padding: 32px; margin-bottom: 24px; border: 1px solid #334155; text-align: center;">
      <div style="font-size: 36px; margin-bottom: 8px;">🧭</div>
      <h1 style="margin: 0 0 8px; color: #f59e0b; font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">NaviBharat</h1>
      <p style="margin: 0 0 16px; color: #94a3b8; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">AI Travel Intelligence</p>
      <div style="background: linear-gradient(135deg, #0f766e, #0891b2); border-radius: 12px; padding: 20px; display: inline-block; width: 100%; box-sizing: border-box;">
        <h2 style="margin: 0 0 4px; color: white; font-size: 24px;">Your Trip to ${destination}</h2>
        <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 14px;">${tripParams?.days || 'Custom'} Days · ${tripParams?.travelStyle || 'Standard'} Style · ${tripParams?.travelers || 1} Traveler(s)</p>
      </div>
    </div>

    <!-- Body -->
    ${daysSections}
    ${budgetSection}
    ${extrasSection}

    <!-- Footer -->
    <div style="text-align: center; padding: 24px; border-top: 1px solid #1e293b;">
      <p style="color: #475569; font-size: 13px; margin: 0 0 4px;">Generated by NaviBharat AI · <a href="http://localhost:3000" style="color: #f59e0b; text-decoration: none;">navibharat.com</a></p>
      <p style="color: #334155; font-size: 12px; margin: 0;">This is a personalized travel plan. Costs are approximate estimates.</p>
    </div>

  </div>
</body>
</html>`;

    const { data, error } = await resend.emails.send({
      from: 'NaviBharat <onboarding@resend.dev>',
      to: [email],
      subject: `🧭 Your ${destination} Itinerary is Ready — NaviBharat`,
      html: htmlEmail,
    });

    if (error) {
      console.error('Resend API error:', error);
      return NextResponse.json({ 
        error: `Email delivery failed: ${error.message}. Note: Resend sandbox only delivers to your registered Resend account email. To send to any email, verify a domain at resend.com/domains.`
      }, { status: 500 });
    }

    console.log('Email sent successfully, ID:', data?.id);
    return NextResponse.json({ message: 'Itinerary sent successfully to ' + email }, { status: 200 });

  } catch (error: any) {
    console.error('Email API Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
