import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    console.log('🏥 Populating pharmacy information...');

    // Real Georgies pharmacy information
    const pharmacyUpdates = [
      {
        code: 'family',
        updates: {
          displayName: 'Georgies Family Pharmacy',
          description: 'Full-service family pharmacy providing prescription services, vaccinations, and health consultations',
          type: 'retail',
          location: '332 W. St. Georges Avenue',
          address: '332 W. St. Georges Avenue',
          city: 'Linden',
          state: 'NJ',
          zipCode: '07036-5638',
          phone: '(908) 925-4567',
          fax: '(908) 925-8090',
          operatingHours: 'Mon-Fri: 9:00 AM - 7:00 PM, Sat: 9:00 AM - 5:00 PM, Sun: Closed',
          isActive: true
        }
      },
      {
        code: 'specialty',
        updates: {
          displayName: 'Georgies Specialty Pharmacy',
          description: 'Specialty medications, compounding, clinical services, and patient education',
          type: 'specialty',
          location: '521 N Wood Avenue',
          address: '521 N Wood Avenue',
          city: 'Linden',
          state: 'NJ',
          zipCode: '07036-4146',
          phone: '(908) 925-4566',
          fax: '(908) 345-5030',
          operatingHours: 'Mon-Fri: 9:30 AM - 6:00 PM, Sat: Closed, Sun: Closed',
          isActive: true
        }
      },
      {
        code: 'parlin',
        updates: {
          displayName: 'Georgies Parlin Pharmacy',
          description: 'Full pharmacy services, immunizations, blood pressure monitoring, and diabetes care',
          type: 'retail',
          location: '499 Ernston Road',
          address: '499 Ernston Road',
          city: 'Parlin',
          state: 'NJ',
          zipCode: '08859-1406',
          phone: '(732) 952-3022',
          fax: '(407) 641-8434',
          operatingHours: 'Mon-Fri: 9:00 AM - 7:00 PM, Sat: 9:00 AM - 5:00 PM, Sun: Closed',
          isActive: true
        }
      },
      {
        code: 'outpatient',
        updates: {
          displayName: 'Georgies Outpatient Pharmacy',
          description: 'Hospital outpatient services, discharge medications, clinical consultations, and medication reviews',
          type: 'hospital',
          location: '6 Earlin Avenue, Suite 130',
          address: '6 Earlin Avenue, Suite 130',
          city: 'Browns Mills',
          state: 'NJ',
          zipCode: '08015-1768',
          phone: '(609) 726-5800',
          fax: '(609) 726-5810',
          operatingHours: 'Mon-Fri: 9:30 AM - 6:00 PM, Sat: 10:00 AM - 2:00 PM, Sun: Closed',
          isActive: true
        }
      }
    ];

    const results = [];

    // Update each pharmacy
    for (const { code, updates } of pharmacyUpdates) {
      const pharmacy = await prisma.pharmacy.findUnique({
        where: { code }
      });

      if (pharmacy) {
        await prisma.pharmacy.update({
          where: { code },
          data: updates
        });
        results.push(`✅ Updated ${updates.displayName} (${code})`);
      } else {
        // Create new pharmacy if it doesn't exist
        await prisma.pharmacy.create({
          data: {
            name: updates.displayName,
            code,
            ...updates
          }
        });
        results.push(`🆕 Created ${updates.displayName} (${code})`);
      }
    }

    // Get updated pharmacies
    const allPharmacies = await prisma.pharmacy.findMany({
      orderBy: { displayName: 'asc' }
    });

    return NextResponse.json({
      success: true,
      message: 'Pharmacy information updated successfully!',
      results,
      pharmacies: allPharmacies.map(pharmacy => ({
        id: pharmacy.id,
        displayName: pharmacy.displayName || pharmacy.name,
        code: pharmacy.code,
        type: pharmacy.type,
        location: pharmacy.location,
        city: pharmacy.city,
        state: pharmacy.state,
        zipCode: pharmacy.zipCode,
        phone: pharmacy.phone,
        email: pharmacy.email,
        operatingHours: pharmacy.operatingHours,
        isActive: pharmacy.isActive
      }))
    });

  } catch (error) {
    console.error('❌ Error updating pharmacies:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update pharmacies: ' + error.message 
      }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}