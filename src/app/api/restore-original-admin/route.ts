import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 RESTORING ADMIN WITH ORIGINAL PASSWORD Maya@102$$...');
    
    // The REAL original password
    const originalPassword = 'Maya@102$$';
    const hashedPassword = await bcrypt.hash(originalPassword, 12);
    
    // Find the admin user
    let admin = await prisma.user.findUnique({
      where: { email: 'admin@georgiesrx.com' },
      include: {
        userPharmacies: {
          include: { pharmacy: true }
        }
      }
    });
    
    console.log('Current admin user state:', {
      exists: !!admin,
      id: admin?.id,
      email: admin?.email,
      role: admin?.role,
      isApproved: admin?.isApproved,
      approvalStatus: admin?.approvalStatus,
      hasPassword: !!admin?.hashedPassword,
      pharmacyCount: admin?.userPharmacies?.length || 0
    });
    
    if (!admin) {
      // Create admin if doesn't exist with ORIGINAL password
      admin = await prisma.user.create({
        data: {
          email: 'admin@georgiesrx.com',
          name: 'System Administrator',
          hashedPassword: hashedPassword,
          role: 'admin',
          isApproved: true,
          approvalStatus: 'approved',
          approvedAt: new Date(),
          isActive: true,
          firstName: 'System',
          lastName: 'Administrator',
          organization: 'Georgies Pharmacy',
          position: 'System Administrator'
        }
      });
      console.log('✅ Created admin user with ORIGINAL password Maya@102$$');
    } else {
      // Update existing admin to ORIGINAL password
      admin = await prisma.user.update({
        where: { id: admin.id },
        data: {
          hashedPassword: hashedPassword,
          role: 'admin',
          isApproved: true,
          approvalStatus: 'approved',
          approvedAt: new Date(),
          isActive: true,
          name: 'System Administrator',
          firstName: 'System',
          lastName: 'Administrator',
          organization: 'Georgies Pharmacy',
          position: 'System Administrator',
          mustChangePassword: false,
          resetToken: null,
          resetTokenExpiry: null
        }
      });
      console.log('✅ Restored admin user with ORIGINAL password Maya@102$$');
    }
    
    // Ensure admin has access to all pharmacies
    const allPharmacies = await prisma.pharmacy.findMany();
    
    if (allPharmacies.length > 0) {
      // Remove existing assignments
      await prisma.userPharmacy.deleteMany({
        where: { userId: admin.id }
      });
      
      // Add all pharmacy assignments
      const assignments = allPharmacies.map(pharmacy => ({
        userId: admin.id,
        pharmacyId: pharmacy.id
      }));
      
      await prisma.userPharmacy.createMany({
        data: assignments
      });
      console.log(`✅ Restored admin access to all ${allPharmacies.length} pharmacies`);
    }
    
    // Test the ORIGINAL password
    const passwordTest = await bcrypt.compare(originalPassword, admin.hashedPassword);
    
    // Also check if there are any other users that might be causing issues
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isApproved: true,
        approvalStatus: true,
        name: true
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Admin user restored with ORIGINAL password Maya@102$$',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        isActive: admin.isActive,
        isApproved: admin.isApproved,
        approvalStatus: admin.approvalStatus,
        passwordTest: passwordTest ? 'WORKING' : 'FAILED',
        pharmacyCount: allPharmacies.length
      },
      originalCredentials: {
        email: 'admin@georgiesrx.com',
        password: originalPassword,
        note: 'ORIGINAL password restored - Maya@102$$'
      },
      databaseInfo: {
        totalUsers: allUsers.length,
        users: allUsers
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to restore admin with original password:', error);
    return NextResponse.json({ 
      error: 'Failed to restore admin user with original password',
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Check current database state
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@georgiesrx.com' },
      include: {
        userPharmacies: {
          include: { pharmacy: true }
        }
      }
    });
    
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isApproved: true,
        approvalStatus: true,
        name: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({ 
      message: 'Current database state',
      admin: admin ? {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        isApproved: admin.isApproved,
        approvalStatus: admin.approvalStatus,
        hasPassword: !!admin.hashedPassword,
        pharmacyCount: admin.userPharmacies?.length || 0
      } : null,
      allUsers: allUsers,
      originalCredentials: {
        email: 'admin@georgiesrx.com',
        password: 'Maya@102$$'
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check database state',
      details: error.message 
    }, { status: 500 });
  }
}