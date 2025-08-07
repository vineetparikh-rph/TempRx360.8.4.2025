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

    // Get user's pharmacy assignments
    const userPharmacies = await prisma.userPharmacy.findMany({
      where: { userId: session.user.id },
      include: { pharmacy: true }
    });

    // Get all sensor assignments
    const allSensorAssignments = await prisma.sensorAssignment.findMany({
      include: { pharmacy: true }
    });

    // Get sensor assignments for user's pharmacies
    const pharmacyIds = userPharmacies.map(up => up.pharmacyId);
    const userSensorAssignments = await prisma.sensorAssignment.findMany({
      where: {
        isActive: true,
        pharmacyId: { in: pharmacyIds }
      },
      include: { pharmacy: true }
    });

    // Get all users with pharmacy assignments
    const allUserPharmacies = await prisma.userPharmacy.findMany({
      include: { 
        user: { select: { id: true, email: true, name: true } },
        pharmacy: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json({
      currentUser: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role
      },
      userPharmacies: userPharmacies.map(up => ({
        id: up.pharmacy.id,
        name: up.pharmacy.name,
        code: up.pharmacy.code
      })),
      allSensorAssignments: allSensorAssignments.length,
      userSensorAssignments: userSensorAssignments.length,
      allUserPharmacyAssignments: allUserPharmacies.map(upa => ({
        user: upa.user.email,
        pharmacy: upa.pharmacy.name
      }))
    });

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}