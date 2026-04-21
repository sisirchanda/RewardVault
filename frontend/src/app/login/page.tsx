'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { api, setToken } from '@/lib/api';
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const params = useSearchParams();
  const redirect = params.get('redirect') || '/dashboard';

  const [mode, setMode] = useState<'login' | 'otp'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      window.location.href = redirect;
    } catch (err: any) {
      if (err.message?.includes('verify')) {
        setMode('otp');
      } else {
        setError(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleOTP(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res: any = await api.auth.verifyOTP({ email, otp });
      setToken(res.token);
      window.location.href = redirect;
    } catch (err: any) {
      setError(err.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg,#f0fdf4 0%,#fafaf7 60%,#fef9c3 100%)',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', marginBottom:40, justifyContent:'center' }}>
          <div style={{ width:40, height:40, background:'#16a34a', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:24, color:'#18170f' }}>
            Reward<span style={{ color:'#16a34a' }}>Vault</span>
          </span>
        </Link>

        <div style={{ background:'white', borderRadius:24, padding:'36px', boxShadow:'0 16px 64px rgba(0,0,0,0.08)', border:'1px solid #e4e3de' }}>
          {mode === 'login' ? (
            <>
              <h1 style={{ fontSize:28, color:'#18170f', marginBottom:6 }}>Welcome back</h1>
              <p style={{ fontSize:15, color:'#6b6960', marginBottom:28 }}>Sign in to access your earnings</p>
              <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <div>
                  <label style={{ display:'block', fontSize:13, fontWeight:600, marginBottom:6 }}>Email address</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="input-vault" />
                </div>
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                    <label style={{ fontSize:13, fontWeight:600 }}>Password</label>
                    <Link href="/forgot-password" style={{ fontSize:12, color:'#16a34a', textDecoration:'none' }}>Forgot password?</Link>
                  </div>
                  <div style={{ position:'relative' }}>
                    <input type={showPass ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="input-vault" style={{ paddingRight:44 }} />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#6b6960', display:'flex', alignItems:'center' }}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                {error && <p style={{ color:'#dc2626', fontSize:13, background:'#fef2f2', padding:'10px 14px', borderRadius:8, margin:0 }}>{error}</p>}
                <button type="submit" disabled={loading} className="btn-vault" style={{ width:'100%', justifyContent:'center', padding:'14px', fontSize:16, marginTop:4 }}>
                  {loading ? 'Signing in…' : <><ArrowRight size={18} /> Sign in</>}
                </button>
              </form>
              <div style={{ borderTop:'1px solid #e4e3de', marginTop:24, paddingTop:20, textAlign:'center', fontSize:14, color:'#6b6960' }}>
                No account?{' '}
                <Link href="/signup" style={{ color:'#16a34a', fontWeight:600, textDecoration:'none' }}>Create one free</Link>
              </div>
            </>
          ) : (
            <>
              <h1 style={{ fontSize:28, color:'#18170f', marginBottom:6 }}>Check your email</h1>
              <p style={{ fontSize:15, color:'#6b6960', marginBottom:28 }}>We sent a 6-digit code to <strong>{email}</strong></p>
              <form onSubmit={handleOTP} style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <input type="text" inputMode="numeric" required value={otp} onChange={e => setOtp(e.target.value)} placeholder="000000" maxLength={6} className="input-vault" style={{ fontFamily:'var(--font-mono)', fontSize:28, letterSpacing:'0.2em', textAlign:'center' }} />
                {error && <p style={{ color:'#dc2626', fontSize:13, margin:0 }}>{error}</p>}
                <button type="submit" disabled={loading || otp.length !== 6} className="btn-vault" style={{ width:'100%', justifyContent:'center', padding:'14px' }}>
                  {loading ? 'Verifying…' : <><Check size={18} /> Verify & sign in</>}
                </button>
              </form>
              <p style={{ textAlign:'center', fontSize:13, color:'#6b6960', marginTop:16 }}>
                Did not receive it?{' '}
                <button onClick={() => api.auth.resendOTP(email)} style={{ background:'none', border:'none', cursor:'pointer', color:'#16a34a', fontSize:13, fontWeight:600 }}>Resend</button>
              </p>
              <button onClick={() => { setMode('login'); setError(''); setOtp(''); }} style={{ display:'block', width:'100%', marginTop:8, background:'none', border:'none', cursor:'pointer', color:'#6b6960', fontSize:13 }}>
                ← Back to login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
