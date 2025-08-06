const { PrismaClient } = require('@prisma/client');
const { createClerkClient } = require('@clerk/clerk-sdk-node');

const prisma = new PrismaClient();

// Initialize Clerk with your secret key
const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY
});

async function migrateUsersToClerk() {
  try {
    console.log('🚀 Starting user migration from Neon to Clerk...\n');
    
    // Get all users from database
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        isApproved: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        role: true,
        organization: true,
        position: true,
        phoneNumber: true,
        createdAt: true
      }
    });

    console.log(`📊 Found ${users.length} approved users to migrate\n`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const user of users) {
      try {
        console.log(`🔄 Migrating: ${user.email}...`);

        // Map role to Clerk metadata
        const roleMapping = {
          'admin': 'admin',
          'pharmacist': 'pharmacist', 
          'technician': 'technician',
          'USER': 'user'
        };

        // Create user in Clerk
        const clerkUser = await clerk.users.createUser({
          emailAddresses: [{ emailAddress: user.email, verified: true }],
          firstName: user.firstName || user.name?.split(' ')[0] || 'User',
          lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
          publicMetadata: {
            role: roleMapping[user.role] || 'user',
            organization: user.organization || '',
            position: user.position || '',
            phoneNumber: user.phoneNumber || '',
            originalUserId: user.id,
            migratedAt: new Date().toISOString(),
            isApproved: true
          },
          privateMetadata: {
            originalDatabaseId: user.id,
            migrationDate: new Date().toISOString()
          },
          skipPasswordChecks: true,
          skipPasswordRequirement: true
        });

        console.log(`   ✅ Created Clerk user: ${clerkUser.id}`);
        
        // Send password reset email so user can set their password
        await clerk.users.createPasswordReset({
          userId: clerkUser.id
        });
        
        console.log(`   📧 Password reset email sent to ${user.email}`);
        
        successCount++;
        
      } catch (error) {
        console.log(`   ❌ Error migrating ${user.email}: ${error.message}`);
        errorCount++;
        errors.push({
          email: user.email,
          error: error.message
        });
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n🎉 Migration Summary:');
    console.log(`   ✅ Successfully migrated: ${successCount} users`);
    console.log(`   ❌ Failed migrations: ${errorCount} users`);
    
    if (errors.length > 0) {
      console.log('\n❌ Migration Errors:');
      errors.forEach(err => {
        console.log(`   ${err.email}: ${err.error}`);
      });
    }

    console.log('\n📧 Next Steps:');
    console.log('   1. All users will receive password reset emails');
    console.log('   2. They can click the link to set their new password');
    console.log('   3. They can then sign in with their email and new password');
    console.log('   4. All user roles and data have been preserved in Clerk');

  } catch (error) {
    console.error('💥 Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateUsersToClerk();