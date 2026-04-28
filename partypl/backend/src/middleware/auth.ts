import type { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

export async function auth(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return c.json({ success: false, message: 'No token, authorization denied' }, 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return c.json({ success: false, message: 'User not found' }, 401);
    }

    c.set('user', {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      approved: user.approved
    });
    await next();
  } catch {
    return c.json({ success: false, message: 'Token is not valid' }, 401);
  }
}

export async function vendorAuth(c: Context, next: Next) {
  await auth(c, async () => {
    const user = c.get('user');
    if (user.role !== 'vendor' || !user.approved) {
      return c.json({ success: false, message: 'Approved vendor access required' }, 403);
    }
    await next();
  });
}

export async function adminAuth(c: Context, next: Next) {
  await auth(c, async () => {
    const user = c.get('user');
    if (user.role !== 'admin') {
      return c.json({ success: false, message: 'Admin access required' }, 403);
    }
    await next();
  });
}
