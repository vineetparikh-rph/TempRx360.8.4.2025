import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
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

    // Get all users with their pharmacy assignments
    const users = await prisma.user.findMany({
      include: {
        userPharmacies: {
          include: {
            pharmacy: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        }
      },
      orderBy: { email: 'asc' }
    });

    // Transform the data for easier reading
    const userList = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive !== undefined ? user.isActive : 'undefined',
      isApproved: user.isApproved,
      approvalStatus: user.approvalStatus,
      hasPassword: !!user.hashedPassword,
      createdAt: user.createdAt.toISOString(),
      pharmacies: user.userPharmacies.map(up => ({
        id: up.pharmacy.id,
        name: up.pharmacy.name,
        code: up.pharmacy.code
      }))
    }));

    // Get pharmacy count for reference
    const pharmacyCount = await prisma.pharmacy.count();

    return NextResponse.json({
      success: true,
      totalUsers: users.length,
      totalPharmacies: pharmacyCount,
      users: userList
    });

  } catch (error) {
    console.error('List all users error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}