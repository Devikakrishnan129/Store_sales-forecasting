// app/prediction/page.js

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // Correct path using alias

export default function SalesForecastingPage() {
  const { currentUser, loading: authLoading, signOut } = useAuth(); // Get auth state and signOut function
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login'); // Redirect to login if not authenticated
    }
  }, [currentUser, authLoading, router]);

  // State variables for the form
  const [storeId, setStoreId] = useState('');
  const [date, setDate] = useState('');
  const [promo, setPromo] = useState(false);
  const [stateHoliday, setStateHoliday] = useState('0');
  const [schoolHoliday, setSchoolHoliday] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Loading for API call

  // Function to handle form submission (your existing logic)
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setPredictionResult(null);

    const payload = {
      store_id: parseInt(storeId),
      date: date,
      promo: promo,
      state_holiday: stateHoliday,
      school_holiday: schoolHoliday,
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/core/predict_sales/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const responseText = await response.text();
        console.error('API response not OK. Status:', response.status);
        console.error('Raw error response body:', responseText);
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.error || `API error (${response.status}): ${responseText}`);
        } catch (jsonParseError) {
          throw new Error(`API error (${response.status}): ${responseText || 'Unknown error occurred.'}`);
        }
      }

      const data = await response.json();
      setPredictionResult(data);
    } catch (err) {
      console.error('Error fetching prediction:', err);
      setError(err.message || 'Failed to get prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show a loading/redirecting message if authentication is still in progress
  if (authLoading || !currentUser) {
    return (
      <div className="container loading-page">
        <h1 className="heading">Loading...</h1>
        <p>Redirecting to login if not authenticated.</p>
      </div>
    );
  }

  // Render the prediction form once authenticated
  return (
    <div className="container">
      <div className="glass-form-container">
        <h1 className="heading">Sales Forecasting App</h1>
        <div className="user-info">
            <p>Welcome, {currentUser.email || 'User'}!</p>
            <button onClick={signOut} className="logout-button">Logout</button>
        </div>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="storeId">Store ID:</label>
            <input
              type="number"
              id="storeId"
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Date:</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group-checkbox">
            <label htmlFor="promo">Promo:</label>
            <input
              type="checkbox"
              id="promo"
              checked={promo}
              onChange={(e) => setPromo(e.target.checked)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="stateHoliday">State Holiday:</label>
            <select
              id="stateHoliday"
              value={stateHoliday}
              onChange={(e) => setStateHoliday(e.target.value)}
            >
              <option value="0">No Holiday</option>
              <option value="a">Public Holiday</option>
              <option value="b">Easter Holiday</option>
              <option value="c">Christmas</option>
            </select>
          </div>

          <div className="form-group-checkbox">
            <label htmlFor="schoolHoliday">School Holiday:</label>
            <input
              type="checkbox"
              id="schoolHoliday"
              checked={schoolHoliday}
              onChange={(e) => setSchoolHoliday(e.target.checked)}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Predicting...' : 'Get Sales Prediction'}
          </button>
        </form>

        {error && (
          <div className="message-container error-message">
            <p>Error: {error}</p>
          </div>
        )}

        {predictionResult && (
          <div className="message-container success-message">
            <h2 className="result-heading">Prediction Result:</h2>
            <p className="result-text">Predicted Sales: ${predictionResult.predicted_sales}</p>
            {predictionResult.message && (
              <p className="result-message">{predictionResult.message}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
