import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 RESTORING ADMIN USER TO ORIGINAL WORKING STATE...');
    
    // Original working password was admin123
    const originalPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(originalPassword, 12);
    
    // Find the admin user
    let admin = await prisma.user.findUnique({
      where: { email: 'admin@georgiesrx.com' }
    });
    
    if (!admin) {
      // Create admin if doesn't exist (restore original)
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
      console.log('✅ Created admin user with original settings');
    } else {
      // Update existing admin to original working state
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
      console.log('✅ Restored admin user to original working state');
    }
    
    // Ensure admin has access to all pharmacies (original setup)
    const allPharmacies = await prisma.pharmacy.findMany();
    
    if (allPharmacies.length > 0) {
      // Remove existing assignments
      await prisma.userPharmacy.deleteMany({
        where: { userId: admin.id }
      });
      
      // Add all pharmacy assignments (original setup)
      const assignments = allPharmacies.map(pharmacy => ({
        userId: admin.id,
        pharmacyId: pharmacy.id
      }));
      
      await prisma.userPharmacy.createMany({
        data: assignments
      });
      console.log(`✅ Restored admin access to all ${allPharmacies.length} pharmacies`);
    }
    
    // Test the password to make sure it works
    const passwordTest = await bcrypt.compare(originalPassword, admin.hashedPassword);
    
    return NextResponse.json({
      success: true,
      message: 'Admin user restored to original working state',
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
        note: 'These are the original working credentials'
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to restore admin:', error);
    return NextResponse.json({ 
      error: 'Failed to restore admin user',
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST to restore admin user to original working state',
    originalCredentials: {
      email: 'admin@georgiesrx.com',
      password: 'admin123'
    }
  });
}