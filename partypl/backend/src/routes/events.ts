import { Hono } from 'hono';
import { Event } from '../models/Event.js';
import { User } from '../models/User.js';
import { vendorAuth, adminAuth } from '../middleware/auth.js';
import { createEventSchema } from '../validators/index.js';

const eventsRouter = new Hono();

// GET /api/events — public: approved events
eventsRouter.get('/', async (c) => {
  const events = await Event.find({ approved: true })
    .populate('vendorId', 'name')
    .sort({ date: -1 });

  const data = events.map(e => ({
    id: e._id,
    name: e.name,
    description: e.description,
    date: e.date,
    location: e.location,
    price: e.price,
    createdAt: (e as any).createdAt,
    vendor: {
      id: (e.vendorId as any)._id,
      name: (e.vendorId as any).name,
    }
  }));

  return c.json({ success: true, data });
});

// GET /api/events/all — admin: all events (including pending)
eventsRouter.get('/all', adminAuth, async (c) => {
  const events = await Event.find()
    .populate('vendorId', 'name')
    .sort({ createdAt: -1 });

  const data = events.map(e => ({
    id: e._id,
    name: e.name,
    description: e.description,
    date: e.date,
    location: e.location,
    price: e.price,
    approved: e.approved,
    createdAt: (e as any).createdAt,
    vendor: {
      id: (e.vendorId as any)._id,
      name: (e.vendorId as any).name,
    }
  }));

  return c.json({ success: true, data });
});

// GET /api/events/mine — vendor's own events
eventsRouter.get('/mine', vendorAuth, async (c) => {
  const user = c.get('user');

  const events = await Event.find({ vendorId: user.id })
    .sort({ createdAt: -1 });

  return c.json({
    success: true,
    data: events.map(e => ({
      ...e.toObject(),
      id: e._id
    }))
  });
});

// POST /api/events — vendor creates event (pending approval)
eventsRouter.post('/', vendorAuth, async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const result = createEventSchema.safeParse(body);

  if (!result.success) {
    return c.json(
      { success: false, message: result.error.errors[0].message },
      400
    );
  }

  const event = await Event.create({
    ...result.data,
    date: new Date(result.data.date),
    vendorId: user.id,
    approved: false,
  });

  return c.json(
    {
      success: true,
      message: 'Event submitted for approval!',
      data: { ...event.toObject(), id: event._id }
    },
    201
  );
});

// PATCH /api/events/:id/approve — admin approves event
eventsRouter.patch('/:id/approve', adminAuth, async (c) => {
  const { id } = c.req.param();

  const event = await Event.findByIdAndUpdate(
    id,
    { approved: true },
    { new: true }
  );

  if (!event) {
    return c.json({ success: false, message: 'Event not found' }, 404);
  }

  return c.json({
    success: true,
    message: 'Event approved!',
    data: { ...event.toObject(), id: event._id }
  });
});

// DELETE /api/events/:id — vendor/admin: remove event
// Restriction: vendors can only remove AFTER the event date has passed
eventsRouter.delete('/:id', vendorAuth, async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();

  const event = await Event.findById(id);

  if (!event) {
    return c.json({ success: false, message: 'Event not found' }, 404);
  }

  // Admin can always delete
  if (user.role === 'admin') {
    await Event.findByIdAndDelete(id);
    return c.json({ success: true, message: 'Event deleted (Admin)' });
  }

  // Vendor check
  if (event.vendorId.toString() !== user.id) {
    return c.json({ success: false, message: 'Forbidden' }, 403);
  }

  const eventDate = new Date(event.date);
  const now = new Date();

  if (eventDate > now) {
    return c.json({ 
      success: false, 
      message: 'Events can only be removed after the scheduled date has passed.' 
    }, 400);
  }

  await Event.findByIdAndDelete(id);
  return c.json({ success: true, message: 'Event removed successfully' });
});

export default eventsRouter;
