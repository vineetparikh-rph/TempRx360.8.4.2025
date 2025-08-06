import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic environment check
    const envCheck = {
      nodeEnv: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      databaseUrlPreview: process.env.DATABASE_URL?.substring(0, 50) + '...',
      nextauthUrl: process.env.NEXTAUTH_URL ? 'SET' : 'NOT SET',
      nextauthSecret: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
      vercelEnv: process.env.VERCEL_ENV || 'NOT SET',
      timestamp: new Date().toISOString()
    };

    // Try to import Prisma
    let prismaStatus = 'NOT TESTED';
    let dbConnectionStatus = 'NOT TESTED';
    
    try {
      const { prisma } = await import('@/lib/prisma');
      prismaStatus = 'IMPORTED';
      
      // Try a simple database query
      await prisma.$queryRaw`SELECT 1`;
      dbConnectionStatus = 'CONNECTED';
    } catch (prismaError) {
      prismaStatus = 'IMPORT FAILED: ' + prismaError.message;
      dbConnectionStatus = 'CONNECTION FAILED: ' + prismaError.message;
    }

    return NextResponse.json({
      status: 'OK',
      environment: envCheck,
      prisma: prismaStatus,
      database: dbConnectionStatus,
      message: 'Health check completed'
    });

  } catch (error) {
    return NextResponse.json({
      status: 'ERROR',
      error: error.message,
      stack: error.stack,
      message: 'Health check failed'
    }, { status: 500 });
  }
}

export async function POST() {
  return GET(); // Same as GET for simplicity
}