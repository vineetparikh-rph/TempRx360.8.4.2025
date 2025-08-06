import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Use the PostgreSQL connection directly
const postgresUrl = "postgresql://neondb_owner:npg_qQtsRd68lyrU@ep-lingering-field-ae55l14x-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

export async function POST(request: NextRequest) {
  let prisma: PrismaClient | null = null;
  
  try {
    const { action } = await request.json();

    // Create Prisma client with PostgreSQL URL
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: postgresUrl
        }
      }
    });

    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL');

    if (action === 'check-schema') {
      // Check current schema by trying to query with all fields
      const results = {
        userTableExists: false,
        userColumns: [],
        pharmacyTableExists: false,
        pharmacyColumns: [],
        schemaIssues: []
      };

      try {
        // Check User table structure
        const userCheck = await prisma.$queryRaw`
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = 'User' AND table_schema = 'public'
          ORDER BY ordinal_position;
        `;
        results.userTableExists = true;
        results.userColumns = userCheck;
      } catch (error) {
        results.schemaIssues.push(`User table issue: ${error.message}`);
      }

      try {
        // Check Pharmacy table structure
        const pharmacyCheck = await prisma.$queryRaw`
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = 'Pharmacy' AND table_schema = 'public'
          ORDER BY ordinal_position;
        `;
        results.pharmacyTableExists = true;
        results.pharmacyColumns = pharmacyCheck;
      } catch (error) {
        results.schemaIssues.push(`Pharmacy table issue: ${error.message}`);
      }

      return NextResponse.json({
        success: true,
        schema: results
      });

    } else if (action === 'fix-schema') {
      // Fix schema by adding missing columns
      const fixes = [];

      try {
        // Add missing columns to User table
        await prisma.$executeRaw`
          ALTER TABLE "User" 
          ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true,
          ADD COLUMN IF NOT EXISTS "mustChangePassword" BOOLEAN DEFAULT false;
        `;
        fixes.push('Added isActive and mustChangePassword columns to User table');
      } catch (error) {
        fixes.push(`User table fix error: ${error.message}`);
      }

      try {
        // Ensure all required User columns exist
        await prisma.$executeRaw`
          ALTER TABLE "User" 
          ADD COLUMN IF NOT EXISTS "approvalStatus" TEXT DEFAULT 'pending',
          ADD COLUMN IF NOT EXISTS "isApproved" BOOLEAN DEFAULT false;
        `;
        fixes.push('Added approvalStatus and isApproved columns to User table');
      } catch (error) {
        fixes.push(`User approval columns error: ${error.message}`);
      }

      return NextResponse.json({
        success: true,
        fixes: fixes
      });

    } else if (action === 'create-admin-safe') {
      // Create admin user with safe column handling
      try {
        // First, ensure schema is fixed
        await prisma.$executeRaw`
          ALTER TABLE "User" 
          ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true,
          ADD COLUMN IF NOT EXISTS "mustChangePassword" BOOLEAN DEFAULT false,
          ADD COLUMN IF NOT EXISTS "approvalStatus" TEXT DEFAULT 'approved',
          ADD COLUMN IF NOT EXISTS "isApproved" BOOLEAN DEFAULT true;
        `;

        // Check if admin already exists
        const existingAdmin = await prisma.$queryRaw`
          SELECT id, email FROM "User" WHERE email = 'admin@georgiesrx.com';
        `;

        if (Array.isArray(existingAdmin) && existingAdmin.length > 0) {
          return NextResponse.json({
            success: false,
            error: 'Admin user already exists',
            adminId: existingAdmin[0].id
          });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash('Maya@102$$', 12);

        // Create admin user using raw SQL to avoid Prisma schema issues
        const adminResult = await prisma.$queryRaw`
          INSERT INTO "User" (
            id, email, name, "hashedPassword", role, 
            "isApproved", "approvalStatus", "isActive", 
            "mustChangePassword", "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(), 
            'admin@georgiesrx.com', 
            'System Administrator',
            ${hashedPassword},
            'admin',
            true,
            'approved',
            true,
            false,
            NOW(),
            NOW()
          ) RETURNING id, email, name, role;
        `;

        // Get the created admin user
        const adminUser = await prisma.$queryRaw`
          SELECT * FROM "User" WHERE email = 'admin@georgiesrx.com';
        `;

        // Get Georgies Family Pharmacy (it exists according to inspection)
        const pharmacy = await prisma.$queryRaw`
          SELECT * FROM "Pharmacy" WHERE code = 'family' OR name ILIKE '%family%' LIMIT 1;
        `;

        let userPharmacyLink = null;
        if (Array.isArray(pharmacy) && pharmacy.length > 0 && Array.isArray(adminUser) && adminUser.length > 0) {
          // Link admin to pharmacy
          await prisma.$executeRaw`
            INSERT INTO "UserPharmacy" (id, "userId", "pharmacyId", "createdAt")
            VALUES (gen_random_uuid(), ${adminUser[0].id}, ${pharmacy[0].id}, NOW())
            ON CONFLICT DO NOTHING;
          `;
          userPharmacyLink = { linked: true, pharmacyName: pharmacy[0].name };
        }

        // Test the password
        const testLogin = await bcrypt.compare('Maya@102$$', hashedPassword);

        return NextResponse.json({
          success: true,
          message: 'Admin user created successfully in PostgreSQL',
          adminUser: Array.isArray(adminUser) && adminUser.length > 0 ? {
            id: adminUser[0].id,
            email: adminUser[0].email,
            name: adminUser[0].name,
            role: adminUser[0].role,
            isApproved: adminUser[0].isApproved,
            approvalStatus: adminUser[0].approvalStatus,
            isActive: adminUser[0].isActive,
            hasPassword: true,
            passwordTest: testLogin
          } : null,
          pharmacy: Array.isArray(pharmacy) && pharmacy.length > 0 ? {
            id: pharmacy[0].id,
            name: pharmacy[0].name,
            code: pharmacy[0].code
          } : null,
          userPharmacyLink: userPharmacyLink
        });

      } catch (error) {
        return NextResponse.json({
          success: false,
          error: `Failed to create admin: ${error.message}`,
          stack: error.stack
        }, { status: 500 });
      }

    } else if (action === 'list-pharmacies') {
      // List all pharmacies
      const pharmacies = await prisma.$queryRaw`
        SELECT * FROM "Pharmacy" ORDER BY name;
      `;

      return NextResponse.json({
        success: true,
        pharmacies: pharmacies
      });

    } else if (action === 'test-admin-login') {
      // Test admin login
      const adminUser = await prisma.$queryRaw`
        SELECT * FROM "User" WHERE email = 'admin@georgiesrx.com';
      `;

      if (!Array.isArray(adminUser) || adminUser.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Admin user not found'
        });
      }

      const user = adminUser[0];
      const passwordTest = await bcrypt.compare('Maya@102$$', user.hashedPassword || '');

      return NextResponse.json({
        success: true,
        adminUser: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isApproved: user.isApproved,
          approvalStatus: user.approvalStatus,
          isActive: user.isActive,
          hasPassword: !!user.hashedPassword,
          passwordTest: passwordTest
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 });

  } catch (error) {
    console.error('PostgreSQL schema fix error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

export async function GET() {
  return NextResponse.json({
    availableActions: [
      'check-schema',
      'fix-schema', 
      'create-admin-safe',
      'list-pharmacies',
      'test-admin-login'
    ],
    instructions: 'Use POST with { "action": "action-name" } to perform actions'
  });
}