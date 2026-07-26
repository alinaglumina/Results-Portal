import React, { useState, useEffect } from 'react';
import ResultCard from './ResultCard';

const API_BASE_URL = 'https://results-portal-hvjj.onrender.com';

export default function ResultSearch() {
  const [titles, setTitles] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [rollNumber, setRollNumber] = useState('');
  const [results, setResults] = useState([]);
  const [loadingTitles, setLoadingTitles] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [error, setError] = useState('');

  // Fetch all published exam titles on load
  useEffect(() => {
    fetchTitles();
  }, []);

  const fetchTitles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/results/titles`);
      const data = await res.json();
      if (res.ok) {
        setTitles(data);
      }
    } catch (err) {
      console.error('Failed to load titles', err);
    } finally {
      setLoadingTitles(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!rollNumber.trim()) return;

    setLoadingSearch(true);
    setError('');
    setResults([]);

    try {
      const response = await fetch(`${API_BASE_URL}/api/results/${rollNumber.trim()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'No result found for this Roll Number.');
      }

      // Filter results to match the selected exam title
      const filtered = data.filter((item) => item.title === selectedTitle);

      if (filtered.length === 0) {
        throw new Error(`No result found for Roll No ${rollNumber} in "${selectedTitle}".`);
      }

      setResults(filtered);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleBackToTitles = () => {
    setSelectedTitle(null);
    setRollNumber('');
    setResults([]);
    setError('');
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* STEP 1: DISPLAY EXAM TITLES FIRST */}
      {!selectedTitle ? (
        <div>
          <h2 style={{ color: '#1e293b', borderBottom: '2px solid #cbd5e1', paddingBottom: '10px', marginBottom: '20px' }}>
            📋 Select Examination Result
          </h2>

          {loadingTitles ? (
            <p style={{ color: '#64748b' }}>Loading published examination list...</p>
          ) : titles.length === 0 ? (
            <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <p style={{ margin: 0, color: '#64748b' }}>No examination results have been published yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {titles.map((title, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedTitle(title)}
                  style={{
                    padding: '16px 20px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    background: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.background = '#f0f6ff';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.background = '#ffffff';
                  }}
                >
                  <span style={{ fontWeight: '600', fontSize: '1.05em', color: '#0f172a' }}>{title}</span>
                  <span style={{ color: '#2563eb', fontWeight: 'bold' }}>View Result →</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        
        /* STEP 2: SEARCH BAR APPEARS AFTER CLICKING A TITLE */
        <div>
          <button
            onClick={handleBackToTitles}
            style={{ padding: '8px 14px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', marginBottom: '16px', fontWeight: 'bold', color: '#334155' }}
          >
            ← Back to All Examinations
          </button>

          <div style={{ background: '#334155', color: '#fff', padding: '16px 20px', borderRadius: '8px', marginBottom: '24px' }}>
            <span style={{ fontSize: '0.85em', textTransform: 'uppercase', tracking: '1px', opacity: 0.8 }}>Selected Examination</span>
            <h3 style={{ margin: '4px 0 0 0' }}>{selectedTitle}</h3>
          </div>

          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Enter Student Roll Number (e.g., 2026CS01)"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              style={{ flex: 1, padding: '12px 16px', fontSize: '16px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
            <button
              type="submit"
              disabled={loadingSearch}
              style={{ padding: '12px 24px', fontSize: '16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {loadingSearch ? 'Searching...' : 'Get Result'}
            </button>
          </form>

          {error && (
            <div style={{ color: '#b91c1c', padding: '12px', background: '#fee2e2', borderRadius: '6px', textAlign: 'center', margin: '20px 0' }}>
              {error}
            </div>
          )}

          {/* Render Result Card */}
          <ResultCard results={results} />
        </div>
      )}

    </div>
  );
}
