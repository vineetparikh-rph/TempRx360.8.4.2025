const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Checking existing users in database...\n');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        role: true,
        isApproved: true,
        approvalStatus: true,
        organization: true,
        position: true,
        phoneNumber: true,
        isActive: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`📊 Found ${users.length} users in database:\n`);
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Name: ${user.firstName || ''} ${user.lastName || ''} (${user.name || 'N/A'})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.isApproved ? '✅ Approved' : '⏳ Pending'} (${user.approvalStatus})`);
      console.log(`   Organization: ${user.organization || 'N/A'}`);
      console.log(`   Position: ${user.position || 'N/A'}`);
      console.log(`   Phone: ${user.phoneNumber || 'N/A'}`);
      console.log(`   Active: ${user.isActive ? 'Yes' : 'No'}`);
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
      console.log('');
    });

    // Summary by role
    const roleStats = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    console.log('📈 Users by role:');
    Object.entries(roleStats).forEach(([role, count]) => {
      console.log(`   ${role}: ${count}`);
    });

    // Summary by approval status
    const approvedCount = users.filter(u => u.isApproved).length;
    const pendingCount = users.filter(u => !u.isApproved).length;
    
    console.log('\n📋 Approval status:');
    console.log(`   ✅ Approved: ${approvedCount}`);
    console.log(`   ⏳ Pending: ${pendingCount}`);

  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();