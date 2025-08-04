import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Setting up production admin user...');

    // Check if admin already exists
    let admin = await prisma.user.findUnique({
      where: { email: 'admin@georgiesrx.com' }
    });

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