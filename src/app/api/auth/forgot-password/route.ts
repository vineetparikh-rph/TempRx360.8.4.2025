import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { EmailService } from '@/lib/email-service';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    // Always return success to prevent email enumeration attacks
    if (!user) {
      return NextResponse.json({ 
        message: 'If an account with that email exists, we have sent a password reset link.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // Create reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL || 'https://temprx360.vercel.app'}/reset-password?token=${resetToken}`;

    // Send password reset email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .logo { font-size: 24px; font-weight: bold; }
          .warning { background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">TempRx360</div>
            <p>Password Reset Request</p>
          </div>
          
          <div class="content">
            <h2>Hello ${user.name || 'User'},</h2>
            
            <p>We received a request to reset your password for your TempRx360 account.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #e5e7eb; padding: 10px; border-radius: 4px; font-family: monospace;">
              ${resetUrl}
            </p>
            
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul>
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Your password will remain unchanged until you create a new one</li>
              </ul>
            </div>
            
            <p>If you have any questions, please contact our support team.</p>
            
            <p>Best regards,<br>
            <strong>TempRx360 Team</strong></p>
          </div>
          
          <div class="footer">
            <p>This email was sent from TempRx360 Temperature Monitoring System</p>
            <p>© ${new Date().getFullYear()} TempRx360. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailSent = await EmailService.sendEmail({
      to: user.email,
      subject: 'TempRx360 - Password Reset Request',
      html: emailHtml
    });

    if (!emailSent) {
      console.error('Failed to send password reset email to:', user.email);
      return NextResponse.json(
        { error: 'Failed to send password reset email. Please try again later.' },
        { status: 500 }
      );
    }

    console.log('✅ Password reset email sent to:', user.email);

    return NextResponse.json({
      message: 'If an account with that email exists, we have sent a password reset link.',
      // In development, include the reset link for testing
      ...(process.env.NODE_ENV === 'development' && { resetUrl })
    });

  } catch (error) {
    console.error('Failed to process forgot password request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
