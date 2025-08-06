// src/app/api/admin/hubs/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import { sensorPushAPI } from '@/lib/sensorpush-api';

// Helper functions to generate realistic hub values
function generateRealisticSignal(hubId: string): number {
  const seed = hubId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (seed * 9301 + 49297) % 233280 / 233280;
  return Math.floor(-30 - random * 30); // -30 to -60 dBm for hubs
}

function generateUptime(hubId: string): string {
  const seed = hubId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (seed * 9301 + 49297) % 233280 / 233280;
  const days = Math.floor(1 + random * 30); // 1-30 days
  const hours = Math.floor(random * 24);
  return `${days}d ${hours}h`;
}

function generateFirmwareVersion(hubId: string): string {
  const versions = ['2.1.4', '2.1.3', '2.0.8', '2.1.5'];
  const seed = hubId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return versions[seed % versions.length];
}

// GET - Fetch all hubs
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get pharmacies for mapping
    const pharmacies = await prisma.pharmacy.findMany({
      orderBy: { name: 'asc' }
    });

    // Get gateways from SensorPush API
    let gatewaysData = {};
    let sensorsData = {};
    try {
      gatewaysData = await sensorPushAPI.getGateways();
      sensorsData = await sensorPushAPI.getSensors();
    } catch (error) {
      console.warn('Could not fetch SensorPush data:', error);
      return NextResponse.json({ error: 'Failed to fetch SensorPush data: ' + error.message }, { status: 500 });
    }

    // Create hubs from real SensorPush gateways
    const realHubs = Object.entries(gatewaysData).map(([gatewayId, gateway]: [string, any]) => {
      // Determine pharmacy based on gateway name
      let pharmacy = null;
      const gatewayName = gateway.name;
      
      if (gatewayName.includes('GFP')) {
        pharmacy = pharmacies.find(p => p.code === 'family');
      } else if (gatewayName.includes('GSP')) {
        pharmacy = pharmacies.find(p => p.code === 'specialty');
      } else if (gatewayName.includes('GPP')) {
        pharmacy = pharmacies.find(p => p.code === 'parlin');
      } else if (gatewayName.includes('GOP')) {
        pharmacy = pharmacies.find(p => p.code === 'outpatient');
      }

      // Determine status based on last seen
      let status = 'offline';
      if (gateway.last_seen) {
        const lastSeenTime = new Date(gateway.last_seen);
        const now = new Date();
        const minutesAgo = (now.getTime() - lastSeenTime.getTime()) / (1000 * 60);

        if (minutesAgo < 10) {
          status = 'online';
        } else if (minutesAgo < 60) {
          status = 'warning';
        }
      }

      // Count connected sensors for this gateway's pharmacy
      const connectedSensors = Object.values(sensorsData).filter((sensor: any) => {
        const sensorName = sensor.name;
        if (gatewayName.includes('GFP')) return sensorName.includes('GFP');
        if (gatewayName.includes('GSP')) return sensorName.includes('GSP');
        if (gatewayName.includes('GPP')) return sensorName.includes('GPP');
        if (gatewayName.includes('GOP')) return sensorName.includes('GOP');
        return false;
      }).length;

      // Extract signal strength from connected sensors
      const pharmacySensors = Object.values(sensorsData).filter((sensor: any) => {
        const sensorName = sensor.name;
        if (gatewayName.includes('GFP')) return sensorName.includes('GFP');
        if (gatewayName.includes('GSP')) return sensorName.includes('GSP');
        if (gatewayName.includes('GPP')) return sensorName.includes('GPP');
        if (gatewayName.includes('GOP')) return sensorName.includes('GOP');
        return false;
      });

      const avgSignal = pharmacySensors.length > 0 
        ? Math.round(pharmacySensors.reduce((sum: number, sensor: any) => sum + (sensor.rssi || -70), 0) / pharmacySensors.length)
        : -70;

      // Determine location based on sensor types
      let location = 'Main Storage';
      if (connectedSensors > 3) location = 'Multiple Areas';
      else if (pharmacySensors.some((s: any) => s.name.includes('Freezer'))) location = 'Cold Storage';
      else if (pharmacySensors.some((s: any) => s.name.includes('Pharmacy'))) location = 'Pharmacy Area';

      return {
        id: gatewayId,
        name: gatewayName,
        serialNumber: gatewayId.substring(0, 8), // Use first 8 chars of gateway ID
        model: 'SensorPush Gateway',
        pharmacyName: pharmacy?.name || 'Unknown Pharmacy',
        pharmacyId: pharmacy?.id || null,
        status,
        lastSeen: gateway.last_seen,
        signalStrength: Math.abs(avgSignal), // Convert to positive percentage-like value
        batteryLevel: null, // Gateways don't have batteries
        connectedSensors,
        maxSensors: 50, // SensorPush gateways can handle many sensors
        firmwareVersion: gateway.version || 'Unknown',
        ipAddress: null, // Not provided by SensorPush API
        location,
        uptime: null, // Calculate if needed
        macAddress: null, // Not provided by SensorPush API
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        pharmacy
      };
    });

    const onlineCount = realHubs.filter(h => h.status === 'online').length;
    const offlineCount = realHubs.filter(h => h.status === 'offline').length;
    const totalSensors = realHubs.reduce((sum, h) => sum + h.connectedSensors, 0);

    return NextResponse.json({
      hubs: realHubs,
      pharmacies,
      totalHubs: realHubs.length,
      onlineHubs: onlineCount,
      offlineHubs: offlineCount,
      totalSensors,
      rawGatewayData: gatewaysData, // For debugging
      rawSensorData: sensorsData // For debugging
    });

  } catch (error) {
    console.error('Hubs API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hubs: ' + error.message }, 
      { status: 500 }
    );
  }
}

// POST - Create new hub
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.serialNumber) {
      return NextResponse.json({ 
        error: 'Name and serial number are required' 
      }, { status: 400 });
    }

    // Check if serial number already exists
    const existingHub = await prisma.hub.findUnique({
      where: { serialNumber: data.serialNumber }
    });

    if (existingHub) {
      return NextResponse.json({ 
        error: 'Hub with this serial number already exists' 
      }, { status: 400 });
    }

    const hub = await prisma.hub.create({
      data: {
        name: data.name,
        serialNumber: data.serialNumber,
        macAddress: data.macAddress || null,
        pharmacyId: data.pharmacyId || null,
        location: data.location || null,
        firmwareVersion: data.firmwareVersion || null,
        isActive: true
      },
      include: {
        pharmacy: true
      }
    });

    // Log the creation
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_HUB',
        resource: `hub:${hub.id}`,
        metadata: JSON.stringify({
          hubName: hub.name,
          serialNumber: hub.serialNumber,
          pharmacyId: hub.pharmacyId
        })
      }
    });

    return NextResponse.json({
      hub,
      message: `Hub "${hub.name}" created successfully`
    });

  } catch (error) {
    console.error('Hub creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create hub: ' + error.message },
      { status: 500 }
    );
  }
}

// PUT - Update hub
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json({ 
        error: 'Hub ID is required' 
      }, { status: 400 });
    }

    const hub = await prisma.hub.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        pharmacy: true
      }
    });

    // Log the update
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_HUB',
        resource: `hub:${hub.id}`,
        metadata: JSON.stringify({
          hubName: hub.name,
          changes: updateData
        })
      }
    });

    return NextResponse.json({
      hub,
      message: `Hub "${hub.name}" updated successfully`
    });

  } catch (error) {
    console.error('Hub update error:', error);
    return NextResponse.json(
      { error: 'Failed to update hub: ' + error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete hub
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        error: 'Hub ID is required' 
      }, { status: 400 });
    }

    // Check if hub has sensors
    const hub = await prisma.hub.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            sensors: true
          }
        }
      }
    });

    if (!hub) {
      return NextResponse.json({ error: 'Hub not found' }, { status: 404 });
    }

    if (hub._count.sensors > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete hub with connected sensors. Please reassign sensors first.' 
      }, { status: 400 });
    }

    await prisma.hub.delete({
      where: { id }
    });

    // Log the deletion
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE_HUB',
        resource: `hub:${id}`,
        metadata: JSON.stringify({
          hubName: hub.name,
          serialNumber: hub.serialNumber
        })
      }
    });

    return NextResponse.json({
      message: `Hub "${hub.name}" deleted successfully`
    });

  } catch (error) {
    console.error('Hub deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete hub: ' + error.message },
      { status: 500 }
    );
  }
}
