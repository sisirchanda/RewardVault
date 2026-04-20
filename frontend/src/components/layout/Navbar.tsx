'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Bell, ChevronDown, LogOut, LayoutDashboard, Settings, Wallet, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <header
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        transition: 'all 0.3s',
        background: scrolled ? 'rgba(250,250,247,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid #e4e3de' : '1px solid transparent',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: 64, gap: 32 }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 36, height: 36, background: 'var(--vault-green)',
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--vault-ink)' }}>
              Reward<span style={{ color: 'var(--vault-green)' }}>Vault</span>
            </span>
          </Link>

          {/* Nav links - desktop */}
          <nav style={{ display: 'flex', gap: 4, flex: 1 }} className="hidden-mobile">
            <NavLink href="/merchants">Offers</NavLink>
            <NavLink href="/merchants?featured=true">Featured</NavLink>
            <NavLink href="/merchants?sort=cashback_desc">Top Cashback</NavLink>
          </nav>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
            {user ? (
              <>
                {/* Balance chip */}
                <Link href="/dashboard/wallet" style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 14px', background: '#f0fdf4',
                  border: '1px solid #bbf7d0', borderRadius: 99,
                  textDecoration: 'none', fontSize: 14, fontWeight: 500, color: '#15803d',
                }}>
                  <Wallet size={14} />
                  ${Number(user.confirmed || 0).toFixed(2)}
                </Link>

                {/* Profile menu */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '6px 12px', background: 'white',
                      border: '1px solid var(--vault-border)', borderRadius: 99,
                      cursor: 'pointer', fontSize: 14, fontWeight: 500,
                    }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'var(--vault-green)', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700,
                    }}>
                      {user.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span>{user.full_name?.split(' ')[0]}</span>
                    <ChevronDown size={14} />
                  </button>

                  {profileOpen && (
                    <div style={{
                      position: 'absolute', right: 0, top: '110%',
                      background: 'white', border: '1px solid var(--vault-border)',
                      borderRadius: 16, padding: 8, minWidth: 200,
                      boxShadow: '0 16px 48px rgba(0,0,0,0.1)',
                      zIndex: 200,
                    }}
                      onMouseLeave={() => setProfileOpen(false)}
                    >
                      <div style={{ padding: '10px 12px 6px', borderBottom: '1px solid var(--vault-border)', marginBottom: 6 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{user.full_name}</div>
                        <div style={{ fontSize: 12, color: 'var(--vault-muted)' }}>{user.email}</div>
                      </div>
                      <DropItem href="/dashboard" icon={<LayoutDashboard size={15}/>} label="Dashboard" />
                      <DropItem href="/dashboard/wallet" icon={<Wallet size={15}/>} label="My Wallet" />
                      {user.role === 'admin' && <DropItem href="/admin" icon={<Settings size={15}/>} label="Admin Panel" />}
                      <div style={{ borderTop: '1px solid var(--vault-border)', marginTop: 6, paddingTop: 6 }}>
                        <button onClick={logout} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          width: '100%', padding: '9px 12px', borderRadius: 10,
                          border: 'none', background: 'transparent', cursor: 'pointer',
                          fontSize: 14, color: '#dc2626', textAlign: 'left',
                        }}>
                          <LogOut size={15}/> Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-outline" style={{ padding: '8px 20px', fontSize: 14 }}>
                  Sign in
                </Link>
                <Link href="/signup" className="btn-vault" style={{ padding: '8px 20px', fontSize: 14 }}>
                  Get started
                </Link>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              className="show-mobile"
            >
              {menuOpen ? <X size={22}/> : <Menu size={22}/>}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{
            borderTop: '1px solid var(--vault-border)',
            padding: '12px 0 20px',
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <MobileNavLink href="/merchants" onClick={() => setMenuOpen(false)}>Offers</MobileNavLink>
            <MobileNavLink href="/merchants?featured=true" onClick={() => setMenuOpen(false)}>Featured Deals</MobileNavLink>
            <MobileNavLink href="/merchants?sort=cashback_desc" onClick={() => setMenuOpen(false)}>Top Cashback</MobileNavLink>
            {!user && <>
              <div style={{ borderTop: '1px solid var(--vault-border)', margin: '8px 0' }}/>
              <MobileNavLink href="/login" onClick={() => setMenuOpen(false)}>Sign in</MobileNavLink>
              <Link href="/signup" className="btn-vault" style={{ margin: '0 0 4px' }} onClick={() => setMenuOpen(false)}>Get started free</Link>
            </>}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) { .hidden-mobile { display: none !important; } }
        @media (min-width: 769px) { .show-mobile  { display: none !important; } }
      `}</style>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} style={{
      padding: '6px 14px', borderRadius: 8,
      textDecoration: 'none', fontSize: 14, fontWeight: 500,
      color: 'var(--vault-ink)', transition: 'all 0.15s',
    }}
      onMouseEnter={e => (e.currentTarget.style.background = '#f0fdf4')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >{children}</Link>
  );
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick} style={{
      display: 'block', padding: '10px 4px', textDecoration: 'none',
      fontSize: 16, fontWeight: 500, color: 'var(--vault-ink)',
      borderRadius: 8,
    }}>{children}</Link>
  );
}

function DropItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 12px', borderRadius: 10, textDecoration: 'none',
      fontSize: 14, color: 'var(--vault-ink)', transition: 'background 0.15s',
    }}
      onMouseEnter={e => (e.currentTarget.style.background = '#f8f8f6')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {icon}{label}
    </Link>
  );
}
