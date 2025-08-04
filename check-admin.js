const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    console.log('🔍 Checking admin user...');

    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@georgiesrx.com' }
    });

    if (adminUser) {
      console.log('✅ Admin user found:');
      console.log('📧 Email:', adminUser.email);
      console.log('👤 Name:', adminUser.name);
      console.log('🔑 Has Password:', !!adminUser.hashedPassword);
      console.log('👤 Role:', adminUser.role);
      console.log('✅ Approved:', adminUser.isApproved);
      console.log('📋 Status:', adminUser.approvalStatus);
      console.log('📅 Created:', adminUser.createdAt);
    } else {
      console.log('❌ Admin user not found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();