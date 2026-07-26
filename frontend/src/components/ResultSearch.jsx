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

  useEffect(() => {
    fetchTitles();
  }, []);

  const fetchTitles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/results/titles`);
      const data = await res.json();
      if (res.ok) setTitles(data);
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
    <div style={{ maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* STEP 1: 2-COLUMN EXAMINATION TITLES TABLE */}
      {!selectedTitle ? (
        <div>
          <h2 style={{ color: '#1e293b', borderBottom: '2px solid #cbd5e1', paddingBottom: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            📋 Select Examination Result
          </h2>

          {loadingTitles ? (
            <p style={{ color: '#64748b' }}>Loading published examination list...</p>
          ) : titles.length === 0 ? (
            <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <p style={{ margin: 0, color: '#64748b' }}>No examination results have been published yet.</p>
            </div>
          ) : (
            <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', background: '#ffffff' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                    <th style={{ padding: '14px 20px', borderBottom: '2px solid #cbd5e1', fontSize: '1rem' }}>Title</th>
                    <th style={{ padding: '14px 20px', borderBottom: '2px solid #cbd5e1', textAlign: 'right', width: '180px', fontSize: '1rem' }}>View Result</th>
                  </tr>
                </thead>
                <tbody>
                  {titles.map((title, index) => (
                    <tr 
                      key={index}
                      onClick={() => setSelectedTitle(title)}
                      style={{ borderBottom: '1px solid #e2e8f0', cursor: 'pointer', transition: 'background 0.2s ease' }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#f0f6ff'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#ffffff'}
                    >
                      <td style={{ padding: '14px 20px', fontWeight: '600', color: '#0f172a', fontSize: '1rem' }}>{title}</td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <button style={{ padding: '8px 16px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.88rem' }}>
                          View Result →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        
        /* STEP 2: SEARCH FORM AFTER SELECTING A TITLE */
        <div>
          <button
            onClick={handleBackToTitles}
            style={{ padding: '8px 14px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', marginBottom: '16px', fontWeight: 'bold', color: '#334155' }}
          >
            ← Back to All Examinations
          </button>

          <div style={{ background: '#1e293b', color: '#fff', padding: '16px 20px', borderRadius: '8px', marginBottom: '24px' }}>
            <span style={{ fontSize: '0.8em', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>Selected Examination</span>
            <h3 style={{ margin: '4px 0 0 0' }}>{selectedTitle}</h3>
          </div>

          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Enter Student Roll Number (e.g., 182G1D2001)"
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

          <ResultCard results={results} />
        </div>
      )}

    </div>
  );
}
