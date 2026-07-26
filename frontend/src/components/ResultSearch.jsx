import { API_BASE_URL } from '../config';
import React, { useState } from 'react';

export default function ResultSearch() {
  const [rollNumber, setRollNumber] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!rollNumber.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/results/${rollNumber.trim()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch result');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#1a365d' }}>Institute Student Results Portal</h1>
      
      {/* Search Form */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <input
          type="text"
          placeholder="Enter Roll / Student ID (e.g., CS202601)"
          value={rollNumber}
          onChange={(e) => setRollNumber(e.target.value)}
          style={{ flex: 1, padding: '12px', fontSize: '16px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '12px 24px', fontSize: '16px', background: '#2b6cb0', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          {loading ? 'Searching...' : 'Get Result'}
        </button>
      </form>

      {/* Error Message */}
      {error && <div style={{ color: '#c53030', padding: '12px', background: '#fff5f5', borderRadius: '6px' }}>{error}</div>}

      {/* Result Card Display */}
      {result && (
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px', background: '#f7fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #cbd5e0', pb: '12px' }}>
            <div>
              <h2 style={{ margin: 0, color: '#2d3748' }}>{result.studentName}</h2>
              <p style={{ margin: '4px 0', color: '#718096' }}>Roll No: <strong>{result.rollNumber}</strong></p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0 }}><strong>Course:</strong> {result.course}</p>
              <p style={{ margin: '4px 0' }}><strong>Semester:</strong> {result.semester}</p>
            </div>
          </div>

          <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#edf2f7', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Subject</th>
                <th style={{ padding: '10px' }}>Obtained</th>
                <th style={{ padding: '10px' }}>Max Marks</th>
              </tr>
            </thead>
            <tbody>
              {result.subjects.map((sub, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px' }}>{sub.subjectName}</td>
                  <td style={{ padding: '10px' }}>{sub.marksObtained}</td>
                  <td style={{ padding: '10px' }}>{sub.maxMarks}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontWeight: 'bold' }}>
            <span>CGPA: {result.cgpa}</span>
            <span style={{ color: result.status === 'PASS' ? '#2f855a' : '#c53030' }}>
              STATUS: {result.status}
            </span>
          </div>

          <button 
            onClick={() => window.print()} 
            style={{ marginTop: '20px', padding: '8px 16px', background: '#4a5568', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            🖨️ Print Marksheet
          </button>
        </div>
      )}
    </div>
  );
}
