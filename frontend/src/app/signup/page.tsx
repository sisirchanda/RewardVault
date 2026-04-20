'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthProvider } from '@/hooks/useAuth';
import { api, setToken } from '@/lib/api';
import { Eye, EyeOff, Check, ArrowRight } from 'lucide-react';

function SignupInner() {
  const router = useRouter();
  const params = useSearchParams();

  const [step, setStep] = useState<'signup' | 'otp'>('signup');
  const [form, setForm] = useState({
    email: '', password: '', full_name: '',
    referral_code: params.get('ref') || '',
    gdpr_consent: false,
  });
  const [otp, setOtp] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function setField(k: string, v: any) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.auth.signup(form);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res: any = await api.auth.verifyOTP({ email: form.email, otp });
      setToken(res.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  }

  const passwordStrength = form.password.length >= 12 ? 'strong' : form.password.length >= 8 ? 'medium' : form.password.length > 0 ? 'weak' : '';
  const strengthColor = { strong: '#16a34a', medium: '#d97706', weak: '#dc2626', '': 'transparent' }[passwordStrength];

  return (
    <div style={{
      minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr',
      background: 'var(--vault-cream)',
    }}>
      {/* Left: Feature panel */}
      <div style={{
        background: 'var(--vault-ink)', padding: '48px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }} className="hide-mobile">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 60 }}>
          <div style={{ width: 40, height: 40, background: 'var(--vault-green)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'white' }}>
            Reward<span style={{ color: '#22c55e' }}>Vault</span>
          </span>
        </Link>

        <h2 style={{ color: 'white', fontSize: 'clamp(28px,3vw,42px)', marginBottom: 20, lineHeight: 1.2 }}>
          Start earning <em style={{ color: '#22c55e' }}>cashback</em> today
        </h2>
        <p style={{ color: '#b3b2a9', fontSize: 16, marginBottom: 48, lineHeight: 1.7 }}>
          Join thousands of smart shoppers earning real money back on every online purchase.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            { icon: '💸', title: 'Earn real cash', body: 'Not points or vouchers. Actual money withdrawn to your bank.' },
            { icon: '🔒', title: 'Completely free', body: 'No subscriptions, no hidden fees. RewardVault is free forever.' },
            { icon: '⚡', title: 'Instant tracking', body: 'Your cashback is tracked the moment you make a purchase.' },
          ].map(f => (
            <div key={f.title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 28 }}>{f.icon}</span>
              <div>
                <div style={{ color: 'white', fontWeight: 600, fontSize: 16, marginBottom: 2 }}>{f.title}</div>
                <div style={{ color: '#b3b2a9', fontSize: 14, lineHeight: 1.6 }}>{f.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Form */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          {step === 'signup' ? (
            <>
              <h1 style={{ fontSize: 28, color: 'var(--vault-ink)', marginBottom: 6 }}>Create your account</h1>
              <p style={{ fontSize: 15, color: 'var(--vault-muted)', marginBottom: 32 }}>Free forever. No credit card required.</p>

              <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Full name</label>
                  <input type="text" required value={form.full_name} onChange={e => setField('full_name', e.target.value)}
                    placeholder="Alex Johnson" className="input-vault"/>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Email address</label>
                  <input type="email" required value={form.email} onChange={e => setField('email', e.target.value)}
                    placeholder="you@example.com" className="input-vault"/>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPass ? 'text' : 'password'} required minLength={8} value={form.password}
                      onChange={e => setField('password', e.target.value)} placeholder="Min. 8 characters"
                      className="input-vault" style={{ paddingRight: 44 }}/>
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--vault-muted)' }}>
                      {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                  {passwordStrength && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      <div style={{ flex: 1, height: 3, background: '#e4e3de', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: passwordStrength === 'strong' ? '100%' : passwordStrength === 'medium' ? '60%' : '30%', background: strengthColor, transition: 'all 0.3s', borderRadius: 99 }}/>
                      </div>
                      <span style={{ fontSize: 11, color: strengthColor, fontWeight: 600, textTransform: 'capitalize' }}>{passwordStrength}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Referral code (optional)</label>
                  <input type="text" value={form.referral_code} onChange={e => setField('referral_code', e.target.value.toUpperCase())}
                    placeholder="ENTER CODE" className="input-vault" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}/>
                </div>

                {/* GDPR consent */}
                <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', padding: '12px', background: '#f8f8f6', borderRadius: 12 }}>
                  <input type="checkbox" required checked={form.gdpr_consent} onChange={e => setField('gdpr_consent', e.target.checked)}
                    style={{ width: 16, height: 16, marginTop: 2, accentColor: 'var(--vault-green)' }}/>
                  <span style={{ fontSize: 13, color: 'var(--vault-muted)', lineHeight: 1.5 }}>
                    I agree to the <Link href="/terms" style={{ color: 'var(--vault-green)', textDecoration: 'none' }}>Terms & Conditions</Link> and{' '}
                    <Link href="/privacy" style={{ color: 'var(--vault-green)', textDecoration: 'none' }}>Privacy Policy</Link>.
                    My data will be processed in accordance with GDPR.
                  </span>
                </label>

                {error && <p style={{ color: '#dc2626', fontSize: 13, background: '#fef2f2', padding: '10px 14px', borderRadius: 8 }}>{error}</p>}

                <button type="submit" disabled={loading || !form.gdpr_consent} className="btn-vault" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 16 }}>
                  {loading ? 'Creating account…' : <><ArrowRight size={18}/> Create account</>}
                </button>
              </form>

              <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--vault-muted)', marginTop: 24 }}>
                Already have an account?{' '}
                <Link href="/login" style={{ color: 'var(--vault-green)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
              </p>
            </>
          ) : (
            <>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
              <h1 style={{ fontSize: 28, color: 'var(--vault-ink)', marginBottom: 6 }}>Verify your email</h1>
              <p style={{ fontSize: 15, color: 'var(--vault-muted)', marginBottom: 32 }}>
                We sent a 6-digit code to <strong>{form.email}</strong>
              </p>

              <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <input type="text" inputMode="numeric" pattern="\d{6}" required value={otp}
                  onChange={e => setOtp(e.target.value)} placeholder="000000" maxLength={6}
                  className="input-vault"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 28, letterSpacing: '0.2em', textAlign: 'center', padding: '20px' }}/>

                {error && <p style={{ color: '#dc2626', fontSize: 13 }}>{error}</p>}

                <button type="submit" disabled={loading || otp.length !== 6} className="btn-vault" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
                  {loading ? 'Verifying…' : <><Check size={18}/> Verify email</>}
                </button>
              </form>

              <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--vault-muted)', marginTop: 20 }}>
                Didn't receive it?{' '}
                <button onClick={() => api.auth.resendOTP(form.email)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--vault-green)', fontWeight: 600 }}>
                  Resend code
                </button>
              </p>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media(max-width:768px) { .hide-mobile { display: none; } }
      `}</style>
    </div>
  );
}

export default function SignupPage() {
  return (
    <AuthProvider>
      <SignupInner />
    </AuthProvider>
  );
}
