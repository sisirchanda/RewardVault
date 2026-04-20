'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Merchant } from '@/lib/api';
import { ArrowRight, Star, Tag } from 'lucide-react';

const CATEGORY_ICONS: Record<string, string> = {
  fashion: '👗', electronics: '💻', travel: '✈️',
  'health-beauty': '✨', 'home-garden': '🏡',
  sports: '⚽', food: '🛒', education: '📚',
};

export default function MerchantCard({ merchant }: { merchant: Merchant }) {
  const router = useRouter();
  const isPercent = merchant.cashback_type === 'percent';
  const cashbackLabel = isPercent
    ? `${merchant.cashback_value}% cashback`
    : `$${merchant.cashback_value} cashback`;

  const emoji = CATEGORY_ICONS[merchant.category_slug] || '🏪';
  const initial = merchant.name[0].toUpperCase();

  return (
    <div
      className="merchant-card card"
      style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
      onClick={() => router.push(`/merchants/${merchant.slug}`)}
    >
      {merchant.is_featured && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: 'var(--vault-gold)', color: '#78350f',
          fontSize: 11, fontWeight: 600, padding: '3px 8px',
          borderRadius: 99, display: 'flex', alignItems: 'center', gap: 3,
        }}>
          <Star size={10} fill="currentColor"/> Featured
        </div>
      )}

      <div style={{ padding: '24px 24px 20px' }}>
        {/* Logo / Initial */}
        <div style={{ marginBottom: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: '#f0fdf4', border: '1.5px solid #bbf7d0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28,
          }}>
            {merchant.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={merchant.logo_url} alt={merchant.name} style={{ width: 40, height: 40, objectFit: 'contain' }}/>
            ) : (
              <span>{emoji}</span>
            )}
          </div>
        </div>

        {/* Name & Category */}
        <div style={{ marginBottom: 8 }}>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18,
            color: 'var(--vault-ink)', marginBottom: 4,
          }}>{merchant.name}</h3>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 12, color: 'var(--vault-muted)',
          }}>
            <Tag size={11}/>{merchant.category_name}
          </span>
        </div>

        {/* Description */}
        <p style={{
          fontSize: 13, color: 'var(--vault-muted)', lineHeight: 1.6,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
          marginBottom: 16, minHeight: 40,
        }}>
          {merchant.description}
        </p>

        {/* Cashback highlight */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span className="cashback-pill" style={{ fontSize: 14 }}>
            💰 {cashbackLabel}
          </span>
          {merchant.min_purchase > 0 && (
            <span style={{ fontSize: 11, color: 'var(--vault-muted)' }}>
              Min. ${merchant.min_purchase}
            </span>
          )}
        </div>
      </div>

      {/* CTA */}
      <div style={{
        borderTop: '1px solid var(--vault-border)',
        padding: '14px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#fafaf7',
      }}>
        <span style={{ fontSize: 13, color: 'var(--vault-muted)' }}>
          {merchant.popularity > 800 ? '🔥 Very popular' :
           merchant.popularity > 600 ? '⭐ Popular' : 'New offer'}
        </span>
        <span style={{
          display: 'flex', alignItems: 'center', gap: 4,
          color: 'var(--vault-green)', fontWeight: 600, fontSize: 13,
        }}>
          Get cashback <ArrowRight size={14}/>
        </span>
      </div>
    </div>
  );
}
