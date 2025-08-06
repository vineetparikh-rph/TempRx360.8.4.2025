import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Use the PostgreSQL connection directly
const postgresUrl = "postgresql://neondb_owner:npg_qQtsRd68lyrU@ep-lingering-field-ae55l14x-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

export async function GET() {
  let prisma: PrismaClient | null = null;
  
  try {
    // Create Prisma client with PostgreSQL URL
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: postgresUrl
        }
      }
    });

    console.log('🔍 Connecting to PostgreSQL database...');

    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL');

    // Get database info
    const dbInfo = {
      connectionStatus: 'CONNECTED',
      databaseType: 'PostgreSQL',
      timestamp: new Date().toISOString()
    };

    // Check all tables and their data
    const inspection = {
      users: {
        count: 0,
        data: [],
        error: null
      },
      pharmacies: {
        count: 0,
        data: [],
        error: null
      },
      userPharmacies: {
        count: 0,
        data: [],
        error: null
      },
      sensors: {
        count: 0,
        data: [],
        error: null
      },
      policies: {
        count: 0,
        data: [],
        error: null
      },
      reports: {
        count: 0,
        data: [],
        error: null
      }
    };

    // Inspect Users table
    try {
      const users = await prisma.user.findMany({
        include: {
          userPharmacies: {
            include: {
              pharmacy: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      inspection.users.count = users.length;
      inspection.users.data = users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isApproved: user.isApproved,
        approvalStatus: user.approvalStatus,
        isActive: user.isActive,
        hasPassword: !!user.hashedPassword,
        pharmacyCount: user.userPharmacies?.length || 0,
        pharmacies: user.userPharmacies?.map(up => up.pharmacy.name) || [],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }));
    } catch (error) {
      inspection.users.error = error.message;
    }

    // Inspect Pharmacies table
    try {
      const pharmacies = await prisma.pharmacy.findMany({
        include: {
          userPharmacies: true,
          sensors: true
        },
        orderBy: { name: 'asc' }
      });
      
      inspection.pharmacies.count = pharmacies.length;
      inspection.pharmacies.data = pharmacies.map(pharmacy => ({
        id: pharmacy.id,
        name: pharmacy.name,
        code: pharmacy.code,
        address: pharmacy.address,
        userCount: pharmacy.userPharmacies?.length || 0,
        sensorCount: pharmacy.sensors?.length || 0,
        createdAt: pharmacy.createdAt
      }));
    } catch (error) {
      inspection.pharmacies.error = error.message;
    }

    // Inspect UserPharmacies table
    try {
      const userPharmacies = await prisma.userPharmacy.findMany({
        include: {
          user: true,
          pharmacy: true
        }
      });
      
      inspection.userPharmacies.count = userPharmacies.length;
      inspection.userPharmacies.data = userPharmacies.map(up => ({
        id: up.id,
        userId: up.userId,
        pharmacyId: up.pharmacyId,
        userEmail: up.user.email,
        pharmacyName: up.pharmacy.name,
        createdAt: up.createdAt
      }));
    } catch (error) {
      inspection.userPharmacies.error = error.message;
    }

    // Inspect Sensors table
    try {
      const sensors = await prisma.sensor.findMany({
        include: {
          pharmacy: true
        },
        orderBy: { createdAt: 'desc' }
      });
      
      inspection.sensors.count = sensors.length;
      inspection.sensors.data = sensors.map(sensor => ({
        id: sensor.id,
        name: sensor.name,
        type: sensor.type,
        status: sensor.status,
        pharmacyName: sensor.pharmacy?.name || 'No Pharmacy',
        lastReading: sensor.lastReading,
        createdAt: sensor.createdAt
      }));
    } catch (error) {
      inspection.sensors.error = error.message;
    }

    // Inspect Policies table
    try {
      const policies = await prisma.policy.findMany({
        orderBy: { createdAt: 'desc' }
      });
      
      inspection.policies.count = policies.length;
      inspection.policies.data = policies.map(policy => ({
        id: policy.id,
        title: policy.title,
        category: policy.category,
        status: policy.status,
        version: policy.version,
        createdAt: policy.createdAt
      }));
    } catch (error) {
      inspection.policies.error = error.message;
    }

    // Inspect Reports table
    try {
      const reports = await prisma.report.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10 // Limit to recent reports
      });
      
      inspection.reports.count = reports.length;
      inspection.reports.data = reports.map(report => ({
        id: report.id,
        title: report.title,
        type: report.type,
        status: report.status,
        createdAt: report.createdAt
      }));
    } catch (error) {
      inspection.reports.error = error.message;
    }

    // Find admin user specifically
    const adminUser = inspection.users.data.find(user => 
      user.email === 'admin@georgiesrx.com' || user.role === 'admin'
    );

    return NextResponse.json({
      success: true,
      database: dbInfo,
      inspection: inspection,
      adminUser: adminUser || null,
      summary: {
        totalUsers: inspection.users.count,
        totalPharmacies: inspection.pharmacies.count,
        totalSensors: inspection.sensors.count,
        totalPolicies: inspection.policies.count,
        totalReports: inspection.reports.count,
        hasAdminUser: !!adminUser,
        adminUserStatus: adminUser ? {
          approved: adminUser.isApproved,
          hasPassword: adminUser.hasPassword,
          pharmacies: adminUser.pharmacyCount
        } : null
      }
    });

  } catch (error) {
    console.error('PostgreSQL inspection error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

export async function POST(request: NextRequest) {
  const { action } = await request.json();
  
  if (action === 'test-admin-login') {
    let prisma: PrismaClient | null = null;
    
    try {
      prisma = new PrismaClient({
        datasources: {
          db: {
            url: postgresUrl
          }
        }
      });

      await prisma.$connect();

      // Test admin login
      const adminUser = await prisma.user.findUnique({
        where: { email: 'admin@georgiesrx.com' },
        include: {
          userPharmacies: {
            include: { pharmacy: true }
          }
        }
      });

      if (!adminUser) {
        return NextResponse.json({
          success: false,
          error: 'Admin user not found'
        });
      }

      // Test password with bcrypt
      const bcrypt = require('bcryptjs');
      const isPasswordValid = await bcrypt.compare('Maya@102$$', adminUser.hashedPassword);

      return NextResponse.json({
        success: true,
        adminTest: {
          userExists: true,
          hasPassword: !!adminUser.hashedPassword,
          passwordValid: isPasswordValid,
          isApproved: adminUser.isApproved,
          approvalStatus: adminUser.approvalStatus,
          role: adminUser.role,
          pharmacyCount: adminUser.userPharmacies?.length || 0
        }
      });

    } catch (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    } finally {
      if (prisma) {
        await prisma.$disconnect();
      }
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}