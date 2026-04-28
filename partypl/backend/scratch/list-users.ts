import 'dotenv/config';
import mongoose from 'mongoose';
import dns from 'dns';
import { User } from '../src/models/User.js';

// Force use of Google DNS to resolve MongoDB Atlas SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

async function listUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected.');

    const users = await User.find({});
    console.log('--- USERS ---');
    users.forEach(u => {
      console.log(`ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, Approved: ${u.approved}`);
    });
    console.log('-------------');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

listUsers();
