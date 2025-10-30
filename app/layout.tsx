import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Prayer Times',
  description: 'Prayer Times',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          {children}
        </div>
      </body>
    </html>
  );
}

