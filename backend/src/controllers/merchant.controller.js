const { query } = require('../config/database');

const MERCHANT_SELECT = `
  SELECT m.id, m.name, m.slug, m.description, m.logo_url, m.website_url,
         m.cashback_type, m.cashback_value, m.min_purchase,
         m.is_featured, m.is_active, m.popularity, m.terms,
         c.name AS category_name, c.slug AS category_slug, c.icon AS category_icon,
         m.created_at
  FROM merchants m
  LEFT JOIN categories c ON c.id = m.category_id
`;

// GET /api/merchants
async function listMerchants(req, res) {
  const { category, sort, featured, search, page = 1, limit = 20 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const conditions = ['m.is_active = TRUE'];
  const params = [];

  if (category) {
    params.push(category);
    conditions.push(`c.slug = $${params.length}`);
  }
  if (featured === 'true') {
    conditions.push('m.is_featured = TRUE');
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(m.name ILIKE $${params.length} OR m.description ILIKE $${params.length})`);
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  const ORDER_MAP = {
    popularity: 'ORDER BY m.popularity DESC',
    cashback_desc: 'ORDER BY m.cashback_value DESC',
    cashback_asc: 'ORDER BY m.cashback_value ASC',
    newest: 'ORDER BY m.created_at DESC',
  };
  const order = ORDER_MAP[sort] || 'ORDER BY m.is_featured DESC, m.popularity DESC';

  params.push(Number(limit), offset);
  const dataQ = `${MERCHANT_SELECT} ${where} ${order} LIMIT $${params.length - 1} OFFSET $${params.length}`;
  const countQ = `SELECT COUNT(*) FROM merchants m LEFT JOIN categories c ON c.id = m.category_id ${where}`;

  const [data, count] = await Promise.all([
    query(dataQ, params),
    query(countQ, params.slice(0, -2)),
  ]);

  res.json({
    merchants: data.rows,
    total: Number(count.rows[0].count),
    page: Number(page),
    limit: Number(limit),
  });
}

// GET /api/merchants/:slug
async function getMerchant(req, res) {
  const result = await query(`${MERCHANT_SELECT} WHERE m.slug = $1`, [req.params.slug]);
  if (!result.rows[0]) return res.status(404).json({ error: 'Merchant not found' });
  res.json(result.rows[0]);
}

// GET /api/categories
async function listCategories(req, res) {
  const result = await query(
    `SELECT c.*, COUNT(m.id) AS merchant_count
     FROM categories c
     LEFT JOIN merchants m ON m.category_id = c.id AND m.is_active = TRUE
     GROUP BY c.id ORDER BY c.name`
  );
  res.json(result.rows);
}

// ── Admin ──────────────────────────────────────

// POST /api/admin/merchants
async function createMerchant(req, res) {
  const {
    name, slug, description, logo_url, website_url, tracking_url,
    category_id, cashback_type, cashback_value, min_purchase,
    is_featured, terms,
  } = req.body;

  const result = await query(
    `INSERT INTO merchants
       (name, slug, description, logo_url, website_url, tracking_url,
        category_id, cashback_type, cashback_value, min_purchase, is_featured, terms)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING *`,
    [name, slug, description, logo_url, website_url, tracking_url,
     category_id, cashback_type, cashback_value, min_purchase || 0, is_featured || false, terms]
  );
  res.status(201).json(result.rows[0]);
}

// PATCH /api/admin/merchants/:id
async function updateMerchant(req, res) {
  const fields = ['name', 'description', 'logo_url', 'cashback_type',
    'cashback_value', 'min_purchase', 'is_featured', 'is_active', 'terms'];
  const updates = [];
  const params = [];

  fields.forEach((f) => {
    if (req.body[f] !== undefined) {
      params.push(req.body[f]);
      updates.push(`${f} = $${params.length}`);
    }
  });

  if (!updates.length) return res.status(400).json({ error: 'No fields to update' });

  params.push(req.params.id);
  const result = await query(
    `UPDATE merchants SET ${updates.join(', ')}, updated_at=NOW() WHERE id=$${params.length} RETURNING *`,
    params
  );
  if (!result.rows[0]) return res.status(404).json({ error: 'Merchant not found' });
  res.json(result.rows[0]);
}

module.exports = { listMerchants, getMerchant, listCategories, createMerchant, updateMerchant };