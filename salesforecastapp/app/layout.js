// app/layout.js

import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext'; // Correct path using alias

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Sales Forecasting App',
  description: 'Predict sales with a Django backend and Next.js frontend.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Wrap children with AuthProvider */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
