'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import { api, AdminStats } from '@/lib/api';
import { Users, Store, TrendingUp, DollarSign, Check, X, AlertCircle } from 'lucide-react';

function AdminInner() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'withdrawals' | 'transactions' | 'users'>('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) router.push('/');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    Promise.all([
      api.admin.analytics(),
      api.admin.withdrawals('pending'),
    ]).then(([s, w]) => {
      setStats(s);
      setWithdrawals(w);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  async function loadUsers() {
    const u = await api.admin.users();
    setUsers(u as any[]);
  }

  useEffect(() => {
    if (activeTab === 'users') loadUsers();
  }, [activeTab]);

  async function processWithdrawal(id: string, action: 'approve' | 'reject') {
    setActionLoading(id);
    try {
      await api.admin.processWithdrawal(id, { action, admin_note: action === 'approve' ? 'Approved by admin' : 'Rejected by admin' });
      setMsg(`Withdrawal ${action}d successfully`);
      const w = await api.admin.withdrawals('pending');
      setWithdrawals(w as any[]);
      const s = await api.admin.analytics();
      setStats(s);
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setActionLoading(null);
      setTimeout(() => setMsg(''), 3000);
    }
  }

  async function confirmTransaction(id: string) {
    setActionLoading(id);
    try {
      await api.admin.confirmTransaction(id);
      setMsg('Transaction confirmed');
      const s = await api.admin.analytics();
      setStats(s);
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setActionLoading(null);
      setTimeout(() => setMsg(''), 3000);
    }
  }

  if (authLoading || loading) {
    return <div style={{ padding: '100px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <div className="skeleton" style={{ height: 500 }}/>
    </div>;
  }

  if (!stats) return null;

  const TABS = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'withdrawals', label: `💰 Withdrawals ${withdrawals.length > 0 ? `(${withdrawals.length})` : ''}` },
    { id: 'transactions', label: '📋 Recent Transactions' },
    { id: 'users', label: '👥 Users' },
  ] as const;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px 64px' }}>
      <div style={{ marginBottom: 32 }}>
        <div className="section-eyebrow" style={{ marginBottom: 8 }}>Admin Panel</div>
        <h1 style={{ fontSize: 36, color: 'var(--vault-ink)' }}>RewardVault Control Centre</h1>
      </div>

      {msg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, marginBottom: 24, color: '#15803d' }}>
          <Check size={16}/> {msg}
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <AdminStat icon={<Users size={20}/>} label="Total Users" value={stats.users.total} sub={`+${stats.users.new_this_month} this month`} color="#1d4ed8"/>
        <AdminStat icon={<Store size={20}/>} label="Active Merchants" value={stats.merchants.active} sub={`of ${stats.merchants.total} total`} color="#16a34a"/>
        <AdminStat icon={<TrendingUp size={20}/>} label="Total Cashback" value={`$${Number(stats.transactions.total_cashback).toFixed(0)}`} sub={`${stats.transactions.total} transactions`} color="#d97706"/>
        <AdminStat icon={<DollarSign size={20}/>} label="Pending Withdrawals" value={`$${Number(stats.withdrawals.pending_amount).toFixed(0)}`} sub={`$${Number(stats.withdrawals.paid_amount).toFixed(0)} paid out`} color="#7c3aed"/>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'white', borderRadius: 12, padding: 4, border: '1px solid var(--vault-border)', marginBottom: 28, width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)} style={{
            padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: activeTab === t.id ? 'var(--vault-green)' : 'transparent',
            color: activeTab === t.id ? 'white' : 'var(--vault-ink)',
            fontSize: 14, fontWeight: activeTab === t.id ? 600 : 400,
            transition: 'all 0.2s', whiteSpace: 'nowrap',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── Overview ── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Top merchants */}
          <div className="card">
            <h3 style={{ fontSize: 18, marginBottom: 20 }}>Top Merchants by Volume</h3>
            {stats.top_merchants.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < stats.top_merchants.length - 1 ? '1px solid var(--vault-border)' : 'none' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--vault-muted)' }}>{m.click_count} clicks</div>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--vault-green)' }}>
                  ${Number(m.cashback_paid).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Cashback breakdown */}
          <div className="card">
            <h3 style={{ fontSize: 18, marginBottom: 20 }}>Cashback Pipeline</h3>
            {[
              { label: 'Pending verification', value: stats.transactions.pending, color: '#d97706', bg: '#fffbeb' },
              { label: 'Confirmed (withdrawable)', value: stats.transactions.confirmed, color: '#16a34a', bg: '#f0fdf4' },
              { label: 'Paid out', value: stats.transactions.paid, color: '#1d4ed8', bg: '#eff6ff' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: 12, background: s.bg, marginBottom: 10 }}>
                <span style={{ fontSize: 14, color: 'var(--vault-ink)' }}>{s.label}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: s.color, fontSize: 18 }}>
                  ${Number(s.value).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Withdrawals ── */}
      {activeTab === 'withdrawals' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--vault-border)' }}>
            <h3 style={{ fontSize: 18 }}>Pending Withdrawal Requests</h3>
          </div>
          {withdrawals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--vault-muted)' }}>
              <AlertCircle size={32} style={{ marginBottom: 12, opacity: 0.4 }}/>
              <p>No pending withdrawals</p>
            </div>
          ) : withdrawals.map((wd, i) => (
            <div key={wd.id} style={{
              display: 'flex', alignItems: 'center', gap: 16, padding: '18px 24px',
              borderBottom: i < withdrawals.length - 1 ? '1px solid var(--vault-border)' : 'none',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{wd.full_name}</div>
                <div style={{ fontSize: 13, color: 'var(--vault-muted)' }}>{wd.email} · {wd.method.replace('_', ' ')}</div>
                <div style={{ fontSize: 12, color: 'var(--vault-muted)' }}>{new Date(wd.requested_at).toLocaleDateString()}</div>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20 }}>
                ${Number(wd.amount).toFixed(2)}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => processWithdrawal(wd.id, 'approve')}
                  disabled={actionLoading === wd.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#16a34a', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
                >
                  <Check size={14}/> Approve
                </button>
                <button
                  onClick={() => processWithdrawal(wd.id, 'reject')}
                  disabled={actionLoading === wd.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
                >
                  <X size={14}/> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Recent Transactions ── */}
      {activeTab === 'transactions' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--vault-border)' }}>
            <h3 style={{ fontSize: 18 }}>Recent Transactions</h3>
          </div>
          {stats.recent_transactions.map((tx, i) => (
            <div key={tx.id} style={{
              display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px',
              borderBottom: i < stats.recent_transactions.length - 1 ? '1px solid var(--vault-border)' : 'none',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{tx.full_name}</div>
                <div style={{ fontSize: 13, color: 'var(--vault-muted)' }}>{tx.merchant_name} · {new Date(tx.pending_at).toLocaleDateString()}</div>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--vault-green)' }}>
                ${Number(tx.cashback_amount).toFixed(2)}
              </div>
              <span className={`badge badge-${tx.status}`}>{tx.status}</span>
              {tx.status === 'pending' && (
                <button
                  onClick={() => confirmTransaction(tx.id)}
                  disabled={actionLoading === tx.id}
                  style={{ padding: '6px 14px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}
                >
                  Confirm
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Users ── */}
      {activeTab === 'users' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--vault-border)' }}>
            <h3 style={{ fontSize: 18 }}>All Users</h3>
          </div>
          {users.map((u, i) => (
            <div key={u.id} style={{
              display: 'flex', alignItems: 'center', gap: 16, padding: '14px 24px',
              borderBottom: i < users.length - 1 ? '1px solid var(--vault-border)' : 'none',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--vault-green)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                {u.full_name?.[0] || '?'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{u.full_name}</div>
                <div style={{ fontSize: 13, color: 'var(--vault-muted)' }}>{u.email}</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 13 }}>
                <div style={{ color: 'var(--vault-green)', fontWeight: 600 }}>${Number(u.confirmed || 0).toFixed(2)} balance</div>
                <div style={{ color: 'var(--vault-muted)' }}>${Number(u.withdrawn || 0).toFixed(2)} withdrawn</div>
              </div>
              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, background: u.is_verified ? '#dcfce7' : '#fee2e2', color: u.is_verified ? '#166534' : '#991b1b' }}>
                {u.is_verified ? 'Verified' : 'Unverified'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthProvider>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--vault-cream)' }}>
        <AdminInner />
      </main>
    </AuthProvider>
  );
}

function AdminStat({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string | number; sub: string; color: string }) {
  return (
    <div style={{ background: 'white', border: '1px solid var(--vault-border)', borderRadius: 16, padding: '20px', borderLeft: `4px solid ${color}` }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, color }}>
        {icon}
        <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--vault-ink)', marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--vault-muted)' }}>{sub}</div>
    </div>
  );
}
