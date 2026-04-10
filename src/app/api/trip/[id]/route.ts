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

// GET /api/trip/[id] — fetch a single trip with itineraries
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const decoded = verifyToken(req);
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const trip = await prisma.trip.findUnique({
      where: { id, userId: decoded.id },
      include: { itineraries: true },
    });

    if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    return NextResponse.json({ trip }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// PUT /api/trip/[id] — update trip metadata (e.g. title, notes)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const decoded = verifyToken(req);
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const { source, destination, days, nights, budget, travelers, preferences, travelStyle } = body;

    const existing = await prisma.trip.findUnique({ where: { id, userId: decoded.id } });
    if (!existing) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

    const updated = await prisma.trip.update({
      where: { id },
      data: {
        ...(source !== undefined && { source }),
        ...(destination !== undefined && { destination }),
        ...(days !== undefined && { days }),
        ...(nights !== undefined && { nights }),
        ...(budget !== undefined && { budget }),
        ...(travelers !== undefined && { travelers }),
        ...(preferences !== undefined && { preferences }),
        ...(travelStyle !== undefined && { travelStyle }),
      },
    });

    return NextResponse.json({ trip: updated }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// DELETE /api/trip/[id] — permanently remove a trip (cascade deletes itineraries)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const decoded = verifyToken(req);
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const existing = await prisma.trip.findUnique({ where: { id, userId: decoded.id } });
    if (!existing) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

    await prisma.trip.delete({ where: { id } });
    return NextResponse.json({ message: 'Trip deleted successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
