const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

/**
 * Verifies the Bearer JWT and attaches req.user.
 * Returns 401 on invalid/expired token.
 */
async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const result = await query(
      'SELECT id, email, full_name, role, is_verified FROM users WHERE id = $1',
      [payload.sub]
    );

    if (!result.rows[0]) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Requires the user to have admin role.
 * Must be used AFTER authenticate.
 */
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

/**
 * Requires email verification.
 */
function requireVerified(req, res, next) {
  if (!req.user?.is_verified) {
    return res.status(403).json({ error: 'Please verify your email first' });
  }
  next();
}

module.exports = { authenticate, requireAdmin, requireVerified };