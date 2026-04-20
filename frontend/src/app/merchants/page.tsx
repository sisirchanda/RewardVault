'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AuthProvider } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MerchantCard from '@/components/merchant/MerchantCard';
import { api, Merchant, Category } from '@/lib/api';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'popularity',    label: '🔥 Most Popular' },
  { value: 'cashback_desc', label: '💰 Highest Cashback' },
  { value: 'cashback_asc',  label: '📉 Lowest Cashback' },
  { value: 'newest',        label: '🆕 Newest' },
];

export default function MerchantsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const category = searchParams.get('category') || '';
  const sort     = searchParams.get('sort') || 'popularity';
  const featured = searchParams.get('featured') || '';

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Load merchants
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { sort, limit: '24' };
      if (category) params.category = category;
      if (featured) params.featured = featured;
      if (debouncedSearch) params.search = debouncedSearch;

      const data = await api.merchants.list(params);
      setMerchants(data.merchants);
      setTotal(data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [category, sort, featured, debouncedSearch]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    api.merchants.categories().then(setCategories).catch(console.error);
  }, []);

  function setParam(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set(key, value); else p.delete(key);
    router.push(`/merchants?${p.toString()}`);
  }

  const activeCategory = categories.find(c => c.slug === category);

  return (
    <AuthProvider>
      <Navbar />
      <main style={{ paddingTop: 64, minHeight: '100vh' }}>

        {/* Header */}
        <section style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #fafaf7 100%)',
          padding: '48px 24px 32px',
          borderBottom: '1px solid var(--vault-border)',
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <h1 style={{ fontSize: 'clamp(28px,4vw,48px)', color: 'var(--vault-ink)', marginBottom: 8 }}>
              {activeCategory ? `${activeCategory.name} Offers` : featured ? '⭐ Featured Deals' : 'All Cashback Offers'}
            </h1>
            <p style={{ color: 'var(--vault-muted)', fontSize: 16, marginBottom: 28 }}>
              {total > 0 ? `${total} offer${total !== 1 ? 's' : ''} available` : 'Searching…'}
            </p>

            {/* Search + filters row */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Search */}
              <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 400 }}>
                <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--vault-muted)' }}/>
                <input
                  className="input-vault"
                  placeholder="Search stores…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ paddingLeft: 42 }}
                />
                {search && (
                  <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--vault-muted)' }}>
                    <X size={14}/>
                  </button>
                )}
              </div>

              {/* Sort */}
              <select
                value={sort}
                onChange={e => setParam('sort', e.target.value)}
                style={{
                  padding: '11px 16px', background: 'white',
                  border: '1.5px solid var(--vault-border)', borderRadius: 12,
                  fontSize: 14, fontFamily: 'var(--font-sans)', cursor: 'pointer',
                  color: 'var(--vault-ink)',
                }}
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>

              {/* Featured toggle */}
              <button
                onClick={() => setParam('featured', featured ? '' : 'true')}
                style={{
                  padding: '11px 18px', borderRadius: 12, cursor: 'pointer',
                  border: `1.5px solid ${featured ? 'var(--vault-green)' : 'var(--vault-border)'}`,
                  background: featured ? '#f0fdf4' : 'white',
                  color: featured ? 'var(--vault-green)' : 'var(--vault-ink)',
                  fontSize: 14, fontFamily: 'var(--font-sans)', fontWeight: 500,
                }}
              >
                ⭐ Featured only
              </button>
            </div>
          </div>
        </section>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px', display: 'flex', gap: 32 }}>

          {/* Sidebar: categories */}
          <aside style={{ width: 220, flexShrink: 0 }} className="sidebar-hide">
            <div style={{ position: 'sticky', top: 80 }}>
              <h3 style={{ fontSize: 13, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--vault-muted)', marginBottom: 16 }}>
                Categories
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <button
                  onClick={() => setParam('category', '')}
                  style={{
                    textAlign: 'left', padding: '9px 12px', borderRadius: 8,
                    border: 'none', cursor: 'pointer', fontSize: 14,
                    background: !category ? '#f0fdf4' : 'transparent',
                    color: !category ? 'var(--vault-green)' : 'var(--vault-ink)',
                    fontWeight: !category ? 600 : 400,
                  }}
                >
                  All categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setParam('category', cat.slug)}
                    style={{
                      textAlign: 'left', padding: '9px 12px', borderRadius: 8,
                      border: 'none', cursor: 'pointer', fontSize: 14,
                      background: category === cat.slug ? '#f0fdf4' : 'transparent',
                      color: category === cat.slug ? 'var(--vault-green)' : 'var(--vault-ink)',
                      fontWeight: category === cat.slug ? 600 : 400,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}
                  >
                    <span>{cat.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--vault-muted)' }}>{cat.merchant_count}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Grid */}
          <div style={{ flex: 1 }}>
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px,1fr))', gap: 24 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 300 }}/>
                ))}
              </div>
            ) : merchants.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <h3 style={{ fontSize: 22, marginBottom: 8 }}>No offers found</h3>
                <p style={{ color: 'var(--vault-muted)' }}>Try adjusting your filters or search term</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px,1fr))', gap: 24 }}>
                {merchants.map((m, i) => (
                  <div key={m.id} className="animate-fade-up" style={{ animationDelay: `${(i % 6) * 0.05}s` }}>
                    <MerchantCard merchant={m}/>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 768px) { .sidebar-hide { display: none; } }
      `}</style>
    </AuthProvider>
  );
}
