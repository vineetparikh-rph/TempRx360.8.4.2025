import { NextRequest, NextResponse } from 'next/server';
import { signIn } from 'next-auth/react';

export async function GET(request: NextRequest) {
  try {
    // Test if NextAuth configuration is accessible
    const { authOptions } = await import('@/lib/auth');
    
    return NextResponse.json({
      success: true,
      message: 'NextAuth configuration loaded successfully',
      providers: authOptions.providers?.map(p => p.name) || [],
      session: authOptions.session || {},
    });
    
  } catch (error) {
    console.error('❌ NextAuth test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to load NextAuth configuration',
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // Import the auth configuration
    const { authOptions } = await import('@/lib/auth');
    
    // Get the credentials provider
    const credentialsProvider = authOptions.providers?.find(p => p.name === 'credentials');
    
    if (!credentialsProvider) {
      return NextResponse.json({ 
        success: false, 
        error: 'Credentials provider not found' 
      }, { status: 400 });
    }
    
    // Test the authorize function directly
    const result = await credentialsProvider.authorize({ email, password });
    
    return NextResponse.json({
      success: true,
      authorized: !!result,
      user: result || null
    });
    
  } catch (error) {
    console.error('❌ NextAuth authorize test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Authorization test failed',
      details: error.message 
    }, { status: 500 });
  }
}