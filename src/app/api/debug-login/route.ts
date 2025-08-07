import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('🔍 Debug login attempt for:', email);
    console.log('🔍 Password provided:', password ? 'YES' : 'NO');
    
    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        userPharmacies: {
          include: { pharmacy: true }
        }
      }
    });
    
    console.log('🔍 User found:', user ? 'YES' : 'NO');
    console.log('🔍 User details:', user ? {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isApproved: user.isApproved,
      approvalStatus: user.approvalStatus,
      hasPassword: !!user.hashedPassword
    } : 'NO USER');
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found',
        debug: { email: email.toLowerCase().trim() }
      }, { status: 404 });
    }
    
    if (!user.hashedPassword) {
      return NextResponse.json({ 
        success: false, 
        error: 'No password set for user',
        debug: { userId: user.id, email: user.email }
      }, { status: 400 });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
    console.log('🔍 Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid password',
        debug: { 
          userId: user.id, 
          email: user.email,
          passwordProvided: password,
          hashedPasswordExists: !!user.hashedPassword
        }
      }, { status: 401 });
    }
    
    // Check approval
    if (!user.isApproved || user.approvalStatus !== 'approved') {
      return NextResponse.json({ 
        success: false, 
        error: 'Account not approved',
        debug: {
          isApproved: user.isApproved,
          approvalStatus: user.approvalStatus
        }
      }, { status: 403 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Login would succeed',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isApproved: user.isApproved,
        approvalStatus: user.approvalStatus,
        pharmacies: user.userPharmacies.map(up => ({
          id: up.pharmacy.id,
          name: up.pharmacy.name,
          code: up.pharmacy.code
        }))
      }
    });
    
  } catch (error) {
    console.error('❌ Debug login error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      debug: { errorMessage: error.message }
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Debug login endpoint is working',
    timestamp: new Date().toISOString()
  });
}