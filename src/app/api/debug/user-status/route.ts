import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the specific user we're debugging
    const targetEmail = request.nextUrl.searchParams.get('email') || session.user.email;
    
    // Find the user in database
    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: {
        userPharmacies: {
          include: {
            pharmacy: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all pharmacies for comparison
    const allPharmacies = await prisma.pharmacy.findMany({
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
        isActive: true
      }
    });

    // Get sensor assignments for user's pharmacies
    const pharmacyIds = user.userPharmacies.map(up => up.pharmacyId);
    const sensorAssignments = await prisma.sensorAssignment.findMany({
      where: {
        pharmacyId: { in: pharmacyIds }
      },
      include: {
        pharmacy: true
      }
    });

    // Check session details
    const sessionInfo = {
      sessionUserId: session.user.id,
      sessionUserEmail: session.user.email,
      sessionUserRole: session.user.role,
      targetUserId: user.id,
      targetUserEmail: user.email,
      targetUserRole: user.role
    };

    // Simulate the sensors API logic
    const isAdmin = user.role === 'admin' || user.role === 'ADMIN';
    let apiWouldReturn;

    if (isAdmin) {
      apiWouldReturn = "All sensor assignments (admin view)";
    } else {
      if (user.userPharmacies.length === 0) {
        apiWouldReturn = "ERROR: No pharmacy assignments";
      } else if (sensorAssignments.length === 0) {
        apiWouldReturn = "FALLBACK: Would create demo data";
      } else {
        apiWouldReturn = "SUCCESS: Would return real sensor data";
      }
    }

    return NextResponse.json({
      sessionInfo,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      },
      pharmacyAssignments: user.userPharmacies.map(up => ({
        pharmacyId: up.pharmacyId,
        pharmacyName: up.pharmacy.name,
        pharmacyCity: up.pharmacy.city,
        pharmacyState: up.pharmacy.state,
        assignedAt: up.createdAt
      })),
      sensorAssignments: sensorAssignments.map(sa => ({
        sensorId: sa.sensorId,
        sensorName: sa.sensorName,
        pharmacyName: sa.pharmacy.name,
        location: sa.location,
        isActive: sa.isActive
      })),
      allPharmacies,
      apiAnalysis: {
        userRole: user.role,
        isAdmin,
        pharmacyCount: user.userPharmacies.length,
        sensorAssignmentCount: sensorAssignments.length,
        expectedApiResult: apiWouldReturn
      },
      troubleshooting: {
        hasPharmacyAssignments: user.userPharmacies.length > 0,
        hasSensorAssignments: sensorAssignments.length > 0,
        shouldSeeData: user.userPharmacies.length > 0 || isAdmin,
        potentialIssues: [
          user.userPharmacies.length === 0 ? "No pharmacy assignments" : null,
          !user.isActive ? "User account is inactive" : null,
          user.role !== 'admin' && sensorAssignments.length === 0 ? "No sensor assignments (will use fallback)" : null
        ].filter(Boolean)
      }
    });

  } catch (error) {
    console.error('Debug user status error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}