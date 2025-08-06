import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Public setup endpoint called');
    
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@georgiesrx.com' }
    });
    
    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: 'Admin user already exists',
        credentials: {
          email: 'admin@georgiesrx.com',
          password: 'admin123'
        }
      });
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await prisma.user.create({
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
    
    console.log('✅ Admin user created');
    
    // Create pharmacies
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
    for (const pharmacy of createdPharmacies) {
      await prisma.userPharmacy.upsert({
        where: {
          userId_pharmacyId: {
            userId: admin.id,
            pharmacyId: pharmacy.id
          }
        },
        update: {},
        create: {
          userId: admin.id,
          pharmacyId: pharmacy.id
        }
      });
    }
    
    console.log(`✅ Admin assigned to ${createdPharmacies.length} pharmacies`);
    
    return NextResponse.json({
      success: true,
      message: 'Neon PostgreSQL database setup complete',
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
    console.error('❌ Setup failed:', error);
    return NextResponse.json({ 
      error: 'Setup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    const userCount = await prisma.user.count();
    const pharmacyCount = await prisma.pharmacy.count();
    
    return NextResponse.json({
      success: true,
      message: 'Database connection test successful',
      userCount,
      pharmacyCount,
      ready: userCount > 0 && pharmacyCount > 0
    });
    
  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}