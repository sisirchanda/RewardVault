const { query, withTransaction } = require('../config/database');

// GET /api/wallet
async function getWallet(req, res) {
  const result = await query(
    `SELECT w.*, 
       (SELECT COALESCE(SUM(cashback_amount),0) FROM transactions WHERE user_id=$1 AND status='paid') AS total_earned
     FROM wallets w WHERE w.user_id=$1`,
    [req.user.id]
  );
  res.json(result.rows[0]);
}

// GET /api/wallet/transactions
async function getTransactions(req, res) {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  const params = [req.user.id];
  let statusClause = '';
  if (status) {
    params.push(status);
    statusClause = `AND t.status = $${params.length}`;
  }
  params.push(Number(limit), offset);

  const result = await query(
    `SELECT t.id, t.purchase_amount, t.cashback_amount, t.cashback_type,
            t.status, t.order_ref, t.pending_at, t.confirmed_at, t.paid_at,
            m.name AS merchant_name, m.logo_url AS merchant_logo, m.slug AS merchant_slug
     FROM transactions t
     JOIN merchants m ON m.id = t.merchant_id
     WHERE t.user_id = $1 ${statusClause}
     ORDER BY t.pending_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const countResult = await query(
    `SELECT COUNT(*) FROM transactions WHERE user_id=$1 ${status ? 'AND status=$2' : ''}`,
    status ? [req.user.id, status] : [req.user.id]
  );

  res.json({
    transactions: result.rows,
    total: Number(countResult.rows[0].count),
    page: Number(page),
    limit: Number(limit),
  });
}

// POST /api/wallet/withdraw
async function requestWithdrawal(req, res) {
  const { amount, method, account_details } = req.body;
  const withdrawAmount = Number(amount);

  if (withdrawAmount < 5) {
    return res.status(400).json({ error: 'Minimum withdrawal amount is $5' });
  }

  const walletResult = await query(
    `SELECT confirmed FROM wallets WHERE user_id=$1`,
    [req.user.id]
  );
  const wallet = walletResult.rows[0];

  if (!wallet || wallet.confirmed < withdrawAmount) {
    return res.status(400).json({ error: 'Insufficient confirmed balance' });
  }

  // Check no pending withdrawal
  const pendingCheck = await query(
    `SELECT id FROM withdrawals WHERE user_id=$1 AND status='pending' LIMIT 1`,
    [req.user.id]
  );
  if (pendingCheck.rows[0]) {
    return res.status(400).json({ error: 'You already have a pending withdrawal request' });
  }

  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO withdrawals (user_id, amount, method, account_details, status)
       VALUES ($1,$2,$3,$4,'pending')`,
      [req.user.id, withdrawAmount, method, JSON.stringify(account_details)]
    );
    // Reserve balance
    await client.query(
      `UPDATE wallets SET confirmed = confirmed - $1, updated_at=NOW() WHERE user_id=$2`,
      [withdrawAmount, req.user.id]
    );
  });

  res.status(201).json({ message: 'Withdrawal request submitted. Admin will process within 3–5 business days.' });
}

// GET /api/wallet/withdrawals
async function listWithdrawals(req, res) {
  const result = await query(
    `SELECT id, amount, method, status, requested_at, processed_at, admin_note
     FROM withdrawals WHERE user_id=$1 ORDER BY requested_at DESC`,
    [req.user.id]
  );
  res.json(result.rows);
}

// ── Admin ──────────────────────────────────────

// GET /api/admin/withdrawals
async function adminListWithdrawals(req, res) {
  const { status = 'pending' } = req.query;
  const result = await query(
    `SELECT w.*, u.email, u.full_name FROM withdrawals w
     JOIN users u ON u.id = w.user_id
     WHERE w.status=$1 ORDER BY w.requested_at ASC`,
    [status]
  );
  res.json(result.rows);
}

// PATCH /api/admin/withdrawals/:id
async function adminProcessWithdrawal(req, res) {
  const { action, admin_note } = req.body; // action: 'approve' | 'reject'
  const { id } = req.params;

  const wdResult = await query(
    `SELECT * FROM withdrawals WHERE id=$1 AND status='pending'`,
    [id]
  );
  const wd = wdResult.rows[0];
  if (!wd) return res.status(404).json({ error: 'Pending withdrawal not found' });

  if (action === 'approve') {
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE withdrawals SET status='completed', processed_at=NOW(), admin_note=$1 WHERE id=$2`,
        [admin_note, id]
      );
      await client.query(
        `UPDATE wallets SET withdrawn = withdrawn + $1, updated_at=NOW() WHERE user_id=$2`,
        [wd.amount, wd.user_id]
      );
      await client.query(
        `INSERT INTO notifications (user_id, type, title, body)
         VALUES ($1,'withdrawal_completed','Withdrawal Completed',$2)`,
        [wd.user_id, `Your withdrawal of $${wd.amount} has been processed.`]
      );
    });
    return res.json({ message: 'Withdrawal approved and completed' });
  }

  if (action === 'reject') {
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE withdrawals SET status='rejected', processed_at=NOW(), admin_note=$1 WHERE id=$2`,
        [admin_note, id]
      );
      // Refund to confirmed balance
      await client.query(
        `UPDATE wallets SET confirmed = confirmed + $1, updated_at=NOW() WHERE user_id=$2`,
        [wd.amount, wd.user_id]
      );
    });
    return res.json({ message: 'Withdrawal rejected and balance refunded' });
  }

  res.status(400).json({ error: "Action must be 'approve' or 'reject'" });
}

module.exports = {
  getWallet, getTransactions, requestWithdrawal, listWithdrawals,
  adminListWithdrawals, adminProcessWithdrawal,
};