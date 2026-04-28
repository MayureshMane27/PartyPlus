import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { Service } from '../src/models/Service.js';
import { User } from '../src/models/User.js';

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not found');

  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // 1. Create a dummy vendor if none exists
    let vendor = await User.findOne({ role: 'vendor' });
    if (!vendor) {
      const passwordHash = await bcrypt.hash('password123', 12);
      vendor = await User.create({
        name: 'Premium Events Co.',
        email: 'vendor@example.com',
        passwordHash,
        role: 'vendor',
        approved: true,
      });
      console.log('👤 Created dummy vendor');
    }

    // 2. Initial services
    const services = [
      {
        name: 'Grand Ballroom Venue',
        category: 'venue',
        price: 50000,
        description: 'A luxurious ballroom perfect for weddings and corporate galas.',
        vendorId: vendor._id,
      },
      {
        name: 'Gourmet Buffet Catering',
        category: 'catering',
        price: 1500,
        description: 'Multi-cuisine buffet with premium ingredients and professional service.',
        vendorId: vendor._id,
      },
      {
        name: 'Floral & Light Decoration',
        category: 'decoration',
        price: 25000,
        description: 'Bespoke floral arrangements and atmospheric lighting setup.',
        vendorId: vendor._id,
      },
      {
        name: 'Professional Event Photography',
        category: 'photography',
        price: 12000,
        description: 'High-quality photography and videography for your special day.',
        vendorId: vendor._id,
      },
      {
        name: 'Live Jazz Band',
        category: 'entertainment',
        price: 20000,
        description: 'Elegant live music to set the mood for your event.',
        vendorId: vendor._id,
      },
    ];

    await Service.deleteMany({}); // Clear existing
    await Service.insertMany(services);
    console.log('✨ Seeded 5 services successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
