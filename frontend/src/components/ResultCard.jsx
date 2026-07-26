import React from 'react';

export default function ResultCard({ results }) {
  if (!results || results.length === 0) return null;

  return (
    <div style={{ marginTop: '30px' }}>
      {results.map((res, index) => (
        <div 
          key={index} 
          style={{ 
            border: '1px solid #cbd5e1', 
            borderRadius: '8px', 
            padding: '28px', 
            background: '#ffffff', 
            marginBottom: '30px', 
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' 
          }}
        >
          {/* JNTUA Official Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <img src="/logo.png" alt="JNTUA Logo" style={{ height: '75px', marginBottom: '8px' }} />
            <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.2rem', fontWeight: 'bold' }}>
              JAWAHARLAL NEHRU TECHNOLOGICAL UNIVERSITY ANANTAPUR
            </h2>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>
              ANANTHAPURAMU - 515002 (A.P.) INDIA
            </p>
            <h3 style={{ margin: '16px 0 0 0', color: '#1e293b', borderTop: '2px solid #0f172a', paddingTop: '12px', fontSize: '1.05rem' }}>
              {res.title}
            </h3>
          </div>

          {/* Roll No & Student Name Banner */}
          <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: '12px 18px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '1.05em', color: '#0f172a' }}>
              <strong>Roll No:</strong> {res.rollNumber}
            </span>
            <span style={{ fontSize: '1.05em', color: '#0f172a' }}>
              <strong>Student Name:</strong> {res.studentName}
            </span>
          </div>

          {/* Subjects Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                <th style={{ padding: '10px', border: '1px solid #cbd5e1' }}>Subject Code</th>
                <th style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'left' }}>Subject Name</th>
                <th style={{ padding: '10px', border: '1px solid #cbd5e1' }}>Internal Marks</th>
                <th style={{ padding: '10px', border: '1px solid #cbd5e1' }}>External Marks</th>
                <th style={{ padding: '10px', border: '1px solid #cbd5e1' }}>Total</th>
                <th style={{ padding: '10px', border: '1px solid #cbd5e1' }}>Result</th>
              </tr>
            </thead>
            <tbody>
              {res.subjects.map((sub, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '10px', border: '1px solid #cbd5e1' }}>{sub.subjectCode}</td>
                  <td style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'left' }}>{sub.subjectName}</td>
                  <td style={{ padding: '10px', border: '1px solid #cbd5e1' }}>{sub.internalMarks}</td>
                  <td style={{ padding: '10px', border: '1px solid #cbd5e1' }}>{sub.externalMarks}</td>
                  <td style={{ padding: '10px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>{sub.totalMarks}</td>
                  <td style={{ 
                    padding: '10px', 
                    border: '1px solid #cbd5e1', 
                    fontWeight: 'bold', 
                    color: sub.result === 'P' || sub.result === 'PASS' ? '#16a34a' : '#dc2626' 
                  }}>
                    {sub.result}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Print Button */}
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <button 
              onClick={() => window.print()} 
              style={{ padding: '10px 18px', background: '#334155', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              🖨️ Print Result Sheet
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
