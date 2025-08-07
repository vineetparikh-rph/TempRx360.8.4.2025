import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = session.user.role === 'admin' || session.user.role === 'ADMIN';
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Define the specific users to check/create
    const specificUsers = [
      {
        email: 'familyrx',
        name: 'Family Pharmacy User',
        pharmacies: ['family'],
        defaultPassword: 'family123'
      },
      {
        email: 'parlinrx@gmail.com',
        name: 'Parlin Pharmacy User',
        pharmacies: ['parlin'],
        defaultPassword: 'parlin123'
      },
      {
        email: 'rosemarwa',
        name: 'Rose Marwa',
        pharmacies: ['all'],
        defaultPassword: 'rose123'
      },
      {
        email: 'specialtyrx@stgeorgesrx.com',
        name: 'Specialty Pharmacy User',
        pharmacies: ['specialty'],
        defaultPassword: 'specialty123'
      }
    ];

    // Get all pharmacies for mapping
    const allPharmacies = await prisma.pharmacy.findMany();
    const pharmacyMap = {
      'family': allPharmacies.find(p => p.name.toLowerCase().includes('family'))?.id,
      'parlin': allPharmacies.find(p => p.name.toLowerCase().includes('parlin'))?.id,
      'specialty': allPharmacies.find(p => p.name.toLowerCase().includes('specialty'))?.id,
      'outpatient': allPharmacies.find(p => p.name.toLowerCase().includes('outpatient'))?.id,
      'all': allPharmacies.map(p => p.id)
    };

    const results = {
      usersChecked: 0,
      usersCreated: 0,
      usersUpdated: 0,
      userDetails: [],
      errors: []
    };

    for (const userData of specificUsers) {
      try {
        results.usersChecked++;
        
        // Check if user exists
        let user = await prisma.user.findUnique({
          where: { email: userData.email },
          include: {
            userPharmacies: {
              include: { pharmacy: true }
            }
          }
        });

        let userAction = 'found';
        
        if (!user) {
          // Create the user
          const hashedPassword = await bcrypt.hash(userData.defaultPassword, 12);
          
          user = await prisma.user.create({
            data: {
              email: userData.email,
              name: userData.name,
              role: 'user',
              hashedPassword: hashedPassword,
              isApproved: true,
              approvalStatus: 'approved',
              approvedBy: session.user.id,
              approvedAt: new Date(),
              isActive: true
            },
            include: {
              userPharmacies: {
                include: { pharmacy: true }
              }
            }
          });
          
          results.usersCreated++;
          userAction = 'created';
        } else {
          // Update existing user to ensure they're active and approved
          const updateData: any = {};
          
          if (!user.isApproved) {
            updateData.isApproved = true;
            updateData.approvalStatus = 'approved';
            updateData.approvedBy = session.user.id;
            updateData.approvedAt = new Date();
          }
          
          if (!user.isActive) {
            updateData.isActive = true;
          }
          
          if (Object.keys(updateData).length > 0) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: updateData,
              include: {
                userPharmacies: {
                  include: { pharmacy: true }
                }
              }
            });
            results.usersUpdated++;
            userAction = 'updated';
          }
        }

        // Handle pharmacy assignments
        const targetPharmacyIds = [];
        
        if (userData.pharmacies.includes('all')) {
          targetPharmacyIds.push(...pharmacyMap.all);
        } else {
          for (const pharmacyKey of userData.pharmacies) {
            if (pharmacyMap[pharmacyKey]) {
              if (Array.isArray(pharmacyMap[pharmacyKey])) {
                targetPharmacyIds.push(...pharmacyMap[pharmacyKey]);
              } else {
                targetPharmacyIds.push(pharmacyMap[pharmacyKey]);
              }
            }
          }
        }

        // Get current pharmacy assignments
        const currentPharmacyIds = user.userPharmacies.map(up => up.pharmacyId);
        
        // Check if pharmacy assignments need updating
        const needsPharmacyUpdate = 
          targetPharmacyIds.length !== currentPharmacyIds.length ||
          !targetPharmacyIds.every(id => currentPharmacyIds.includes(id));

        if (needsPharmacyUpdate && targetPharmacyIds.length > 0) {
          // Remove existing assignments
          await prisma.userPharmacy.deleteMany({
            where: { userId: user.id }
          });

          // Create new assignments
          const pharmacyAssignments = targetPharmacyIds.map(pharmacyId => ({
            userId: user.id,
            pharmacyId: pharmacyId
          }));

          await prisma.userPharmacy.createMany({
            data: pharmacyAssignments
          });

          // Refresh user data
          user = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
              userPharmacies: {
                include: { pharmacy: true }
              }
            }
          });
        }

        results.userDetails.push({
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          isApproved: user.isApproved,
          approvalStatus: user.approvalStatus,
          action: userAction,
          pharmacies: user.userPharmacies.map(up => ({
            id: up.pharmacy.id,
            name: up.pharmacy.name
          })),
          defaultPassword: userAction === 'created' ? userData.defaultPassword : 'Not changed'
        });

      } catch (error) {
        console.error(`Error processing user ${userData.email}:`, error);
        results.errors.push({
          email: userData.email,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.usersChecked} users`,
      results: results
    });

  } catch (error) {
    console.error('Check specific users error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}