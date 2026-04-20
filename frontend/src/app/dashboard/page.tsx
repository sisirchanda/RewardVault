'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import { api, Transaction, Wallet } from '@/lib/api';
import { TrendingUp, Clock, DollarSign, Download, ChevronRight, ArrowUpRight } from 'lucide-react';

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  pending:   { bg: '#fef9c3', color: '#854d0e', label: 'Pending' },
  confirmed: { bg: '#dcfce7', color: '#166534', label: 'Confirmed' },
  paid:      { bg: '#dbeafe', color: '#1d4ed8', label: 'Paid' },
  rejected:  { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
};

function DashboardInner() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login?redirect=/dashboard');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.wallet.get(),
      api.wallet.transactions({ limit: '10' }),
    ]).then(([w, t]) => {
      setWallet(w);
      setTxs(t.transactions);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || loading) {
    return (
      <div style={{ padding: '100px 24px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
          {[1,2,3].map(n => <div key={n} className="skeleton" style={{ height: 120 }}/>)}
        </div>
        <div className="skeleton" style={{ height: 400 }}/>
      </div>
    );
  }

  if (!user || !wallet) return null;

  const totalEarned = Number(wallet.total_earned) + Number(wallet.confirmed) + Number(wallet.pending) + Number(wallet.withdrawn);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '100px 24px 64px' }}>

      {/* Welcome header */}
      <div style={{ marginBottom: 40 }}>
        <div className="section-eyebrow" style={{ marginBottom: 8 }}>Welcome back</div>
        <h1 style={{ fontSize: 36, color: 'var(--vault-ink)' }}>
          {user.full_name?.split(' ')[0]}'s Vault
        </h1>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
        <StatCard
          icon={<DollarSign size={20} color="#16a34a"/>}
          label="Available to withdraw"
          value={`$${Number(wallet.confirmed).toFixed(2)}`}
          accent="#16a34a"
          bg="#f0fdf4"
          action={<Link href="/dashboard/wallet" style={{ fontSize: 12, color: '#16a34a', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>Withdraw <ChevronRight size={12}/></Link>}
        />
        <StatCard
          icon={<Clock size={20} color="#d97706"/>}
          label="Pending cashback"
          value={`$${Number(wallet.pending).toFixed(2)}`}
          accent="#d97706"
          bg="#fffbeb"
          action={<span style={{ fontSize: 12, color: 'var(--vault-muted)' }}>Confirming…</span>}
        />
        <StatCard
          icon={<TrendingUp size={20} color="#1d4ed8"/>}
          label="Total earned"
          value={`$${Number(wallet.total_earned || 0).toFixed(2)}`}
          accent="#1d4ed8"
          bg="#eff6ff"
          action={<span style={{ fontSize: 12, color: 'var(--vault-muted)' }}>All time</span>}
        />
        <StatCard
          icon={<Download size={20} color="#7c3aed"/>}
          label="Total withdrawn"
          value={`$${Number(wallet.withdrawn).toFixed(2)}`}
          accent="#7c3aed"
          bg="#f5f3ff"
          action={<Link href="/dashboard/withdrawals" style={{ fontSize: 12, color: '#7c3aed', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>History <ChevronRight size={12}/></Link>}
        />
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 40, flexWrap: 'wrap' }}>
        <Link href="/merchants" className="btn-vault" style={{ fontSize: 14, padding: '10px 20px' }}>
          Browse offers
        </Link>
        <Link href="/dashboard/wallet" className="btn-outline" style={{ fontSize: 14, padding: '10px 20px' }}>
          <Download size={15}/> Withdraw earnings
        </Link>
      </div>

      {/* Recent transactions */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 24, color: 'var(--vault-ink)' }}>Recent activity</h2>
          <Link href="/dashboard/transactions" style={{ fontSize: 14, color: 'var(--vault-green)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            View all <ChevronRight size={15}/>
          </Link>
        </div>

        {txs.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '48px', background: 'white',
            borderRadius: 20, border: '1px solid var(--vault-border)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
            <h3 style={{ fontSize: 20, marginBottom: 8 }}>No transactions yet</h3>
            <p style={{ color: 'var(--vault-muted)', marginBottom: 20 }}>Start shopping through RewardVault to earn cashback</p>
            <Link href="/merchants" className="btn-vault">Browse offers</Link>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid var(--vault-border)', overflow: 'hidden' }}>
            {txs.map((tx, i) => {
              const s = STATUS_STYLE[tx.status] || STATUS_STYLE.pending;
              return (
                <div key={tx.id} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '16px 24px',
                  borderBottom: i < txs.length - 1 ? '1px solid var(--vault-border)' : 'none',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fafaf7')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Store logo placeholder */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: '#f0fdf4', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 20, flexShrink: 0,
                  }}>
                    🏪
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--vault-ink)', marginBottom: 2 }}>
                      {tx.merchant_name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--vault-muted)' }}>
                      {new Date(tx.pending_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {tx.purchase_amount && ` · Purchase: $${Number(tx.purchase_amount).toFixed(2)}`}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--vault-green)', marginBottom: 4 }}>
                      +${Number(tx.cashback_amount).toFixed(2)}
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px',
                      borderRadius: 99, background: s.bg, color: s.color,
                    }}>
                      {s.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Referral card */}
      {user.referral_code && (
        <div style={{
          marginTop: 32, background: 'var(--vault-ink)', borderRadius: 20,
          padding: '28px 32px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 20,
        }}>
          <div>
            <h3 style={{ color: 'white', fontSize: 22, marginBottom: 6 }}>Refer & earn more 🎁</h3>
            <p style={{ color: '#b3b2a9', fontSize: 14 }}>Share your code. You both earn when they make their first cashback purchase.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              background: 'rgba(255,255,255,0.1)', borderRadius: 12,
              padding: '10px 20px', fontFamily: 'var(--font-mono)',
              fontSize: 18, fontWeight: 600, color: 'white',
              letterSpacing: '0.08em',
            }}>
              {user.referral_code}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(user.referral_code || '')}
              style={{
                background: 'var(--vault-green)', color: 'white',
                border: 'none', borderRadius: 12, padding: '10px 20px',
                cursor: 'pointer', fontSize: 14, fontWeight: 500,
              }}
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthProvider>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--vault-cream)' }}>
        <DashboardInner />
      </main>
    </AuthProvider>
  );
}

function StatCard({ icon, label, value, accent, bg, action }: {
  icon: React.ReactNode; label: string; value: string;
  accent: string; bg: string; action?: React.ReactNode;
}) {
  return (
    <div style={{
      background: 'white', border: '1px solid var(--vault-border)',
      borderRadius: 16, padding: '20px 22px',
      borderTop: `3px solid ${accent}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ background: bg, borderRadius: 10, padding: 8 }}>{icon}</div>
        {action}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--vault-ink)', marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: 'var(--vault-muted)' }}>{label}</div>
    </div>
  );
}
