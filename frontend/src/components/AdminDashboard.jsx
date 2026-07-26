import { API_BASE_URL } from '../config';
import React, { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [resultsList, setResultsList] = useState([]);
  const [error, setError] = useState('');

  // Form State for New Result
  const [formData, setFormData] = useState({
    rollNumber: '',
    studentName: '',
    course: '',
    semester: '1',
    academicYear: '2025-2026',
    cgpa: '',
    status: 'PASS',
    subjects: [{ subjectName: '', marksObtained: 0, maxMarks: 100 }]
  });

  // Fetch all results when logged in
  useEffect(() => {
    if (token) fetchResults();
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/results/admin/login', {
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
    const res = await fetch('http://localhost:5000/api/results', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setResultsList(data);
    }
  };

  const handleAddSubject = () => {
    setFormData({
      ...formData,
      subjects: [...formData.subjects, { subjectName: '', marksObtained: 0, maxMarks: 100 }]
    });
  };

  const handleSubmitResult = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert('Result Published Successfully!');
      fetchResults();
    } catch (err) {
      alert(`Failed: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this result?')) return;
    await fetch(`http://localhost:5000/api/results/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchResults();
  };

  // --- 1. LOGIN SCREEN ---
  if (!token) {
    return (
      <div style={{ maxWidth: '400px', margin: '60px auto', padding: '24px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#fff' }}>
        <h2>Admin Portal Login</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input 
            type="text" 
            placeholder="Username (admin)" 
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })} 
            style={{ padding: '10px' }}
          />
          <input 
            type="password" 
            placeholder="Password (admin123)" 
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} 
            style={{ padding: '10px' }}
          />
          <button type="submit" style={{ padding: '10px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px' }}>
            Login
          </button>
        </form>
      </div>
    );
  }

  // --- 2. DASHBOARD VIEW ---
  return (
    <div style={{ maxWidth: '900px', margin: '20px auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>🛠️ Admin Control Panel</h2>
        <button 
          onClick={() => { localStorage.removeItem('adminToken'); setToken(''); }}
          style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px' }}
        >
          Logout
        </button>
      </div>

      {/* Add Result Form */}
      <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', marginBottom: '30px' }}>
        <h3>Publish New Result</h3>
        <form onSubmit={handleSubmitResult}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <input placeholder="Roll Number" onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })} required />
            <input placeholder="Student Name" onChange={(e) => setFormData({ ...formData, studentName: e.target.value })} required />
            <input placeholder="Course (e.g. B.Tech CS)" onChange={(e) => setFormData({ ...formData, course: e.target.value })} required />
            <input placeholder="CGPA (e.g. 8.5)" type="number" step="0.01" onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })} required />
          </div>

          <h4>Subjects</h4>
          {formData.subjects.map((sub, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input 
                placeholder="Subject Name" 
                onChange={(e) => {
                  const updated = [...formData.subjects];
                  updated[idx].subjectName = e.target.value;
                  setFormData({ ...formData, subjects: updated });
                }} 
                required 
              />
              <input 
                type="number" 
                placeholder="Marks Obtained" 
                onChange={(e) => {
                  const updated = [...formData.subjects];
                  updated[idx].marksObtained = Number(e.target.value);
                  setFormData({ ...formData, subjects: updated });
                }} 
                required 
              />
            </div>
          ))}
          <button type="button" onClick={handleAddSubject} style={{ marginBottom: '16px' }}>+ Add Another Subject</button>
          <br />
          <button type="submit" style={{ padding: '10px 20px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px' }}>
            Publish Result
          </button>
        </form>
      </div>

      {/* Existing Results Management */}
      <h3>Existing Published Results ({resultsList.length})</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1' }}>
        <thead>
          <tr style={{ background: '#f1f5f9' }}>
            <th style={{ padding: '8px', textAlign: 'left' }}>Roll No</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Name</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Course</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>CGPA</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {resultsList.map((item) => (
            <tr key={item._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '8px' }}>{item.rollNumber}</td>
              <td style={{ padding: '8px' }}>{item.studentName}</td>
              <td style={{ padding: '8px' }}>{item.course}</td>
              <td style={{ padding: '8px' }}>{item.cgpa}</td>
              <td style={{ padding: '8px' }}>
                <button onClick={() => handleDelete(item._id)} style={{ color: 'red', cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
