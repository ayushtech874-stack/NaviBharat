import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // 1. Verify Vercel Cron Authentication
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret || authHeader !== \`Bearer \${expectedSecret}\`) {
      return NextResponse.json({ error: 'Unauthorized. Invalid Cron Secret.' }, { status: 401 });
    }

    // Capture dynamic current date
    const now = new Date();

    // 2. Cleanup Old Chat Sessions (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    const obsoleteChats = await prisma.chatSession.deleteMany({
      where: {
        updatedAt: {
          lt: thirtyDaysAgo,
        },
      },
    });

    // 3. Cleanup Old Pending Trips (older than 7 days that possess no itineraries)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    const abandonedTrips = await prisma.trip.deleteMany({
      where: {
        createdAt: {
          lt: sevenDaysAgo,
        },
        itineraries: {
          none: {} // only delete trips that have ZERO itineraries generated
        }
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Automatic Maintenance Complete.',
      deletedChatSessions: obsoleteChats.count,
      deletedEmptyTrips: abandonedTrips.count,
      timestamp: now.toISOString(),
    });
  } catch (error: any) {
    console.error('Maintenance Job Failed:', error);
    return NextResponse.json({ error: 'Failed to run maintenance' }, { status: 500 });
  }
}
