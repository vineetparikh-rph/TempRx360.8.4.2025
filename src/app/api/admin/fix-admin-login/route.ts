import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    console.log('🔧 Fixing admin login for:', email);

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('👤 User found:', {
      id: user.id,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      approvalStatus: user.approvalStatus,
      hasPassword: !!user.hashedPassword
    });

    // Hash the new password if provided
    let updateData: any = {
      isApproved: true,
      approvalStatus: 'approved',
      approvedAt: new Date()
    };

    // If password is provided, hash and update it
    if (password && password !== 'KEEP_EXISTING') {
      const hashedPassword = await bcrypt.hash(password, 12);
      updateData.hashedPassword = hashedPassword;
      console.log('🔐 Password will be updated');
    }

    // Ensure admin role only for the main admin email
    if (email === 'admin@georgiesrx.com') {
      updateData.role = 'admin';
      console.log('👑 Setting admin role for main admin');
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData
    });

    console.log('✅ User updated successfully');

    // Test password if provided
    let passwordTest = 'Not tested';
    if (password && password !== 'KEEP_EXISTING' && updatedUser.hashedPassword) {
      const isValid = await bcrypt.compare(password, updatedUser.hashedPassword);
      passwordTest = isValid ? 'Valid' : 'Invalid';
    }

    return NextResponse.json({
      success: true,
      message: 'Admin login fixed successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        isApproved: updatedUser.isApproved,
        approvalStatus: updatedUser.approvalStatus,
        passwordTest: passwordTest
      }
    });

  } catch (error) {
    console.error('Fix admin login error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}