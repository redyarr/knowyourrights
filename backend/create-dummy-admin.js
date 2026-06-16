const bcrypt = require('bcrypt');
const { User } = require('./models');

async function createDummyAdmin() {
  try {
    console.log('Creating dummy admin account...');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { email: 'dummy.admin@test.com' } });
    if (existingAdmin) {
      console.log('Dummy admin already exists!');
      console.log('Email: dummy.admin@test.com');
      console.log('Password: admin123');
      return;
    }
    
    // Create the dummy admin (password will be hashed by the model's beforeCreate hook)
    const dummyAdmin = await User.create({
      firstName: 'Dummy',
      lastName: 'Admin',
      email: 'dummy.admin@test.com',
      password: 'admin123',
      role: 'admin',
      country: 'USA',
      city: 'Test City'
    });
    
    console.log('Dummy admin created successfully!');
    console.log('Login credentials:');
    console.log('Email: dummy.admin@test.com');
    console.log('Password: admin123');
    console.log('Role: admin');
    
  } catch (error) {
    console.error('Error creating dummy admin:', error.message);
  } finally {
    process.exit(0);
  }
}

// Run the function
createDummyAdmin();