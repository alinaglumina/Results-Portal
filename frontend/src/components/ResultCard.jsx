import React from 'react';

export default function ResultCard({ result }) {
  if (!result) return null;

  return (
    <div 
      className="printable-card" 
      style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '24px', background: '#ffffff', marginTop: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
    >
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a' }}>{result.studentName}</h2>
          <p style={{ margin: '4px 0', color: '#64748b' }}>Roll No: <strong>{result.rollNumber}</strong></p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0 }}><strong>Course:</strong> {result.course}</p>
          <p style={{ margin: '4px 0' }}><strong>Semester:</strong> {result.semester}</p>
          <p style={{ margin: 0, fontSize: '0.9em', color: '#64748b' }}>Academic Year: {result.academicYear}</p>
        </div>
      </div>

      {/* Marks Table */}
      <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f1f5f9', textAlign: 'left', color: '#334155' }}>
            <th style={{ padding: '12px', borderBottom: '1px solid #cbd5e1' }}>Subject</th>
            <th style={{ padding: '12px', borderBottom: '1px solid #cbd5e1' }}>Marks Obtained</th>
            <th style={{ padding: '12px', borderBottom: '1px solid #cbd5e1' }}>Max Marks</th>
          </tr>
        </thead>
        <tbody>
          {result.subjects.map((sub, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '12px' }}>{sub.subjectName}</td>
              <td style={{ padding: '12px' }}>{sub.marksObtained}</td>
              <td style={{ padding: '12px' }}>{sub.maxMarks}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '12px', borderTop: '2px solid #e2e8f0', fontWeight: 'bold' }}>
        <span style={{ fontSize: '1.1em', color: '#1e293b' }}>CGPA: {result.cgpa}</span>
        <span style={{ 
          fontSize: '1em',
          padding: '4px 12px', 
          borderRadius: '20px', 
          backgroundColor: result.status === 'PASS' ? '#dcfce7' : '#fee2e2',
          color: result.status === 'PASS' ? '#15803d' : '#b91c1c' 
        }}>
          {result.status}
        </span>
      </div>

      {/* Actions */}
      <div style={{ marginTop: '20px', textAlign: 'right' }}>
        <button 
          onClick={() => window.print()} 
          style={{ padding: '10px 18px', background: '#334155', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          🖨️ Print Marksheet
        </button>
      </div>
    </div>
  );
}