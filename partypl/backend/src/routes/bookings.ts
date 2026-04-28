import { Hono } from 'hono';
import { Booking } from '../models/Booking.js';
import { auth, adminAuth } from '../middleware/auth.js';
import { createBookingSchema, updateBookingStatusSchema } from '../validators/index.js';
import { emitActivity } from '../lib/socket.js';

const bookingsRouter = new Hono();

// GET /api/bookings — get current user's bookings
bookingsRouter.get('/', auth, async (c) => {
  const user = c.get('user');

  const bookings = await Booking.find({ userId: user.id })
    .sort({ createdAt: -1 });

  return c.json({ 
    success: true, 
    data: bookings.map(b => ({
      ...b.toObject(),
      id: b._id
    })) 
  });
});

// GET /api/bookings/all — admin: get all bookings
bookingsRouter.get('/all', adminAuth, async (c) => {
  const bookings = await Booking.find()
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });

  return c.json({ 
    success: true, 
    data: bookings.map(b => ({
      ...b.toObject(),
      id: b._id,
      userName: (b.userId as any)?.name,
      userEmail: (b.userId as any)?.email
    })) 
  });
});

// GET /api/bookings/:id — get single booking
bookingsRouter.get('/:id', auth, async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();

  const booking = await Booking.findById(id);

  if (!booking) {
    return c.json({ success: false, message: 'Booking not found' }, 404);
  }

  // users can only see their own bookings; admins can see all
  if (booking.userId.toString() !== user.id && user.role !== 'admin') {
    return c.json({ success: false, message: 'Forbidden' }, 403);
  }

  return c.json({ 
    success: true, 
    data: { ...booking.toObject(), id: booking._id } 
  });
});

// POST /api/bookings — create booking
bookingsRouter.post('/', auth, async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const result = createBookingSchema.safeParse(body);

  if (!result.success) {
    return c.json(
      { success: false, message: result.error.errors[0].message },
      400
    );
  }

  const { eventName, eventDate, services, totalPrice, notes } = result.data;

  const booking = await Booking.create({
    userId: user.id,
    eventName,
    eventDate: new Date(eventDate),
    totalPrice,
    notes,
    status: 'confirmed',
    services: services.map(s => ({
      serviceId: s.id,
      serviceName: s.name,
      servicePrice: s.price
    }))
  });

  // Broadcast new booking for Admin live feed
  emitActivity('booking', {
    userName: user.name,
    eventName: booking.eventName,
    totalPrice: booking.totalPrice,
  });

  return c.json(
    { 
      success: true, 
      message: 'Booking confirmed!', 
      data: { ...booking.toObject(), id: booking._id } 
    },
    201
  );
});

// PATCH /api/bookings/:id/status — update status
bookingsRouter.patch('/:id/status', auth, async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  const body = await c.req.json();
  const result = updateBookingStatusSchema.safeParse(body);

  if (!result.success) {
    return c.json(
      { success: false, message: result.error.errors[0].message },
      400
    );
  }

  const booking = await Booking.findById(id);

  if (!booking) {
    return c.json({ success: false, message: 'Booking not found' }, 404);
  }

  // Only the owner can cancel; admin can change any status
  if (booking.userId.toString() !== user.id && user.role !== 'admin') {
    return c.json({ success: false, message: 'Forbidden' }, 403);
  }

  booking.status = result.data.status as any;
  await booking.save();

  return c.json({ 
    success: true, 
    message: 'Status updated!', 
    data: { ...booking.toObject(), id: booking._id } 
  });
});

export default bookingsRouter;
