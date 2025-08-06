import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    // Get all users and pharmacies
    const [allUsers, allPharmacies] = await Promise.all([
      prisma.user.findMany({
        include: {
          userPharmacies: {
            include: {
              pharmacy: true
            }
          }
        }
      }),
      prisma.pharmacy.findMany()
    ]);

    const results = {
      usersProcessed: 0,
      assignmentsCreated: 0,
      rolesUpdated: 0,
      errors: [],
      userDetails: []
    };

    // Define user-pharmacy assignments
    const userAssignments = {
      'itadmin@georgiesrx.com': ['all'], // All pharmacies (but user role)
      'vinitbparikh@gmail.com': ['specialty'], // Georgies Specialty Pharmacy (but user role)
      'admin@georgiesrx.com': ['all'], // All pharmacies (admin role)
      'user@georgiesrx.com': ['family'], // Georgies Family Pharmacy
      'test@georgiesrx.com': ['parlin'], // Georgies Parlin Pharmacy
      'demo@georgiesrx.com': ['outpatient'], // Georgies Outpatient Pharmacy
      
      // Additional users you mentioned
      'familyrx': ['family'], // Georgies Family Pharmacy
      'parlinrx@gmail.com': ['parlin'], // Georgies Parlin Pharmacy
      'rosemarwa': ['all'], // All pharmacies access
      'specialtyrx@stgeorgesrx.com': ['specialty'] // Georgies Specialty Pharmacy
    };

    for (const user of allUsers) {
      try {
        results.usersProcessed++;
        
        const userEmail = user.email.toLowerCase();
        const assignmentConfig = userAssignments[userEmail];
        
        // Update user role if needed
        let targetRole = 'user';
        if (userEmail === 'admin@georgiesrx.com') {
          targetRole = 'admin';
        }

        // Update user role and status if needed
        const updateData: any = {};
        if (user.role !== targetRole) {
          updateData.role = targetRole;
          results.rolesUpdated++;
        }
        
        // Ensure user is active and approved
        if (!user.isActive) {
          updateData.isActive = true;
        }
        if (!user.isApproved) {
          updateData.isApproved = true;
          updateData.approvalStatus = 'approved';
          updateData.approvedBy = session.user.id;
          updateData.approvedAt = new Date();
        }
        
        // Update user if there are changes
        if (Object.keys(updateData).length > 0) {
          await prisma.user.update({
            where: { id: user.id },
            data: updateData
          });
        }

        // Determine pharmacy assignments
        let pharmaciesToAssign = [];
        
        if (assignmentConfig) {
          if (assignmentConfig.includes('all')) {
            pharmaciesToAssign = allPharmacies;
          } else {
            pharmaciesToAssign = allPharmacies.filter(p => 
              assignmentConfig.includes(p.code)
            );
          }
        } else {
          // Default assignment - assign to specialty pharmacy
          pharmaciesToAssign = allPharmacies.filter(p => p.code === 'specialty');
        }

        // Remove existing assignments
        await prisma.userPharmacy.deleteMany({
          where: { userId: user.id }
        });

        // Create new assignments
        for (const pharmacy of pharmaciesToAssign) {
          await prisma.userPharmacy.create({
            data: {
              userId: user.id,
              pharmacyId: pharmacy.id
            }
          });
          results.assignmentsCreated++;
        }

        results.userDetails.push({
          email: user.email,
          role: targetRole,
          pharmaciesAssigned: pharmaciesToAssign.map(p => p.name),
          assignmentCount: pharmaciesToAssign.length
        });

      } catch (userError) {
        results.errors.push({
          user: user.email,
          error: userError.message
        });
      }
    }

    // Log the operation
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'FIX_ALL_USER_ASSIGNMENTS',
        resource: 'user_pharmacy_assignments',
        metadata: JSON.stringify({
          usersProcessed: results.usersProcessed,
          assignmentsCreated: results.assignmentsCreated,
          rolesUpdated: results.rolesUpdated,
          executedBy: session.user.email,
          timestamp: new Date().toISOString()
        })
      }
    });

    return NextResponse.json({
      success: true,
      message: `Fixed assignments for ${results.usersProcessed} users`,
      results
    });

  } catch (error) {
    console.error('Fix all users error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}