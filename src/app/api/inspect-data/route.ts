import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Starting comprehensive data inspection...');

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isApproved: true,
        approvalStatus: true,
        isActive: true,
        createdAt: true,
        userPharmacies: {
          include: {
            pharmacy: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        }
      }
    });

    // Get all pharmacies
    const pharmacies = await prisma.pharmacy.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        displayName: true,
        type: true,
        location: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            sensors: true,
            userPharmacies: true,
            alerts: true,
            sensorAssignments: true
          }
        }
      }
    });

    // Get all sensors
    const sensors = await prisma.sensor.findMany({
      select: {
        id: true,
        sensorPushId: true,
        name: true,
        location: true,
        isActive: true,
        minTemp: true,
        maxTemp: true,
        pharmacy: {
          select: {
            name: true,
            code: true
          }
        },
        _count: {
          select: {
            readings: true,
            alerts: true
          }
        }
      }
    });

    // Get sensor assignments
    const sensorAssignments = await prisma.sensorAssignment.findMany({
      select: {
        id: true,
        sensorPushId: true,
        sensorName: true,
        locationType: true,
        isActive: true,
        pharmacy: {
          select: {
            name: true,
            code: true
          }
        },
        createdAt: true
      }
    });

    // Get recent readings (last 10)
    const recentReadings = await prisma.reading.findMany({
      take: 10,
      orderBy: {
        timestamp: 'desc'
      },
      select: {
        id: true,
        temperature: true,
        humidity: true,
        timestamp: true,
        sensor: {
          select: {
            name: true,
            location: true,
            pharmacy: {
              select: {
                name: true,
                code: true
              }
            }
          }
        }
      }
    });

    // Get active alerts
    const activeAlerts = await prisma.alert.findMany({
      where: {
        resolved: false
      },
      select: {
        id: true,
        type: true,
        severity: true,
        message: true,
        currentValue: true,
        thresholdValue: true,
        createdAt: true,
        sensor: {
          select: {
            name: true,
            location: true
          }
        },
        pharmacy: {
          select: {
            name: true,
            code: true
          }
        }
      }
    });

    // Get temperature policies
    const policies = await prisma.temperaturePolicy.findMany({
      select: {
        id: true,
        title: true,
        version: true,
        isActive: true,
        pharmacy: {
          select: {
            name: true,
            code: true
          }
        },
        createdAt: true
      }
    });

    // Get database counts
    const counts = {
      users: await prisma.user.count(),
      pharmacies: await prisma.pharmacy.count(),
      sensors: await prisma.sensor.count(),
      sensorAssignments: await prisma.sensorAssignment.count(),
      readings: await prisma.reading.count(),
      alerts: await prisma.alert.count(),
      activeAlerts: await prisma.alert.count({ where: { resolved: false } }),
      policies: await prisma.temperaturePolicy.count(),
      sessions: await prisma.session.count(),
      accounts: await prisma.account.count()
    };

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalRecords: Object.values(counts).reduce((a, b) => a + b, 0),
        counts
      },
      data: {
        users: {
          count: users.length,
          data: users
        },
        pharmacies: {
          count: pharmacies.length,
          data: pharmacies
        },
        sensors: {
          count: sensors.length,
          data: sensors
        },
        sensorAssignments: {
          count: sensorAssignments.length,
          data: sensorAssignments
        },
        recentReadings: {
          count: recentReadings.length,
          data: recentReadings
        },
        activeAlerts: {
          count: activeAlerts.length,
          data: activeAlerts
        },
        policies: {
          count: policies.length,
          data: policies
        }
      }
    });

  } catch (error) {
    console.error('❌ Data inspection error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to inspect data',
      details: error.message
    }, { status: 500 });
  }
}