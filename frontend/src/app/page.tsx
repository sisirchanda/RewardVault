'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AuthProvider } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MerchantCard from '@/components/merchant/MerchantCard';
import { api, Merchant, Category } from '@/lib/api';
import { ArrowRight, TrendingUp, Shield, Zap, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const [featured, setFeatured] = useState<Merchant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.merchants.list({ featured: 'true', limit: '6' }),
      api.merchants.categories(),
    ]).then(([data, cats]) => {
      setFeatured(data.merchants);
      setCategories(cats);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthProvider>
      <Navbar />
      <main>
        {/* ── Hero ──────────────────────────────────────────────── */}
        <section style={{
          minHeight: '100vh',
          display: 'flex', alignItems: 'center',
          background: 'linear-gradient(160deg, #f0fdf4 0%, #fafaf7 40%, #fef9c3 100%)',
          padding: '80px 24px 64px',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Background decoration */}
          <div style={{
            position: 'absolute', top: -80, right: -80,
            width: 600, height: 600, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}/>
          <div style={{
            position: 'absolute', bottom: -40, left: '20%',
            width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}/>

          <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>

              {/* Left: Copy */}
              <div>
                <div className="section-eyebrow animate-fade-up" style={{ marginBottom: 20 }}>
                  The smarter way to shop
                </div>
                <h1 className="animate-fade-up delay-100" style={{
                  fontSize: 'clamp(40px, 5vw, 72px)', fontWeight: 700,
                  lineHeight: 1.08, color: 'var(--vault-ink)', marginBottom: 24,
                }}>
                  Earn real<br/>
                  <em style={{ color: 'var(--vault-green)', fontStyle: 'italic' }}>cashback</em><br/>
                  as you shop.
                </h1>
                <p className="animate-fade-up delay-200" style={{
                  fontSize: 18, color: 'var(--vault-muted)', lineHeight: 1.7,
                  maxWidth: 440, marginBottom: 40,
                }}>
                  RewardVault connects you to exclusive cashback deals from top online stores.
                  Click, shop, earn — it's that simple.
                </p>

                <div className="animate-fade-up delay-300" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 48 }}>
                  <Link href="/signup" className="btn-vault" style={{ fontSize: 16, padding: '14px 32px' }}>
                    Start earning free <ArrowRight size={18}/>
                  </Link>
                  <Link href="/merchants" className="btn-outline" style={{ fontSize: 16, padding: '14px 32px' }}>
                    Browse offers
                  </Link>
                </div>

                {/* Social proof */}
                <div className="animate-fade-up delay-400" style={{ display: 'flex', gap: 32 }}>
                  {[
                    { value: '$2.4M+', label: 'Cashback paid out' },
                    { value: '50K+', label: 'Happy members' },
                    { value: '200+', label: 'Partner stores' },
                  ].map(s => (
                    <div key={s.label}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--vault-ink)' }}>
                        {s.value}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--vault-muted)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Float card */}
              <div style={{ display: 'flex', justifyContent: 'center' }} className="animate-fade-up delay-200">
                <div className="animate-float" style={{ width: '100%', maxWidth: 360 }}>
                  <div style={{
                    background: 'white', borderRadius: 24, padding: 28,
                    boxShadow: '0 24px 80px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(255,255,255,0.8)',
                  }}>
                    <div style={{ fontSize: 12, color: 'var(--vault-muted)', marginBottom: 4, fontFamily: 'var(--font-mono)' }}>MY EARNINGS</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 700, color: 'var(--vault-ink)', marginBottom: 4 }}>
                      $247.50
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#16a34a', marginBottom: 24 }}>
                      <TrendingUp size={14}/> +$12.40 this week
                    </div>

                    {/* Mini transactions */}
                    {[
                      { store: '🛍️ StyleNest', amount: '+$8.50', status: 'Confirmed', color: '#16a34a' },
                      { store: '💻 TechHaven', amount: '+$14.00', status: 'Pending', color: '#d97706' },
                      { store: '✈️ WanderBook', amount: '+$25.20', status: 'Paid out', color: '#1d4ed8' },
                    ].map(tx => (
                      <div key={tx.store} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 0', borderBottom: '1px solid var(--vault-border)',
                      }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500 }}>{tx.store}</div>
                          <div style={{ fontSize: 12, color: tx.color }}>{tx.status}</div>
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--vault-green)' }}>
                          {tx.amount}
                        </div>
                      </div>
                    ))}

                    <div style={{ marginTop: 20 }}>
                      <div style={{
                        width: '100%', padding: '12px', background: '#f0fdf4',
                        border: '1px solid #bbf7d0', borderRadius: 12,
                        textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#15803d',
                      }}>
                        💳 Withdraw $247.50
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────────── */}
        <section style={{ padding: '96px 24px', background: 'white' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <div className="section-eyebrow" style={{ marginBottom: 12 }}>How it works</div>
              <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', color: 'var(--vault-ink)' }}>
                Three steps to earning
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32 }}>
              {[
                { n: '01', icon: '🔍', title: 'Find an offer', body: 'Browse our curated selection of cashback deals from hundreds of online stores across every category.' },
                { n: '02', icon: '🛒', title: 'Shop as normal', body: 'Click "Get Cashback" and you\'ll be taken to the store. Shop and checkout exactly as you normally would.' },
                { n: '03', icon: '💰', title: 'Get paid', body: 'Your cashback is automatically tracked and added to your wallet. Withdraw to your bank, PayPal, or gift card.' },
              ].map((step, i) => (
                <div key={step.n} className="animate-fade-up" style={{ animationDelay: `${i * 0.15}s` }}>
                  <div style={{
                    fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--vault-green)',
                    letterSpacing: '0.1em', marginBottom: 16,
                  }}>STEP {step.n}</div>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>{step.icon}</div>
                  <h3 style={{ fontSize: 22, marginBottom: 12, color: 'var(--vault-ink)' }}>{step.title}</h3>
                  <p style={{ fontSize: 15, color: 'var(--vault-muted)', lineHeight: 1.7 }}>{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Categories ────────────────────────────────────────── */}
        <section style={{ padding: '80px 24px', background: 'var(--vault-cream)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
              <div>
                <div className="section-eyebrow" style={{ marginBottom: 8 }}>Shop by category</div>
                <h2 style={{ fontSize: 'clamp(24px,3vw,36px)', color: 'var(--vault-ink)' }}>Find your next deal</h2>
              </div>
              <Link href="/merchants" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--vault-green)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
                All offers <ChevronRight size={16}/>
              </Link>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  href={`/merchants?category=${cat.slug}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 20px',
                    background: 'white', border: '1px solid var(--vault-border)',
                    borderRadius: 99, textDecoration: 'none',
                    fontSize: 14, fontWeight: 500, color: 'var(--vault-ink)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--vault-green)'; e.currentTarget.style.background = '#f0fdf4'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--vault-border)'; e.currentTarget.style.background = 'white'; }}
                >
                  <span style={{ fontSize: 18 }}>
                    {({ fashion:'👗', electronics:'💻', travel:'✈️', 'health-beauty':'✨', 'home-garden':'🏡', sports:'⚽', food:'🛒', education:'📚' } as any)[cat.slug] || '🏪'}
                  </span>
                  {cat.name}
                  <span style={{ fontSize: 12, color: 'var(--vault-muted)' }}>({cat.merchant_count})</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Featured merchants ────────────────────────────────── */}
        <section style={{ padding: '80px 24px', background: 'white' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
              <div>
                <div className="section-eyebrow" style={{ marginBottom: 8 }}>Top offers</div>
                <h2 style={{ fontSize: 'clamp(24px,3vw,36px)', color: 'var(--vault-ink)' }}>Featured today</h2>
              </div>
              <Link href="/merchants?featured=true" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--vault-green)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
                View all <ChevronRight size={16}/>
              </Link>
            </div>

            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
                {[1,2,3].map(n => <div key={n} className="skeleton" style={{ height: 280 }}/>)}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
                {featured.map(m => <MerchantCard key={m.id} merchant={m}/>)}
              </div>
            )}
          </div>
        </section>

        {/* ── Trust signals ──────────────────────────────────────── */}
        <section style={{ padding: '80px 24px', background: '#f0fdf4' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <div className="section-eyebrow" style={{ marginBottom: 12 }}>Why RewardVault</div>
              <h2 style={{ fontSize: 'clamp(24px,3vw,40px)', color: 'var(--vault-ink)' }}>Built on trust</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
              {[
                { icon: <Shield size={28} color="#16a34a"/>, title: 'Secure & Private', body: 'Your data is encrypted and never sold to third parties. GDPR-compliant by design.' },
                { icon: <Zap size={28} color="#16a34a"/>, title: 'Instant Tracking', body: 'Every click is tracked in real-time. Your cashback appears in your wallet within hours.' },
                { icon: <TrendingUp size={28} color="#16a34a"/>, title: 'Real Money', body: 'Withdraw to your bank account, PayPal, or convert to gift cards. No points, no tricks.' },
              ].map(f => (
                <div key={f.title} className="card">
                  <div style={{ marginBottom: 16 }}>{f.icon}</div>
                  <h3 style={{ fontSize: 20, marginBottom: 10, color: 'var(--vault-ink)' }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--vault-muted)', lineHeight: 1.7 }}>{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────── */}
        <section style={{
          padding: '96px 24px',
          background: 'var(--vault-ink)',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>🏦</div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', color: 'white', marginBottom: 20 }}>
              Ready to start earning?
            </h2>
            <p style={{ fontSize: 18, color: '#b3b2a9', marginBottom: 40, lineHeight: 1.7 }}>
              Join thousands of smart shoppers earning cashback every day. Free forever.
            </p>
            <Link href="/signup" className="btn-vault" style={{ fontSize: 17, padding: '16px 40px' }}>
              Create free account <ArrowRight size={18}/>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </AuthProvider>
  );
}
