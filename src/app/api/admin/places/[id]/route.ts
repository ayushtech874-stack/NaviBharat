import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

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

// PUT /api/admin/places/[id] — update a place
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const { name, city, description, imageUrl, category, avgCost } = await req.json();

    const existing = await prisma.place.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Place not found' }, { status: 404 });
    }

    const updated = await prisma.place.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(city !== undefined && { city }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(category !== undefined && { category }),
        ...(avgCost !== undefined && { avgCost }),
      },
    });

    return NextResponse.json({ place: updated }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// DELETE /api/admin/places/[id] — remove a place
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
  }

  try {
    const { id } = await params;

    const existing = await prisma.place.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Place not found' }, { status: 404 });
    }

    await prisma.place.delete({ where: { id } });

    return NextResponse.json({ message: 'Place deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
