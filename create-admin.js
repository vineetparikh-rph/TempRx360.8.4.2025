const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database
const dbPath = path.join(__dirname, 'prisma', 'pharmacy.db');
const db = new sqlite3.Database(dbPath);

async function createAdminUser() {
  try {
    console.log('Creating admin user...\n');
    
    // Check if admin user already exists
    const checkUser = new Promise((resolve, reject) => {
      db.get("SELECT * FROM User WHERE email = ?", ['admin@georgiesrx.com'], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    const existingUser = await checkUser;
    
    if (existingUser) {
      console.log('✅ Admin user already exists:');
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Name: ${existingUser.name}`);
      console.log(`   Role: ${existingUser.role}`);
      console.log('\n🔑 Try these credentials:');
      console.log('   Email: admin@georgiesrx.com');
      console.log('   Password: admin123 (if this is the original password)');
      console.log('\n💡 If you forgot the password, I can reset it for you.');
      return;
    }
    
    // Create new admin user
    const email = 'admin@georgiesrx.com';
    const password = 'admin123';
    const name = 'Admin User';
    const role = 'admin';
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Generate a simple ID (since we can't use cuid() easily here)
    const userId = 'admin_' + Date.now();
    
    // Insert user
    const insertUser = new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO User (id, email, name, role, hashedPassword, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
        [userId, email, name, role, hashedPassword, new Date().toISOString()],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
    
    await insertUser;
    
    console.log('✅ Admin user created successfully!');
    console.log('\n🔑 Login credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${role}`);
    console.log('\n🌐 You can now login at: http://localhost:3008/signin');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    db.close();
  }
}

createAdminUser();
