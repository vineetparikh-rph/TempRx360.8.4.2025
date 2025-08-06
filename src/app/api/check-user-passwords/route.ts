import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('🔍 Checking password for:', email);
    
    // Find user in database (case-insensitive)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        email: true,
        name: true,
        hashedPassword: true,
        isApproved: true,
        approvalStatus: true
      }
    });
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found',
        debug: { email: email.toLowerCase().trim() }
      });
    }
    
    if (!user.hashedPassword) {
      return NextResponse.json({ 
        success: false, 
        error: 'User has no password set',
        debug: { 
          email: user.email,
          name: user.name,
          hasPassword: false
        }
      });
    }
    
    // Test the password
    const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
    
    // Also test common passwords
    const testPasswords = ['admin123', 'manager123', 'staff123', 'pharmacy123'];
    const passwordTests = {};
    
    for (const testPwd of testPasswords) {
      passwordTests[testPwd] = await bcrypt.compare(testPwd, user.hashedPassword);
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isApproved: user.isApproved,
        approvalStatus: user.approvalStatus
      },
      passwordCheck: {
        providedPassword: password,
        isValid: isValidPassword,
        testResults: passwordTests
      }
    });
    
  } catch (error) {
    console.error('❌ Password check error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to check password',
      details: error.message
    }, { status: 500 });
  }
}