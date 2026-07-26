import React from 'react';
import html2pdf from 'html2pdf.js';

export default function ResultCard({ results }) {
  if (!results || results.length === 0) return null;

  // Handler to export the selected memo as a PDF
  const handleDownloadPDF = (index, rollNumber, examTitle) => {
    const element = document.getElementById(`marks-memo-${index}`);
    
    // PDF configuration options
    const opt = {
      margin: [8, 8, 8, 8],
      filename: `JNTUA_Marks_Memo_${rollNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div style={{ marginTop: '30px' }}>
      {results.map((res, index) => {
        // Calculate total credits & pass/fail status
        const totalCreditsObtained = res.subjects.reduce((sum, sub) => {
          const c = parseFloat(sub.credits);
          return !isNaN(c) && (sub.result === 'P' || sub.result === 'PASS') ? sum + c : sum;
        }, 0);

        const isOverallPass = res.subjects.every(
          (sub) => sub.result === 'P' || sub.result === 'PASS'
        );

        return (
          <div key={index} style={{ marginBottom: '40px' }}>
            
            {/* ACTION BUTTONS (Hidden in PDF export) */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '12px' }}>
              <button 
                onClick={() => window.print()} 
                style={{ padding: '9px 16px', background: '#475569', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}
              >
                🖨️ Print
              </button>
              <button 
                onClick={() => handleDownloadPDF(index, res.rollNumber, res.title)} 
                style={{ padding: '9px 18px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}
              >
                📥 Download PDF Memo
              </button>
            </div>

            {/* OFFICIAL SEMESTER MARKS MEMO (Captured for PDF) */}
            <div 
              id={`marks-memo-${index}`}
              style={{ 
                border: '2px solid #0f172a', 
                borderRadius: '4px', 
                padding: '28px', 
                background: '#ffffff', 
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                color: '#0f172a',
                fontFamily: 'serif'
              }}
            >
              {/* University Header */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <img src="/logo.png" alt="JNTUA Logo" style={{ height: '70px', marginBottom: '6px' }} />
                <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                  JAWAHARLAL NEHRU TECHNOLOGICAL UNIVERSITY ANANTAPUR
                </h2>
                <p style={{ margin: '2px 0 0 0', color: '#334155', fontSize: '0.82rem', fontWeight: 'bold' }}>
                  ANANTHAPURAMU - 515002, ANDHRA PRADESH, INDIA
                </p>
                
                <div style={{ margin: '14px 0 10px 0', borderTop: '2px double #0f172a', borderBottom: '2px double #0f172a', padding: '6px 0' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    SEMESTER MARKS MEMORANDUM
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.95rem', fontWeight: 'bold', fontFamily: 'sans-serif' }}>
                    {res.title}
                  </p>
                </div>
              </div>

              {/* Student Details Box */}
              <table style={{ width: '100%', marginBottom: '18px', borderCollapse: 'collapse', fontFamily: 'sans-serif', fontSize: '0.95rem' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '6px 0', width: '15%', fontWeight: 'bold' }}>Hall Ticket No:</td>
                    <td style={{ padding: '6px 0', width: '35%', fontWeight: 'bold', color: '#1e293b' }}>{res.rollNumber}</td>
                    <td style={{ padding: '6px 0', width: '15%', fontWeight: 'bold' }}>Student Name:</td>
                    <td style={{ padding: '6px 0', width: '35%', fontWeight: 'bold', color: '#1e293b' }}>{res.studentName}</td>
                  </tr>
                </tbody>
              </table>

              {/* Marks Breakdown Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontFamily: 'sans-serif', fontSize: '0.9rem', marginBottom: '20px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#0f172a' }}>
                    <th style={{ padding: '10px', border: '1px solid #0f172a', width: '15%' }}>Subject Code</th>
                    <th style={{ padding: '10px', border: '1px solid #0f172a', textAlign: 'left' }}>Subject Title</th>
                    <th style={{ padding: '10px', border: '1px solid #0f172a', width: '12%' }}>Internal</th>
                    <th style={{ padding: '10px', border: '1px solid #0f172a', width: '12%' }}>External</th>
                    <th style={{ padding: '10px', border: '1px solid #0f172a', width: '12%' }}>Total</th>
                    <th style={{ padding: '10px', border: '1px solid #0f172a', width: '10%' }}>Result</th>
                    <th style={{ padding: '10px', border: '1px solid #0f172a', width: '10%' }}>Credits</th>
                  </tr>
                </thead>
                <tbody>
                  {res.subjects.map((sub, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '9px', border: '1px solid #0f172a', fontWeight: '600' }}>{sub.subjectCode}</td>
                      <td style={{ padding: '9px', border: '1px solid #0f172a', textAlign: 'left' }}>{sub.subjectName}</td>
                      <td style={{ padding: '9px', border: '1px solid #0f172a' }}>{sub.internalMarks}</td>
                      <td style={{ padding: '9px', border: '1px solid #0f172a' }}>{sub.externalMarks}</td>
                      <td style={{ padding: '9px', border: '1px solid #0f172a', fontWeight: 'bold' }}>{sub.totalMarks}</td>
                      <td style={{ 
                        padding: '9px', 
                        border: '1px solid #0f172a', 
                        fontWeight: 'bold', 
                        color: sub.result === 'P' || sub.result === 'PASS' ? '#15803d' : '#b91c1c' 
                      }}>
                        {sub.result}
                      </td>
                      <td style={{ padding: '9px', border: '1px solid #0f172a', fontWeight: 'bold' }}>
                        {sub.credits || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Memo Summary Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', border: '1px solid #0f172a', padding: '10px 16px', borderRadius: '4px', fontFamily: 'sans-serif', fontSize: '0.9rem', marginBottom: '35px' }}>
                <div>
                  <strong>Total Credits Earned:</strong> {totalCreditsObtained}
                </div>
                <div>
                  <strong>Overall Status: </strong>
                  <span style={{ color: isOverallPass ? '#15803d' : '#b91c1c', fontWeight: 'bold' }}>
                    {isOverallPass ? 'PASSED' : 'FAILED / COMPARTMENT'}
                  </span>
                </div>
              </div>

              {/* Official Signatures Section */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '40px', paddingTop: '20px', fontFamily: 'sans-serif', fontSize: '0.85rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>Verified By</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>Additional Controller of Examinations</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>Controller of Examinations</p>
                </div>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
}
