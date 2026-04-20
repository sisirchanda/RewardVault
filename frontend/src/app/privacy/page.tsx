'use client';

import { AuthProvider } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function PrivacyPage() {
  return (
    <AuthProvider>
      <Navbar />
      <main style={{ paddingTop: 80, minHeight: '100vh', background: 'var(--vault-cream)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>
          <div className="section-eyebrow" style={{ marginBottom: 12 }}>Legal</div>
          <h1 style={{ fontSize: 40, marginBottom: 8 }}>Privacy Policy</h1>
          <p style={{ color: 'var(--vault-muted)', marginBottom: 48 }}>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          {[
            { title: 'Data We Collect', body: 'We collect the information you provide during registration (name, email, password), transaction data needed to track and verify cashback earnings, device and browser information for fraud prevention, and usage data to improve our services.' },
            { title: 'How We Use Your Data', body: 'Your data is used to operate and personalise your RewardVault account, process and verify cashback transactions, communicate account updates and cashback status, prevent fraud and maintain platform security, and comply with legal obligations.' },
            { title: 'Data Sharing', body: 'We do not sell your personal data. We share limited data with merchant partners solely to track qualifying cashback transactions. We may share data with service providers (email, analytics) under strict data processing agreements. We will disclose data to authorities when legally required.' },
            { title: 'Your GDPR Rights', body: 'Under GDPR, you have the right to: access your personal data, correct inaccurate data, request deletion of your data, object to or restrict processing, data portability, and lodge a complaint with a supervisory authority. To exercise these rights, contact privacy@rewardvault.com.' },
            { title: 'Data Retention', body: 'We retain your account data for as long as your account is active. Transaction records are retained for 7 years for legal and accounting purposes. You may request deletion of your account at any time, subject to retention obligations.' },
            { title: 'Cookies', body: 'We use essential cookies for session management and security. Optional analytics cookies help us understand usage patterns. You can manage cookie preferences in your browser settings. See our Cookie Policy for details.' },
            { title: 'Security', body: 'We use industry-standard security measures including TLS encryption, bcrypt password hashing, and regular security audits. No method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.' },
            { title: 'Contact', body: 'For privacy-related enquiries or to exercise your rights, contact our Data Protection Officer at privacy@rewardvault.com.' },
          ].map(s => (
            <div key={s.title} style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 20, color: 'var(--vault-ink)', marginBottom: 10 }}>{s.title}</h2>
              <p style={{ fontSize: 15, color: 'var(--vault-muted)', lineHeight: 1.8 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </AuthProvider>
  );
}
