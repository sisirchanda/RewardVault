'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import { api, Wallet, Withdrawal } from '@/lib/api';
import { ArrowLeft, DollarSign, Building, CreditCard, Gift, CheckCircle } from 'lucide-react';

const METHODS = [
  { id: 'bank_transfer', label: 'Bank Transfer', icon: <Building size={20}/>, desc: '3-5 business days' },
  { id: 'paypal',       label: 'PayPal',        icon: <DollarSign size={20}/>, desc: '1-2 business days' },
  { id: 'gift_card',    label: 'Gift Card',     icon: <Gift size={20}/>, desc: 'Instant delivery' },
];

function WalletInner() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bank_transfer');
  const [accountDetails, setAccountDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([api.wallet.get(), api.wallet.withdrawals()])
      .then(([w, wd]) => { setWallet(w); setWithdrawals(wd); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  async function handleWithdraw() {
    setError('');
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 5) { setError('Minimum withdrawal is $5'); return; }
    if (!wallet || amt > wallet.confirmed) { setError('Insufficient balance'); return; }

    setSubmitting(true);
    try {
      await api.wallet.withdraw({
        amount: amt,
        method,
        account_details: { info: accountDetails },
      });
      setSubmitted(true);
      const [w, wd] = await Promise.all([api.wallet.get(), api.wallet.withdrawals()]);
      setWallet(w);
      setWithdrawals(wd);
      setAmount('');
      setAccountDetails('');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || authLoading) {
    return <div style={{ padding: '100px 24px' }}><div className="skeleton" style={{ height: 400, maxWidth: 700, margin: '0 auto' }}/></div>;
  }

  if (!wallet) return null;

  const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
    pending:    { bg: '#fef9c3', color: '#854d0e' },
    approved:   { bg: '#dcfce7', color: '#166534' },
    completed:  { bg: '#dbeafe', color: '#1d4ed8' },
    rejected:   { bg: '#fee2e2', color: '#991b1b' },
    processing: { bg: '#f3e8ff', color: '#6b21a8' },
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '100px 24px 64px' }}>
      <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--vault-muted)', textDecoration: 'none', fontSize: 14, marginBottom: 32 }}>
        <ArrowLeft size={16}/> Back to dashboard
      </Link>

      <h1 style={{ fontSize: 36, color: 'var(--vault-ink)', marginBottom: 32 }}>My Wallet</h1>

      {/* Balance overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
        {[
          { label: 'Available', value: wallet.confirmed, color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Pending', value: wallet.pending, color: '#d97706', bg: '#fffbeb' },
          { label: 'Withdrawn', value: wallet.withdrawn, color: '#1d4ed8', bg: '#eff6ff' },
        ].map(b => (
          <div key={b.label} style={{
            background: b.bg, borderRadius: 16, padding: '20px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 12, color: 'var(--vault-muted)', marginBottom: 6, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{b.label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: b.color }}>
              ${Number(b.value).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Withdrawal form */}
      <div className="card" style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 22, marginBottom: 24 }}>Request Withdrawal</h2>

        {submitted && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: '#f0fdf4', borderRadius: 12, marginBottom: 20 }}>
            <CheckCircle size={20} color="#16a34a"/>
            <span style={{ fontSize: 14, color: '#15803d', fontWeight: 500 }}>Withdrawal request submitted! We'll process it within 3–5 business days.</span>
          </div>
        )}

        {/* Method selector */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--vault-ink)', marginBottom: 10 }}>
            Withdrawal method
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {METHODS.map(m => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                style={{
                  padding: '14px 12px', borderRadius: 12, cursor: 'pointer',
                  border: `1.5px solid ${method === m.id ? 'var(--vault-green)' : 'var(--vault-border)'}`,
                  background: method === m.id ? '#f0fdf4' : 'white',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ color: method === m.id ? 'var(--vault-green)' : 'var(--vault-muted)' }}>{m.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: method === m.id ? 'var(--vault-green)' : 'var(--vault-ink)' }}>{m.label}</span>
                <span style={{ fontSize: 11, color: 'var(--vault-muted)' }}>{m.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            Amount (max: ${Number(wallet.confirmed).toFixed(2)})
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--vault-muted)', fontWeight: 600 }}>$</span>
            <input
              type="number" min="5" step="0.01"
              max={wallet.confirmed}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="input-vault"
              style={{ paddingLeft: 28 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {[10, 25, 50].map(v => (
              <button
                key={v}
                onClick={() => setAmount(Math.min(v, wallet.confirmed).toFixed(2))}
                style={{ padding: '4px 12px', borderRadius: 99, border: '1px solid var(--vault-border)', background: 'transparent', cursor: 'pointer', fontSize: 12 }}
              >
                ${v}
              </button>
            ))}
            <button
              onClick={() => setAmount(Number(wallet.confirmed).toFixed(2))}
              style={{ padding: '4px 12px', borderRadius: 99, border: '1px solid var(--vault-border)', background: 'transparent', cursor: 'pointer', fontSize: 12 }}
            >
              Max
            </button>
          </div>
        </div>

        {/* Account details */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            {method === 'bank_transfer' ? 'Account number / IBAN' :
             method === 'paypal' ? 'PayPal email address' :
             'Gift card type (e.g. Amazon, Google Play)'}
          </label>
          <input
            type="text"
            value={accountDetails}
            onChange={e => setAccountDetails(e.target.value)}
            placeholder={method === 'paypal' ? 'your@email.com' : method === 'bank_transfer' ? 'IBAN or account details' : 'Amazon, Google Play…'}
            className="input-vault"
          />
        </div>

        {error && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 16 }}>{error}</p>}

        <button
          onClick={handleWithdraw}
          disabled={submitting || !amount || !accountDetails || wallet.confirmed < 5}
          className="btn-vault"
          style={{ width: '100%', justifyContent: 'center', opacity: submitting ? 0.7 : 1 }}
        >
          {submitting ? 'Submitting…' : `Withdraw ${amount ? `$${amount}` : ''}`}
        </button>
      </div>

      {/* Withdrawal history */}
      <div>
        <h2 style={{ fontSize: 22, marginBottom: 20 }}>Withdrawal history</h2>
        {withdrawals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: 16, border: '1px solid var(--vault-border)', color: 'var(--vault-muted)' }}>
            No withdrawals yet
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--vault-border)', overflow: 'hidden' }}>
            {withdrawals.map((wd, i) => {
              const s = STATUS_STYLE[wd.status] || STATUS_STYLE.pending;
              return (
                <div key={wd.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 24px',
                  borderBottom: i < withdrawals.length - 1 ? '1px solid var(--vault-border)' : 'none',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>
                      {METHODS.find(m => m.id === wd.method)?.label || wd.method}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--vault-muted)' }}>
                      {new Date(wd.requested_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {wd.admin_note && ` · ${wd.admin_note}`}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
                      ${Number(wd.amount).toFixed(2)}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: s.bg, color: s.color, textTransform: 'capitalize' }}>
                      {wd.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function WalletPage() {
  return (
    <AuthProvider>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--vault-cream)' }}>
        <WalletInner />
      </main>
    </AuthProvider>
  );
}
