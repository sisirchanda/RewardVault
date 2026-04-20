'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import { api, Transaction } from '@/lib/api';
import { ArrowLeft, Filter, Download } from 'lucide-react';

const STATUSES = ['all', 'pending', 'confirmed', 'paid', 'rejected'];

const STATUS_META: Record<string, { bg: string; color: string; dot: string }> = {
  pending:   { bg: '#fef9c3', color: '#854d0e', dot: '#f59e0b' },
  confirmed: { bg: '#dcfce7', color: '#166534', dot: '#16a34a' },
  paid:      { bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
  rejected:  { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
  cancelled: { bg: '#f3f4f6', color: '#374151', dot: '#9ca3af' },
};

function TransactionsInner() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const LIMIT = 15;

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const params: Record<string, string> = { limit: String(LIMIT), page: String(page) };
    if (filter !== 'all') params.status = filter;
    api.wallet.transactions(params)
      .then(d => { setTxs(d.transactions); setTotal(d.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, filter, page]);

  const totalPages = Math.ceil(total / LIMIT);

  // Summary by status
  const summary = txs.reduce<Record<string, number>>((acc, tx) => {
    acc[tx.status] = (acc[tx.status] || 0) + Number(tx.cashback_amount);
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '100px 24px 64px' }}>
      <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--vault-muted)', textDecoration: 'none', fontSize: 14, marginBottom: 32 }}>
        <ArrowLeft size={16} /> Back to dashboard
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="section-eyebrow" style={{ marginBottom: 8 }}>Earnings history</div>
          <h1 style={{ fontSize: 36, color: 'var(--vault-ink)' }}>My Transactions</h1>
        </div>
        <span style={{ fontSize: 14, color: 'var(--vault-muted)' }}>{total} total</span>
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => { setFilter(s); setPage(1); }}
            style={{
              padding: '7px 16px', borderRadius: 99, border: 'none',
              cursor: 'pointer', fontSize: 13, fontWeight: filter === s ? 600 : 400,
              background: filter === s
                ? (s === 'all' ? 'var(--vault-ink)' : (STATUS_META[s]?.bg || '#f0fdf4'))
                : '#f0f0ed',
              color: filter === s
                ? (s === 'all' ? 'white' : (STATUS_META[s]?.color || 'var(--vault-ink)'))
                : 'var(--vault-muted)',
              transition: 'all 0.15s',
              textTransform: 'capitalize',
            }}
          >
            {s === 'all' ? 'All transactions' : s}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 72, borderRadius: 14 }} />
          ))}
        </div>
      ) : txs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px', background: 'white', borderRadius: 20, border: '1px solid var(--vault-border)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <h3 style={{ fontSize: 20, marginBottom: 8 }}>No transactions found</h3>
          <p style={{ color: 'var(--vault-muted)' }}>
            {filter !== 'all' ? `No ${filter} transactions yet` : 'Start shopping to earn cashback!'}
          </p>
          {filter !== 'all' && (
            <button onClick={() => setFilter('all')} className="btn-outline" style={{ marginTop: 16, fontSize: 14 }}>
              View all transactions
            </button>
          )}
        </div>
      ) : (
        <>
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid var(--vault-border)', overflow: 'hidden' }}>
            {/* Table header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 120px 120px 110px',
              padding: '12px 24px', background: '#f8f8f6',
              borderBottom: '1px solid var(--vault-border)',
              fontSize: 12, fontWeight: 600, color: 'var(--vault-muted)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              <span>Merchant</span>
              <span style={{ textAlign: 'right' }}>Purchase</span>
              <span style={{ textAlign: 'right' }}>Cashback</span>
              <span style={{ textAlign: 'center' }}>Status</span>
            </div>

            {txs.map((tx, i) => {
              const meta = STATUS_META[tx.status] || STATUS_META.pending;
              return (
                <div
                  key={tx.id}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 120px 120px 110px',
                    alignItems: 'center', padding: '16px 24px',
                    borderBottom: i < txs.length - 1 ? '1px solid var(--vault-border)' : 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fafaf7')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Merchant info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: '#f0fdf4', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 18, flexShrink: 0,
                    }}>
                      🏪
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--vault-ink)' }}>
                        {tx.merchant_name}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--vault-muted)' }}>
                        {new Date(tx.pending_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                        {tx.order_ref && ` · #${tx.order_ref}`}
                      </div>
                    </div>
                  </div>

                  {/* Purchase amount */}
                  <div style={{ textAlign: 'right', fontSize: 14, color: 'var(--vault-muted)' }}>
                    {tx.purchase_amount ? `$${Number(tx.purchase_amount).toFixed(2)}` : '—'}
                  </div>

                  {/* Cashback */}
                  <div style={{
                    textAlign: 'right',
                    fontFamily: 'var(--font-display)', fontWeight: 700,
                    fontSize: 16, color: 'var(--vault-green)',
                  }}>
                    +${Number(tx.cashback_amount).toFixed(2)}
                  </div>

                  {/* Status badge */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '4px 10px', borderRadius: 99,
                      background: meta.bg, color: meta.color,
                      fontSize: 12, fontWeight: 600, textTransform: 'capitalize',
                    }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: meta.dot, flexShrink: 0,
                      }} />
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 24 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: '1px solid var(--vault-border)',
                  background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer',
                  opacity: page === 1 ? 0.4 : 1, fontSize: 14,
                }}
              >
                ← Prev
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      width: 36, height: 36, borderRadius: 8,
                      border: `1px solid ${p === page ? 'var(--vault-green)' : 'var(--vault-border)'}`,
                      background: p === page ? '#f0fdf4' : 'white',
                      color: p === page ? 'var(--vault-green)' : 'var(--vault-ink)',
                      fontWeight: p === page ? 700 : 400,
                      cursor: 'pointer', fontSize: 14,
                    }}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: '1px solid var(--vault-border)',
                  background: 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  opacity: page === totalPages ? 0.4 : 1, fontSize: 14,
                }}
              >
                Next →
              </button>
            </div>
          )}

          {/* Summary row */}
          <div style={{
            marginTop: 24, display: 'flex', gap: 16, flexWrap: 'wrap',
            padding: '16px 20px', background: 'white',
            borderRadius: 16, border: '1px solid var(--vault-border)',
          }}>
            <span style={{ fontSize: 13, color: 'var(--vault-muted)', alignSelf: 'center' }}>Showing {txs.length} of {total}</span>
            <div style={{ flex: 1 }} />
            {Object.entries(summary).map(([status, amount]) => {
              const meta = STATUS_META[status];
              if (!meta) return null;
              return (
                <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: meta.dot }} />
                  <span style={{ fontSize: 13, color: 'var(--vault-muted)', textTransform: 'capitalize' }}>{status}:</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--vault-ink)' }}>${amount.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <AuthProvider>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--vault-cream)' }}>
        <TransactionsInner />
      </main>
    </AuthProvider>
  );
}
