import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isApproved: true,
        approvalStatus: true,
        hashedPassword: true
      },
      orderBy: { email: 'asc' }
    });
    
    const userList = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isApproved: user.isApproved,
      approvalStatus: user.approvalStatus,
      hasPassword: !!user.hashedPassword
    }));
    
    return NextResponse.json({
      success: true,
      count: users.length,
      users: userList
    });
    
  } catch (error) {
    console.error('❌ List users error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to list users',
      details: error.message
    }, { status: 500 });
  }
}