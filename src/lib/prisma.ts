import { PrismaClient } from '@prisma/client';
import { NeonHttpDriver } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';

// Use DATABASE_URL from environment (Vercel-Neon integration provides this)
const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL or NEON_DATABASE_URL environment variable is not set');
}

// Create Neon connection pool
const pool = new Pool({ connectionString });

// Create Neon HTTP driver for serverless optimization
const driver = new NeonHttpDriver({ pool });

// Global Prisma instance for development hot reloading
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma client with Neon adapter
const prisma = globalForPrisma.prisma ?? new PrismaClient({ 
  adapter: driver,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
});

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;