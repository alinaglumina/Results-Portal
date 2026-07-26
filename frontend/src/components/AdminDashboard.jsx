import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';

const API_BASE_URL = 'https://results-portal-hvjj.onrender.com';

export default function AdminDashboard() {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [summaryList, setSummaryList] = useState([]);
  const [title, setTitle] = useState('');
  const [parsedData, setParsedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Bulk Memo Generation States
  const [batchResults, setBatchResults] = useState([]);
  const [generatingTitle, setGeneratingTitle] = useState('');

  useEffect(() => {
    if (token) fetchSummary();
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/results/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      localStorage.setItem('adminToken', data.token);
      setToken(data.token);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchSummary = async () => {
    const res = await fetch(`${API_BASE_URL}/api/results/summary`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setSummaryList(data);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      const clean = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

      const getVal = (row, ...possibleKeys) => {
        const rowKeys = Object.keys(row);
        for (const pKey of possibleKeys) {
          const targetClean = clean(pKey);
          const matchKey = rowKeys.find((rk) => clean(rk) === targetClean);
          if (matchKey && row[matchKey] !== undefined && row[matchKey] !== null && String(row[matchKey]).trim() !== '') {
            return String(row[matchKey]).trim();
          }
        }
        return '-';
      };

      const grouped = {};
      data.forEach((row) => {
        const roll = getVal(row, 'Roll No', 'Roll Number', 'RollNo', 'HTNO', 'Hall Ticket No', 'Roll').toUpperCase();
        const name = getVal(row, 'Student Name', 'StudentName', 'Name', 'Student');

        if (roll === '-') return;

        if (!grouped[roll]) {
          grouped[roll] = {
            rollNumber: roll,
            studentName: name,
            subjects: []
          };
        }

        const internal = getVal(row, 'Internal Marks', 'Internal', 'Int Marks', 'Int', 'IM', 'Mid');
        const external = getVal(row, 'External Marks', 'External', 'Ext Marks', 'Ext', 'EM', 'SEE');
        
        let total = getVal(row, 'Total', 'Total Marks', 'TotalMarks', 'Tot');
        if (total === '-' && !isNaN(internal) && !isNaN(external)) {
          total = String(Number(internal) + Number(external));
        }

        grouped[roll].subjects.push({
          subjectCode: getVal(row, 'Subject Code', 'Sub Code', 'SubjectCode', 'SubCode', 'Code'),
          subjectName: getVal(row, 'Subject Name', 'Sub Name', 'SubjectName', 'SubName', 'Subject'),
          internalMarks: internal,
          externalMarks: external,
          totalMarks: total,
          result: getVal(row, 'Result', 'Status', 'Res', 'Grade'),
          credits: getVal(row, 'Credits', 'Credit', 'Cred', 'Cr')
        });
      });

      setParsedData(Object.values(grouped));
    };
    reader.readAsBinaryString(file);
  };

  const handlePublish = async () => {
    if (!title.trim()) return alert('Please enter Examination Title!');
    if (parsedData.length === 0) return alert('Please upload an Excel / CSV file first!');

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/results/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, studentResults: parsedData })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert(data.message);
      setParsedData([]);
      setTitle('');
      fetchSummary();
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTitle = async (examTitle) => {
    if (!window.confirm(`Delete all results for "${examTitle}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/results/title/${encodeURIComponent(examTitle)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchSummary();
    } catch (err) {
      alert('Failed to delete results');
    }
  };

  // BULK MARKS MEMO PDF DOWNLOAD FUNCTION
  const handleDownloadAllMemos = async (examTitle) => {
    setGeneratingTitle(examTitle);

    try {
      const res = await fetch(`${API_BASE_URL}/api/results/title/${encodeURIComponent(examTitle)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok || data.length === 0) {
        throw new Error('Failed to fetch records for memo generation.');
      }

      setBatchResults(data);

      // Allow DOM to render hidden elements before compiling PDF
      setTimeout(() => {
        const element = document.getElementById('batch-memos-container');
        
        const opt = {
          margin: [8, 8, 8, 8],
          filename: `JNTUA_Memos_${examTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'] }
        };

        html2pdf().set(opt).from(element).save().then(() => {
          setGeneratingTitle('');
          setBatchResults([]);
        });
      }, 500);

    } catch (err) {
      alert(`Error generating memos: ${err.message}`);
      setGeneratingTitle('');
      setBatchResults([]);
    }
  };

  if (!token) {
    return (
      <div style={{ maxWidth: '400px', margin: '60px auto', padding: '24px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#fff' }}>
        <h2>Admin Portal Login</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input type="text" placeholder="Username (admin)" onChange={(e) => setCredentials({ ...credentials, username: e.target.value })} style={{ padding: '10px' }} />
          <input type="password" placeholder="Password (admin123)" onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} style={{ padding: '10px' }} />
          <button type="submit" style={{ padding: '10px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px' }}>Login</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '20px auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>🛠️ Admin Control Panel</h2>
        <button onClick={() => { localStorage.removeItem('adminToken'); setToken(''); }} style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
      </div>

      {/* Upload Section */}
      <div style={{ padding: '24px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#ffffff', marginBottom: '30px' }}>
        <h3>Publish / Update Examination Results</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Examination Title / Session:</label>
            <input 
              type="text" 
              placeholder="e.g. B.Tech II Year I Sem Supple Results Dec 2025" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              style={{ width: '100%', padding: '10px', fontSize: '15px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Upload Excel / CSV File:</label>
            <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} style={{ padding: '8px' }} />
          </div>

          <button 
            onClick={handlePublish} 
            disabled={loading}
            style={{ padding: '12px 24px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {loading ? 'Processing Upload...' : 'Publish / Update Results'}
          </button>
        </div>
      </div>

      {/* Published Summary Table */}
      <h3>Published Examinations ({summaryList.length})</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1', background: '#fff' }}>
        <thead>
          <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
            <th style={{ padding: '12px 16px', borderBottom: '2px solid #cbd5e1' }}>Examination Title</th>
            <th style={{ padding: '12px 16px', borderBottom: '2px solid #cbd5e1', textAlign: 'center', width: '160px' }}>Total Records</th>
            <th style={{ padding: '12px 16px', borderBottom: '2px solid #cbd5e1', textAlign: 'right', width: '280px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {summaryList.map((item, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '12px 16px', fontWeight: '600', color: '#0f172a' }}>{item.title}</td>
              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.88rem' }}>
                  {item.count} Students
                </span>
              </td>
              <td style={{ padding: '12px 16px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                <button 
                  onClick={() => handleDownloadAllMemos(item.title)} 
                  disabled={generatingTitle === item.title}
                  style={{ padding: '6px 12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.82rem' }}
                >
                  {generatingTitle === item.title ? 'Generating PDF...' : '📥 Download All Memos (PDF)'}
                </button>
                <button 
                  onClick={() => handleDeleteTitle(item.title)} 
                  style={{ color: '#ef4444', cursor: 'pointer', border: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '0.88rem' }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* HIDDEN BATCH CONTAINER (RENDERED TEMPORARILY FOR PDF GENERATION) */}
      {batchResults.length > 0 && (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <div id="batch-memos-container">
            {batchResults.map((res, bIdx) => {
              const totalCreditsObtained = res.subjects.reduce((sum, sub) => {
                const c = parseFloat(sub.credits);
                return !isNaN(c) && (sub.result === 'P' || sub.result === 'PASS') ? sum + c : sum;
              }, 0);

              const isOverallPass = res.subjects.every(
                (sub) => sub.result === 'P' || sub.result === 'PASS'
              );

              return (
                <div 
                  key={bIdx}
                  style={{ 
                    border: '2px solid #0f172a', 
                    borderRadius: '4px', 
                    padding: '28px', 
                    background: '#ffffff', 
                    color: '#0f172a',
                    fontFamily: 'serif',
                    pageBreakAfter: 'always',
                    breakAfter: 'page',
                    boxSizing: 'border-box'
                  }}
                >
                  {/* Header */}
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

                  {/* Student Details */}
                  <table style={{ width: '100%', marginBottom: '18px', borderCollapse: 'collapse', fontFamily: 'sans-serif', fontSize: '0.95rem' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '6px 0', width: '18%', fontWeight: 'bold' }}>Hall Ticket No:</td>
                        <td style={{ padding: '6px 0', width: '32%', fontWeight: 'bold', color: '#1e293b' }}>{res.rollNumber}</td>
                        <td style={{ padding: '6px 0', width: '18%', fontWeight: 'bold' }}>Student Name:</td>
                        <td style={{ padding: '6px 0', width: '32%', fontWeight: 'bold', color: '#1e293b' }}>{res.studentName}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Subjects Table */}
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
                      {res.subjects.map((sub, sIdx) => (
                        <tr key={sIdx}>
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

                  {/* Summary Footer */}
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

                  {/* Signatures */}
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
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
