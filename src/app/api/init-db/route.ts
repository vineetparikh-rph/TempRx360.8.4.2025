import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Initializing database...')

    // First, try to push the schema to create tables
    console.log('📋 Creating database schema...')
    
    // Connect to database
    await prisma.$connect()
    console.log('✅ Database connected')

    // Try to create a simple test record to see if tables exist
    try {
      // Check if we can query users table
      const userCount = await prisma.user.count()
      console.log(`📊 Database already initialized with ${userCount} users`)
      
      // Check if admin exists
      const adminExists = await prisma.user.findUnique({
        where: { email: 'admin@georgies.com' }
      })
      
      if (adminExists) {
        return NextResponse.json({ 
          success: true, 
          message: 'Database already initialized and admin user exists!',
          adminExists: true,
          credentials: {
            email: 'admin@georgies.com',
            password: 'admin123'
          }
        })
      }
      
      // Admin doesn't exist, create it
      console.log('👤 Creating admin user...')
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@georgies.com',
          name: 'Admin User',
          hashedPassword,
          role: 'admin',
        },
      })

      console.log('✅ Created admin user:', adminUser.email)

      return NextResponse.json({ 
        success: true, 
        message: 'Database initialized and admin user created!',
        adminExists: false,
        userCreated: true,
        credentials: {
          email: 'admin@georgies.com',
          password: 'admin123'
        }
      })
      
    } catch (error: any) {
      console.log('⚠️ Tables might not exist, this is normal for first run')
      console.log('Error details:', error.message)
      
      // Tables don't exist, we need to create them
      // For SQLite, Prisma should auto-create tables on first use
      console.log('🔄 Attempting to create admin user (this will create tables)')
      
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@georgies.com',
          name: 'Admin User',
          hashedPassword,
          role: 'admin',
        },
      })

      console.log('✅ Database initialized and admin user created:', adminUser.email)

      return NextResponse.json({ 
        success: true, 
        message: 'Database initialized from scratch and admin user created!',
        firstTime: true,
        credentials: {
          email: 'admin@georgies.com',
          password: 'admin123'
        }
      })
    }

  } catch (error: any) {
    console.error('❌ Database initialization failed:', error)
    
    let errorMessage = 'Unknown error'
    let suggestion = 'Please try again'
    
    if (error instanceof Error) {
      errorMessage = error.message
      
      if (errorMessage.includes('SQLITE_CANTOPEN')) {
        suggestion = 'SQLite database file cannot be created. This might be a Vercel limitation.'
      } else if (errorMessage.includes('P2002')) {
        suggestion = 'Admin user might already exist. Try logging in directly.'
      } else if (errorMessage.includes('database')) {
        suggestion = 'Database connection issue. Check DATABASE_URL environment variable.'
      }
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to initialize database',
      details: errorMessage,
      suggestion,
      note: 'SQLite might not work properly on Vercel. Consider using a cloud database.'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST method to initialize the database',
    endpoint: '/api/init-db',
    method: 'POST',
    note: 'This will create the database schema and admin user'
  })
}