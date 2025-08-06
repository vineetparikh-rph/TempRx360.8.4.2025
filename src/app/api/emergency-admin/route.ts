import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password, action } = await request.json();

    // ONLY allow admin@georgiesrx.com
    const adminEmail = 'admin@georgiesrx.com';
    const adminPassword = password || 'admin123';
    
    // Security check - only allow admin@georgiesrx.com
    if (email && email !== 'admin@georgiesrx.com') {
      return NextResponse.json({ error: 'Only admin@georgiesrx.com allowed' }, { status: 403 });
    }

    console.log('🚨 Emergency admin action:', action, 'for:', adminEmail);

    if (action === 'create' || action === 'reset') {
      // Hash the password
      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      // Try to find existing admin user
      let adminUser = await prisma.user.findUnique({
        where: { email: adminEmail }
      });

      if (adminUser) {
        // Update existing user
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

      // Ensure admin has access to all pharmacies
      const allPharmacies = await prisma.pharmacy.findMany();
      
      if (allPharmacies.length > 0) {
        // Remove existing pharmacy assignments
        await prisma.userPharmacy.deleteMany({
          where: { userId: adminUser.id }
        });

        // Add all pharmacy assignments
        const pharmacyAssignments = allPharmacies.map(pharmacy => ({
          userId: adminUser.id,
          pharmacyId: pharmacy.id
        }));

        await prisma.userPharmacy.createMany({
          data: pharmacyAssignments
        });
        console.log('✅ Assigned admin to all pharmacies');
      }

      // Test the password
      const passwordTest = await bcrypt.compare(adminPassword, adminUser.hashedPassword);

      return NextResponse.json({
        success: true,
        message: `Admin user ${action === 'create' ? 'created' : 'reset'} successfully`,
        admin: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role,
          isActive: adminUser.isActive,
          isApproved: adminUser.isApproved,
          approvalStatus: adminUser.approvalStatus,
          passwordTest: passwordTest ? 'Valid' : 'Invalid',
          pharmacyCount: allPharmacies.length
        },
        credentials: {
          email: adminEmail,
          password: adminPassword
        }
      });
    }

    if (action === 'check') {
      // Just check admin status
      const adminUser = await prisma.user.findUnique({
        where: { email: adminEmail },
        include: {
          userPharmacies: {
            include: { pharmacy: true }
          }
        }
      });

      if (!adminUser) {
        return NextResponse.json({
          success: false,
          message: 'Admin user not found',
          exists: false
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Admin user found',
        exists: true,
        admin: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role,
          isActive: adminUser.isActive,
          isApproved: adminUser.isApproved,
          approvalStatus: adminUser.approvalStatus,
          hasPassword: !!adminUser.hashedPassword,
          pharmacies: adminUser.userPharmacies.map(up => up.pharmacy.name)
        }
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Emergency admin error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}