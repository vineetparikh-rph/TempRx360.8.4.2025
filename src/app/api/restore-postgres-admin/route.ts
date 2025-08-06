import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Use the PostgreSQL connection directly
const postgresUrl = "postgresql://neondb_owner:npg_qQtsRd68lyrU@ep-lingering-field-ae55l14x-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

export async function POST(request: NextRequest) {
  let prisma: PrismaClient | null = null;
  
  try {
    const { action } = await request.json();

    // Create Prisma client with PostgreSQL URL
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: postgresUrl
        }
      }
    });

    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL');

    if (action === 'create-admin') {
      // Check if admin already exists
      const existingAdmin = await prisma.user.findUnique({
        where: { email: 'admin@georgiesrx.com' }
      });

      if (existingAdmin) {
        return NextResponse.json({
          success: false,
          error: 'Admin user already exists',
          adminId: existingAdmin.id
        });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash('Maya@102$$', 12);

      // Create admin user
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@georgiesrx.com',
          name: 'System Administrator',
          hashedPassword: hashedPassword,
          role: 'admin',
          isApproved: true,
          approvalStatus: 'approved',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      console.log('✅ Created admin user:', adminUser.id);

      // Get or create St. George's Pharmacy
      let stGeorgesPharmacy = await prisma.pharmacy.findFirst({
        where: {
          OR: [
            { name: { contains: 'St. George', mode: 'insensitive' } },
            { name: { contains: 'George', mode: 'insensitive' } },
            { code: 'STG001' }
          ]
        }
      });

      if (!stGeorgesPharmacy) {
        stGeorgesPharmacy = await prisma.pharmacy.create({
          data: {
            name: "St. George's Pharmacy",
            code: 'STG001',
            address: '123 Main Street, City, State 12345',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        console.log('✅ Created St. Georges Pharmacy:', stGeorgesPharmacy.id);
      }

      // Link admin to pharmacy
      const userPharmacy = await prisma.userPharmacy.create({
        data: {
          userId: adminUser.id,
          pharmacyId: stGeorgesPharmacy.id,
          createdAt: new Date()
        }
      });

      console.log('✅ Linked admin to pharmacy:', userPharmacy.id);

      // Test the login
      const testLogin = await bcrypt.compare('Maya@102$$', adminUser.hashedPassword);

      return NextResponse.json({
        success: true,
        message: 'Admin user created successfully in PostgreSQL',
        adminUser: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role,
          isApproved: adminUser.isApproved,
          approvalStatus: adminUser.approvalStatus,
          hasPassword: !!adminUser.hashedPassword,
          passwordTest: testLogin
        },
        pharmacy: {
          id: stGeorgesPharmacy.id,
          name: stGeorgesPharmacy.name,
          code: stGeorgesPharmacy.code
        },
        userPharmacyLink: {
          id: userPharmacy.id,
          linked: true
        }
      });

    } else if (action === 'check-admin') {
      // Check current admin status
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
          error: 'No admin user found'
        });
      }

      // Test password
      const passwordTest = await bcrypt.compare('Maya@102$$', adminUser.hashedPassword || '');

      return NextResponse.json({
        success: true,
        adminUser: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role,
          isApproved: adminUser.isApproved,
          approvalStatus: adminUser.approvalStatus,
          hasPassword: !!adminUser.hashedPassword,
          passwordTest: passwordTest,
          pharmacyCount: adminUser.userPharmacies?.length || 0,
          pharmacies: adminUser.userPharmacies?.map(up => ({
            id: up.pharmacy.id,
            name: up.pharmacy.name,
            code: up.pharmacy.code
          })) || []
        }
      });

    } else if (action === 'delete-admin') {
      // Delete admin user (for testing)
      const adminUser = await prisma.user.findUnique({
        where: { email: 'admin@georgiesrx.com' }
      });

      if (!adminUser) {
        return NextResponse.json({
          success: false,
          error: 'No admin user to delete'
        });
      }

      // Delete user-pharmacy relationships first
      await prisma.userPharmacy.deleteMany({
        where: { userId: adminUser.id }
      });

      // Delete admin user
      await prisma.user.delete({
        where: { id: adminUser.id }
      });

      return NextResponse.json({
        success: true,
        message: 'Admin user deleted successfully'
      });

    } else if (action === 'list-all-users') {
      // List all users in PostgreSQL
      const users = await prisma.user.findMany({
        include: {
          userPharmacies: {
            include: { pharmacy: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return NextResponse.json({
        success: true,
        userCount: users.length,
        users: users.map(user => ({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isApproved: user.isApproved,
          approvalStatus: user.approvalStatus,
          hasPassword: !!user.hashedPassword,
          pharmacyCount: user.userPharmacies?.length || 0,
          pharmacies: user.userPharmacies?.map(up => up.pharmacy.name) || [],
          createdAt: user.createdAt
        }))
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 });

  } catch (error) {
    console.error('PostgreSQL admin restore error:', error);
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

export async function GET() {
  // Just return the available actions
  return NextResponse.json({
    availableActions: [
      'create-admin',
      'check-admin', 
      'delete-admin',
      'list-all-users'
    ],
    instructions: 'Use POST with { "action": "action-name" } to perform actions'
  });
}