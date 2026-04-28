import 'dotenv/config';
import dns from 'node:dns';
// Force use of Google DNS to resolve MongoDB SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { rateLimiter } from 'hono-rate-limiter';
import { testConnection } from './db/index.js';
import authRouter from './routes/auth.js';
import servicesRouter from './routes/services.js';
import bookingsRouter from './routes/bookings.js';
import eventsRouter from './routes/events.js';
import usersRouter from './routes/users.js';

const app = new Hono();

// ─── Global Middleware ─────────────────────────────────────────
app.use('*', logger());
app.use('*', prettyJSON());
app.use(
  '*',
  cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Rate Limiter (Temporarily disabled for stability) ─────────
/*
app.use(
  '/api/*',
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    keyGenerator: (c) =>
      c.req.header('x-forwarded-for') ?? c.req.raw.headers.get('host') ?? 'unknown',
  })
);
*/

// ─── Health Check ─────────────────────────────────────────────
app.get('/', (c) =>
  c.json({
    name: 'PartyPlus API v2.0',
    status: 'running',
    stack: 'Hono + Mongoose + MongoDB',
    endpoints: [
      '/api/auth/register',
      '/api/auth/login',
      '/api/auth/me',
      '/api/services',
      '/api/bookings',
      '/api/events',
      '/api/users',
    ],
  })
);

// ─── Routes ───────────────────────────────────────────────────
app.route('/api/auth', authRouter);
app.route('/api/services', servicesRouter);
app.route('/api/bookings', bookingsRouter);
app.route('/api/events', eventsRouter);
app.route('/api/users', usersRouter);

// ─── 404 ──────────────────────────────────────────────────────
app.notFound((c) =>
  c.json({ success: false, message: 'API endpoint not found' }, 404)
);

// ─── Error Handler ────────────────────────────────────────────
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ success: false, message: 'Internal server error' }, 500);
});

// ─── Start ────────────────────────────────────────────────────
import { initSocket } from './lib/socket.js';

const PORT = Number(process.env.PORT) || 5000;

testConnection()
  .then(() => {
    const server = serve({ fetch: app.fetch, port: PORT }, (info) => {
      console.log(`🚀 PartyPlus API running on http://localhost:${info.port}`);
      console.log(`📦 Stack: Hono.js + Mongoose + MongoDB`);
      console.log(`🌍 CORS origin: ${process.env.CORS_ORIGIN}`);
    });

    // Initialize Socket.io with the node server
    initSocket(server);
  })
  .catch((err) => {
    console.error('❌ Failed to connect to database:', err);
    process.exit(1);
  });

export default app;
