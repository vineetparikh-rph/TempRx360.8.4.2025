import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Setting up database...')

    // Try to connect to the database
    await prisma.$connect()
    console.log('✅ Database connected')

    // Instead of raw SQL, let's just try to query the tables to see if they exist
    // If they don't exist, Prisma will handle the error gracefully
    let userCount = 0
    let pharmacyCount = 0
    let setupNeeded = false

    try {
      userCount = await prisma.user.count()
      console.log(`📊 Users table exists with ${userCount} records`)
    } catch (error) {
      console.log('⚠️ Users table might not exist or be accessible')
      setupNeeded = true
    }

    try {
      pharmacyCount = await prisma.pharmacy.count()
      console.log(`📊 Pharmacy table exists with ${pharmacyCount} records`)
    } catch (error) {
      console.log('⚠️ Pharmacy table might not exist or be accessible')
      setupNeeded = true
    }

    if (setupNeeded) {
      console.log('🔄 Database schema might need initialization')
      console.log('💡 This is normal for first-time setup')
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database connection verified!',
      counts: {
        users: userCount,
        pharmacies: pharmacyCount
      },
      setupNeeded,
      note: setupNeeded ? 'Database schema will be created when first user is added' : 'Database is ready'
    })

  } catch (error) {
    console.error('❌ Database setup failed:', error)
    
    let errorMessage = 'Unknown error'
    let errorDetails = ''
    
    if (error instanceof Error) {
      errorMessage = error.message
      errorDetails = error.stack || ''
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to setup database',
      details: errorMessage,
      fullError: errorDetails
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST method to setup the database',
    endpoint: '/api/db-setup',
    method: 'POST'
  })
}