// filepath: /c:/Users/sindh/solana-transaction-monitor/solana-transaction-monitor/src/app/layout.tsx
import React from 'react';
import { Noto_Sans, Roboto_Mono } from 'next/font/google';

const robotoSans = Noto_Sans({ subsets: ['latin'], variable: '--font-roboto-sans' });
const robotoMono = Roboto_Mono({ subsets: ['latin'], variable: '--font-roboto-mono', weight: '400' });

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Solana Transaction Monitor</title>
      </head>
      <body className={`${robotoSans.variable} ${robotoMono.variable} antialiased bg-white`}>
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}