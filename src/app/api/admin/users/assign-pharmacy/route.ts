import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

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

    const data = await request.json();
    const { userId, pharmacyIds } = data;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!pharmacyIds || !Array.isArray(pharmacyIds) || pharmacyIds.length === 0) {
      return NextResponse.json({ error: 'At least one pharmacy ID is required' }, { status: 400 });
    }

    try {
      // First, remove existing pharmacy assignments for this user
      await prisma.userPharmacy.deleteMany({
        where: { userId: userId }
      });

      // Create new pharmacy assignments
      const pharmacyAssignments = pharmacyIds.map((pharmacyId: string) => ({
        userId: userId,
        pharmacyId: pharmacyId
      }));

      await prisma.userPharmacy.createMany({
        data: pharmacyAssignments
      });

      // Log the assignment
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'ASSIGN_USER_PHARMACY',
          resource: `user:${userId}`,
          metadata: JSON.stringify({
            pharmacyIds: pharmacyIds,
            assignedBy: session.user.email
          })
        }
      });

      return NextResponse.json({
        message: 'User successfully assigned to pharmacies',
        userId: userId,
        pharmacyIds: pharmacyIds
      });

    } catch (dbError) {
      console.error('Database error during pharmacy assignment:', dbError);
      return NextResponse.json({ error: 'Failed to assign user to pharmacies' }, { status: 500 });
    }

  } catch (error) {
    console.error('Failed to assign user to pharmacy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Get user's pharmacy assignments
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {
      const userPharmacies = await prisma.userPharmacy.findMany({
        where: { userId: userId },
        include: {
          pharmacy: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              state: true,
              zipCode: true
            }
          }
        }
      });

      return NextResponse.json({
        userId: userId,
        pharmacies: userPharmacies.map(up => up.pharmacy)
      });

    } catch (dbError) {
      console.error('Database error fetching user pharmacies:', dbError);
      return NextResponse.json({ error: 'Failed to fetch user pharmacies' }, { status: 500 });
    }

  } catch (error) {
    console.error('Failed to fetch user pharmacy assignments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}