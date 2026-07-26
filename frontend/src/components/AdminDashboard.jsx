import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

const API_BASE_URL = 'https://results-portal-hvjj.onrender.com';

export default function AdminDashboard() {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [summaryList, setSummaryList] = useState([]);
  const [title, setTitle] = useState('');
  const [parsedData, setParsedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  // Strict & Robust Excel Parser
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

      // Clean string helper for exact comparison
      const clean = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

      // Strict Exact Match Key Helper
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
        // Auto-calculate Total if missing but internal and external exist
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
    <div style={{ maxWidth: '950px', margin: '20px auto', fontFamily: 'sans-serif' }}>
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

          {/* Verification Preview */}
          {parsedData.length > 0 && (
            <div style={{ marginTop: '10px', background: '#f8fafc', padding: '16px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
              <p style={{ margin: '0 0 10px 0', color: '#16a34a', fontWeight: 'bold' }}>
                ✓ Parsed {parsedData.length} students. Sample Preview:
              </p>
              
              <div style={{ fontSize: '0.9em', marginBottom: '8px' }}>
                <strong>Roll No:</strong> {parsedData[0].rollNumber} | <strong>Name:</strong> {parsedData[0].studentName}
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', fontSize: '0.85em' }}>
                <thead>
                  <tr style={{ background: '#e2e8f0' }}>
                    <th style={{ padding: '6px', border: '1px solid #cbd5e1' }}>Code</th>
                    <th style={{ padding: '6px', border: '1px solid #cbd5e1' }}>Subject Name</th>
                    <th style={{ padding: '6px', border: '1px solid #cbd5e1' }}>Int</th>
                    <th style={{ padding: '6px', border: '1px solid #cbd5e1' }}>Ext</th>
                    <th style={{ padding: '6px', border: '1px solid #cbd5e1' }}>Total</th>
                    <th style={{ padding: '6px', border: '1px solid #cbd5e1' }}>Res</th>
                    <th style={{ padding: '6px', border: '1px solid #cbd5e1' }}>Credits</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData[0].subjects.map((s, i) => (
                    <tr key={i} style={{ textAlign: 'center' }}>
                      <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}>{s.subjectCode}</td>
                      <td style={{ padding: '6px', border: '1px solid #cbd5e1', textAlign: 'left' }}>{s.subjectName}</td>
                      <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}>{s.internalMarks}</td>
                      <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}>{s.externalMarks}</td>
                      <td style={{ padding: '6px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>{s.totalMarks}</td>
                      <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}>{s.result}</td>
                      <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}>{s.credits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button 
            onClick={handlePublish} 
            disabled={loading}
            style={{ padding: '12px 24px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {loading ? 'Processing Upload...' : 'Publish / Update Results'}
          </button>
        </div>
      </div>

      {/* Published Summary */}
      <h3>Published Examinations ({summaryList.length})</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1', background: '#fff' }}>
        <thead>
          <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
            <th style={{ padding: '12px 16px', borderBottom: '2px solid #cbd5e1' }}>Examination Title</th>
            <th style={{ padding: '12px 16px', borderBottom: '2px solid #cbd5e1', textAlign: 'center', width: '180px' }}>Total Records</th>
            <th style={{ padding: '12px 16px', borderBottom: '2px solid #cbd5e1', textAlign: 'right', width: '120px' }}>Action</th>
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
              <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                <button 
                  onClick={() => handleDeleteTitle(item.title)} 
                  style={{ color: '#ef4444', cursor: 'pointer', border: 'none', background: 'transparent', fontWeight: 'bold' }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
