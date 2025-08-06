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

    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
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

    // Check if there are any userPharmacy records with mismatched user IDs
    const allUserPharmacies = await prisma.userPharmacy.findMany({
      where: {
        user: {
          email: email
        }
      },
      include: {
        user: true,
        pharmacy: true
      }
    });

    // Check for session ID mismatch
    const sessionUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    return NextResponse.json({
      targetUser: {
        id: user.id,
        email: user.email,
        role: user.role,
        pharmacyAssignments: user.userPharmacies.length
      },
      sessionUser: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        dbUser: sessionUser ? {
          id: sessionUser.id,
          email: sessionUser.email,
          role: sessionUser.role
        } : null
      },
      allUserPharmaciesForEmail: allUserPharmacies.map(up => ({
        userId: up.userId,
        userEmail: up.user.email,
        pharmacyId: up.pharmacyId,
        pharmacyName: up.pharmacy.name
      })),
      analysis: {
        userExists: !!user,
        hasPharmacyAssignments: user.userPharmacies.length > 0,
        sessionUserInDb: !!sessionUser,
        sessionIdMatchesTargetId: session.user.id === user.id,
        potentialIssues: [
          !sessionUser ? 'Session user not found in database' : null,
          session.user.id !== user.id && session.user.email === user.email ? 'Session ID mismatch for same email' : null,
          user.userPharmacies.length === 0 ? 'No pharmacy assignments' : null
        ].filter(Boolean)
      }
    });

  } catch (error) {
    console.error('Fix user ID error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}