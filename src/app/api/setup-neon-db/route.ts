import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Setting up Neon PostgreSQL database...');

    // Test database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Neon PostgreSQL connection successful');
    } catch (connectionError) {
      console.error('❌ Neon PostgreSQL connection failed:', connectionError);
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: connectionError instanceof Error ? connectionError.message : 'Unknown error',
        suggestion: 'Please check your DATABASE_URL environment variable'
      }, { status: 500 });
    }

    // Run database migrations to ensure schema exists
    console.log('🔨 Ensuring database schema is up to date...');
    
    // Check if tables exist by trying to count users
    try {
      const userCount = await prisma.user.count();
      console.log(`📊 Found ${userCount} users in database`);
    } catch (tableError) {
      console.log('❌ Database schema not found. Please run migrations first.');
      return NextResponse.json({ 
        error: 'Database schema not found',
        details: 'The database exists but tables are not created.',
        suggestion: 'Run "npx prisma migrate deploy" or "npx prisma db push" to create the schema'
      }, { status: 500 });
    }

    // Create admin user
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

    // Create Georgies pharmacies
    const pharmacyCount = await prisma.pharmacy.count();
    console.log(`🏥 Found ${pharmacyCount} pharmacies`);
    
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
        operatingHours: 'Mon-Fri 9:00 AM - 7:00 PM, Sat 9:00 AM - 5:00 PM, Sun Closed'
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
        operatingHours: 'Mon-Fri 9:30 AM - 6:00 PM, Sat Closed, Sun Closed'
      },
      {
        name: 'Georgies Parlin Pharmacy',
        code: 'parlin',
        displayName: 'Georgies Parlin Pharmacy',
        description: 'Community pharmacy serving Parlin and surrounding areas',
        type: 'retail',
        location: 'Parlin, NJ',
        address: '499 Ernston Road',
        city: 'Parlin',
        state: 'NJ',
        zipCode: '08859-1406',
        phone: '(732) 952-3022',
        fax: '(407) 641-8434',
        email: 'parlin@georgiesrx.com',
        operatingHours: 'Mon-Fri 9:00 AM - 7:00 PM, Sat 9:00 AM - 5:00 PM, Sun Closed'
      },
      {
        name: 'Georgies Outpatient Pharmacy',
        code: 'outpatient',
        displayName: 'Georgies Outpatient Pharmacy',
        description: 'Hospital outpatient pharmacy providing discharge medications and clinical services',
        type: 'hospital',
        location: 'Browns Mills, NJ',
        address: '6 Earlin Avenue, Suite 130',
        city: 'Browns Mills',
        state: 'NJ',
        zipCode: '08015-1768',
        phone: '(609) 726-5800',
        fax: '(609) 726-5810',
        email: 'outpatient@georgiesrx.com',
        operatingHours: 'Mon-Fri 9:30 AM - 6:00 PM, Sat 10:00 AM - 2:00 PM, Sun Closed'
      }
    ];

    const createdPharmacies = [];
    for (const pharmacyData of pharmacies) {
      const pharmacy = await prisma.pharmacy.upsert({
        where: { code: pharmacyData.code },
        update: pharmacyData,
        create: pharmacyData,
      });
      createdPharmacies.push(pharmacy);
    }
    
    console.log(`✅ Created/updated ${createdPharmacies.length} pharmacies`);

    // Assign admin to all pharmacies
    // Remove existing assignments
    await prisma.userPharmacy.deleteMany({
      where: { userId: admin.id }
    });

    // Add admin to all pharmacies
    for (const pharmacy of createdPharmacies) {
      await prisma.userPharmacy.create({
        data: {
          userId: admin.id,
          pharmacyId: pharmacy.id
        }
      });
    }

    console.log(`✅ Admin assigned to ${createdPharmacies.length} pharmacies`);

    return NextResponse.json({
      success: true,
      message: 'Neon PostgreSQL database setup complete',
      database: 'PostgreSQL (Neon)',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      },
      pharmacies: createdPharmacies.length,
      credentials: {
        email: 'admin@georgiesrx.com',
        password: 'admin123'
      }
    });

  } catch (error) {
    console.error('❌ Neon PostgreSQL setup failed:', error);
    return NextResponse.json({ 
      error: 'Neon PostgreSQL setup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}