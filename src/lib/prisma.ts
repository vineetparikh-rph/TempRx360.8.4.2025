import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

// Configure Neon for serverless environments
neonConfig.webSocketConstructor = ws

// For edge environments (Vercel Edge Functions), enable querying over fetch
if (process.env.VERCEL_ENV === 'production') {
  neonConfig.poolQueryViaFetch = true
}

// Global Prisma instance for development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with Neon adapter for optimal serverless performance
function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  // Use Neon adapter for better serverless performance
  const adapter = new PrismaNeon({ connectionString })
  
  return new PrismaClient({ 
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}