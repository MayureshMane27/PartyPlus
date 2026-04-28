# PartyPl v2.0 🎉

Event management platform — upgraded from static HTML + MongoDB to a modern full-stack TypeScript app.

## Tech Stack

| Layer | Old | New |
|---|---|---|
| Frontend | React (JS) + localStorage | React 19 + TypeScript + TanStack Query + Zustand |
| Backend | Express.js (JS) + Joi | Hono.js (TS) + Zod |
| ODM | Mongoose | Mongoose (MongoDB Atlas) |
| Database | MongoDB | MongoDB Atlas |
| Auth | JWT (same) | JWT + refresh (same logic, typed) |
| State | prop drilling + localStorage | Zustand (persisted) |
| Data fetching | plain axios | TanStack Query (cache + retries) |

---

## Project Structure

```
partypl/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   └── index.ts        # DB connection (Mongoose)
│   │   ├── models/
│   │   │   ├── User.ts         # User model
│   │   │   ├── Service.ts      # Service model
│   │   │   ├── Event.ts        # Event model
│   │   │   ├── Booking.ts      # Booking model
│   │   │   └── Review.ts       # Review model
│   │   ├── middleware/
│   │   │   └── auth.ts         # JWT auth / vendorAuth / adminAuth
│   │   ├── routes/
│   │   │   ├── auth.ts         # register, login, /me
│   │   │   ├── services.ts     # CRUD services
│   │   │   ├── bookings.ts     # CRUD bookings
│   │   │   ├── events.ts       # CRUD events
│   │   │   └── users.ts        # admin: users, stats, approve
│   │   ├── validators/
│   │   │   └── index.ts        # Zod schemas (shared types)
│   │   └── index.ts            # Hono app entry
│   ├── drizzle.config.ts
│   ├── .env.example
│   └── package.json
│
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.tsx       # Sticky nav with mobile menu
    │   │   ├── ProtectedRoute.tsx
    │   │   └── ui.tsx           # Button, Input, Modal, Badge, etc.
    │   ├── lib/
    │   │   ├── api.ts           # Axios instance + auth interceptors
    │   │   ├── queries.ts       # All TanStack Query hooks
    │   │   └── utils.ts         # cn(), formatPrice(), formatDate()
    │   ├── pages/
    │   │   ├── Home.tsx         # Landing page
    │   │   ├── Login.tsx
    │   │   ├── Register.tsx
    │   │   ├── Dashboard.tsx    # User + vendor dashboard
    │   │   ├── Services.tsx     # Browse + book services
    │   │   ├── Events.tsx       # Browse events
    │   │   ├── Vendors.tsx      # Browse vendors
    │   │   ├── VendorServices.tsx  # Vendor: manage services + events
    │   │   ├── Admin.tsx        # Admin: stats, approvals, user table
    │   │   └── NotFound.tsx
    │   ├── store/
    │   │   └── authStore.ts     # Zustand auth store (persisted)
    │   ├── types/
    │   │   └── index.ts         # TypeScript types
    │   ├── App.tsx              # Router + QueryClient + Toaster
    │   └── main.tsx
    └── package.json
```

---

## Getting Started

### 1. Set up MongoDB Atlas

1. Create a free cluster at [mongodb.com](https://www.mongodb.com/cloud/atlas).
2. Create a database user and whitelist your IP.
3. Copy the connection string (SRV).
4. Paste it into `backend/.env` as `MONGODB_URI`.

---

### 2. Backend setup

```bash
cd backend

# Copy env and fill in values
cp .env.example .env
# Edit .env: MONGODB_URI, JWT_SECRET, CORS_ORIGIN

# Install dependencies
npm install

# Test connection (optional)
npx tsx scratch/test-db.ts

# Start dev server
npm run dev
# → Running on http://localhost:5000
```

**Optional: open Drizzle Studio** (visual database browser)
```bash
npm run db:studio
```

---

### 3. Frontend setup

```bash
cd client

npm install
npm run dev
# → Running on http://localhost:5173
```

Vite proxies `/api/*` → `http://localhost:5000` automatically. No CORS config needed in dev.

---

### 4. Run both together (from root)

```bash
# From /partypl root:
npm install          # installs concurrently
npm run install:all  # installs backend + client deps
npm run dev          # starts both simultaneously
```

---

## Creating an admin user

After running `db:push`, create an admin account directly in the database:

```bash
# Via Drizzle Studio, or psql:
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

Or register normally and update via Drizzle Studio.

---

## API Endpoints

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register user or vendor |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | Bearer | Get current user |

### Services
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/services` | — | List all services |
| GET | `/api/services/mine` | Vendor | Get own services |
| POST | `/api/services` | Vendor | Create service |
| PUT | `/api/services/:id` | Vendor | Update service |
| DELETE | `/api/services/:id` | Vendor | Delete service |

### Events
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/events` | — | List approved events |
| GET | `/api/events/mine` | Vendor | Get own events |
| POST | `/api/events` | Vendor | Submit event for approval |
| PATCH | `/api/events/:id/approve` | Admin | Approve event |

### Bookings
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/bookings` | User | Get own bookings |
| POST | `/api/bookings` | User | Create booking |
| PATCH | `/api/bookings/:id/status` | User | Cancel booking |

### Admin
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/users` | Admin | List all users |
| GET | `/api/users/vendors` | — | List approved vendors |
| GET | `/api/users/stats` | Admin | Platform stats |
| PUT | `/api/users/:id/approve` | Admin | Approve vendor |

---

## Deploy

### Frontend → Vercel
```bash
cd client && npm run build
# Push to GitHub → connect repo in vercel.com
# Set VITE_API_URL if not using the proxy
```

### Backend → Railway
1. Connect GitHub repo in railway.app
2. Set root directory to `backend`
3. Add environment variables from `.env.example`
4. Add a PostgreSQL plugin → copy DATABASE_URL

---

## Database Schema

Collections: `users`, `services`, `events`, `bookings`, `reviews`

Using Mongoose schemas with proper validation, timestamps, and ObjectIds for relations.
