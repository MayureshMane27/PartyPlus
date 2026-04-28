import 'dotenv/config';
import mongoose from 'mongoose';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);

const uri = process.env.MONGODB_URI;
console.log('Detected MONGODB_URI:', uri ? uri.replace(/:([^@]+)@/, ':****@') : 'UNDEFINED');

async function test() {
  if (!uri) {
    console.error('Error: MONGODB_URI is undefined in process.env');
    process.exit(1);
  }

  try {
    console.log('Attempting to connect...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected successfully to:', mongoose.connection.host);
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Connection failed:');
    console.error(err);
    process.exit(1);
  }
}

test();
