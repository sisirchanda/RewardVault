'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { api, Merchant } from '@/lib/api';
import { ArrowLeft, ExternalLink, Info, CheckCircle, Clock, Tag, Shield } from 'lucide-react';

const EMOJI_MAP: Record<string, string> = {
  fashion: '👗', electronics: '💻', travel: '✈️',
  'health-beauty': '✨', 'home-garden': '🏡',
  sports: '⚽', food: '🛒', education: '📚',
};

function MerchantDetailInner({ slug }: { slug: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);
  const [clicking, setClicking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.merchants.get(slug)
      .then(setMerchant)
      .catch(() => router.push('/merchants'))
      .finally(() => setLoading(false));
  }, [slug, router]);

  async function handleGetCashback() {
    if (!user) {
      router.push(`/login?redirect=/merchants/${slug}`);
      return;
    }
    if (!merchant) return;

    setClicking(true);
    setError('');
    try {
      const { redirect_url } = await api.track.click(merchant.id);
      setSuccess(true);
      setTimeout(() => {
        window.open(redirect_url, '_blank');
      }, 800);
    } catch (e: any) {
      setError(e.message || 'Failed to track click');
    } finally {
      setClicking(false);
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 900, margin: '100px auto 64px', padding: '0 24px' }}>
        <div className="skeleton" style={{ height: 400, borderRadius: 20 }}/>
      </div>
    );
  }

  if (!merchant) return null;

  const cashbackLabel = merchant.cashback_type === 'percent'
    ? `${merchant.cashback_value}%`
    : `$${merchant.cashback_value}`;
  const emoji = EMOJI_MAP[merchant.category_slug] || '🏪';

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '100px 24px 64px' }}>
      {/* Back */}
      <Link href="/merchants" style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        color: 'var(--vault-muted)', textDecoration: 'none', fontSize: 14,
        marginBottom: 32,
      }}>
        <ArrowLeft size={16}/> Back to offers
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40, alignItems: 'start' }}>

        {/* Left: Merchant info */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
            <div style={{
              width: 80, height: 80, borderRadius: 20,
              background: '#f0fdf4', border: '2px solid #bbf7d0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 44,
            }}>
              {emoji}
            </div>
            <div>
              <h1 style={{ fontSize: 36, color: 'var(--vault-ink)', marginBottom: 4 }}>{merchant.name}</h1>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 13, color: 'var(--vault-muted)',
                background: '#f8f8f6', padding: '4px 12px', borderRadius: 99,
              }}>
                <Tag size={12}/> {merchant.category_name}
              </span>
            </div>
          </div>

          <p style={{ fontSize: 16, color: 'var(--vault-muted)', lineHeight: 1.8, marginBottom: 32 }}>
            {merchant.description}
          </p>

          {/* Details grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
            <InfoCard icon={<CheckCircle size={18} color="#16a34a"/>} label="Cashback rate" value={`${cashbackLabel} ${merchant.cashback_type === 'percent' ? 'on purchases' : 'per order'}`}/>
            <InfoCard icon={<Clock size={18} color="#d97706"/>} label="Confirmation time" value="~30 days"/>
            <InfoCard icon={<Tag size={18} color="#1d4ed8"/>} label="Minimum purchase" value={merchant.min_purchase > 0 ? `$${merchant.min_purchase}` : 'No minimum'}/>
            <InfoCard icon={<Shield size={18} color="#7c3aed"/>} label="Status" value={merchant.is_active ? 'Active & tracking' : 'Temporarily paused'}/>
          </div>

          {/* Terms */}
          {merchant.terms && (
            <div style={{
              background: '#fffbeb', border: '1px solid #fde68a',
              borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 12,
            }}>
              <Info size={16} style={{ color: '#d97706', flexShrink: 0, marginTop: 2 }}/>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#92400e', marginBottom: 4 }}>Cashback terms</div>
                <p style={{ fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>{merchant.terms}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: CTA card */}
        <div style={{ position: 'sticky', top: 90 }}>
          <div style={{
            background: 'white', border: '1px solid var(--vault-border)',
            borderRadius: 24, padding: 28,
            boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
          }}>
            {/* Cashback highlight */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: 'var(--vault-muted)', marginBottom: 8, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                You earn
              </div>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 700,
                color: 'var(--vault-green)', lineHeight: 1,
              }}>
                {cashbackLabel}
              </div>
              <div style={{ fontSize: 14, color: 'var(--vault-muted)', marginTop: 4 }}>
                {merchant.cashback_type === 'percent' ? 'back on every purchase' : 'back per order'}
              </div>
            </div>

            {/* CTA */}
            {success ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                padding: '20px', background: '#f0fdf4', borderRadius: 16,
              }}>
                <CheckCircle size={32} color="#16a34a"/>
                <div style={{ fontWeight: 600, color: '#15803d' }}>Opening store…</div>
                <div style={{ fontSize: 13, color: 'var(--vault-muted)' }}>Your cashback is being tracked</div>
              </div>
            ) : (
              <>
                <button
                  onClick={handleGetCashback}
                  disabled={clicking}
                  className="btn-vault"
                  style={{ width: '100%', justifyContent: 'center', fontSize: 16, padding: '16px', marginBottom: 12 }}
                >
                  {clicking ? 'Connecting…' : (
                    <><ExternalLink size={18}/> Get Cashback</>
                  )}
                </button>
                {!user && (
                  <p style={{ fontSize: 13, color: 'var(--vault-muted)', textAlign: 'center' }}>
                    <Link href="/login" style={{ color: 'var(--vault-green)' }}>Sign in</Link> to start earning cashback
                  </p>
                )}
              </>
            )}

            {error && (
              <p style={{ fontSize: 13, color: '#dc2626', textAlign: 'center', marginTop: 8 }}>{error}</p>
            )}

            <div style={{ borderTop: '1px solid var(--vault-border)', marginTop: 20, paddingTop: 20 }}>
              {[
                '✓ No extra cost to you',
                '✓ Cashback tracked automatically',
                '✓ Withdraw to bank or PayPal',
              ].map(t => (
                <div key={t} style={{ fontSize: 13, color: 'var(--vault-muted)', marginBottom: 8 }}>{t}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MerchantDetailPage() {
  const params = useParams();
  return (
    <AuthProvider>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--vault-cream)' }}>
        <MerchantDetailInner slug={params.slug as string}/>
      </main>
      <Footer />
    </AuthProvider>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ background: '#f8f8f6', borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{ marginTop: 1 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 12, color: 'var(--vault-muted)', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--vault-ink)' }}>{value}</div>
      </div>
    </div>
  );
}
