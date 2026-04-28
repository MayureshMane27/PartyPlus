import { Hono } from 'hono';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { registerSchema, loginSchema } from '../validators/index.js';
import { emitActivity } from '../lib/socket.js';

const auth = new Hono();

// POST /api/auth/register
auth.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    console.log('Registration attempt for:', body.email, 'Role:', body.role);

    const result = registerSchema.safeParse(body);
    if (!result.success) {
      console.log('Registration validation failed:', result.error.errors[0].message);
      return c.json(
        { success: false, message: result.error.errors[0].message },
        400
      );
    }

    const { name, email, password, role } = result.data;

    // Check duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('Email already registered:', email);
      return c.json({ success: false, message: 'Email already registered!' }, 400);
    }

    console.log('Hashing password for:', email);
    const passwordHash = await bcrypt.hash(password, 12);

    console.log('Creating user in DB:', email);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      // vendors need admin approval; regular users are auto-approved
      approved: role === 'vendor' ? false : true,
    });

    console.log('Generating token for:', email);
    const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN ?? '30d',
    });

    console.log('Registration successful for:', email);
    return c.json(
      {
        success: true,
        message:
          role === 'vendor'
            ? 'Registration successful! Vendor account pending admin approval.'
            : 'Registration successful!',
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          approved: user.approved,
        },
      },
      201
    );
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ success: false, message: 'Internal server error during registration' }, 500);
  }
});

// POST /api/auth/login
auth.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    console.log('Login attempt for:', body.email);
    
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      console.log('Login validation failed:', result.error.errors[0].message);
      return c.json(
        { success: false, message: result.error.errors[0].message },
        400
      );
    }

    const { email, password } = result.data;
    let user;
    try {
      user = await User.findOne({ email });
    } catch (dbError) {
      console.error('Database error during login findOne:', dbError);
      throw new Error('Database connection issue');
    }

    if (!user) {
      console.log('Login failed: User not found:', email);
      return c.json({ success: false, message: 'Invalid email or password!' }, 401);
    }

    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.passwordHash);
    } catch (bcryptError) {
      console.error('Bcrypt error during login:', bcryptError);
      throw new Error('Password verification failed');
    }

    if (!isMatch) {
      console.log('Login failed: Password mismatch for:', email);
      return c.json({ success: false, message: 'Invalid email or password!' }, 401);
    }

    console.log('Login successful for:', email);
    if (user.role === 'vendor' && !user.approved) {
      return c.json(
        { success: false, message: 'Vendor account pending approval!' },
        403
      );
    }

    let token;
    try {
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is missing from environment variables!');
        throw new Error('Configuration error');
      }
      token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN ?? '30d',
      });
    } catch (jwtError) {
      console.error('JWT signing error during login:', jwtError);
      throw new Error('Token generation failed');
    }

    console.log('Login successful for:', email, 'Role:', user.role);
    
    // Broadcast login activity for Admin live feed
    emitActivity('login', { 
      name: user.name, 
      role: user.role, 
      email: user.email 
    });

    return c.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        approved: user.approved,
      },
    });
  } catch (error: any) {
    console.error('Full login process error:', error.message);
    return c.json({ success: false, message: `Internal server error: ${error.message}` }, 500);
  }
});

// GET /api/auth/me — verify token and return current user
auth.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) return c.json({ success: false, message: 'No token' }, 401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) return c.json({ success: false, message: 'User not found' }, 404);
    
    return c.json({ 
      success: true, 
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        approved: user.approved
      } 
    });
  } catch {
    return c.json({ success: false, message: 'Invalid token' }, 401);
  }
});

export default auth;
