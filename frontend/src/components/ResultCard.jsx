import React from 'react';

export default function ResultCard({ results }) {
  if (!results || results.length === 0) return null;

  return (
    <div style={{ marginTop: '24px' }}>
      {results.map((res, index) => (
        <div 
          key={index} 
          style={{ 
            border: '1px solid #cbd5e1', 
            borderRadius: '8px', 
            padding: '24px', 
            background: '#ffffff', 
            marginBottom: '24px', 
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' 
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <img src="/logo.png" alt="JNTUA Logo" style={{ height: '60px', marginBottom: '6px' }} />
            <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.15rem', fontWeight: 'bold' }}>
              JAWAHARLAL NEHRU TECHNOLOGICAL UNIVERSITY ANANTAPUR
            </h2>
            <h3 style={{ margin: '10px 0 0 0', color: '#1e293b', borderTop: '2px solid #0f172a', paddingTop: '10px', fontSize: '1rem' }}>
              {res.title}
            </h3>
          </div>

          {/* Student Info Banner */}
          <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: '12px 18px', borderRadius: '6px', marginBottom: '18px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }}>
            <span><strong>Roll No:</strong> {res.rollNumber}</span>
            <span><strong>Student Name:</strong> {res.studentName}</span>
          </div>

          {/* Public Results Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                <th style={{ padding: '10px', border: '1px solid #cbd5e1' }}>Subject Code</th>
                <th style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'left' }}>Subject Title</th>
                <th style={{ padding: '10px', border: '1px solid #cbd5e1' }}>Internal</th>
                <th style={{ padding: '10px', border: '1px solid #cbd5e1' }}>External</th>
                <th style={{ padding: '10px', border: '1px solid #cbd5e1' }}>Total</th>
                <th style={{ padding: '10px', border: '1px solid #cbd5e1' }}>Result</th>
                <th style={{ padding: '10px', border: '1px solid #cbd5e1' }}>Credits</th>
              </tr>
            </thead>
            <tbody>
              {res.subjects.map((sub, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '9px', border: '1px solid #cbd5e1' }}>{sub.subjectCode}</td>
                  <td style={{ padding: '9px', border: '1px solid #cbd5e1', textAlign: 'left' }}>{sub.subjectName}</td>
                  <td style={{ padding: '9px', border: '1px solid #cbd5e1' }}>{sub.internalMarks}</td>
                  <td style={{ padding: '9px', border: '1px solid #cbd5e1' }}>{sub.externalMarks}</td>
                  <td style={{ padding: '9px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>{sub.totalMarks}</td>
                  <td style={{ 
                    padding: '9px', 
                    border: '1px solid #cbd5e1', 
                    fontWeight: 'bold', 
                    color: sub.result === 'P' || sub.result === 'PASS' ? '#16a34a' : '#dc2626' 
                  }}>
                    {sub.result}
                  </td>
                  <td style={{ padding: '9px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>{sub.credits || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Print Button */}
          <div style={{ marginTop: '16px', textAlign: 'right' }}>
            <button 
              onClick={() => window.print()} 
              style={{ padding: '8px 16px', background: '#334155', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
            >
              🖨️ Print Result Sheet
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
