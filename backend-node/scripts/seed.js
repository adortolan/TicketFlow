require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../src/config/database');

async function seedAdmin() {
  try {
    console.log('Starting admin user seed...');
    
    // Admin user credentials
    const adminUser = {
      name: 'Admin User',
      email: 'admin@ticketflow.com',
      password: 'admin123',
      cpf: '00000000000',
      role: 'ADMIN'
    };

    // Check if admin user already exists
    const [existingUsers] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [adminUser.email]
    );

    if (existingUsers.length > 0) {
      console.log('Admin user already exists with email:', adminUser.email);
      console.log('Updating password to match seed script...');
      
      // Update the password for existing admin user
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(adminUser.password, saltRounds);
      
      await pool.execute(
        'UPDATE users SET password = ? WHERE email = ?',
        [hashedPassword, adminUser.email]
      );
      
      console.log('Password updated successfully!');
      console.log('Admin user details:', {
        id: existingUsers[0].id,
        name: existingUsers[0].name,
        email: existingUsers[0].email,
        role: existingUsers[0].role
      });
      console.log('You can now login with these credentials.');
      return;
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminUser.password, saltRounds);
    console.log('Password hashed successfully');

    // Insert admin user
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, cpf, role) VALUES (?, ?, ?, ?, ?)',
      [adminUser.name, adminUser.email, hashedPassword, adminUser.cpf, adminUser.role]
    );

    console.log('Admin user created successfully!');
    console.log('User ID:', result.insertId);
    console.log('Email:', adminUser.email);
    console.log('Password:', adminUser.password);
    console.log('Role:', adminUser.role);
    console.log('');
    console.log('You can now login with these credentials to test ADMIN features.');
    
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('Database connection closed');
  }
}

seedAdmin();
