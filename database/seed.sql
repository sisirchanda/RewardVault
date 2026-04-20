-- RewardVault Seed Data
-- Run after schema.sql

-- Categories
INSERT INTO categories (id, name, slug, icon) VALUES
  (uuid_generate_v4(), 'Fashion & Apparel',    'fashion',       'shirt'),
  (uuid_generate_v4(), 'Electronics',          'electronics',   'cpu'),
  (uuid_generate_v4(), 'Travel & Hotels',      'travel',        'plane'),
  (uuid_generate_v4(), 'Health & Beauty',      'health-beauty', 'heart'),
  (uuid_generate_v4(), 'Home & Garden',        'home-garden',   'home'),
  (uuid_generate_v4(), 'Sports & Outdoors',    'sports',        'activity'),
  (uuid_generate_v4(), 'Food & Groceries',     'food',          'shopping-bag'),
  (uuid_generate_v4(), 'Books & Education',    'education',     'book');

-- Admin user (password: Admin@123 bcrypt hashed placeholder)
INSERT INTO users (id, email, password_hash, full_name, role, is_verified, referral_code, gdpr_consent) VALUES
  ('00000000-0000-0000-0000-000000000001',
   'admin@rewardvault.com',
   '$2b$12$PLACEHOLDER_HASH_REPLACE_IN_PRODUCTION',
   'Vault Admin',
   'admin',
   TRUE,
   'ADMIN001',
   TRUE);

-- Demo user
INSERT INTO users (id, email, password_hash, full_name, role, is_verified, referral_code, gdpr_consent) VALUES
  ('00000000-0000-0000-0000-000000000002',
   'demo@rewardvault.com',
   '$2b$12$PLACEHOLDER_HASH_REPLACE_IN_PRODUCTION',
   'Alex Demo',
   'user',
   TRUE,
   'ALEX2024',
   TRUE);

-- Wallets for demo user
INSERT INTO wallets (user_id, pending, confirmed, currency) VALUES
  ('00000000-0000-0000-0000-000000000002', 12.50, 47.80, 'USD');

-- Merchants (all fictional)
INSERT INTO merchants (name, slug, description, logo_url, website_url, tracking_url,
  category_id, cashback_type, cashback_value, min_purchase, is_featured, popularity) VALUES

  ('StyleNest', 'stylenest',
   'Premium fashion finds for every style and season.',
   '/logos/stylenest.svg',
   'https://example-stylenest.com',
   'https://track.rewardvault.com/go/stylenest',
   (SELECT id FROM categories WHERE slug='fashion'), 'percent', 8.5, 25.00, TRUE, 950),

  ('TechHaven', 'techhaven',
   'Top-rated electronics, gadgets and accessories.',
   '/logos/techhaven.svg',
   'https://example-techhaven.com',
   'https://track.rewardvault.com/go/techhaven',
   (SELECT id FROM categories WHERE slug='electronics'), 'percent', 4.0, 50.00, TRUE, 880),

  ('WanderBook', 'wanderbook',
   'Hotels, flights and holiday packages worldwide.',
   '/logos/wanderbook.svg',
   'https://example-wanderbook.com',
   'https://track.rewardvault.com/go/wanderbook',
   (SELECT id FROM categories WHERE slug='travel'), 'percent', 6.0, 100.00, TRUE, 820),

  ('GlowBox', 'glowbox',
   'Curated health, wellness and beauty products.',
   '/logos/glowbox.svg',
   'https://example-glowbox.com',
   'https://track.rewardvault.com/go/glowbox',
   (SELECT id FROM categories WHERE slug='health-beauty'), 'percent', 10.0, 0.00, FALSE, 760),

  ('NestCraft', 'nestcraft',
   'Home décor, furniture and garden essentials.',
   '/logos/nestcraft.svg',
   'https://example-nestcraft.com',
   'https://track.rewardvault.com/go/nestcraft',
   (SELECT id FROM categories WHERE slug='home-garden'), 'percent', 5.5, 40.00, FALSE, 640),

  ('PeakGear', 'peakgear',
   'Sports equipment and outdoor adventure gear.',
   '/logos/peakgear.svg',
   'https://example-peakgear.com',
   'https://track.rewardvault.com/go/peakgear',
   (SELECT id FROM categories WHERE slug='sports'), 'flat', 5.00, 60.00, FALSE, 580),

  ('FreshBasket', 'freshbasket',
   'Online grocery delivery with fresh produce.',
   '/logos/freshbasket.svg',
   'https://example-freshbasket.com',
   'https://track.rewardvault.com/go/freshbasket',
   (SELECT id FROM categories WHERE slug='food'), 'flat', 3.00, 30.00, FALSE, 710),

  ('ReadMore', 'readmore',
   'Books, e-books and online courses at great prices.',
   '/logos/readmore.svg',
   'https://example-readmore.com',
   'https://track.rewardvault.com/go/readmore',
   (SELECT id FROM categories WHERE slug='education'), 'percent', 7.0, 0.00, FALSE, 420);

-- Sample transactions for demo user
INSERT INTO transactions (user_id, merchant_id, purchase_amount, cashback_amount, cashback_type, status, confirmed_at)
VALUES
  ('00000000-0000-0000-0000-000000000002',
   (SELECT id FROM merchants WHERE slug='stylenest'),
   120.00, 10.20, 'percent', 'confirmed', NOW() - INTERVAL '5 days'),

  ('00000000-0000-0000-0000-000000000002',
   (SELECT id FROM merchants WHERE slug='techhaven'),
   350.00, 14.00, 'percent', 'confirmed', NOW() - INTERVAL '12 days'),

  ('00000000-0000-0000-0000-000000000002',
   (SELECT id FROM merchants WHERE slug='glowbox'),
   85.00, 8.50, 'percent', 'pending', NULL),

  ('00000000-0000-0000-0000-000000000002',
   (SELECT id FROM merchants WHERE slug='wanderbook'),
   420.00, 25.20, 'percent', 'paid', NOW() - INTERVAL '30 days'),

  ('00000000-0000-0000-0000-000000000002',
   (SELECT id FROM merchants WHERE slug='freshbasket'),
   45.00, 3.00, 'flat', 'pending', NULL);
