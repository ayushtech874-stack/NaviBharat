import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

/** Verify JWT and confirm the caller is an ADMIN */
function requireAdmin(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;

  const token = authHeader.split(' ')[1];
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'ADMIN') return null;
    return decoded;
  } catch {
    return null;
  }
}

// GET /api/admin/places — list all places (with optional ?city= filter)
export async function GET(req: Request) {
  const admin = requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const city = searchParams.get('city');

  const places = await prisma.place.findMany({
    where: city ? { city: { contains: city, mode: 'insensitive' } } : undefined,
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ places }, { status: 200 });
}

// POST /api/admin/places — create a new place
export async function POST(req: Request) {
  const admin = requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
  }

  try {
    const { name, city, description, imageUrl, category, avgCost } = await req.json();

    if (!name || !city || !description || !category) {
      return NextResponse.json(
        { error: 'name, city, description, and category are required' },
        { status: 400 }
      );
    }

    const place = await prisma.place.create({
      data: {
        name,
        city,
        description,
        imageUrl: imageUrl ?? null,
        category,
        avgCost: avgCost ?? 0,
      },
    });

    return NextResponse.json({ place }, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
