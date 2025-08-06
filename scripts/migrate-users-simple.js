const { PrismaClient } = require('@prisma/client');
const { createClerkClient } = require('@clerk/clerk-sdk-node');

const prisma = new PrismaClient();

// Initialize Clerk with your secret key
const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY
});

async function testClerkConnection() {
  try {
    console.log('🔍 Testing Clerk connection...\n');
    
    // Test with a simple user creation
    const testUser = await clerk.users.createUser({
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      firstName: 'Test',
      lastName: 'User'
    });
    
    console.log('✅ Clerk connection successful!');
    console.log('Test user created:', testUser.id);
    
    // Delete the test user
    await clerk.users.deleteUser(testUser.id);
    console.log('🗑️ Test user deleted');
    
  } catch (error) {
    console.error('❌ Clerk connection failed:', error.message);
    console.error('Full error:', error);
  }
}

async function migrateOneUser() {
  try {
    console.log('🚀 Testing migration with one user...\n');
    
    // Get one user from database
    const user = await prisma.user.findFirst({
      where: {
        isActive: true,
        isApproved: true
      }
    });

    if (!user) {
      console.log('❌ No users found');
      return;
    }

    console.log(`🔄 Testing migration for: ${user.email}`);

    // Try creating user with minimal data first
    const clerkUser = await clerk.users.createUser({
      emailAddresses: [{ emailAddress: user.email }],
      firstName: user.firstName || 'User',
      lastName: user.lastName || 'Name'
    });

    console.log(`✅ Successfully created user: ${clerkUser.id}`);
    
    // Update with metadata
    await clerk.users.updateUserMetadata(clerkUser.id, {
      publicMetadata: {
        role: user.role,
        organization: user.organization || '',
        originalUserId: user.id,
        migratedAt: new Date().toISOString()
      }
    });

    console.log(`✅ Metadata updated for user: ${clerkUser.id}`);
    
  } catch (error) {
    console.error('❌ Migration test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
async function runTests() {
  await testClerkConnection();
  console.log('\n' + '='.repeat(50) + '\n');
  await migrateOneUser();
}

runTests();