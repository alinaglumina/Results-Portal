import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

const API_BASE_URL = 'https://results-portal-hvjj.onrender.com';

export default function AdminDashboard() {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [resultsList, setResultsList] = useState([]);
  const [title, setTitle] = useState('');
  const [parsedData, setParsedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) fetchResults();
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

  const fetchResults = async () => {
    const res = await fetch(`${API_BASE_URL}/api/results`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setResultsList(data);
    }
  };

  // Read Excel / CSV File
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

      // Group rows by Roll No
      const grouped = {};
      data.forEach((row) => {
        const roll = String(row['Roll No'] || row['rollNumber'] || '').trim();
        const name = String(row['Student Name'] || row['studentName'] || '').trim();

        if (!roll) return;

        if (!grouped[roll]) {
          grouped[roll] = {
            rollNumber: roll,
            studentName: name,
            subjects: []
          };
        }

        grouped[roll].subjects.push({
          subjectCode: String(row['Subject Code'] || row['subjectCode'] || '-'),
          subjectName: String(row['Subject Name'] || row['subjectName'] || '-'),
          internalMarks: String(row['Internal'] || row['internalMarks'] || '-'),
          externalMarks: String(row['External'] || row['externalMarks'] || '-'),
          totalMarks: String(row['Total'] || row['totalMarks'] || '-'),
          result: String(row['Result'] || row['result'] || 'P')
        });
      });

      setParsedData(Object.values(grouped));
    };
    reader.readAsBinaryString(file);
  };

  // Submit Title + Parsed Excel Data to Backend
  const handlePublish = async () => {
    if (!title.trim()) return alert('Please enter Examination Title!');
    if (parsedData.length === 0) return alert('Please upload a valid Excel / CSV file first!');

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
      fetchResults();
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this published result record?')) return;
    await fetch(`${API_BASE_URL}/api/results/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchResults();
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
              placeholder="e.g. B.Tech III Year I Sem Regular Examinations Nov 2025" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              style={{ width: '100%', padding: '10px', fontSize: '15px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Upload Excel / CSV File:</label>
            <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} style={{ padding: '8px' }} />
          </div>

          {/* Preview Parsed Data */}
          {parsedData.length > 0 && (
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <p style={{ margin: 0, color: '#16a34a', fontWeight: 'bold' }}>
                ✓ Successfully parsed results for {parsedData.length} students from file.
              </p>
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

      {/* Published Results Table */}
      <h3>Published Results Database ({resultsList.length})</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1', background: '#fff' }}>
        <thead>
          <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
            <th style={{ padding: '10px', borderBottom: '1px solid #cbd5e1' }}>Roll No</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #cbd5e1' }}>Student Name</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #cbd5e1' }}>Title / Exam</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #cbd5e1' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {resultsList.map((item) => (
            <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '10px' }}><strong>{item.rollNumber}</strong></td>
              <td style={{ padding: '10px' }}>{item.studentName}</td>
              <td style={{ padding: '10px', fontSize: '0.9em' }}>{item.title}</td>
              <td style={{ padding: '10px' }}>
                <button onClick={() => handleDelete(item._id)} style={{ color: '#ef4444', cursor: 'pointer', border: 'none', background: 'transparent', fontWeight: 'bold' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
