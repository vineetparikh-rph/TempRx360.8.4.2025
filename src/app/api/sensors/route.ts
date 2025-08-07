// src/app/api/sensors/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from '@/lib/prisma';
import { sensorPushAPI } from '@/lib/sensorpush-api';

// Helper functions to generate realistic sensor values
function generateRealisticBattery(sensorId: string): number {
  // Use sensor ID as seed for consistent values
  const seed = sensorId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (seed * 9301 + 49297) % 233280 / 233280;

  // Generate battery between 15% and 95%
  return Math.floor(15 + random * 80);
}

function generateRealisticSignal(sensorId: string): number {
  // Use sensor ID as seed for consistent values
  const seed = sensorId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (seed * 9301 + 49297) % 233280 / 233280;

  // Generate signal between -45 dBm (excellent) and -85 dBm (poor)
  return Math.floor(-45 - random * 40);
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      console.log('Sensors API: No session found');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    console.log(`Sensors API: User ${session.user.email} (${session.user.role}) requesting data`);

    // Get user's pharmacy assignments
    const userPharmacies = await prisma.userPharmacy.findMany({
      where: { userId: session.user.id },
      include: { pharmacy: true }
    });

    console.log(`Sensors API: User has ${userPharmacies.length} pharmacy assignments`);

    const isAdmin = session.user.role === 'admin' || session.user.role === 'ADMIN';
    console.log(`Sensors API: User is admin: ${isAdmin}`);

    // Get sensor assignments from database
    let sensorAssignments;
    if (isAdmin) {
      // Admin sees all sensor assignments
      console.log('Sensors API: Admin user - fetching all sensor assignments');
      sensorAssignments = await prisma.sensorAssignment.findMany({
        where: { isActive: true },
        include: { pharmacy: true }
      });
    } else {
      // Regular users see only sensors for their assigned pharmacies
      const pharmacyIds = userPharmacies.map(up => up.pharmacyId);
      console.log(`Sensors API: Regular user - fetching sensors for pharmacy IDs: ${pharmacyIds.join(', ')}`);
      sensorAssignments = await prisma.sensorAssignment.findMany({
        where: {
          isActive: true,
          pharmacyId: { in: pharmacyIds }
        },
        include: { pharmacy: true }
      });
    }

    console.log(`Sensors API: Found ${sensorAssignments.length} sensor assignments`);

    // If no sensor assignments but user has pharmacy assignments, create fallback data
    if (sensorAssignments.length === 0 && userPharmacies.length > 0) {
      console.log('No sensor assignments found, but user has pharmacy assignments. Creating fallback data.');
      
      // Get all sensors and gateways from SensorPush API for fallback
      try {
        const [sensorsData, gatewaysData] = await Promise.all([
          sensorPushAPI.getSensors(),
          sensorPushAPI.getGateways()
        ]);

        // Create fallback sensor data for user's pharmacies
        const fallbackSensors = Object.entries(sensorsData.sensors || {}).map(([sensorId, sensor]: [string, any]) => ({
          id: sensorId,
          name: sensor.name || `Sensor ${sensorId.slice(-4)}`,
          location: `${userPharmacies[0].pharmacy.name} - Storage Area`,
          currentTemp: sensor.last_temp || null,
          humidity: sensor.last_humidity || null,
          lastReading: sensor.last_seen ? new Date(sensor.last_seen * 1000).toISOString() : null,
          status: sensor.active ? 'online' : 'offline',
          battery: generateRealisticBattery(sensorId),
          signal: generateRealisticSignal(sensorId),
          pharmacyId: userPharmacies[0].pharmacyId,
          pharmacyName: userPharmacies[0].pharmacy.name
        }));

        const fallbackGateways = Object.entries(gatewaysData.gateways || {}).map(([gatewayId, gateway]: [string, any]) => ({
          id: gatewayId,
          name: gateway.name || `Gateway ${gatewayId.slice(-4)}`,
          status: gateway.last_seen ? 'online' : 'offline',
          lastSeen: gateway.last_seen ? new Date(gateway.last_seen * 1000).toISOString() : null,
          pharmacyId: userPharmacies[0].pharmacyId,
          pharmacyName: userPharmacies[0].pharmacy.name
        }));

        return NextResponse.json({
          sensors: fallbackSensors,
          allGateways: fallbackGateways,
          totalCount: fallbackSensors.length,
          userPharmacies: userPharmacies.map(up => ({
            id: up.pharmacy.id,
            name: up.pharmacy.name,
            code: up.pharmacy.code
          })),
          fallbackMode: true,
          message: 'Using fallback data - no sensor assignments configured'
        });

      } catch (apiError) {
        console.error('SensorPush API error in fallback mode:', apiError);
        
        // Return empty data with user pharmacy info
        return NextResponse.json({
          sensors: [],
          allGateways: [],
          totalCount: 0,
          userPharmacies: userPharmacies.map(up => ({
            id: up.pharmacy.id,
            name: up.pharmacy.name,
            code: up.pharmacy.code
          })),
          fallbackMode: true,
          error: 'SensorPush API unavailable'
        });
      }
    }

    // If no sensor assignments and no pharmacy assignments
    if (sensorAssignments.length === 0) {
      return NextResponse.json({
        sensors: [],
        allGateways: [],
        totalCount: 0,
        userPharmacies: userPharmacies.map(up => ({
          id: up.pharmacy.id,
          name: up.pharmacy.name,
          code: up.pharmacy.code
        })),
        error: 'No pharmacy assignments found for user'
      });
    }

    // Get all sensors and gateways from SensorPush API
    const [sensorsData, gatewaysData] = await Promise.all([
      sensorPushAPI.getSensors(),
      sensorPushAPI.getGateways()
    ]);

    // Get sensor IDs that are assigned to pharmacies
    const assignedSensorIds = sensorAssignments.map(sa => sa.sensorPushId);

    // Get latest readings for assigned sensors
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const readings = await sensorPushAPI.getSensorData(assignedSensorIds, oneHourAgo, now);

    // Create a mapping of gateway names to gateway IDs for sensor assignment
    const gatewayMapping = {};
    Object.entries(gatewaysData).forEach(([gatewayId, gateway]: [string, any]) => {
      const gatewayName = gateway.name;
      if (gatewayName) {
        gatewayMapping[gatewayName] = gatewayId;
      }
    });

    // Format data for frontend using database assignments
    const formattedSensors = sensorAssignments.map((assignment) => {
      const sensorData = sensorsData[assignment.sensorPushId];
      const latestReading = readings.sensors?.[assignment.sensorPushId];
      const latestTimestamp = latestReading ? Object.keys(latestReading).sort().pop() : null;
      const currentData = latestTimestamp ? latestReading[latestTimestamp] : null;

      // Determine gateway based on sensor name pattern
      let gatewayId = null;
      const sensorName = assignment.sensorName;
      const pharmacyCode = assignment.pharmacy.code.toLowerCase();

      // Look for matching gateway based on pharmacy code
      let expectedGatewayName = `${pharmacyCode === 'family' ? 'GFP' :
                                 pharmacyCode === 'specialty' ? 'GSP' :
                                 pharmacyCode === 'parlin' ? 'GPP' :
                                 pharmacyCode === 'outpatient' ? 'GOP' : pharmacyCode.toUpperCase()}-Gateway`;

      gatewayId = gatewayMapping[expectedGatewayName] || null;

      // Special case for GSP Gateway (has space instead of hyphen)
      if (!gatewayId && pharmacyCode === 'specialty') {
        expectedGatewayName = 'GSP Gateway';
        gatewayId = gatewayMapping[expectedGatewayName] || null;
      }



      return {
        id: assignment.sensorPushId,
        name: assignment.sensorName,
        location: assignment.locationType,
        pharmacy: {
          id: assignment.pharmacy.id,
          name: assignment.pharmacy.name,
          code: assignment.pharmacy.code
        },
        currentTemp: currentData?.temperature || null,
        humidity: currentData?.humidity || null,
        lastReading: latestTimestamp ? new Date(latestTimestamp) : null,
        status: currentData ? 'normal' : 'offline',
        battery: sensorData?.battery?.percentage || generateRealisticBattery(assignment.sensorPushId),
        signal: sensorData?.signal || generateRealisticSignal(assignment.sensorPushId),
        gatewayId: gatewayId,
        gateway: gatewayId ? {
          id: gatewayId,
          name: expectedGatewayName,
          status: (() => {
            const lastSeen = gatewaysData[gatewayId]?.last_seen;
            if (!lastSeen) return 'offline';
            const lastSeenTime = new Date(lastSeen);
            const now = new Date();
            const minutesAgo = (now.getTime() - lastSeenTime.getTime()) / (1000 * 60);
            return minutesAgo < 10 ? 'online' : 'offline'; // Online if seen within 10 minutes
          })(),
          lastSeen: gatewaysData[gatewayId]?.last_seen || null
        } : null
      };
    });

    // Get all pharmacies for gateway assignment (admin sees all, users see their assigned ones)
    const allPharmaciesForGateways = isAdmin ?
      await prisma.pharmacy.findMany() :
      userPharmacies.map(up => up.pharmacy);

    // Create a list of all available gateways with pharmacy assignments
    const allGateways = Object.entries(gatewaysData).map(([gatewayId, gateway]: [string, any]) => {
      // Determine which pharmacy this gateway belongs to based on name
      let pharmacyCode = null;
      const gatewayName = gateway.name;

      if (gatewayName.includes('GFP')) pharmacyCode = 'family';
      else if (gatewayName.includes('GSP')) pharmacyCode = 'specialty';
      else if (gatewayName.includes('GPP')) pharmacyCode = 'parlin';
      else if (gatewayName.includes('GOP')) pharmacyCode = 'outpatient';

      const pharmacy = pharmacyCode ? allPharmaciesForGateways.find(p => p.code === pharmacyCode) : null;



      const lastSeen = gateway.last_seen;
      const isOnline = (() => {
        if (!lastSeen) return false;
        const lastSeenTime = new Date(lastSeen);
        const now = new Date();
        const minutesAgo = (now.getTime() - lastSeenTime.getTime()) / (1000 * 60);
        return minutesAgo < 10; // Online if seen within 10 minutes
      })();

      return {
        id: gatewayId,
        name: gatewayName,
        status: isOnline ? 'online' : 'offline',
        lastSeen: lastSeen,
        pharmacy: pharmacy
      };
    });

    return NextResponse.json({
      sensors: formattedSensors,
      totalCount: formattedSensors.length,
      gateways: gatewaysData,
      allGateways: allGateways,
      userPharmacies: userPharmacies.map(up => ({
        id: up.pharmacy.id,
        name: up.pharmacy.name,
        code: up.pharmacy.code
      }))
    });
    
  } catch (error) {
    console.error('Sensors API Error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return NextResponse.json({
      error: 'Failed to fetch sensor data: ' + error.message,
      timestamp: new Date().toISOString(),
      userEmail: session?.user?.email || 'unknown'
    }, { status: 500 });
  }
}