import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('🔍 Testing auth for:', email);
    
    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userPharmacies: {
          include: { pharmacy: true }
        }
      }
    });
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }
    
    if (!user.hashedPassword) {
      return NextResponse.json({ 
        success: false, 
        error: 'No password set' 
      }, { status: 400 });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
    
    if (!isValidPassword) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid password' 
      }, { status: 401 });
    }
    
    // Check approval
    if (!user.isApproved || user.approvalStatus !== 'approved') {
      return NextResponse.json({ 
        success: false, 
        error: 'User not approved',
        details: {
          isApproved: user.isApproved,
          approvalStatus: user.approvalStatus
        }
      }, { status: 403 });
    }
    
    return NextResponse.json({
      success: true,
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
    console.error('❌ Auth test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}