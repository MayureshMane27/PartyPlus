import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Enums ────────────────────────────────────────────────────
export const roleEnum = pgEnum('role', ['user', 'vendor', 'admin']);
export const bookingStatusEnum = pgEnum('booking_status', [
  'pending',
  'confirmed',
  'cancelled',
]);
export const serviceCategoryEnum = pgEnum('service_category', [
  'venue',
  'catering',
  'decoration',
  'photography',
  'entertainment',
]);

// ─── Users ────────────────────────────────────────────────────
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 50 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: roleEnum('role').notNull().default('user'),
  approved: boolean('approved').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── Services ─────────────────────────────────────────────────
export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  category: serviceCategoryEnum('category').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  description: text('description'),
  vendorId: uuid('vendor_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── Events ───────────────────────────────────────────────────
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 150 }).notNull(),
  description: text('description'),
  date: timestamp('date').notNull(),
  location: varchar('location', { length: 200 }),
  price: numeric('price', { precision: 10, scale: 2 }).notNull().default('0'),
  vendorId: uuid('vendor_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  approved: boolean('approved').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── Bookings ─────────────────────────────────────────────────
export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  eventName: varchar('event_name', { length: 150 }).notNull(),
  eventDate: timestamp('event_date').notNull(),
  totalPrice: numeric('total_price', { precision: 10, scale: 2 }).notNull(),
  status: bookingStatusEnum('status').notNull().default('confirmed'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── Booking Services (junction) ──────────────────────────────
export const bookingServices = pgTable('booking_services', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookingId: uuid('booking_id')
    .notNull()
    .references(() => bookings.id, { onDelete: 'cascade' }),
  serviceId: uuid('service_id').references(() => services.id, {
    onDelete: 'set null',
  }),
  serviceName: varchar('service_name', { length: 100 }).notNull(),
  servicePrice: numeric('service_price', { precision: 10, scale: 2 }).notNull(),
});

// ─── Reviews ──────────────────────────────────────────────────
export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  vendorId: uuid('vendor_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Relations ────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  services: many(services),
  events: many(events),
  bookings: many(bookings),
  reviewsGiven: many(reviews, { relationName: 'reviewer' }),
  reviewsReceived: many(reviews, { relationName: 'vendor' }),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  vendor: one(users, { fields: [services.vendorId], references: [users.id] }),
  bookingServices: many(bookingServices),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  vendor: one(users, { fields: [events.vendorId], references: [users.id] }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, { fields: [bookings.userId], references: [users.id] }),
  bookingServices: many(bookingServices),
}));

export const bookingServicesRelations = relations(
  bookingServices,
  ({ one }) => ({
    booking: one(bookings, {
      fields: [bookingServices.bookingId],
      references: [bookings.id],
    }),
    service: one(services, {
      fields: [bookingServices.serviceId],
      references: [services.id],
    }),
  })
);

export const reviewsRelations = relations(reviews, ({ one }) => ({
  reviewer: one(users, {
    fields: [reviews.userId],
    references: [users.id],
    relationName: 'reviewer',
  }),
  vendor: one(users, {
    fields: [reviews.vendorId],
    references: [users.id],
    relationName: 'vendor',
  }),
}));
