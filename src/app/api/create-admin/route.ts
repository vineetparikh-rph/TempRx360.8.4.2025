import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log('👤 Creating admin user...')

    // Create admin user with minimal dependencies
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    // Try to create the admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@georgies.com',
        name: 'Admin User',
        hashedPassword,
        role: 'ADMIN',
        isActive: true,
      },
    })

    console.log('✅ Created admin user:', adminUser.email)

    return NextResponse.json({ 
      success: true, 
      message: 'Admin user created successfully!',
      user: {
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      },
      credentials: {
        email: 'admin@georgies.com',
        password: 'admin123'
      }
    })

  } catch (error: any) {
    console.error('❌ Admin creation failed:', error)
    
    // Check if user already exists
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return NextResponse.json({ 
        success: true, 
        message: 'Admin user already exists!',
        credentials: {
          email: 'admin@georgies.com',
          password: 'admin123'
        },
        note: 'You can login with the existing admin account'
      })
    }
    
    let errorMessage = 'Unknown error'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create admin user',
      details: errorMessage,
      suggestion: 'The database might need to be initialized first'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST method to create admin user',
    endpoint: '/api/create-admin',
    method: 'POST'
  })
}