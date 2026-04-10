import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

function requireAdmin(req: Request): any | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  try {
    const decoded: any = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    return decoded.role === 'ADMIN' ? decoded : null;
  } catch {
    return null;
  }
}

// GET /api/admin/stats — aggregate platform statistics
export async function GET(req: Request) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });

  try {
    const [totalUsers, totalTrips, totalItineraries, recentTrips] = await Promise.all([
      prisma.user.count(),
      prisma.trip.count(),
      prisma.itinerary.count(),
      prisma.trip.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          itineraries: { select: { totalCost: true }, take: 1 },
        },
      }),
    ]);

    const topDestinations = await prisma.trip.groupBy({
      by: ['destination'],
      _count: { destination: true },
      orderBy: { _count: { destination: 'desc' } },
      take: 5,
    });

    return NextResponse.json(
      {
        stats: { totalUsers, totalTrips, totalItineraries },
        recentTrips,
        topDestinations: topDestinations.map((d) => ({
          destination: d.destination,
          count: d._count.destination,
        })),
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
