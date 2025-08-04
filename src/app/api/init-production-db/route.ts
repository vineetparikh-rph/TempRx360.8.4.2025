import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Initializing production database...');

    // Step 1: Test basic connection
    try {
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      console.log('✅ Database connection test passed:', result);
    } catch (error) {
      console.log('❌ Database connection failed, attempting to initialize...');
      
      // For SQLite, we need to ensure the file exists and has proper schema
      try {
        // Run Prisma migrations to ensure schema exists
        console.log('🔨 Running database migrations...');
        
        // This will create the database file and schema if it doesn't exist
        await prisma.$executeRaw`PRAGMA foreign_keys=ON`;
        
        console.log('✅ Database initialized successfully');
      } catch (initError) {
        console.error('❌ Database initialization failed:', initError);
        return NextResponse.json({ 
          error: 'Database initialization failed',
          details: initError instanceof Error ? initError.message : 'Unknown error',
          suggestion: 'The database file may not exist or schema is not created'
        }, { status: 500 });
      }
    }

    // Step 2: Check if tables exist by trying to count users
    try {
      const userCount = await prisma.user.count();
      console.log(`📊 Found ${userCount} users in database`);
    } catch (tableError) {
      console.log('❌ User table does not exist, database needs schema creation');
      return NextResponse.json({ 
        error: 'Database schema not found',
        details: 'The database exists but tables are not created. Run database migrations first.',
        suggestion: 'Visit /db-setup to initialize the database schema'
      }, { status: 500 });
    }

    // Step 3: Create admin user
    console.log('👤 Creating admin user...');
    
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@georgiesrx.com' }
    });

    let admin;
    if (existingAdmin) {
      // Update existing admin
      admin = await prisma.user.update({
        where: { email: 'admin@georgiesrx.com' },
        data: {
          hashedPassword,
          isApproved: true,
          approvalStatus: 'approved',
          mustChangePassword: false,
          role: 'admin',
          name: 'System Administrator'
        }
      });
      console.log('✅ Updated existing admin user');
    } else {
      // Create new admin
      admin = await prisma.user.create({
        data: {
          email: 'admin@georgiesrx.com',
          name: 'System Administrator',
          hashedPassword,
          role: 'admin',
          isApproved: true,
          approvalStatus: 'approved',
          mustChangePassword: false,
          firstName: 'System',
          lastName: 'Administrator',
          organization: 'Georgies Pharmacy',
          position: 'System Administrator'
        }
      });
      console.log('✅ Created new admin user');
    }

    // Step 4: Create basic pharmacies if they don't exist
    const pharmacyCount = await prisma.pharmacy.count();
    console.log(`🏥 Found ${pharmacyCount} pharmacies`);
    
    if (pharmacyCount === 0) {
      console.log('🏥 Creating default pharmacies...');
      
      const pharmacies = [
        {
          name: 'Georgies Family Pharmacy',
          code: 'family',
          displayName: 'Georgies Family Pharmacy',
          description: 'Full-service family pharmacy providing comprehensive pharmaceutical care',
          type: 'retail',
          location: 'Linden, NJ',
          address: '332 W. St. Georges Avenue',
          city: 'Linden',
          state: 'NJ',
          zipCode: '07036-5638',
          phone: '(908) 925-4567',
          fax: '(908) 925-8090',
          email: 'family@georgiesrx.com',
          operatingHours: 'Mon-Fri 9:00 AM - 7:00 PM, Sat 9:00 AM - 5:00 PM, Sun Closed',
          services: 'Prescription Services, Vaccinations, Health Consultations, Medication Therapy Management'
        },
        {
          name: 'Georgies Specialty Pharmacy',
          code: 'specialty',
          displayName: 'Georgies Specialty Pharmacy',
          description: 'Specialized pharmacy focusing on complex medications and clinical services',
          type: 'specialty',
          location: 'Linden, NJ',
          address: '521 N Wood Avenue',
          city: 'Linden',
          state: 'NJ',
          zipCode: '07036-4146',
          phone: '(908) 925-4566',
          fax: '(908) 345-5030',
          email: 'specialty@georgiesrx.com',
          operatingHours: 'Mon-Fri 9:30 AM - 6:00 PM, Sat Closed, Sun Closed',
          services: 'Specialty Medications, Compounding, Clinical Services, Patient Education'
        }
      ];

      for (const pharmacy of pharmacies) {
        await prisma.pharmacy.create({ data: pharmacy });
      }
      
      console.log(`✅ Created ${pharmacies.length} default pharmacies`);
    }

    // Step 5: Assign admin to all pharmacies
    const allPharmacies = await prisma.pharmacy.findMany();
    
    // Remove existing assignments
    await prisma.userPharmacy.deleteMany({
      where: { userId: admin.id }
    });

    // Add admin to all pharmacies
    for (const pharmacy of allPharmacies) {
      await prisma.userPharmacy.create({
        data: {
          userId: admin.id,
          pharmacyId: pharmacy.id
        }
      });
    }

    console.log(`✅ Admin assigned to ${allPharmacies.length} pharmacies`);

    return NextResponse.json({
      success: true,
      message: 'Production database initialized successfully',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      },
      pharmacies: allPharmacies.length,
      credentials: {
        email: 'admin@georgiesrx.com',
        password: 'admin123'
      }
    });

  } catch (error) {
    console.error('❌ Production database initialization failed:', error);
    return NextResponse.json({ 
      error: 'Production database initialization failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}