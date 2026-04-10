import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    const resend = new Resend(process.env.RESEND_API_KEY || 'default');
    
    // Send Login Email
    try {
      await resend.emails.send({
        from: 'NaviBharat <security@resend.dev>',
        to: user.email,
        subject: 'New Login Detected',
        html: `<p>Hi ${user.name},</p><p>We detected a new login to your NaviBharat account.</p>`
      });
    } catch (e) {
      console.error('Failed to send login email', e);
    }

    return NextResponse.json(
      { message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email } },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
