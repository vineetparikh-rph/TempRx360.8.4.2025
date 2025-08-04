import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Setting up database...')

    // Try to connect to the database
    await prisma.$connect()
    console.log('✅ Database connected')

    // Try to create tables if they don't exist (this will be a no-op if they exist)
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "email" TEXT NOT NULL UNIQUE,
        "name" TEXT,
        "hashedPassword" TEXT,
        "role" TEXT NOT NULL DEFAULT 'STAFF',
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Pharmacy" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "name" TEXT NOT NULL,
        "address" TEXT,
        "phone" TEXT,
        "email" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "UserPharmacy" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "userId" INTEGER NOT NULL,
        "pharmacyId" INTEGER NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'STAFF',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY ("pharmacyId") REFERENCES "Pharmacy"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Sensor" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "name" TEXT NOT NULL,
        "type" TEXT NOT NULL DEFAULT 'TEMPERATURE',
        "location" TEXT,
        "pharmacyId" INTEGER NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "batteryLevel" INTEGER,
        "lastReading" DATETIME,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("pharmacyId") REFERENCES "Pharmacy"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "TemperatureReading" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "sensorId" INTEGER NOT NULL,
        "temperature" REAL NOT NULL,
        "humidity" REAL,
        "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("sensorId") REFERENCES "Sensor"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `

    console.log('✅ Database tables ensured')

    // Test if we can query the tables
    const userCount = await prisma.user.count()
    const pharmacyCount = await prisma.pharmacy.count()
    
    console.log(`📊 Current counts - Users: ${userCount}, Pharmacies: ${pharmacyCount}`)

    return NextResponse.json({ 
      success: true, 
      message: 'Database setup completed successfully!',
      counts: {
        users: userCount,
        pharmacies: pharmacyCount
      }
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