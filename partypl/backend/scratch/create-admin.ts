import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import dns from 'dns';
import { User } from '../src/models/User.js';

// Force use of Google DNS to resolve MongoDB Atlas SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

async function createAdmin() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not found in .env');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    const adminEmail = 'aryanmane12@gmail.com';
    const adminPassword = 'aryan@4847';

    // Check if admin already exists
    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      console.log('ℹ️ Admin user already exists:', adminEmail);
      console.log('🔄 Updating admin role and approved status...');
      
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      existing.passwordHash = passwordHash;
      existing.role = 'admin';
      existing.approved = true;
      
      await existing.save();
      console.log('✨ Admin updated successfully!');
      console.log('📧 Email:', adminEmail);
      console.log('🔑 Password (updated):', adminPassword);
      process.exit(0);
    }

    console.log('Creating new admin user...');
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    await User.create({
      name: 'System Admin',
      email: adminEmail,
      passwordHash,
      role: 'admin',
      approved: true,
    });

    console.log('✨ Admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create admin:', error);
    process.exit(1);
  }
}

createAdmin();
