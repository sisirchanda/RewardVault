'use client';

import Link from 'next/link';
import { AuthProvider } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function TermsPage() {
  return (
    <AuthProvider>
      <Navbar />
      <main style={{ paddingTop: 80, minHeight: '100vh', background: 'var(--vault-cream)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>
          <div className="section-eyebrow" style={{ marginBottom: 12 }}>Legal</div>
          <h1 style={{ fontSize: 40, marginBottom: 8 }}>Terms & Conditions</h1>
          <p style={{ color: 'var(--vault-muted)', marginBottom: 48 }}>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          {[
            { title: '1. Acceptance of Terms', body: 'By accessing or using RewardVault ("the Platform"), you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the Platform. We reserve the right to update these terms at any time with notice.' },
            { title: '2. Eligibility', body: 'You must be at least 18 years old to use RewardVault. By using the Platform, you represent and warrant that you meet this requirement and have the legal capacity to enter into a binding agreement.' },
            { title: '3. Cashback & Rewards', body: 'Cashback earnings are subject to successful tracking of qualifying purchases through our platform. Cashback rates are set by our merchant partners and may change without notice. Pending cashback is subject to a verification period and may be reversed if a purchase is returned or cancelled. RewardVault reserves the right to adjust or reverse cashback for fraudulent or disputed transactions.' },
            { title: '4. Withdrawals', body: 'Confirmed cashback balances may be withdrawn subject to a minimum threshold of $5. Withdrawals are processed within 3–5 business days. RewardVault reserves the right to delay or withhold withdrawals pending fraud investigation. Withdrawal methods available include bank transfer, PayPal, and gift cards.' },
            { title: '5. Prohibited Conduct', body: 'Users must not attempt to fraudulently earn cashback, create multiple accounts, or abuse the referral system. Any such conduct may result in immediate account suspension, forfeiture of earnings, and legal action where appropriate.' },
            { title: '6. Privacy', body: 'Your privacy is important to us. Please review our Privacy Policy, which governs how we collect, use, and protect your personal information. By using the Platform, you consent to our data practices as described in the Privacy Policy.' },
            { title: '7. Limitation of Liability', body: 'RewardVault is provided "as is" without warranties of any kind. We are not liable for merchant service failures, missed cashback due to tracking errors outside our control, or any indirect or consequential damages arising from your use of the Platform.' },
            { title: '8. Governing Law', body: 'These Terms shall be governed by applicable law. Disputes shall be resolved through binding arbitration, except where prohibited by law.' },
          ].map(s => (
            <div key={s.title} style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 20, color: 'var(--vault-ink)', marginBottom: 10 }}>{s.title}</h2>
              <p style={{ fontSize: 15, color: 'var(--vault-muted)', lineHeight: 1.8 }}>{s.body}</p>
            </div>
          ))}

          <div style={{ background: '#f0fdf4', borderRadius: 16, padding: '20px 24px', marginTop: 40 }}>
            <p style={{ fontSize: 14, color: '#15803d', lineHeight: 1.7 }}>
              <strong>Questions about these terms?</strong> Contact us at{' '}
              <a href="mailto:legal@rewardvault.com" style={{ color: '#15803d' }}>legal@rewardvault.com</a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </AuthProvider>
  );
}
