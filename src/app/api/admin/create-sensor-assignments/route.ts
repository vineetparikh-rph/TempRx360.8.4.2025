import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sensorPushAPI } from '@/lib/sensorpush-api';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = session.user.role === 'admin' || session.user.role === 'ADMIN';
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    try {
      // Get all pharmacies
      const pharmacies = await prisma.pharmacy.findMany({
        include: {
          sensorAssignments: true
        }
      });

      // Get sensors from SensorPush API
      const sensorsData = await sensorPushAPI.getSensors();
      const sensorIds = Object.keys(sensorsData.sensors || {});

      if (sensorIds.length === 0) {
        return NextResponse.json({ 
          error: 'No sensors found in SensorPush API',
          pharmacies: pharmacies.length 
        }, { status: 400 });
      }

      const createdAssignments = [];

      // Create sensor assignments for pharmacies that don't have any
      for (const pharmacy of pharmacies) {
        if (pharmacy.sensorAssignments.length === 0) {
          // Assign multiple sensors to each pharmacy for better coverage
          const sensorsPerPharmacy = Math.min(3, sensorIds.length); // Up to 3 sensors per pharmacy
          
          for (let i = 0; i < sensorsPerPharmacy; i++) {
            const sensorIndex = (createdAssignments.length + i) % sensorIds.length;
            const sensorId = sensorIds[sensorIndex];
            const sensor = sensorsData.sensors[sensorId];

            // Create different location types
            const locations = [
              `${pharmacy.name} - Main Storage`,
              `${pharmacy.name} - Refrigerated Area`,
              `${pharmacy.name} - Controlled Substances`
            ];

            const assignment = await prisma.sensorAssignment.create({
              data: {
                sensorPushId: sensorId,
                sensorId: sensorId,
                sensorName: sensor.name || `Sensor ${sensorId.slice(-4)}`,
                pharmacyId: pharmacy.id,
                location: locations[i] || `${pharmacy.name} - Storage Area ${i + 1}`,
                locationType: i === 0 ? 'main_storage' : i === 1 ? 'refrigerated' : 'controlled_substances',
                isActive: true,
                assignedBy: session.user.id
              }
            });

            createdAssignments.push({
              pharmacy: pharmacy.name,
              sensor: assignment.sensorName,
              sensorId: sensorId,
              location: assignment.location
            });
          }
        }
      }

      // Log the creation
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'CREATE_SENSOR_ASSIGNMENTS',
          resource: 'sensor_assignments',
          metadata: JSON.stringify({
            createdCount: createdAssignments.length,
            assignments: createdAssignments,
            createdBy: session.user.email
          })
        }
      });

      return NextResponse.json({
        message: `Created ${createdAssignments.length} sensor assignments`,
        assignments: createdAssignments,
        totalPharmacies: pharmacies.length,
        availableSensors: sensorIds.length
      });

    } catch (dbError) {
      console.error('Database error during sensor assignment creation:', dbError);
      return NextResponse.json({ 
        error: 'Failed to create sensor assignments',
        details: dbError.message 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Failed to create sensor assignments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}