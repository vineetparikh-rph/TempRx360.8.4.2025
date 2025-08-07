import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('🔍 DEBUG AUTH - Testing login for:', email);
    
    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: email },
      include: {
        userPharmacies: {
          include: { pharmacy: true }
        }
      }
    });
    
    const debugInfo = {
      email: email,
      userExists: !!user,
      userDetails: user ? {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isApproved: user.isApproved,
        approvalStatus: user.approvalStatus,
        isActive: user.isActive,
        hasPassword: !!user.hashedPassword,
        pharmacyCount: user.userPharmacies?.length || 0,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      } : null,
      passwordTest: null,
      authFlow: []
    };
    
    debugInfo.authFlow.push('1. User lookup: ' + (user ? 'FOUND' : 'NOT FOUND'));
    
    if (!user) {
      debugInfo.authFlow.push('2. FAILED: User does not exist');
      return NextResponse.json({ success: false, debug: debugInfo });
    }
    
    if (!user.hashedPassword) {
      debugInfo.authFlow.push('2. FAILED: User has no password');
      return NextResponse.json({ success: false, debug: debugInfo });
    }
    
    debugInfo.authFlow.push('2. Password check: User has password');
    
    if (!user.isApproved || user.approvalStatus !== 'approved') {
      debugInfo.authFlow.push('3. FAILED: User not approved - isApproved: ' + user.isApproved + ', status: ' + user.approvalStatus);
      return NextResponse.json({ success: false, debug: debugInfo });
    }
    
    debugInfo.authFlow.push('3. Approval check: PASSED');
    
    // Test password
    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
    debugInfo.passwordTest = isPasswordValid ? 'VALID' : 'INVALID';
    debugInfo.authFlow.push('4. Password test: ' + (isPasswordValid ? 'VALID' : 'INVALID'));
    
    if (!isPasswordValid) {
      debugInfo.authFlow.push('5. FAILED: Invalid password');
      return NextResponse.json({ success: false, debug: debugInfo });
    }
    
    debugInfo.authFlow.push('5. SUCCESS: All checks passed');
    
    return NextResponse.json({ 
      success: true, 
      debug: debugInfo,
      message: 'Authentication should work'
    });
    
  } catch (error) {
    console.error('Debug auth error:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message,
      debug: { authFlow: ['ERROR: ' + error.message] }
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Get all users to see database state
    const allUsers = await prisma.user.findMany({
      include: {
        userPharmacies: {
          include: { pharmacy: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const userSummary = allUsers.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isApproved: user.isApproved,
      approvalStatus: user.approvalStatus,
      isActive: user.isActive,
      hasPassword: !!user.hashedPassword,
      pharmacyCount: user.userPharmacies?.length || 0,
      createdAt: user.createdAt
    }));
    
    return NextResponse.json({
      totalUsers: allUsers.length,
      users: userSummary,
      adminUser: userSummary.find(u => u.email === 'admin@georgiesrx.com') || null
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}