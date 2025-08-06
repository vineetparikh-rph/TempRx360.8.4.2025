import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    console.log('🚨 FIXING ADMIN USER NOW...');
    
    const adminEmail = 'admin@georgiesrx.com';
    const adminPassword = 'admin123';
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    // Find or create admin user
    let adminUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (adminUser) {
      // Update existing admin user
      adminUser = await prisma.user.update({
        where: { id: adminUser.id },
        data: {
          hashedPassword: hashedPassword,
          role: 'admin',
          isApproved: true,
          approvalStatus: 'approved',
          approvedAt: new Date(),
          isActive: true
        }
      });
      console.log('✅ Updated existing admin user');
    } else {
      // Create new admin user
      adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          name: 'System Administrator',
          role: 'admin',
          hashedPassword: hashedPassword,
          isApproved: true,
          approvalStatus: 'approved',
          approvedAt: new Date(),
          isActive: true
        }
      });
      console.log('✅ Created new admin user');
    }
    
    // Get all pharmacies and assign to admin
    const allPharmacies = await prisma.pharmacy.findMany();
    
    if (allPharmacies.length > 0) {
      // Remove existing assignments
      await prisma.userPharmacy.deleteMany({
        where: { userId: adminUser.id }
      });
      
      // Add all pharmacy assignments
      const assignments = allPharmacies.map(pharmacy => ({
        userId: adminUser.id,
        pharmacyId: pharmacy.id
      }));
      
      await prisma.userPharmacy.createMany({
        data: assignments
      });
      console.log('✅ Assigned admin to all pharmacies');
    }
    
    // Test password
    const passwordTest = await bcrypt.compare(adminPassword, adminUser.hashedPassword);
    
    return NextResponse.json({
      success: true,
      message: 'Admin user fixed successfully',
      admin: {
        email: adminUser.email,
        role: adminUser.role,
        isActive: adminUser.isActive,
        isApproved: adminUser.isApproved,
        approvalStatus: adminUser.approvalStatus,
        passwordTest: passwordTest ? 'VALID' : 'INVALID',
        pharmacyCount: allPharmacies.length
      },
      credentials: {
        email: adminEmail,
        password: adminPassword
      }
    });
    
  } catch (error) {
    console.error('Fix admin error:', error);
    return NextResponse.json({ 
      error: 'Failed to fix admin',
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Use POST to fix admin user' });
}