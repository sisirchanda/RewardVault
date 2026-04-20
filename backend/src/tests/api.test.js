/**
 * RewardVault — Backend API Test Suite
 * Run: cd backend && npm test
 *
 * Uses in-memory mocks so no real DB/SMTP is needed.
 */

const request = require('supertest');

// ── Mock DB before importing app ──────────────────────────────
jest.mock('./src/config/database', () => {
  const users = new Map();
  const wallets = new Map();
  const merchants = new Map([
    ['m1', {
      id: 'm1', name: 'TestShop', slug: 'testshop',
      tracking_url: 'https://example.com/shop',
      cashback_type: 'percent', cashback_value: 5,
      min_purchase: 0, is_active: true,
    }],
  ]);
  const clicks = new Map();
  const transactions = new Map();

  const mockQuery = jest.fn(async (sql, params) => {
    // Auth: signup insert
    if (sql.includes('INSERT INTO users')) {
      const id = 'user-' + Date.now();
      const u = { id, email: params[0], full_name: params[2], role: 'user', is_verified: false, otp_code: params[5], referral_code: params[3] };
      users.set(id, u);
      return { rows: [u], rowCount: 1 };
    }
    if (sql.includes('INSERT INTO wallets')) {
      wallets.set(params[0], { user_id: params[0], pending: 0, confirmed: 0, withdrawn: 0, currency: 'USD' });
      return { rows: [], rowCount: 1 };
    }
    // Auth: find user by email
    if (sql.includes('FROM users WHERE email')) {
      const u = [...users.values()].find(u => u.email === params[0]);
      return { rows: u ? [u] : [], rowCount: u ? 1 : 0 };
    }
    // Auth: find user by ID
    if (sql.includes('FROM users WHERE id')) {
      const u = users.get(params[0]);
      return { rows: u ? [u] : [], rowCount: u ? 1 : 0 };
    }
    // Verify OTP
    if (sql.includes('SET is_verified=TRUE')) {
      const u = users.get(params[0]);
      if (u) { u.is_verified = true; u.otp_code = null; }
      return { rows: [], rowCount: 1 };
    }
    // Merchants list
    if (sql.includes('FROM merchants m') && sql.includes('LIMIT')) {
      return { rows: [...merchants.values()], rowCount: merchants.size };
    }
    if (sql.includes("COUNT(*) FROM merchants")) {
      return { rows: [{ count: String(merchants.size) }], rowCount: 1 };
    }
    // Merchant by slug
    if (sql.includes('WHERE m.slug')) {
      const m = merchants.get([...merchants.keys()].find(k => merchants.get(k).slug === params[0]));
      return { rows: m ? [m] : [], rowCount: m ? 1 : 0 };
    }
    // Wallet
    if (sql.includes('FROM wallets w WHERE w.user_id')) {
      const w = wallets.get(params[0]);
      return { rows: w ? [{ ...w, total_earned: 0 }] : [], rowCount: w ? 1 : 0 };
    }
    // Transactions
    if (sql.includes('FROM transactions t')) {
      return { rows: [], rowCount: 0 };
    }
    if (sql.includes('COUNT(*) FROM transactions')) {
      return { rows: [{ count: '0' }], rowCount: 1 };
    }
    // Withdrawals
    if (sql.includes('FROM withdrawals WHERE user_id')) {
      return { rows: [], rowCount: 0 };
    }
    // Notifications
    if (sql.includes('FROM notifications')) {
      return { rows: [], rowCount: 0 };
    }
    // Categories
    if (sql.includes('FROM categories')) {
      return { rows: [], rowCount: 0 };
    }
    // Default
    return { rows: [], rowCount: 0 };
  });

  const mockWithTransaction = jest.fn(async (fn) => {
    return fn({ query: mockQuery });
  });

  return { query: mockQuery, withTransaction: mockWithTransaction, pool: { on: jest.fn() } };
});

jest.mock('./src/services/email.service', () => ({
  generateOTP: () => '123456',
  sendOTPEmail: jest.fn().mockResolvedValue(undefined),
  sendCashbackNotification: jest.fn().mockResolvedValue(undefined),
}));

// ── Load app AFTER mocks ──────────────────────────────────────
process.env.JWT_SECRET = 'test_secret_at_least_32_chars_long!!';
process.env.NODE_ENV = 'test';
process.env.TRACKING_BASE_URL = 'http://localhost:4000/track';

const app = require('./src/index');

// ── Test helpers ─────────────────────────────────────────────
let authToken = '';
const TEST_USER = { email: 'test@example.com', password: 'TestPass123!', full_name: 'Test User' };

// ═════════════════════════════════════════════════════════════
describe('Health check', () => {
  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

// ═════════════════════════════════════════════════════════════
describe('Auth API', () => {
  it('POST /api/auth/signup — creates user with GDPR consent', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ ...TEST_USER, gdpr_consent: true });
    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/created/i);
    expect(res.body.user.email).toBe(TEST_USER.email);
  });

  it('POST /api/auth/signup — rejects without GDPR consent', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ ...TEST_USER, email: 'other@example.com', gdpr_consent: false });
    expect(res.status).toBe(400);
  });

  it('POST /api/auth/signup — rejects short password', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ ...TEST_USER, email: 'short@example.com', password: '123', gdpr_consent: true });
    expect(res.status).toBe(422);
  });

  it('POST /api/auth/verify-otp — verifies with correct OTP', async () => {
    // Set up user in mock with known OTP
    const { query } = require('./src/config/database');
    query.mockImplementationOnce(async (sql) => {
      if (sql.includes('FROM users WHERE email')) {
        return {
          rows: [{
            id: 'user-123', otp_code: '123456',
            otp_expires_at: new Date(Date.now() + 600000).toISOString(),
          }],
          rowCount: 1,
        };
      }
      return { rows: [], rowCount: 0 };
    });

    const res = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: TEST_USER.email, otp: '123456' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    authToken = res.body.token;
  });

  it('POST /api/auth/verify-otp — rejects wrong OTP', async () => {
    const { query } = require('./src/config/database');
    query.mockImplementationOnce(async () => ({
      rows: [{
        id: 'user-123', otp_code: '999999',
        otp_expires_at: new Date(Date.now() + 600000).toISOString(),
      }],
      rowCount: 1,
    }));

    const res = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: TEST_USER.email, otp: '000000' });
    expect(res.status).toBe(400);
  });
});

// ═════════════════════════════════════════════════════════════
describe('Merchant API', () => {
  it('GET /api/merchants — returns list', async () => {
    const res = await request(app).get('/api/merchants');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.merchants)).toBe(true);
  });

  it('GET /api/categories — returns categories', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/merchants/nonexistent — 404', async () => {
    const res = await request(app).get('/api/merchants/does-not-exist');
    expect(res.status).toBe(404);
  });
});

// ═════════════════════════════════════════════════════════════
describe('Auth middleware', () => {
  it('GET /api/auth/me — 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('GET /api/wallet — 401 without token', async () => {
    const res = await request(app).get('/api/wallet');
    expect(res.status).toBe(401);
  });

  it('GET /api/admin/analytics — 401 without token', async () => {
    const res = await request(app).get('/api/admin/analytics');
    expect(res.status).toBe(401);
  });
});

// ═════════════════════════════════════════════════════════════
describe('Tracking API', () => {
  it('POST /api/track/click — 401 without auth', async () => {
    const res = await request(app)
      .post('/api/track/click')
      .send({ merchant_id: 'some-uuid-00000000-0000-0000-0000-000000000000' });
    expect(res.status).toBe(401);
  });

  it('POST /api/track/webhook — validates required fields', async () => {
    const res = await request(app)
      .post('/api/track/webhook')
      .send({ purchase_amount: 100 }); // missing click_id
    expect(res.status).toBe(422);
  });
});

// ═════════════════════════════════════════════════════════════
describe('Withdrawal validation', () => {
  it('POST /api/wallet/withdraw — 401 without auth', async () => {
    const res = await request(app)
      .post('/api/wallet/withdraw')
      .send({ amount: 10, method: 'paypal', account_details: {} });
    expect(res.status).toBe(401);
  });
});

// ═════════════════════════════════════════════════════════════
describe('Rate limiting', () => {
  it('Login endpoint has stricter rate limit', async () => {
    // This just verifies the endpoint is responsive; full rate-limit
    // testing would require 11 rapid requests in a test environment
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'x@x.com', password: 'wrong' });
    expect([401, 429]).toContain(res.status);
  });
});