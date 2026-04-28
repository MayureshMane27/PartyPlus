/**
 * fix-passwords.mjs
 * 
 * Run this script ONCE to hash all plain-text passwords in your MongoDB collection.
 * This fixes users you manually added in MongoDB Compass with plain passwords.
 * 
 * Usage: node fix-passwords.mjs
 */

import 'dotenv/config';
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']); // Fix Windows SRV resolution
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env');
  process.exit(1);
}

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  passwordHash: String,
  role: String,
  approved: Boolean,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function fixPasswords() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected!\n');

  const users = await User.find({});
  console.log(`Found ${users.length} user(s) in the database:\n`);

  for (const user of users) {
    const pwd = user.passwordHash;
    
    // Check if already a bcrypt hash (starts with $2a$ or $2b$)
    const isAlreadyHashed = pwd && (pwd.startsWith('$2a$') || pwd.startsWith('$2b$'));
    
    if (isAlreadyHashed) {
      console.log(`✅ [${user.email}] — already hashed, skipping.`);
    } else if (pwd) {
      // It's a plain-text password — hash it now
      const hashed = await bcrypt.hash(pwd, 12);
      await User.updateOne({ _id: user._id }, { passwordHash: hashed });
      console.log(`🔐 [${user.email}] — plain password "${pwd}" → hashed & saved.`);
    } else {
      console.log(`⚠️  [${user.email}] — no password found, skipping.`);
    }
  }

  console.log('\n✅ Done! All passwords are now properly hashed.');
  console.log('You can now log in with your original plain-text passwords.');
  await mongoose.disconnect();
}

fixPasswords().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
