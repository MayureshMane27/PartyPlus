import { z } from 'zod';

// ─── Auth ─────────────────────────────────────────────────────
export const registerSchema = z.object({
  name: z.string().min(2).max(50).trim(),
  email: z.string().email().toLowerCase(),
  password: z.string().min(6).max(100),
  role: z.enum(['user', 'vendor']).default('user'),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

// ─── Services ─────────────────────────────────────────────────
export const createServiceSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  category: z.enum([
    'venue',
    'catering',
    'decoration',
    'photography',
    'entertainment',
  ]),
  price: z.number().positive().finite(),
  description: z.string().max(500).optional(),
});

export const updateServiceSchema = createServiceSchema.partial();

// ─── Events ───────────────────────────────────────────────────
export const createEventSchema = z.object({
  name: z.string().min(2).max(150).trim(),
  description: z.string().max(1000).optional(),
  date: z.string().datetime(),
  location: z.string().max(200).optional(),
  price: z.number().nonnegative().finite().default(0),
});

// ─── Bookings ─────────────────────────────────────────────────
export const createBookingSchema = z.object({
  eventName: z.string().min(2).max(150).trim(),
  eventDate: z.string().datetime(),
  services: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1),
      price: z.number().nonnegative(),
    })
  ),
  totalPrice: z.number().positive(),
  notes: z.string().max(500).optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled']),
});

// ─── Inferred Types ───────────────────────────────────────────
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
