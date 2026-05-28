import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

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

// GET /api/auth/me — return the authenticated user's profile
export async function GET(req: Request) {
  const decoded = verifyToken(req);
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true, dateOfBirth: true, gender: true, age: true, occupation: true, biography: true, profilePicUrl: true },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// PUT /api/auth/me — update name, phone, or password
export async function PUT(req: Request) {
  const decoded = verifyToken(req);
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, phone, password, dateOfBirth, gender, age, occupation, biography, profilePicUrl } = await req.json();

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (gender !== undefined) updateData.gender = gender;
    if (occupation !== undefined) updateData.occupation = occupation;
    if (biography !== undefined) updateData.biography = biography;
    if (profilePicUrl !== undefined) updateData.profilePicUrl = profilePicUrl;
    if (age !== undefined) updateData.age = typeof age === 'string' ? parseInt(age) : age;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    if (password) {
      if (password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: decoded.id },
      data: updateData,
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true, dateOfBirth: true, gender: true, age: true, occupation: true, biography: true, profilePicUrl: true },
    });

    return NextResponse.json({ user: updated, message: 'Profile updated' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
