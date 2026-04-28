import { Hono } from 'hono';
import { User } from '../models/User.js';
import { Booking } from '../models/Booking.js';
import { Event } from '../models/Event.js';
import { adminAuth } from '../middleware/auth.js';

const usersRouter = new Hono();

// GET /api/users — admin: list all users
usersRouter.get('/', adminAuth, async (c) => {
  const users = await User.find().sort({ createdAt: -1 });

  return c.json({ 
    success: true, 
    data: users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      approved: u.approved,
      createdAt: (u as any).createdAt,
    })) 
  });
});

// GET /api/users/vendors — public: list approved vendors
usersRouter.get('/vendors', async (c) => {
  const vendors = await User.find({ role: 'vendor' }).sort({ createdAt: -1 });

  return c.json({ 
    success: true, 
    data: vendors.map(v => ({
      id: v._id,
      name: v.name,
      email: v.email,
      createdAt: (v as any).createdAt,
    })) 
  });
});

// PUT /api/users/:id/approve — admin: approve vendor
usersRouter.put('/:id/approve', adminAuth, async (c) => {
  const { id } = c.req.param();

  const user = await User.findById(id);

  if (!user) {
    return c.json({ success: false, message: 'User not found' }, 404);
  }

  if (user.role !== 'vendor') {
    return c.json({ success: false, message: 'Can only approve vendors' }, 400);
  }

  user.approved = true;
  await user.save();

  return c.json({
    success: true,
    message: 'Vendor approved!',
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      approved: user.approved,
    },
  });
});

// DELETE /api/users/:id — admin: remove user
usersRouter.delete('/:id', adminAuth, async (c) => {
  const { id } = c.req.param();
  await User.findByIdAndDelete(id);
  return c.json({ success: true, message: 'User deleted' });
});

// GET /api/users/stats — admin: dashboard stats
usersRouter.get('/stats', adminAuth, async (c) => {
  const [allUsers, allBookings, allEvents] = await Promise.all([
    User.find({}, 'role approved'),
    Booking.find({}, 'status'),
    Event.find({}, 'approved'),
  ]);

  return c.json({
    success: true,
    data: {
      totalUsers: allUsers.filter((u) => u.role === 'user').length,
      totalVendors: allUsers.filter((u) => u.role === 'vendor').length,
      pendingVendors: allUsers.filter(
        (u) => u.role === 'vendor' && !u.approved
      ).length,
      totalBookings: allBookings.length,
      confirmedBookings: allBookings.filter((b) => b.status === 'confirmed')
        .length,
      totalEvents: allEvents.length,
      pendingEvents: allEvents.filter((e) => !e.approved).length,
    },
  });
});

// GET /api/users/activity — admin: recent platform activity
usersRouter.get('/activity', adminAuth, async (c) => {
  const [recentBookings, recentUsers] = await Promise.all([
    Booking.find().sort({ createdAt: -1 }).limit(5),
    User.find().sort({ createdAt: -1 }).limit(5),
  ]);

  return c.json({
    success: true,
    data: {
      bookings: recentBookings.map(b => ({
        id: b._id,
        eventName: b.eventName,
        totalPrice: b.totalPrice,
        createdAt: (b as any).createdAt,
      })),
      users: recentUsers.map(u => ({
        id: u._id,
        name: u.name,
        role: u.role,
        createdAt: (u as any).createdAt,
      })),
    },
  });
});

export default usersRouter;
