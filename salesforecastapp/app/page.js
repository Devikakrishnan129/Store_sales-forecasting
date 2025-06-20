// app/page.js

'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; // Correct path using alias
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  // Optional: Redirect authenticated users directly to the prediction page
  useEffect(() => {
    if (!authLoading && currentUser) {
      router.push('/prediction');
    }
  }, [currentUser, authLoading, router]);

  // Show a loading message while authentication state is being determined
  if (authLoading) {
    return (
      <div className="container loading-page">
        <h1 className="heading">Loading...</h1>
      </div>
    );
  }

  // Render home page for unauthenticated users or if currentUser is null
  return (
    <div className="container">
      <div className="glass-form-container home-page-card">
        <h1 className="heading">Welcome to Sales Forecast</h1>
        <p className="home-description">
          Unlock insights into your future sales. Log in or register to predict
          sales based on various factors.
        </p>
        <div className="home-buttons">
          <Link href="/login" className="home-button">
            Login
          </Link>
          <Link href="/register" className="home-button secondary">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
