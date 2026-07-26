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
            padding: '24px', 
            background: '#ffffff', 
            marginBottom: '30px', 
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' 
          }}
        >
          {/* Exam Title Header */}
          <h3 style={{ textAlign: 'center', margin: '0 0 20px 0', color: '#1e293b', borderBottom: '2px solid #0f172a', paddingBottom: '10px' }}>
            {res.title}
          </h3>

          {/* First Row: Roll No and Student Name */}
          <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: '12px 16px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '1.1em', color: '#0f172a' }}>
              <strong>Roll No:</strong> {res.rollNumber}
            </span>
            <span style={{ fontSize: '1.1em', color: '#0f172a' }}>
              <strong>Student Name:</strong> {res.studentName}
            </span>
          </div>

          {/* Subject Wise Results Table */}
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

          {/* Print Action Button */}
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <button 
              onClick={() => window.print()} 
              style={{ padding: '8px 16px', background: '#334155', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              🖨️ Print Result
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
