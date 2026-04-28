/**
 * seed.mjs — PartyPl Demo Data Seeder
 *
 * Inserts realistic demo data into your MongoDB "test" database.
 * Passwords are properly bcrypt-hashed so login works immediately.
 *
 * Usage:  node seed.mjs
 * ⚠️  This will CLEAR existing users/services/events/bookings first!
 */

import 'dotenv/config';
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']); // Fix Windows SRV DNS resolution

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// ─── Connect ──────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error('❌ MONGODB_URI missing in .env'); process.exit(1); }

console.log('🔌 Connecting to MongoDB...');
await mongoose.connect(MONGODB_URI);
console.log('✅ Connected to:', MONGODB_URI.replace(/:([^@]+)@/, ':****@'), '\n');

// ─── Schemas ──────────────────────────────────────────────────
const User = mongoose.model('User', new mongoose.Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role:         { type: String, enum: ['user', 'vendor', 'admin'], default: 'user' },
  approved:     { type: Boolean, default: true },
}, { timestamps: true }));

const Service = mongoose.model('Service', new mongoose.Schema({
  name:        { type: String, required: true },
  category:    { type: String, enum: ['venue', 'catering', 'decoration', 'photography', 'entertainment'], required: true },
  price:       { type: Number, required: true },
  description: { type: String },
  vendorId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true }));

const Event = mongoose.model('Event', new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String },
  date:        { type: Date, required: true },
  location:    { type: String },
  price:       { type: Number, default: 0 },
  vendorId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approved:    { type: Boolean, default: true },
}, { timestamps: true }));

const bookingServiceSchema = new mongoose.Schema({
  serviceId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  serviceName:  { type: String, required: true },
  servicePrice: { type: Number, required: true },
});
const Booking = mongoose.model('Booking', new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventName:  { type: String, required: true },
  eventDate:  { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  status:     { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'confirmed' },
  notes:      { type: String },
  services:   [bookingServiceSchema],
}, { timestamps: true }));

// ─── Clear old demo data ───────────────────────────────────────
console.log('🗑️  Clearing old data...');
await Promise.all([
  User.deleteMany({}),
  Service.deleteMany({}),
  Event.deleteMany({}),
  Booking.deleteMany({}),
]);
console.log('✅ Cleared.\n');

// ─── Hash helper ──────────────────────────────────────────────
const hash = (pwd) => bcrypt.hash(pwd, 12);

// ─── 1. USERS ─────────────────────────────────────────────────
console.log('👤 Creating users...');
const [adminUser, vendor1, vendor2, user1, user2] = await User.insertMany([
  {
    name:         'Admin',
    email:        'admin@partypl.com',
    passwordHash: await hash('Admin@123'),
    role:         'admin',
    approved:     true,
  },
  {
    name:         'Raj Events',
    email:        'raj@vendor.com',
    passwordHash: await hash('Vendor@123'),
    role:         'vendor',
    approved:     true,
  },
  {
    name:         'Priya Decors',
    email:        'priya@vendor.com',
    passwordHash: await hash('Vendor@123'),
    role:         'vendor',
    approved:     true,
  },
  {
    name:         'Mayuresh Mane',
    email:        'mayuresh@user.com',
    passwordHash: await hash('User@123'),
    role:         'user',
    approved:     true,
  },
  {
    name:         'Atharv Patil',
    email:        'atharv@user.com',
    passwordHash: await hash('User@123'),
    role:         'user',
    approved:     true,
  },
]);

console.log('  ✅ admin@partypl.com       → password: Admin@123  (role: admin)');
console.log('  ✅ raj@vendor.com          → password: Vendor@123 (role: vendor)');
console.log('  ✅ priya@vendor.com        → password: Vendor@123 (role: vendor)');
console.log('  ✅ mayuresh@user.com       → password: User@123   (role: user)');
console.log('  ✅ atharv@user.com         → password: User@123   (role: user)\n');

// ─── 2. SERVICES ──────────────────────────────────────────────
console.log('🎪 Creating services...');
const [svc1, svc2, svc3, svc4, svc5] = await Service.insertMany([
  {
    name:        'Grand Ballroom Venue',
    category:    'venue',
    price:       50000,
    description: 'Luxurious ballroom accommodating up to 500 guests with full AV setup.',
    vendorId:    vendor1._id,
  },
  {
    name:        'Royal Catering Package',
    category:    'catering',
    price:       800,
    description: 'Per-plate premium catering with live counters, desserts, and welcome drinks.',
    vendorId:    vendor1._id,
  },
  {
    name:        'Floral Fantasy Decoration',
    category:    'decoration',
    price:       25000,
    description: 'Full venue decoration with fresh flowers, drapes, and lighting.',
    vendorId:    vendor2._id,
  },
  {
    name:        'Premium Photography + Reels',
    category:    'photography',
    price:       30000,
    description: '2 photographers + 1 videographer, drone shots, same-day highlight reel.',
    vendorId:    vendor2._id,
  },
  {
    name:        'DJ Night Entertainment',
    category:    'entertainment',
    price:       15000,
    description: 'Professional DJ with light show, fog machine, and 5-hour set.',
    vendorId:    vendor1._id,
  },
]);
console.log('  ✅ 5 services created.\n');

// ─── 3. EVENTS ────────────────────────────────────────────────
console.log('🎉 Creating events...');
await Event.insertMany([
  {
    name:        'Navratri Gala Night 2025',
    description: 'A spectacular Navratri celebration with traditional garba, live music, and themed decoration.',
    date:        new Date('2025-10-05T19:00:00'),
    location:    'Grand Ballroom, Pune',
    price:       1500,
    vendorId:    vendor1._id,
    approved:    true,
  },
  {
    name:        'Corporate Annual Meet & Gala',
    description: 'Professional corporate event with networking dinner, awards ceremony, and entertainment.',
    date:        new Date('2025-12-15T18:00:00'),
    location:    'Hotel Marriott, Mumbai',
    price:       2500,
    vendorId:    vendor1._id,
    approved:    true,
  },
  {
    name:        'Haldi & Mehendi Celebration',
    description: 'Traditional pre-wedding celebration with floral decor, dhol, and mehendi artists.',
    date:        new Date('2025-11-20T10:00:00'),
    location:    'Garden Lawn, Nashik',
    price:       1200,
    vendorId:    vendor2._id,
    approved:    true,
  },
  {
    name:        'New Year Bash 2026',
    description: 'Ring in 2026 with a massive party — DJ, fireworks, open bar, and a midnight countdown.',
    date:        new Date('2025-12-31T21:00:00'),
    location:    'Rooftop Arena, Pune',
    price:       3000,
    vendorId:    vendor2._id,
    approved:    true,
  },
  {
    name:        'Kids Birthday Extravaganza',
    description: 'Fun-filled birthday party with games, magic show, clowns, and themed cake.',
    date:        new Date('2025-09-14T11:00:00'),
    location:    'Fun Zone Hall, Pimpri',
    price:       800,
    vendorId:    vendor1._id,
    approved:    true,
  },
]);
console.log('  ✅ 5 events created.\n');

// ─── 4. BOOKINGS ──────────────────────────────────────────────
console.log('📅 Creating bookings...');
await Booking.insertMany([
  {
    userId:     user1._id,
    eventName:  'Mayuresh Birthday Party',
    eventDate:  new Date('2025-09-10'),
    totalPrice: 95000,
    status:     'confirmed',
    notes:      'Need veg catering only. Outdoor backup required.',
    services:   [
      { serviceId: svc1._id, serviceName: svc1.name, servicePrice: svc1.price },
      { serviceId: svc2._id, serviceName: svc2.name, servicePrice: 800 * 50 },
      { serviceId: svc3._id, serviceName: svc3.name, servicePrice: svc3.price },
    ],
  },
  {
    userId:     user1._id,
    eventName:  'Office Farewell Party',
    eventDate:  new Date('2025-08-25'),
    totalPrice: 45000,
    status:     'confirmed',
    notes:      'Small gathering, 30 people.',
    services:   [
      { serviceId: svc4._id, serviceName: svc4.name, servicePrice: svc4.price },
      { serviceId: svc5._id, serviceName: svc5.name, servicePrice: svc5.price },
    ],
  },
  {
    userId:     user2._id,
    eventName:  'Atharv Wedding Reception',
    eventDate:  new Date('2025-11-30'),
    totalPrice: 120000,
    status:     'pending',
    notes:      'Grand wedding, 400+ guests expected.',
    services:   [
      { serviceId: svc1._id, serviceName: svc1.name, servicePrice: svc1.price },
      { serviceId: svc2._id, serviceName: svc2.name, servicePrice: 800 * 100 },
      { serviceId: svc3._id, serviceName: svc3.name, servicePrice: svc3.price },
      { serviceId: svc4._id, serviceName: svc4.name, servicePrice: svc4.price },
    ],
  },
]);
console.log('  ✅ 3 bookings created.\n');

// ─── Done ─────────────────────────────────────────────────────
console.log('════════════════════════════════════════════════');
console.log('🎊 DATABASE SEEDED SUCCESSFULLY!');
console.log('════════════════════════════════════════════════');
console.log('\n📋 LOGIN CREDENTIALS:');
console.log('  Role   │ Email                  │ Password');
console.log('  ───────┼────────────────────────┼──────────────');
console.log('  admin  │ admin@partypl.com       │ Admin@123');
console.log('  vendor │ raj@vendor.com          │ Vendor@123');
console.log('  vendor │ priya@vendor.com        │ Vendor@123');
console.log('  user   │ mayuresh@user.com       │ User@123');
console.log('  user   │ atharv@user.com         │ User@123');
console.log('\n✅ Open MongoDB Compass → "test" database to see your data!');
console.log('════════════════════════════════════════════════\n');

await mongoose.disconnect();
