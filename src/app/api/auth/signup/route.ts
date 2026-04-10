import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    const resend = new Resend(process.env.RESEND_API_KEY || 'default');
    
    // Send Welcome Email
    try {
      await resend.emails.send({
        from: 'NaviBharat <onboarding@resend.dev>',
        to: email,
        subject: 'Welcome to NaviBharat!',
        html: `<p>Hi ${name},</p><p>Welcome to NaviBharat! We are excited to help you plan your next trip.</p>`
      });
    } catch (e) {
      console.error('Failed to send welcome email', e);
    }

    return NextResponse.json(
      { message: 'User created successfully', token, user: { id: user.id, name: user.name, email: user.email } }, 
      { status: 201 }
    );

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
