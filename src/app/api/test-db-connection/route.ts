import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing database connection...');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 20));
    
    // Test basic connection
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful');
    
    // Check if User table exists
    let userTableExists = false;
    let userCount = 0;
    try {
      userCount = await prisma.user.count();
      userTableExists = true;
      console.log(`✅ User table exists with ${userCount} users`);
    } catch (error) {
      console.log('❌ User table does not exist:', error);
    }
    
    // Check if Pharmacy table exists
    let pharmacyTableExists = false;
    let pharmacyCount = 0;
    try {
      pharmacyCount = await prisma.pharmacy.count();
      pharmacyTableExists = true;
      console.log(`✅ Pharmacy table exists with ${pharmacyCount} pharmacies`);
    } catch (error) {
      console.log('❌ Pharmacy table does not exist:', error);
    }
    
    // List all tables
    let tables = [];
    try {
      tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `;
      console.log('📋 Tables in database:', tables);
    } catch (error) {
      console.log('❌ Could not list tables:', error);
    }
    
    return NextResponse.json({
      success: true,
      connection: 'successful',
      environment: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? 'set' : 'not set',
      databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20),
      userTable: {
        exists: userTableExists,
        count: userCount
      },
      pharmacyTable: {
        exists: pharmacyTableExists,
        count: pharmacyCount
      },
      tables: tables
    });
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? 'set' : 'not set'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}