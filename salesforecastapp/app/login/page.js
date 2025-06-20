// app/login/page.js

'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth'; // Removed signInWithPopup
import { auth } from '@/lib/firebase'; // Adjust path if firebase.js is in utils (removed googleProvider)
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Handle email/password login
  const handleEmailLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/prediction'); // Redirect to prediction page on successful login
    } catch (err) {
      console.error("Email login error:", err);
      setError(err.message || "Failed to log in with email and password.");
    } finally {
      setLoading(false);
    }
  };

  // Google login functionality removed as requested
  // const handleGoogleLogin = async () => { ... };

  return (
    <div className="container">
      <div className="glass-form-container">
        <h1 className="heading">Login to Sales Forecast</h1>
        <form onSubmit={handleEmailLogin} className="form">
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Logging In...' : 'Login with Email'}
          </button>
        </form>

        <p className="auth-link-text">
          Don't have an account?{' '}
          <Link href="/register" className="auth-link">
            Register here
          </Link>
        </p>

        {error && (
          <div className="message-container error-message">
            <p>Error: {error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
