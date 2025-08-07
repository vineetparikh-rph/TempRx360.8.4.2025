import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';

// GET - Fetch pharmacies (accessible to all authenticated users)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const isAdmin = session.user.role === 'admin' || session.user.role === 'ADMIN';

    try {
      let pharmacies;

      if (isAdmin) {
        // Admin sees all pharmacies
        pharmacies = await prisma.pharmacy.findMany({
          orderBy: { name: 'asc' },
          include: {
            _count: {
              select: {
                userPharmacies: true,
                sensorAssignments: true
              }
            }
          }
        });
      } else {
        // Regular users see only their assigned pharmacies
        const userPharmacies = await prisma.userPharmacy.findMany({
          where: { userId: session.user.id },
          include: {
            pharmacy: {
              include: {
                _count: {
                  select: {
                    userPharmacies: true,
                    sensorAssignments: true
                  }
                }
              }
            }
          }
        });

        pharmacies = userPharmacies.map(up => up.pharmacy);
      }

      return NextResponse.json({
        pharmacies,
        totalCount: pharmacies.length,
        userRole: session.user.role
      });

    } catch (dbError) {
      console.error('Database error, using fallback pharmacies:', dbError);
      
      // Return fallback pharmacies if database fails
      const fallbackPharmacies = [
        {
          id: 'clz123abc',
          name: 'Georgies Specialty Pharmacy',
          address: '123 Main St',
          city: 'New Brunswick',
          state: 'NJ',
          zipCode: '08901',
          phone: '(732) 555-0123',
          email: 'specialty@georgiesrx.com',
          isActive: true,
          _count: { userPharmacies: 0, sensorAssignments: 0 }
        },
        {
          id: 'clz456def',
          name: 'Central Pharmacy',
          address: '456 Oak Ave',
          city: 'Princeton',
          state: 'NJ',
          zipCode: '08540',
          phone: '(609) 555-0456',
          email: 'info@centralrx.com',
          isActive: true,
          _count: { userPharmacies: 0, sensorAssignments: 0 }
        }
      ];

      return NextResponse.json({
        pharmacies: fallbackPharmacies,
        totalCount: fallbackPharmacies.length,
        fallback: true,
        userRole: session.user.role
      });
    }

  } catch (error) {
    console.error('Pharmacies API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pharmacies: ' + error.message }, 
      { status: 500 }
    );
  }
}