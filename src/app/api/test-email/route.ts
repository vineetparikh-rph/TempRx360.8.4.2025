import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    // Test email configuration first
    const configValid = await EmailService.testEmailConfig();
    
    if (!configValid) {
      return NextResponse.json(
        { 
          error: 'Email configuration is invalid. Please check SMTP settings.',
          details: 'Make sure SMTP_HOST, SMTP_USER, SMTP_PASS, and SMTP_FROM are set correctly.'
        },
        { status: 500 }
      );
    }

    // Send test email
    const emailSent = await EmailService.sendTestEmail(email);

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully! Check your inbox.',
        config: {
          host: process.env.SMTP_HOST || 'Not configured',
          port: process.env.SMTP_PORT || 'Not configured',
          from: process.env.SMTP_FROM || 'Not configured',
          hasCredentials: !!(process.env.SMTP_USER && process.env.SMTP_PASS)
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send test email' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Test email error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check email configuration status
    const hasSmtpConfig = !!(
      process.env.SMTP_HOST && 
      process.env.SMTP_USER && 
      process.env.SMTP_PASS && 
      process.env.SMTP_FROM
    );

    return NextResponse.json({
      configured: hasSmtpConfig,
      config: {
        host: process.env.SMTP_HOST || 'Not set',
        port: process.env.SMTP_PORT || '587',
        from: process.env.SMTP_FROM || 'Not set',
        user: process.env.SMTP_USER ? '***configured***' : 'Not set',
        pass: process.env.SMTP_PASS ? '***configured***' : 'Not set'
      },
      status: hasSmtpConfig ? 'Ready for email sending' : 'Email not configured - will use mock mode'
    });

  } catch (error) {
    console.error('❌ Email config check error:', error);
    return NextResponse.json(
      { error: 'Failed to check email configuration' },
      { status: 500 }
    );
  }
}