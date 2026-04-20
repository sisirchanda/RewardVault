const express = require('express');
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');

const auth = require('../controllers/auth.controller');
const merchant = require('../controllers/merchant.controller');
const tracking = require('../controllers/tracking.controller');
const wallet = require('../controllers/wallet.controller');
const admin = require('../controllers/admin.controller');
const { authenticate, requireAdmin, requireVerified } = require('../middleware/auth');

const router = express.Router();

// ─── Auth ────────────────────────────────────────────────────────────────────
router.post('/auth/signup',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('full_name').trim().notEmpty(),
  body('gdpr_consent').isBoolean().equals('true'),
  validate,
  auth.signup
);

router.post('/auth/verify-otp',
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }),
  validate,
  auth.verifyOTP
);

router.post('/auth/login',
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate,
  auth.login
);

router.post('/auth/resend-otp',
  body('email').isEmail().normalizeEmail(),
  validate,
  auth.resendOTP
);

router.get('/auth/me', authenticate, auth.me);

// ─── Merchants (public) ──────────────────────────────────────────────────────
router.get('/merchants', merchant.listMerchants);
router.get('/merchants/:slug', merchant.getMerchant);
router.get('/categories', merchant.listCategories);

// ─── Tracking ────────────────────────────────────────────────────────────────
router.post('/track/click',
  authenticate,
  requireVerified,
  body('merchant_id').isUUID(),
  validate,
  tracking.recordClick
);

// Simulated affiliate postback (normally called by affiliate network)
router.post('/track/webhook',
  body('click_id').notEmpty(),
  body('purchase_amount').isNumeric(),
  validate,
  tracking.webhookCallback
);

// ─── Wallet ──────────────────────────────────────────────────────────────────
router.get('/wallet', authenticate, wallet.getWallet);
router.get('/wallet/transactions', authenticate, wallet.getTransactions);
router.get('/wallet/withdrawals', authenticate, wallet.listWithdrawals);
router.post('/wallet/withdraw',
  authenticate,
  requireVerified,
  body('amount').isNumeric().isFloat({ min: 5 }),
  body('method').isIn(['bank_transfer', 'paypal', 'gift_card']),
  validate,
  wallet.requestWithdrawal
);

// ─── Notifications ───────────────────────────────────────────────────────────
router.get('/notifications', authenticate, async (req, res) => {
  const { query: dbQuery } = require('../config/database');
  const result = await dbQuery(
    `SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 20`,
    [req.user.id]
  );
  res.json(result.rows);
});

router.patch('/notifications/:id/read', authenticate, async (req, res) => {
  const { query: dbQuery } = require('../config/database');
  await dbQuery(
    `UPDATE notifications SET is_read=TRUE WHERE id=$1 AND user_id=$2`,
    [req.params.id, req.user.id]
  );
  res.json({ ok: true });
});

// ─── Admin ────────────────────────────────────────────────────────────────────
router.get('/admin/analytics', authenticate, requireAdmin, admin.getDashboardStats);
router.get('/admin/users', authenticate, requireAdmin, admin.listUsers);

router.post('/admin/merchants', authenticate, requireAdmin,
  body('name').trim().notEmpty(),
  body('slug').trim().notEmpty(),
  body('tracking_url').isURL(),
  body('cashback_type').isIn(['percent', 'flat']),
  body('cashback_value').isNumeric(),
  validate,
  merchant.createMerchant
);

router.patch('/admin/merchants/:id', authenticate, requireAdmin, merchant.updateMerchant);

router.get('/admin/withdrawals', authenticate, requireAdmin, wallet.adminListWithdrawals);
router.patch('/admin/withdrawals/:id',
  authenticate,
  requireAdmin,
  body('action').isIn(['approve', 'reject']),
  validate,
  wallet.adminProcessWithdrawal
);

router.post('/admin/transactions/:id/confirm',
  authenticate,
  requireAdmin,
  tracking.confirmTransaction
);

module.exports = router;