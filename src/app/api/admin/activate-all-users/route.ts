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

    // Update all users to be approved and active
    const updateResult = await prisma.user.updateMany({
      data: {
        isApproved: true,
        approvalStatus: 'approved',
        approvedBy: session.user.id,
        approvedAt: new Date()
      }
    });

    console.log(`Activated ${updateResult.count} users`);

    // Log the operation
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'ACTIVATE_ALL_USERS',
        resource: 'user_management',
        metadata: JSON.stringify({
          usersActivated: updateResult.count,
          executedBy: session.user.email,
          timestamp: new Date().toISOString()
        })
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully activated ${updateResult.count} users`,
      activatedCount: updateResult.count
    });

  } catch (error) {
    console.error('User activation error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}