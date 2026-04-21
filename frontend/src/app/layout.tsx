import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';

export const metadata: Metadata = {
  title: 'RewardVault — Earn Cashback On Every Purchase',
  description: 'Discover cashback offers, track your earnings, and withdraw real money from hundreds of online stores.',
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'RewardVault',
    description: 'Earn cashback every time you shop online.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
