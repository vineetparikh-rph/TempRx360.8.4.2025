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

    // First, let's check if the isActive column exists by trying to update a user
    try {
      // Try to update all users to be active and approved
      const updateResult = await prisma.user.updateMany({
        data: {
          isActive: true,
          isApproved: true,
          approvalStatus: 'approved',
          approvedBy: session.user.id,
          approvedAt: new Date()
        }
      });

      console.log(`Updated ${updateResult.count} users to active status`);

      return NextResponse.json({
        success: true,
        message: `Successfully updated ${updateResult.count} users to active status`,
        updatedCount: updateResult.count
      });

    } catch (error) {
      console.error('Migration error:', error);
      
      // If the column doesn't exist, we need to run a raw SQL migration
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        try {
          // Add the isActive column if it doesn't exist
          await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true`;
          
          // Now try the update again
          const updateResult = await prisma.user.updateMany({
            data: {
              isActive: true,
              isApproved: true,
              approvalStatus: 'approved',
              approvedBy: session.user.id,
              approvedAt: new Date()
            }
          });

          return NextResponse.json({
            success: true,
            message: `Added isActive column and updated ${updateResult.count} users to active status`,
            updatedCount: updateResult.count,
            columnAdded: true
          });

        } catch (sqlError) {
          console.error('SQL migration error:', sqlError);
          return NextResponse.json({
            error: 'Failed to add isActive column',
            details: sqlError.message
          }, { status: 500 });
        }
      } else {
        throw error;
      }
    }

  } catch (error) {
    console.error('User status migration error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}