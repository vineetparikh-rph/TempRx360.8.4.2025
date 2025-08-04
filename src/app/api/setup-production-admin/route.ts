import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Setting up production admin user...');

    // First, ensure database is initialized
    console.log('📊 Initializing database...');
    try {
      await prisma.$executeRaw`PRAGMA journal_mode=WAL;`;
      await prisma.$executeRaw`PRAGMA synchronous=NORMAL;`;
      await prisma.$executeRaw`PRAGMA cache_size=1000000;`;
      await prisma.$executeRaw`PRAGMA foreign_keys=true;`;
      await prisma.$executeRaw`PRAGMA temp_store=memory;`;
    } catch (pragmaError) {
      console.log('⚠️ PRAGMA commands failed (might not be SQLite):', pragmaError);
    }

    // Test database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Database connection successful');
    } catch (connectionError) {
      console.error('❌ Database connection failed:', connectionError);
      
      // Try to create tables if they don't exist
      console.log('🔨 Attempting to create database schema...');
      try {
        await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT,
          "email" TEXT NOT NULL UNIQUE,
          "emailVerified" DATETIME,
          "image" TEXT,
          "hashedPassword" TEXT,
          "role" TEXT NOT NULL DEFAULT 'technician',
          "isApproved" BOOLEAN NOT NULL DEFAULT false,
          "approvalStatus" TEXT NOT NULL DEFAULT 'pending',
          "approvedBy" TEXT,
          "approvedAt" DATETIME,
          "rejectedReason" TEXT,
          "firstName" TEXT,
          "lastName" TEXT,
          "phoneNumber" TEXT,
          "organization" TEXT,
          "position" TEXT,
          "requestReason" TEXT,
          "resetToken" TEXT,
          "resetTokenExpiry" DATETIME,
          "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`;
        console.log('✅ User table created');
      } catch (createError) {
        console.error('❌ Failed to create tables:', createError);
        return NextResponse.json({ 
          error: 'Database initialization failed',
          details: createError instanceof Error ? createError.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    // Check if admin already exists
    let admin;
    try {
      admin = await prisma.user.findUnique({
        where: { email: 'admin@georgiesrx.com' }
      });
    } catch (findError) {
      console.log('⚠️ Could not find admin user, will create new one');
      admin = null;
    }

    const hashedPassword = await bcrypt.hash('admin123', 12);

    if (admin) {
      // Update existing admin
      admin = await prisma.user.update({
        where: { email: 'admin@georgiesrx.com' },
        data: {
          hashedPassword,
          isApproved: true,
          approvalStatus: 'approved',
          mustChangePassword: false,
          resetToken: null,
          resetTokenExpiry: null,
          role: 'admin',
          name: 'System Administrator',
          firstName: 'System',
          lastName: 'Administrator',
          organization: 'Georgies Pharmacy',
          position: 'System Administrator'
        }
      });
      console.log('✅ Updated existing admin user');
    } else {
      // Create new admin
      admin = await prisma.user.create({
        data: {
          email: 'admin@georgiesrx.com',
          name: 'System Administrator',
          hashedPassword,
          role: 'admin',
          isApproved: true,
          approvalStatus: 'approved',
          mustChangePassword: false,
          firstName: 'System',
          lastName: 'Administrator',
          organization: 'Georgies Pharmacy',
          position: 'System Administrator'
        }
      });
      console.log('✅ Created new admin user');
    }

    // Ensure admin has access to all pharmacies
    const pharmacies = await prisma.pharmacy.findMany();
    console.log(`🏥 Found ${pharmacies.length} pharmacies`);

    // Remove existing pharmacy assignments
    await prisma.userPharmacy.deleteMany({
      where: { userId: admin.id }
    });

    // Add admin to all pharmacies
    for (const pharmacy of pharmacies) {
      await prisma.userPharmacy.create({
        data: {
          userId: admin.id,
          pharmacyId: pharmacy.id
        }
      });
    }

    console.log(`✅ Admin assigned to ${pharmacies.length} pharmacies`);

    return NextResponse.json({
      success: true,
      message: 'Production admin user setup complete',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        isApproved: admin.isApproved,
        approvalStatus: admin.approvalStatus,
        pharmacyCount: pharmacies.length
      },
      credentials: {
        email: 'admin@georgiesrx.com',
        password: 'admin123'
      }
    });

  } catch (error) {
    console.error('❌ Error setting up admin:', error);
    return NextResponse.json({ 
      error: 'Failed to setup admin user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}