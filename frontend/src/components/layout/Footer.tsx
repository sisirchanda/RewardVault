import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--vault-ink)',
      color: '#b3b2a9',
      padding: '64px 24px 32px',
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 48, marginBottom: 48 }}>

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, background: 'var(--vault-green)', borderRadius: 10, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'white' }}>
                Reward<span style={{ color: 'var(--vault-green-l)' }}>Vault</span>
              </span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 220 }}>
              Earn real cashback every time you shop. Simple, transparent, free.
            </p>
          </div>

          {/* Earn */}
          <div>
            <h4 style={{ color: 'white', fontSize: 13, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Earn</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <FooterLink href="/merchants">All Offers</FooterLink>
              <FooterLink href="/merchants?featured=true">Featured Deals</FooterLink>
              <FooterLink href="/merchants?sort=cashback_desc">Top Cashback</FooterLink>
              <FooterLink href="/merchants?category=travel">Travel Deals</FooterLink>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 style={{ color: 'white', fontSize: 13, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Account</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <FooterLink href="/signup">Create Account</FooterLink>
              <FooterLink href="/login">Sign In</FooterLink>
              <FooterLink href="/dashboard">My Dashboard</FooterLink>
              <FooterLink href="/dashboard/wallet">Withdraw Earnings</FooterLink>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 style={{ color: 'white', fontSize: 13, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Legal</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <FooterLink href="/terms">Terms & Conditions</FooterLink>
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/cookies">Cookie Policy</FooterLink>
              <FooterLink href="/contact">Contact Us</FooterLink>
            </ul>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: 24,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 12,
        }}>
          <p style={{ fontSize: 13 }}>
            © {new Date().getFullYear()} RewardVault. All rights reserved.
          </p>
          <p style={{ fontSize: 12 }}>
            Cashback rates are subject to change. Terms apply. For demonstration purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} style={{
        color: '#b3b2a9', textDecoration: 'none', fontSize: 14,
        transition: 'color 0.15s',
      }}
        onMouseEnter={e => (e.currentTarget.style.color = 'white')}
        onMouseLeave={e => (e.currentTarget.style.color = '#b3b2a9')}
      >{children}</Link>
    </li>
  );
}
