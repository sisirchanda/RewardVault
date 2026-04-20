-- RewardVault Database Schema
-- PostgreSQL 15+

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  full_name     VARCHAR(255),
  avatar_url    VARCHAR(500),
  role          VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_verified   BOOLEAN NOT NULL DEFAULT FALSE,
  otp_code      VARCHAR(6),
  otp_expires_at TIMESTAMPTZ,
  referral_code VARCHAR(20) UNIQUE,
  referred_by   UUID REFERENCES users(id),
  gdpr_consent  BOOLEAN NOT NULL DEFAULT FALSE,
  gdpr_consent_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- WALLETS
-- ─────────────────────────────────────────────
CREATE TABLE wallets (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pending       NUMERIC(12, 2) NOT NULL DEFAULT 0,
  confirmed     NUMERIC(12, 2) NOT NULL DEFAULT 0,
  withdrawn     NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency      CHAR(3) NOT NULL DEFAULT 'USD',
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- CATEGORIES
-- ─────────────────────────────────────────────
CREATE TABLE categories (
  id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name  VARCHAR(100) UNIQUE NOT NULL,
  slug  VARCHAR(100) UNIQUE NOT NULL,
  icon  VARCHAR(50)
);

-- ─────────────────────────────────────────────
-- MERCHANTS
-- ─────────────────────────────────────────────
CREATE TABLE merchants (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(255) NOT NULL,
  slug            VARCHAR(255) UNIQUE NOT NULL,
  description     TEXT,
  logo_url        VARCHAR(500),
  website_url     VARCHAR(500),
  tracking_url    VARCHAR(1000) NOT NULL,
  category_id     UUID REFERENCES categories(id),
  cashback_type   VARCHAR(10) NOT NULL CHECK (cashback_type IN ('percent', 'flat')),
  cashback_value  NUMERIC(8, 2) NOT NULL,
  min_purchase    NUMERIC(10, 2) DEFAULT 0,
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  popularity      INTEGER NOT NULL DEFAULT 0,
  terms           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- CLICKS (Tracking Layer)
-- ─────────────────────────────────────────────
CREATE TABLE clicks (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  click_tracking_id	VARCHAR(64) UNIQUE NOT NULL,
  user_id       UUID NOT NULL REFERENCES users(id),
  merchant_id   UUID NOT NULL REFERENCES merchants(id),
  ip_address    INET,
  user_agent    TEXT,
  referrer      VARCHAR(1000),
  status        VARCHAR(20) NOT NULL DEFAULT 'clicked'
                  CHECK (status IN ('clicked', 'converted', 'expired', 'rejected')),
  clicked_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  converted_at  TIMESTAMPTZ,
  expires_at 	TIMESTAMPTZ
);

-- ─────────────────────────────────────────────
-- TRANSACTIONS (Cashback Records)
-- ─────────────────────────────────────────────
CREATE TABLE transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id),
  merchant_id     UUID NOT NULL REFERENCES merchants(id),
  click_id        UUID REFERENCES clicks(id),
  order_ref       VARCHAR(255),
  purchase_amount NUMERIC(12, 2),
  cashback_amount NUMERIC(12, 2) NOT NULL,
  cashback_type   VARCHAR(10) NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'confirmed', 'paid', 'rejected', 'cancelled')),
  status_reason   TEXT,
  pending_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at    TIMESTAMPTZ,
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- WITHDRAWALS
-- ─────────────────────────────────────────────
CREATE TABLE withdrawals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id),
  amount          NUMERIC(12, 2) NOT NULL,
  method          VARCHAR(50) NOT NULL CHECK (method IN ('bank_transfer', 'paypal', 'gift_card')),
  account_details JSONB,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'rejected')),
  admin_note      TEXT,
  requested_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at    TIMESTAMPTZ,
  is_verified BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────────
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id),
  type        VARCHAR(50) NOT NULL,
  title       VARCHAR(255) NOT NULL,
  body        TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────
CREATE INDEX idx_clicks_user       ON clicks(user_id);
CREATE INDEX idx_clicks_merchant   ON clicks(merchant_id);
CREATE INDEX idx_clicks_click_id   ON clicks(click_tracking_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_withdrawals_user  ON withdrawals(user_id);
CREATE INDEX idx_merchants_active  ON merchants(is_active);
CREATE INDEX idx_merchants_category ON merchants(category_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- ─────────────────────────────────────────────
-- TRIGGERS: auto-update updated_at
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated       BEFORE UPDATE ON users       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_merchants_updated   BEFORE UPDATE ON merchants   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_transactions_updated BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
