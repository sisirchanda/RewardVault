const { nanoid } = require('nanoid');
const { query, withTransaction } = require('../config/database');

/**
 * POST /api/track/click
 * Records a click and returns the affiliate redirect URL.
 */
async function recordClick(req, res) {
  const { merchant_id } = req.body;
  const userId = req.user.id;

  const merchantResult = await query(
    `SELECT id, tracking_url, cashback_type, cashback_value, is_active FROM merchants WHERE id=$1`,
    [merchant_id]
  );
  const merchant = merchantResult.rows[0];
  if (!merchant) return res.status(404).json({ error: 'Merchant not found' });
  if (!merchant.is_active) return res.status(400).json({ error: 'This offer is currently unavailable' });

  const clickId = nanoid(32);
  await query(
    `INSERT INTO clicks (click_id, user_id, merchant_id, ip_address, user_agent)
     VALUES ($1,$2,$3,$4,$5)`,
    [clickId, userId, merchant_id,
     req.ip,
     req.headers['user-agent']?.slice(0, 500)]
  );

  // Build tracked redirect URL
  const redirectUrl = `${process.env.TRACKING_BASE_URL}/redirect?cid=${clickId}`;
  res.json({ redirect_url: redirectUrl, click_id: clickId });
}

/**
 * GET /track/redirect
 * Public redirect endpoint — logs the click and bounces to the merchant.
 * This simulates the affiliate network redirect.
 */
async function redirect(req, res) {
  const { cid } = req.query;
  if (!cid) return res.status(400).send('Missing click ID');

  const result = await query(
    `SELECT c.*, m.tracking_url FROM clicks c
     JOIN merchants m ON m.id = c.merchant_id
     WHERE c.click_id = $1`,
    [cid]
  );
  const click = result.rows[0];

  if (!click) return res.status(404).send('Invalid tracking link');
  if (click.status !== 'clicked') {
    return res.redirect(click.tracking_url);
  }

  // Update click timestamp
  await query(`UPDATE clicks SET status='clicked' WHERE click_id=$1`, [cid]);

  // In a real integration, the merchant's affiliate URL would include
  // the click_id as a sub-parameter for postback tracking.
  return res.redirect(click.tracking_url);
}

/**
 * POST /api/track/webhook
 * Simulated postback: called internally or via test to confirm a conversion.
 * In production this would be called by the affiliate network.
 */
async function webhookCallback(req, res) {
  const { click_id, order_ref, purchase_amount } = req.body;

  const clickResult = await query(
    `SELECT c.*, m.cashback_type, m.cashback_value, m.min_purchase
     FROM clicks c JOIN merchants m ON m.id = c.merchant_id
     WHERE c.click_id = $1`,
    [click_id]
  );
  const click = clickResult.rows[0];
  if (!click) return res.status(404).json({ error: 'Click not found' });
  if (click.status === 'converted') {
    return res.status(409).json({ error: 'Already converted' });
  }

  const amount = Number(purchase_amount) || 0;
  if (amount < click.min_purchase) {
    return res.status(400).json({
      error: `Minimum purchase of $${click.min_purchase} required for cashback`,
    });
  }

  const cashback =
    click.cashback_type === 'percent'
      ? parseFloat(((amount * click.cashback_value) / 100).toFixed(2))
      : click.cashback_value;

  await withTransaction(async (client) => {
    // Mark click as converted
    await client.query(
      `UPDATE clicks SET status='converted', converted_at=NOW() WHERE click_id=$1`,
      [click_id]
    );

    // Create pending transaction
    await client.query(
      `INSERT INTO transactions
         (user_id, merchant_id, click_id, order_ref, purchase_amount,
          cashback_amount, cashback_type, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'pending')`,
      [click.user_id, click.merchant_id, click.id,
       order_ref, amount, cashback, click.cashback_type]
    );

    // Add to wallet pending
    await client.query(
      `UPDATE wallets SET pending = pending + $1, updated_at=NOW() WHERE user_id=$2`,
      [cashback, click.user_id]
    );

    // Notification
    await client.query(
      `INSERT INTO notifications (user_id, type, title, body, metadata)
       VALUES ($1, 'cashback_pending', 'Cashback Pending', $2, $3)`,
      [click.user_id,
       `$${cashback} cashback is pending verification`,
       JSON.stringify({ cashback, merchant_id: click.merchant_id })]
    );
  });

  res.json({ success: true, cashback_amount: cashback });
}

/**
 * POST /api/admin/transactions/:id/confirm
 * Admin: move transaction from pending → confirmed.
 */
async function confirmTransaction(req, res) {
  const { id } = req.params;

  const txResult = await query(
    `SELECT * FROM transactions WHERE id=$1 AND status='pending'`,
    [id]
  );
  const tx = txResult.rows[0];
  if (!tx) return res.status(404).json({ error: 'Pending transaction not found' });

  await withTransaction(async (client) => {
    await client.query(
      `UPDATE transactions SET status='confirmed', confirmed_at=NOW(), updated_at=NOW() WHERE id=$1`,
      [id]
    );
    await client.query(
      `UPDATE wallets SET
         pending = pending - $1,
         confirmed = confirmed + $1,
         updated_at=NOW()
       WHERE user_id=$2`,
      [tx.cashback_amount, tx.user_id]
    );
  });

  res.json({ message: 'Transaction confirmed' });
}

module.exports = { recordClick, redirect, webhookCallback, confirmTransaction };