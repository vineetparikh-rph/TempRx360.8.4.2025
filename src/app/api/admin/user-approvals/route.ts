import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'

    const users = await prisma.user.findMany({
      where: {
        approvalStatus: status,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        name: true,
        email: true,
        phoneNumber: true,
        organization: true,
        position: true,
        requestReason: true,
        approvalStatus: true,
        approvedBy: true,
        approvedAt: true,
        rejectedReason: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ users })

  } catch (error) {
    console.error('Error fetching user approvals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, action, rejectedReason, assignedRole } = body

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (action === 'reject' && !rejectedReason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    let updatedUser
    let emailSubject = ''
    let emailContent = ''

    if (action === 'approve') {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          isApproved: true,
          approvalStatus: 'approved',
          approvedBy: session.user.id,
          approvedAt: new Date(),
          role: assignedRole || 'technician',
        },
      })

      emailSubject = 'TempRx360 - Account Approved'
      emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Account Approved!</h2>
          <p>Hello ${user.firstName},</p>
          
          <p>Great news! Your TempRx360 account has been approved and is now active.</p>
          
          <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <h3 style="margin-top: 0; color: #15803d;">✅ Account Details</h3>
            <p style="color: #15803d; margin-bottom: 0;">
              <strong>Email:</strong> ${user.email}<br>
              <strong>Role:</strong> ${assignedRole || 'Technician'}<br>
              <strong>Status:</strong> Active
            </p>
          </div>
          
          <p>You can now sign in to your account and start using TempRx360.</p>
          
          <div style="margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/signin" 
               style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Sign In Now
            </a>
          </div>
          
          <p>If you have any questions, please contact our support team.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated message from TempRx360. Please do not reply to this email.
          </p>
        </div>
      `
    } else if (action === 'reject') {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          approvalStatus: 'rejected',
          rejectedReason,
        },
      })

      emailSubject = 'TempRx360 - Registration Update'
      emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Registration Update</h2>
          <p>Hello ${user.firstName},</p>
          
          <p>Thank you for your interest in TempRx360. After reviewing your registration, we are unable to approve your account at this time.</p>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="margin-top: 0; color: #b91c1c;">Reason:</h3>
            <p style="color: #b91c1c; margin-bottom: 0;">
              ${rejectedReason}
            </p>
          </div>
          
          <p>If you believe this is an error or would like to provide additional information, please contact our support team.</p>
          
          <div style="margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/contact" 
               style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Contact Support
            </a>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated message from TempRx360. Please do not reply to this email.
          </p>
        </div>
      `
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    // Send notification email to user
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: user.email,
        subject: emailSubject,
        html: emailContent,
      })
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError)
      // Don't fail the approval if email fails
    }

    return NextResponse.json({
      success: true,
      message: `User ${action}d successfully`,
      user: updatedUser,
    })

  } catch (error) {
    console.error('Error processing user approval:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}