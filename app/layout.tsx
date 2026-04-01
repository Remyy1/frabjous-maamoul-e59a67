import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'TrackFlow — Global Logistics Intelligence',
  description:
    'Real-time shipment tracking for FedEx, UPS, USPS, and DHL. Know where your package is, always.',
  keywords: 'package tracking, shipment tracking, logistics, FedEx, UPS, USPS, DHL',
  openGraph: {
    title: 'TrackFlow',
    description: 'Real-time shipment tracking intelligence',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body bg-ink-900 text-ink-100 antialiased">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a30',
              color: '#e8e8ed',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              fontSize: '14px',
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
