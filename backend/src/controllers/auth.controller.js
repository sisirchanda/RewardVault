const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { query, withTransaction } = require('../config/database');
const { generateOTP, sendOTPEmail } = require('../services/email.service');

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function generateReferralCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

// POST /api/auth/signup
async function signup(req, res) {
  const { email, password, full_name, referral_code, gdpr_consent } = req.body;

  if (!gdpr_consent) {
    return res.status(400).json({ error: 'You must accept the terms to register' });
  }

  const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existing.rows[0]) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const hash = await bcrypt.hash(password, 12);
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + Number(process.env.OTP_EXPIRES_MINUTES || 10) * 60000);
  const myReferralCode = generateReferralCode();

  let referrerId = null;
  if (referral_code) {
    const refUser = await query('SELECT id FROM users WHERE referral_code = $1', [referral_code.toUpperCase()]);
    referrerId = refUser.rows[0]?.id || null;
  }

  const user = await withTransaction(async (client) => {
    const result = await client.query(
      `INSERT INTO users (email, password_hash, full_name, referral_code, referred_by,
         otp_code, otp_expires_at, gdpr_consent, gdpr_consent_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,TRUE,NOW())
       RETURNING id, email, full_name, role`,
      [email.toLowerCase(), hash, full_name, myReferralCode, referrerId, otp, otpExpiry]
    );
    const u = result.rows[0];
    await client.query('INSERT INTO wallets (user_id) VALUES ($1)', [u.id]);
    return u;
  });

  // Send OTP email (non-blocking)
  sendOTPEmail(email, otp).catch(console.error);

  res.status(201).json({
    message: 'Account created. Check your email for verification code.',
    user: { id: user.id, email: user.email, full_name: user.full_name },
  });
}

// POST /api/auth/verify-otp
async function verifyOTP(req, res) {
  const { email, otp } = req.body;

  const result = await query(
    `SELECT id, otp_code, otp_expires_at FROM users WHERE email = $1`,
    [email.toLowerCase()]
  );
  const user = result.rows[0];

  if (!user || user.otp_code !== otp) {
    return res.status(400).json({ error: 'Invalid or expired code' });
  }
  if (new Date() > new Date(user.otp_expires_at)) {
    return res.status(400).json({ error: 'Code has expired. Request a new one.' });
  }

  await query(
    `UPDATE users SET is_verified=TRUE, otp_code=NULL, otp_expires_at=NULL WHERE id=$1`,
    [user.id]
  );

  const token = signToken(user.id);
  res.json({ token, message: 'Email verified successfully' });
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;

  const result = await query(
    `SELECT id, email, full_name, role, password_hash, is_verified FROM users WHERE email=$1`,
    [email.toLowerCase()]
  );
  const user = result.rows[0];
  
  console.log("3. User Given Passowrd:", password);
  console.log("3. Data base Pass:", user.password_hash);

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  if (!user.is_verified) {
    return res.status(403).json({ error: 'Please verify your email first' });
  }

  const token = signToken(user.id);
  res.json({
    token,
    user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
  });
}

// POST /api/auth/resend-otp
async function resendOTP(req, res) {
  const { email } = req.body;
  const otp = generateOTP();
  const expiry = new Date(Date.now() + 10 * 60000);

  const result = await query(
    `UPDATE users SET otp_code=$1, otp_expires_at=$2 WHERE email=$3 RETURNING id`,
    [otp, expiry, email.toLowerCase()]
  );
  if (!result.rows[0]) {
    return res.status(404).json({ error: 'Email not found' });
  }

  await sendOTPEmail(email, otp);
  res.json({ message: 'Verification code resent' });
}

// GET /api/auth/me
async function me(req, res) {
  const result = await query(
    `SELECT u.id, u.email, u.full_name, u.role, u.avatar_url, u.referral_code, u.created_at,
            w.pending, w.confirmed, w.withdrawn, w.currency
     FROM users u JOIN wallets w ON w.user_id = u.id
     WHERE u.id = $1`,
    [req.user.id]
  );
  res.json(result.rows[0]);
}

module.exports = { signup, verifyOTP, login, resendOTP, me };