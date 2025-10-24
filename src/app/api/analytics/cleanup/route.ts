/**
 * Analytics data cleanup cron job
 * Runs daily at 2 AM to clean up old analytics data
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/monitoring/logger';
import { isProduction } from '@/lib/config/production';

export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron job request (Vercel adds this header)
    const authHeader = request.headers.get('authorization');
    if (isProduction && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      logger.warn('Unauthorized analytics cleanup attempt', {
        userAgent: request.headers.get('user-agent'),
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('Starting analytics cleanup job');

    // Delete analytics data older than 1 year
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const [deletedAnalytics, deletedPageViews, deletedSessions] = await Promise.all([
      prisma.analytics.deleteMany({
        where: {
          timestamp: {
            lt: oneYearAgo,
          },
        },
      }),
      prisma.pageView.deleteMany({
        where: {
          timestamp: {
            lt: oneYearAgo,
          },
        },
      }),
      prisma.session.deleteMany({
        where: {
          startTime: {
            lt: oneYearAgo,
          },
        },
      }),
    ]);

    const totalDeleted = 
      deletedAnalytics.count + 
      deletedPageViews.count + 
      deletedSessions.count;

    logger.info('Analytics cleanup completed', {
      deletedAnalytics: deletedAnalytics.count,
      deletedPageViews: deletedPageViews.count,
      deletedSessions: deletedSessions.count,
      totalDeleted,
    });

    return NextResponse.json({
      success: true,
      deleted: {
        analytics: deletedAnalytics.count,
        pageViews: deletedPageViews.count,
        sessions: deletedSessions.count,
        total: totalDeleted,
      },
    });

  } catch (error) {
    logger.error('Analytics cleanup job failed', error as Error);
    
    return NextResponse.json(
      { error: 'Cleanup job failed' },
      { status: 500 }
    );
  }
}

// Also allow POST for manual triggers
export const POST = GET;