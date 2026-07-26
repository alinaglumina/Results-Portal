import React, { useState } from 'react';
import ResultCard from './ResultCard';

const API_BASE_URL = 'https://results-portal-hvjj.onrender.com';

export default function ResultSearch() {
  const [rollNumber, setRollNumber] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!rollNumber.trim()) return;

    setLoading(true);
    setError('');
    setResults([]);

    try {
      const response = await fetch(`${API_BASE_URL}/api/results/${rollNumber.trim()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'No result found for this Roll Number.');
      }

      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Enter Roll Number (e.g., 2026CS01)"
          value={rollNumber}
          onChange={(e) => setRollNumber(e.target.value)}
          style={{ flex: 1, padding: '12px 16px', fontSize: '16px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '12px 24px', fontSize: '16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loading ? 'Searching...' : 'Search Results'}
        </button>
      </form>

      {error && (
        <div style={{ color: '#b91c1c', padding: '12px', background: '#fee2e2', borderRadius: '6px', textAlign: 'center', margin: '20px 0' }}>
          {error}
        </div>
      )}

      {/* Render card list */}
      <ResultCard results={results} />
    </div>
  );
}
