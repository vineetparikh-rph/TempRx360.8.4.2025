const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixAdmin() {
  try {
    console.log('🔧 Fixing admin user...');

    // Delete existing admin users
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: 'admin@georgies.com' },
          { email: 'admin@georgiesrx.com' }
        ]
      }
    });

    // Create new admin user with correct fields
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@georgiesrx.com',
        name: 'Admin User',
        firstName: 'Admin',
        lastName: 'User',
        hashedPassword,
        role: 'admin',
        isApproved: true,
        approvalStatus: 'approved',
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminUser.email);
    console.log('🔑 Password: admin123');
    console.log('👤 Role:', adminUser.role);
    console.log('✅ Approved:', adminUser.isApproved);
    console.log('📋 Status:', adminUser.approvalStatus);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdmin();