import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@georgies.com' },
    update: {},
    create: {
      email: 'admin@georgies.com',
      name: 'Admin User',
      hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  })

  console.log('✅ Created admin user:', adminUser.email)

  // Create manager user
  const managerPassword = await bcrypt.hash('manager123', 12)
  
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@georgies.com' },
    update: {},
    create: {
      email: 'manager@georgies.com',
      name: 'Manager User',
      hashedPassword: managerPassword,
      role: 'MANAGER',
      isActive: true,
    },
  })

  console.log('✅ Created manager user:', managerUser.email)

  // Create staff user
  const staffPassword = await bcrypt.hash('staff123', 12)
  
  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@georgies.com' },
    update: {},
    create: {
      email: 'staff@georgies.com',
      name: 'Staff User',
      hashedPassword: staffPassword,
      role: 'STAFF',
      isActive: true,
    },
  })

  console.log('✅ Created staff user:', staffUser.email)

  // Create a sample pharmacy
  const pharmacy = await prisma.pharmacy.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Georgie's Pharmacy",
      address: "123 Main Street, Anytown, USA",
      phone: "(555) 123-4567",
      email: "contact@georgies.com",
      isActive: true,
    },
  })

  console.log('✅ Created pharmacy:', pharmacy.name)

  // Link admin user to pharmacy
  await prisma.userPharmacy.upsert({
    where: {
      userId_pharmacyId: {
        userId: adminUser.id,
        pharmacyId: pharmacy.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      pharmacyId: pharmacy.id,
      role: 'ADMIN',
    },
  })

  // Link manager user to pharmacy
  await prisma.userPharmacy.upsert({
    where: {
      userId_pharmacyId: {
        userId: managerUser.id,
        pharmacyId: pharmacy.id,
      },
    },
    update: {},
    create: {
      userId: managerUser.id,
      pharmacyId: pharmacy.id,
      role: 'MANAGER',
    },
  })

  // Link staff user to pharmacy
  await prisma.userPharmacy.upsert({
    where: {
      userId_pharmacyId: {
        userId: staffUser.id,
        pharmacyId: pharmacy.id,
      },
    },
    update: {},
    create: {
      userId: staffUser.id,
      pharmacyId: pharmacy.id,
      role: 'STAFF',
    },
  })

  console.log('✅ Linked users to pharmacy')

  // Create sample sensors
  const sensor1 = await prisma.sensor.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Refrigerator Sensor 1',
      type: 'TEMPERATURE',
      location: 'Main Refrigerator',
      pharmacyId: pharmacy.id,
      isActive: true,
      batteryLevel: 85,
      lastReading: new Date(),
    },
  })

  const sensor2 = await prisma.sensor.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Freezer Sensor 1',
      type: 'TEMPERATURE',
      location: 'Main Freezer',
      pharmacyId: pharmacy.id,
      isActive: true,
      batteryLevel: 92,
      lastReading: new Date(),
    },
  })

  console.log('✅ Created sensors')

  // Create sample temperature readings
  const now = new Date()
  const readings = []

  for (let i = 0; i < 24; i++) {
    const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000)) // Every hour for 24 hours

    // Refrigerator readings (2-8°C)
    readings.push({
      sensorId: sensor1.id,
      temperature: 2 + Math.random() * 6,
      humidity: 45 + Math.random() * 10,
      timestamp,
    })

    // Freezer readings (-25 to -15°C)
    readings.push({
      sensorId: sensor2.id,
      temperature: -25 + Math.random() * 10,
      humidity: 30 + Math.random() * 10,
      timestamp,
    })
  }

  await prisma.temperatureReading.createMany({
    data: readings,
    skipDuplicates: true,
  })

  console.log('✅ Created temperature readings')

  console.log('🎉 Database seed completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })