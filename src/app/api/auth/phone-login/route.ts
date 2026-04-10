import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    if (!otp) {
      // Simulate sending OTP
      return NextResponse.json({ message: 'OTP sent successfully to ' + phone }, { status: 200 });
    }

    // If OTP is provided, verify it (mocking verification true if otp === '123456')
    if (otp !== '123456') {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 });
    }

    // Find or create user by phone
    // Note: phone is not unique in prisma schema currently, so findFirst
    let user = await prisma.user.findFirst({ where: { phone } });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: 'Phone User',
          email: `${phone.replace(/\D/g, '')}@navibharat.temp`, // Fake email
          phone,
        }
      });
    }

    const token = jwt.sign({ id: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: '7d' });

    return NextResponse.json(
      { message: 'Phone login successful', token, user: { id: user.id, name: user.name, phone: user.phone } },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
