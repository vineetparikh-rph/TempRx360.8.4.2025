import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      organization,
      position,
      requestReason,
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with pending approval
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email: email.toLowerCase(),
        hashedPassword,
        phoneNumber,
        organization,
        position,
        requestReason,
        role: 'technician', // Default role
        isApproved: false,
        approvalStatus: 'pending',
      },
    })

    // Send notification email to admins
    try {
      const admins = await prisma.user.findMany({
        where: { role: 'admin' },
        select: { email: true, name: true }
      })

      for (const admin of admins) {
        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: admin.email,
          subject: 'TempRx360 - New User Registration Pending Approval',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">New User Registration</h2>
              <p>A new user has registered and is pending approval:</p>
              
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">User Details:</h3>
                <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phoneNumber || 'Not provided'}</p>
                <p><strong>Organization:</strong> ${organization || 'Not provided'}</p>
                <p><strong>Position:</strong> ${position || 'Not provided'}</p>
                <p><strong>Request Reason:</strong> ${requestReason || 'Not provided'}</p>
                <p><strong>Registration Date:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <p>Please review and approve/reject this registration in the admin dashboard.</p>
              
              <div style="margin: 30px 0;">
                <a href="${process.env.NEXTAUTH_URL}/admin/users" 
                   style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Review Registration
                </a>
              </div>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">
                This is an automated message from TempRx360. Please do not reply to this email.
              </p>
            </div>
          `,
        })
      }
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError)
      // Don't fail the registration if email fails
    }

    // Send confirmation email to user
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'TempRx360 - Registration Submitted',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Registration Submitted</h2>
            <p>Hello ${firstName},</p>
            
            <p>Thank you for registering with TempRx360. Your registration has been submitted and is pending approval.</p>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h3 style="margin-top: 0; color: #92400e;">⏳ Pending Approval</h3>
              <p style="color: #92400e; margin-bottom: 0;">
                Your account is currently under review. You will receive an email notification once your account has been approved or if additional information is needed.
              </p>
            </div>
            
            <p>If you have any questions, please contact our support team.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated message from TempRx360. Please do not reply to this email.
            </p>
          </div>
        `,
      })
    } catch (emailError) {
      console.error('Failed to send user confirmation email:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Registration submitted successfully. Your account is pending approval.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        approvalStatus: user.approvalStatus,
      },
    })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to register a new user',
    requiredFields: [
      'firstName',
      'lastName', 
      'email',
      'password'
    ],
    optionalFields: [
      'phoneNumber',
      'organization',
      'position', 
      'requestReason'
    ]
  })
}