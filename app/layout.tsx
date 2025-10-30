import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Prayer Times',
  description: 'Prayer Times',
  icons: {
    icon: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png?v=3', sizes: '200x200' },
    ],
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

