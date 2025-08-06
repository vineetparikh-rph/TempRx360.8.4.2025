import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session-token')?.value;
    
    if (!sessionToken) {
      return NextResponse.json({ 
        authenticated: false, 
        error: 'No session token' 
      }, { status: 401 });
    }
    
    // Verify the JWT token
    const decoded = jwt.verify(sessionToken, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
    
    return NextResponse.json({
      authenticated: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
        isApproved: decoded.isApproved,
        pharmacies: decoded.pharmacies
      }
    });
    
  } catch (error) {
    console.error('❌ Session verification error:', error);
    return NextResponse.json({ 
      authenticated: false, 
      error: 'Invalid session token' 
    }, { status: 401 });
  }
}