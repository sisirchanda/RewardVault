# 🏦 RewardVault

> A full-stack cashback & affiliate rewards platform — 100% original, built from scratch.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start — Local](#quick-start--local-development)
- [Quick Start — Docker](#quick-start--docker)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Cashback Tracking Flow](#cashback-tracking-flow)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Production Checklist](#production-checklist)
- [Legal & Compliance](#legal--compliance)

---

## Overview

RewardVault is an original cashback rewards platform where users discover deals from
e-commerce partners, click tracked affiliate links, earn cashback on purchases, and
withdraw real money. It includes a complete admin panel, affiliate tracking simulation,
wallet system, and withdrawal approval flow.

**This project is 100% original.** No code, UI, branding, or proprietary content has been
copied from any existing platform. All merchant data is fictional/mock.

---

## Features

### User-Facing
- ✅ Email signup with OTP verification
- ✅ JWT authentication (7-day sessions)
- ✅ Merchant & offer discovery with search, filters, sorting
- ✅ Category browsing (Fashion, Electronics, Travel, etc.)
- ✅ Cashback tracking via unique click IDs
- ✅ Affiliate redirect service with tracking layer
- ✅ Earnings dashboard (pending, confirmed, withdrawable)
- ✅ Full transaction history with status filtering & pagination
- ✅ Withdrawal requests (bank transfer, PayPal, gift card)
- ✅ Referral system with unique codes
- ✅ In-app notifications

### Admin Panel
- ✅ Analytics dashboard (users, cashback pipeline, top merchants)
- ✅ User management
- ✅ Merchant CRUD (create, update, toggle active)
- ✅ Withdrawal approval / rejection workflow
- ✅ Transaction confirmation (pending → confirmed)

### Technical
- ✅ Simulated webhook/postback for cashback conversion
- ✅ Atomic wallet operations (PostgreSQL transactions)
- ✅ Rate limiting on auth endpoints
- ✅ Helmet security headers
- ✅ GDPR consent tracking
- ✅ Email notifications via Nodemailer (MailHog in dev)
- ✅ Docker Compose with health checks
- ✅ Test suite with mocked DB

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | Next.js 14, React 18, TypeScript    |
| Styling   | Tailwind CSS + custom CSS variables |
| Backend   | Node.js 20, Express 4               |
| Database  | PostgreSQL 15                       |
| Cache     | Redis 7 (session/rate-limit ready)  |
| Auth      | JWT + bcrypt + OTP email            |
| Email     | Nodemailer (MailHog in dev)         |
| Tracking  | nanoid click IDs + redirect service |
| Testing   | Jest + Supertest                    |
| Container | Docker + Docker Compose             |

---

## Project Structure

```
rewardvault/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # PostgreSQL pool + helpers
│   │   ├── controllers/
│   │   │   ├── auth.controller.js   # Signup, login, OTP, /me
│   │   │   ├── merchant.controller.js
│   │   │   ├── tracking.controller.js  # Click tracking, webhook
│   │   │   ├── wallet.controller.js    # Balance, transactions, withdrawals
│   │   │   └── admin.controller.js     # Analytics, user management
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT guard, admin guard
│   │   │   └── validate.js          # express-validator formatter
│   │   ├── routes/
│   │   │   └── index.js             # All API routes
│   │   ├── services/
│   │   │   └── email.service.js     # OTP + cashback emails
│   │   ├── tests/
│   │   │   └── api.test.js
│   │   └── index.js                 # Express app entry
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx             # Homepage
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   ├── merchants/
│   │   │   │   ├── page.tsx         # Merchant listing
│   │   │   │   └── [slug]/page.tsx  # Merchant detail
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx         # Earnings dashboard
│   │   │   │   ├── wallet/page.tsx  # Withdrawal page
│   │   │   │   └── transactions/page.tsx
│   │   │   ├── admin/page.tsx       # Admin panel
│   │   │   ├── terms/page.tsx
│   │   │   ├── privacy/page.tsx
│   │   │   ├── globals.css          # Design system + tokens
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── Footer.tsx
│   │   │   └── merchant/
│   │   │       └── MerchantCard.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.tsx          # Auth context
│   │   └── lib/
│   │       └── api.ts               # Type-safe API client
│   ├── Dockerfile
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── database/
│   ├── schema.sql                   # Full PostgreSQL schema
│   └── seed.sql                     # Categories, merchants, demo users
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Quick Start — Local Development

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis (optional, ready for integration)

### 1. Clone & set up

```bash
git clone <repo-url>
cd rewardvault
```

### 2. Database

```bash
# Create database
createdb rewardvault_db

# Run schema
psql rewardvault_db < database/schema.sql

# Seed sample data
psql rewardvault_db < database/seed.sql
```

### 3. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set DATABASE_URL, JWT_SECRET, SMTP credentials
npm install
npm run dev
# API runs on http://localhost:4000
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:3000
```

### 5. Test it

Open http://localhost:3000

**Demo accounts** (after running seed.sql):
- Admin: `admin@rewardvault.com` / (set your own password — seed uses placeholder hash)
- Demo user: `demo@rewardvault.com`

To create a working admin, register via the signup form or manually update the password hash:

```bash
# Generate a bcrypt hash (Node.js)
node -e "const b=require('bcryptjs'); b.hash('Admin@123',12).then(console.log)"

# Update in DB
psql rewardvault_db -c "UPDATE users SET password_hash='<hash>' WHERE email='admin@rewardvault.com';"
```

---

## Quick Start — Docker

```bash
# 1. Build and start all services
docker-compose up --build

# Services:
#   Frontend:  http://localhost:3000
#   Backend:   http://localhost:4000
#   MailHog:   http://localhost:8025  (catches all outbound emails)
#   PostgreSQL: localhost:5432
```

The database is automatically initialised with schema + seed data on first run.

**Stop everything:**
```bash
docker-compose down

# Remove volumes (resets DB):
docker-compose down -v
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable                | Default                  | Description                            |
|-------------------------|--------------------------|----------------------------------------|
| `NODE_ENV`              | `development`            | `development` / `production` / `test`  |
| `PORT`                  | `4000`                   | API server port                        |
| `DATABASE_URL`          | —                        | PostgreSQL connection string           |
| `JWT_SECRET`            | —                        | Min 32 chars, keep secret              |
| `JWT_EXPIRES_IN`        | `7d`                     | Token expiry                           |
| `FRONTEND_URL`          | `http://localhost:3000`  | Allowed CORS origin                    |
| `TRACKING_BASE_URL`     | `http://localhost:4000/track` | Base URL for redirect links       |
| `OTP_EXPIRES_MINUTES`   | `10`                     | OTP validity window                    |
| `SMTP_HOST`             | —                        | SMTP server (use MailHog in dev)       |
| `SMTP_PORT`             | `587`                    | SMTP port                              |
| `SMTP_USER`             | —                        | SMTP username                          |
| `SMTP_PASS`             | —                        | SMTP password                          |
| `EMAIL_FROM`            | `noreply@rewardvault.com`| Sender address                         |
| `CASHBACK_CONFIRM_DAYS` | `30`                     | Days before cashback auto-confirms     |

---

## API Reference

### Auth

| Method | Endpoint                | Auth | Description              |
|--------|-------------------------|------|--------------------------|
| POST   | `/api/auth/signup`      | —    | Register new user        |
| POST   | `/api/auth/verify-otp`  | —    | Verify email OTP         |
| POST   | `/api/auth/login`       | —    | Login → JWT token        |
| POST   | `/api/auth/resend-otp`  | —    | Resend verification code |
| GET    | `/api/auth/me`          | ✅   | Get current user + wallet|

### Merchants

| Method | Endpoint                    | Auth  | Description                   |
|--------|-----------------------------|-------|-------------------------------|
| GET    | `/api/merchants`            | —     | List with filters & pagination|
| GET    | `/api/merchants/:slug`      | —     | Single merchant detail        |
| GET    | `/api/categories`           | —     | All categories with counts    |

**Query params for `/api/merchants`:**
- `category` — category slug
- `sort` — `popularity` | `cashback_desc` | `cashback_asc` | `newest`
- `featured` — `true` to show featured only
- `search` — text search on name/description
- `page`, `limit` — pagination

### Tracking

| Method | Endpoint               | Auth     | Description                          |
|--------|------------------------|----------|--------------------------------------|
| POST   | `/api/track/click`     | ✅ verified | Record click, get redirect URL    |
| GET    | `/track/redirect`      | —        | Affiliate redirect (public)          |
| POST   | `/api/track/webhook`   | —        | Simulated postback (conversion event)|

**Click flow:**
```
POST /api/track/click { merchant_id }
→ { redirect_url: "http://localhost:4000/track/redirect?cid=<id>" }

GET /track/redirect?cid=<id>
→ 302 → merchant's tracking URL

POST /api/track/webhook { click_id, order_ref, purchase_amount }
→ Creates pending transaction, updates wallet
```

### Wallet

| Method | Endpoint                     | Auth | Description                  |
|--------|------------------------------|------|------------------------------|
| GET    | `/api/wallet`                | ✅   | Balance summary              |
| GET    | `/api/wallet/transactions`   | ✅   | Transaction history          |
| POST   | `/api/wallet/withdraw`       | ✅   | Request withdrawal           |
| GET    | `/api/wallet/withdrawals`    | ✅   | Withdrawal history           |

### Admin

| Method | Endpoint                              | Auth Admin | Description               |
|--------|---------------------------------------|------------|---------------------------|
| GET    | `/api/admin/analytics`                | ✅ admin   | Full platform stats       |
| GET    | `/api/admin/users`                    | ✅ admin   | List all users            |
| POST   | `/api/admin/merchants`                | ✅ admin   | Create merchant           |
| PATCH  | `/api/admin/merchants/:id`            | ✅ admin   | Update merchant           |
| GET    | `/api/admin/withdrawals`              | ✅ admin   | List withdrawals by status|
| PATCH  | `/api/admin/withdrawals/:id`          | ✅ admin   | Approve or reject         |
| POST   | `/api/admin/transactions/:id/confirm` | ✅ admin   | Confirm pending cashback  |

---

## Cashback Tracking Flow

```
User clicks "Get Cashback"
        │
        ▼
POST /api/track/click
  → generates unique click_id (nanoid 32)
  → inserts into clicks table
  → returns redirect_url

        │
        ▼
Frontend opens redirect_url in new tab
GET /track/redirect?cid=<click_id>
  → logs visit, redirects to merchant tracking_url

        │
        ▼
User completes purchase on merchant site

        │
        ▼ (simulated — in production: merchant/network calls back)
POST /api/track/webhook
  { click_id, order_ref, purchase_amount }
  → looks up click → calculates cashback
  → INSERT transaction (status: pending)
  → UPDATE wallet (pending += cashback)
  → INSERT notification

        │
        ▼
Admin reviews → POST /api/admin/transactions/:id/confirm
  → UPDATE transaction (status: confirmed)
  → UPDATE wallet (pending -= X, confirmed += X)

        │
        ▼
User requests withdrawal
POST /api/wallet/withdraw
  → INSERT withdrawal (status: pending)
  → UPDATE wallet (confirmed -= amount)

        │
        ▼
Admin approves → PATCH /api/admin/withdrawals/:id { action: "approve" }
  → UPDATE withdrawal (status: completed)
  → UPDATE wallet (withdrawn += amount)
```

---

## Database Schema

```
users          → wallets (1:1)
users          → clicks (1:N)
users          → transactions (1:N)
users          → withdrawals (1:N)
users          → notifications (1:N)
merchants      → clicks (1:N)
merchants      → transactions (1:N)
categories     → merchants (1:N)
clicks         → transactions (1:1, nullable)
```

Key tables:
- **users** — auth, profile, GDPR consent, referral system
- **wallets** — pending / confirmed / withdrawn balances (atomic updates)
- **merchants** — name, slug, cashback config, tracking URL, category
- **clicks** — unique click_id per user+merchant visit, conversion status
- **transactions** — cashback record, 5-state lifecycle
- **withdrawals** — withdrawal requests with admin approval flow
- **notifications** — in-app notification inbox

---

## Testing

```bash
cd backend
npm test
```

The test suite uses Jest + Supertest with a fully mocked database layer — no live DB or SMTP needed.

**Test coverage:**
- Health endpoint
- Auth: signup, OTP verify, validation edge cases
- Merchant listing and 404 handling
- Auth middleware (401 on protected routes)
- Tracking: click requires auth, webhook validation
- Withdrawal: 401 without auth
- Rate limiting presence check

---

## Production Checklist

- [ ] Set strong `JWT_SECRET` (32+ random chars, never commit)
- [ ] Replace seed password placeholder hashes with real bcrypt hashes
- [ ] Set `NODE_ENV=production` in all services
- [ ] Enable PostgreSQL SSL (`ssl: { rejectUnauthorized: true }`)
- [ ] Configure real SMTP (SendGrid, Postmark, AWS SES)
- [ ] Set `FRONTEND_URL` to your actual domain for CORS
- [ ] Enable HTTPS (reverse proxy with nginx/Caddy or cloud load balancer)
- [ ] Add Redis for distributed rate limiting (replace in-memory)
- [ ] Set up PostgreSQL backups
- [ ] Configure log aggregation (e.g. Datadog, Papertrail)
- [ ] Review and tighten CSP headers in Helmet config
- [ ] Add monitoring / uptime checks on `/health`
- [ ] Review and complete Terms & Conditions / Privacy Policy with legal counsel

---

## Legal & Compliance

- All merchant data is **fictional** — no real affiliate links or scraped data
- GDPR consent is captured at signup with timestamp (`gdpr_consent`, `gdpr_consent_at`)
- Users can request account deletion (implement in production per GDPR Article 17)
- Terms & Conditions and Privacy Policy pages are included as placeholders
- **Review with legal counsel before launching** — cashback platforms may require specific regulatory compliance in your jurisdiction
- Do **not** use real affiliate network credentials without a valid affiliate agreement

---

## License

This project is released for educational and demonstration purposes.
All brand names, merchant names, and data within are entirely fictional.
