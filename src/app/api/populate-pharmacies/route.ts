import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    console.log('🏥 Populating pharmacy information...');

    // Enhanced pharmacy data with descriptive information
    const pharmacyUpdates = [
      {
        code: 'family',
        updates: {
          displayName: 'Family Medicine Pharmacy',
          description: 'Primary care pharmacy serving family medicine patients',
          type: 'clinic',
          location: 'Family Medicine Building - Ground Floor',
          city: 'Medical Center',
          state: 'NJ',
          zipCode: '08901',
          email: 'family.pharmacy@georgiesrx.com',
          phone: '(732) 555-0101',
          operatingHours: 'Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 2:00 PM',
          isActive: true
        }
      },
      {
        code: 'specialty',
        updates: {
          displayName: 'Specialty Care Pharmacy',
          description: 'Specialized medications for complex conditions and rare diseases',
          type: 'specialty',
          location: 'Specialty Care Center - 2nd Floor',
          city: 'Medical Center',
          state: 'NJ',
          zipCode: '08901',
          email: 'specialty.pharmacy@georgiesrx.com',
          phone: '(732) 555-0102',
          operatingHours: 'Mon-Fri: 9:00 AM - 5:00 PM',
          isActive: true
        }
      },
      {
        code: 'parlin',
        updates: {
          displayName: 'Parlin Community Pharmacy',
          description: 'Community pharmacy serving Parlin and surrounding areas',
          type: 'retail',
          location: 'Parlin Shopping Center',
          city: 'Parlin',
          state: 'NJ',
          zipCode: '08859',
          email: 'parlin.pharmacy@georgiesrx.com',
          phone: '(732) 555-0103',
          operatingHours: 'Mon-Sat: 9:00 AM - 9:00 PM, Sun: 10:00 AM - 6:00 PM',
          isActive: true
        }
      },
      {
        code: 'outpatient',
        updates: {
          displayName: 'Outpatient Services Pharmacy',
          description: 'Hospital outpatient pharmacy for discharged patients and outpatient procedures',
          type: 'hospital',
          location: 'Main Hospital - Outpatient Wing, 1st Floor',
          city: 'Medical Center',
          state: 'NJ',
          zipCode: '08901',
          email: 'outpatient.pharmacy@georgiesrx.com',
          phone: '(732) 555-0104',
          operatingHours: 'Mon-Sun: 7:00 AM - 11:00 PM',
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