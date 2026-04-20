const { query } = require('../config/database');

// GET /api/admin/analytics
async function getDashboardStats(req, res) {
  const [users, merchants, transactions, withdrawals, topMerchants, recentTx] =
    await Promise.all([
      query(`SELECT
               COUNT(*) AS total,
               COUNT(*) FILTER (WHERE created_at > NOW()-INTERVAL '30 days') AS new_this_month
             FROM users WHERE role='user'`),
      query(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE is_active) AS active FROM merchants`),
      query(`SELECT
               COUNT(*) AS total,
               COALESCE(SUM(cashback_amount),0) AS total_cashback,
               COALESCE(SUM(cashback_amount) FILTER (WHERE status='pending'),0) AS pending,
               COALESCE(SUM(cashback_amount) FILTER (WHERE status='confirmed'),0) AS confirmed,
               COALESCE(SUM(cashback_amount) FILTER (WHERE status='paid'),0) AS paid
             FROM transactions`),
      query(`SELECT
               COUNT(*) AS total,
               COALESCE(SUM(amount) FILTER (WHERE status='pending'),0) AS pending_amount,
               COALESCE(SUM(amount) FILTER (WHERE status='completed'),0) AS paid_amount
             FROM withdrawals`),
      query(`SELECT m.name, m.slug, m.logo_url,
               COUNT(t.id) AS click_count,
               COALESCE(SUM(t.cashback_amount),0) AS cashback_paid
             FROM merchants m
             LEFT JOIN transactions t ON t.merchant_id = m.id
             GROUP BY m.id ORDER BY click_count DESC LIMIT 5`),
      query(`SELECT t.id, t.cashback_amount, t.status, t.pending_at,
               u.email, u.full_name, m.name AS merchant_name
             FROM transactions t
             JOIN users u ON u.id = t.user_id
             JOIN merchants m ON m.id = t.merchant_id
             ORDER BY t.pending_at DESC LIMIT 10`),
    ]);

  res.json({
    users: users.rows[0],
    merchants: merchants.rows[0],
    transactions: transactions.rows[0],
    withdrawals: withdrawals.rows[0],
    top_merchants: topMerchants.rows,
    recent_transactions: recentTx.rows,
  });
}

// GET /api/admin/users
async function listUsers(req, res) {
  const { search, page = 1, limit = 25 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  const params = [];
  let where = "WHERE u.role='user'";

  if (search) {
    params.push(`%${search}%`);
    where += ` AND (u.email ILIKE $${params.length} OR u.full_name ILIKE $${params.length})`;
  }

  params.push(Number(limit), offset);
  const result = await query(
    `SELECT u.id, u.email, u.full_name, u.is_verified, u.created_at,
            w.pending, w.confirmed, w.withdrawn
     FROM users u LEFT JOIN wallets w ON w.user_id=u.id
     ${where} ORDER BY u.created_at DESC
     LIMIT $${params.length-1} OFFSET $${params.length}`,
    params
  );

  res.json(result.rows);
}

module.exports = { getDashboardStats, listUsers };