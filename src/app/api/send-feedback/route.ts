import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'default');

export async function POST(req: Request) {
  try {
    const { name, feedback } = await req.json();

    if (!name || !feedback) {
      return NextResponse.json({ error: 'Missing name or feedback' }, { status: 400 });
    }

    try {
      await resend.emails.send({
        from: 'NaviBharat Feedback <onboarding@resend.dev>', // Needs to be a verified domain or resend's test domain
        to: 'ayushtech874@gmail.com',
        subject: `New Feedback from ${name}`,
        html: `
          <h3>New User Feedback Received</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Message:</strong></p>
          <blockquote>${feedback}</blockquote>
        `,
      });
    } catch (emailErr) {
      console.error('Resend email failed:', emailErr);
      return NextResponse.json({ error: 'Failed to send feedback email. Check your Resend API Key.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Feedback sent successfully!' }, { status: 200 });
  } catch (error: any) {
    console.error('Feedback API Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
