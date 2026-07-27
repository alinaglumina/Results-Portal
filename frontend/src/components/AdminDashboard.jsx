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

  // Pre-printed Stationery Toggle
  const [dataOnlyMode, setDataOnlyMode] = useState(true);

  // Bulk PDF State
  const [batchResults, setBatchResults] = useState([]);
  const [generatingTitle, setGeneratingTitle] = useState('');

  useEffect(() => {
    if (token) fetchSummary();
  }, [token]);

  // Convert aggregate total to digit-by-digit words
  const convertToDigitWords = (num) => {
    if (isNaN(num) || num === null || num === undefined) return 'Zero';
    const wordsMap = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    return String(num)
      .split('')
      .map((digit) => wordsMap[parseInt(digit)] || digit)
      .join(' ');
  };

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

  // Generate A3 PDF Memos
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

      setTimeout(() => {
        const element = document.getElementById('batch-memos-container');
        
        const opt = {
          margin: [8, 8, 8, 8],
          filename: `JNTUA_A3_Memos_${examTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'mm', format: 'a3', orientation: 'portrait' },
          pagebreak: { mode: 'css', before: '.page-break' }
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

      {/* Mode Selector Option */}
      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <strong>Print Mode for A3 Memos:</strong>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
            Choose "Data-Only Overprint" if you are feeding blank pre-printed university stationery sheets into the printer.
          </p>
        </div>
        <label style={{ cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input 
            type="checkbox" 
            checked={dataOnlyMode} 
            onChange={(e) => setDataOnlyMode(e.target.checked)} 
            style={{ width: '18px', height: '18px' }}
          />
          Data-Only Overprint (For Pre-printed A3 Sheets)
        </label>
      </div>

      {/* Upload Section */}
      <div style={{ padding: '24px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#ffffff', marginBottom: '30px' }}>
        <h3>Publish / Update Examination Results</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Examination Title / Session:</label>
            <input 
              type="text" 
              placeholder="e.g. B.Tech IV Year I Sem Regular Examinations Dec 2015" 
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
                  {generatingTitle === item.title ? 'Generating A3 PDF...' : '📥 Generate A3 Memos (PDF)'}
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

     {/* A3 PRINT CONTAINER FOR PDF GENERATION */}
      {batchResults.length > 0 && (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <div id="batch-memos-container" style={{ width: '280mm' }}>
            {batchResults.map((res, bIdx) => {
              let totalInternal = 0;
              let totalEndExam = 0;
              let totalAggregate = 0;
              let totalCredits = 0;
              let registered = res.subjects.length;
              let appeared = 0;
              let passed = 0;

              res.subjects.forEach((sub) => {
                const internal = parseInt(sub.internalMarks) || 0;
                const external = parseInt(sub.externalMarks) || 0;
                const total = parseInt(sub.totalMarks) || (internal + external);
                const credit = parseFloat(sub.credits) || 0;

                totalInternal += internal;
                totalEndExam += external;
                totalAggregate += total;

                if (sub.internalMarks !== 'AB' && sub.externalMarks !== 'AB') appeared += 1;
                if (sub.result === 'P' || sub.result === 'PASS') {
                  passed += 1;
                  totalCredits += credit;
                }
              });

              const borderStyle = dataOnlyMode ? '1px solid transparent' : '1px solid #000';
              const hideLabelStyle = dataOnlyMode ? { visibility: 'hidden' } : {};
              const isLast = bIdx === batchResults.length - 1;

              return (
                <div 
                  key={bIdx}
                  className={!isLast ? "page-break" : ""}
                  style={{ 
                    width: '280mm',
                    height: '395mm', // Fixed height prevents overflow empty pages
                    maxHeight: '395mm',
                    border: borderStyle,
                    padding: '20px 25px', 
                    background: '#ffffff', 
                    color: '#000',
                    fontFamily: 'Arial, sans-serif',
                    pageBreakAfter: isLast ? 'avoid' : 'always',
                    breakAfter: isLast ? 'avoid' : 'page',
                    boxSizing: 'border-box',
                    overflow: 'hidden'
                  }}
                >
                  {/* Header Block */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '25px', height: '80px' }}>
                    <div style={{ width: '80px', visibility: dataOnlyMode ? 'hidden' : 'visible' }}>
                      <img src="/logo.png" alt="Logo" style={{ height: '70px' }} />
                    </div>
                    
                    <div style={{ textAlign: 'center', flex: 1, ...hideLabelStyle }}>
                      <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 'bold', fontFamily: 'serif' }}>
                        JAWAHARLAL NEHRU TECHNOLOGICAL UNIVERSITY ANANTAPUR
                      </h2>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.9rem', fontWeight: 'bold' }}>
                        ANANTHAPURAMU - 515 002, ANDHRA PRADESH, INDIA
                      </p>
                      <h3 style={{ margin: '10px 0 0 0', fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'serif' }}>
                        MEMORANDUM OF MARKS
                      </h3>
                    </div>

                    <div style={{ textAlign: 'right', minWidth: '150px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 'bold', ...hideLabelStyle }}>MEMO NO: </span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: dataOnlyMode ? '#000' : '#dc2626' }}>
                        {res.memoNo || ''}
                      </span>
                    </div>
                  </div>

                  {/* Student Details Grid */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: borderStyle, fontSize: '0.95rem', marginBottom: '20px' }}>
                    <tbody>
                      <tr style={{ height: '28px' }}>
                        <td style={{ padding: '6px', borderRight: borderStyle, borderBottom: borderStyle, width: '12%', fontWeight: 'bold', ...hideLabelStyle }}>S.No:</td>
                        <td style={{ padding: '6px', borderRight: borderStyle, borderBottom: borderStyle, width: '38%' }}>{res.serialNo || ''}</td>
                        <td style={{ padding: '6px', borderRight: borderStyle, borderBottom: borderStyle, width: '18%', fontWeight: 'bold', ...hideLabelStyle }}>HALL TICKET NO:</td>
                        <td style={{ padding: '6px', borderBottom: borderStyle, width: '32%', fontSize: '1.15rem', fontWeight: 'bold' }}>{res.rollNumber}</td>
                      </tr>
                      <tr style={{ height: '28px' }}>
                        <td style={{ padding: '6px', borderRight: borderStyle, borderBottom: borderStyle, fontWeight: 'bold', ...hideLabelStyle }}>EXAMINATION:</td>
                        <td style={{ padding: '6px', borderRight: borderStyle, borderBottom: borderStyle, fontWeight: 'bold' }}>{res.title}</td>
                        <td style={{ padding: '6px', borderRight: borderStyle, borderBottom: borderStyle, fontWeight: 'bold', ...hideLabelStyle }}>MONTH & YEAR OF EXAM:</td>
                        <td style={{ padding: '6px', borderBottom: borderStyle, fontWeight: 'bold' }}>{res.monthYear || 'DECEMBER 2025'}</td>
                      </tr>
                      <tr style={{ height: '28px' }}>
                        <td style={{ padding: '6px', borderRight: borderStyle, borderBottom: borderStyle, fontWeight: 'bold', ...hideLabelStyle }}>BRANCH:</td>
                        <td style={{ padding: '6px', borderRight: borderStyle, borderBottom: borderStyle }}>{res.branch || ''}</td>
                        <td style={{ padding: '6px', borderRight: borderStyle, borderBottom: borderStyle, fontWeight: 'bold', ...hideLabelStyle }}>INSTITUTION:</td>
                        <td style={{ padding: '6px', borderBottom: borderStyle }}>{res.institution || ''}</td>
                      </tr>
                      <tr style={{ height: '28px' }}>
                        <td style={{ padding: '6px', borderRight: borderStyle, fontWeight: 'bold', ...hideLabelStyle }}>NAME:</td>
                        <td colSpan="3" style={{ padding: '6px', fontSize: '1rem', fontWeight: 'bold' }}>{res.studentName}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Marks Table */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: borderStyle, fontSize: '0.95rem', textAlign: 'center', marginBottom: '20px' }}>
                    <thead>
                      <tr style={{ borderBottom: borderStyle, fontWeight: 'bold', height: '32px', ...hideLabelStyle }}>
                        <th style={{ padding: '8px', borderRight: borderStyle, width: '5%' }}>S. No.</th>
                        <th style={{ padding: '8px', borderRight: borderStyle, width: '14%' }}>SUBJECT CODE</th>
                        <th style={{ padding: '8px', borderRight: borderStyle, textAlign: 'left' }}>SUBJECT TITLE</th>
                        <th style={{ padding: '8px', borderRight: borderStyle, width: '12%' }}>INTERNAL MARKS</th>
                        <th style={{ padding: '8px', borderRight: borderStyle, width: '10%' }}>END EXAM</th>
                        <th style={{ padding: '8px', borderRight: borderStyle, width: '10%' }}>TOTAL MARKS</th>
                        <th style={{ padding: '8px', borderRight: borderStyle, width: '8%' }}>RESULT</th>
                        <th style={{ padding: '8px', width: '8%' }}>CREDITS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {res.subjects.map((sub, idx) => (
                        <tr key={idx} style={{ height: '28px' }}>
                          <td style={{ padding: '6px', borderRight: borderStyle }}>{idx + 1}</td>
                          <td style={{ padding: '6px', borderRight: borderStyle, fontWeight: 'bold' }}>{sub.subjectCode}</td>
                          <td style={{ padding: '6px', borderRight: borderStyle, textAlign: 'left' }}>{sub.subjectName}</td>
                          <td style={{ padding: '6px', borderRight: borderStyle }}>{sub.internalMarks}</td>
                          <td style={{ padding: '6px', borderRight: borderStyle }}>{sub.externalMarks}</td>
                          <td style={{ padding: '6px', borderRight: borderStyle, fontWeight: 'bold' }}>{sub.totalMarks}</td>
                          <td style={{ padding: '6px', borderRight: borderStyle, fontWeight: 'bold' }}>{sub.result}</td>
                          <td style={{ padding: '6px', fontWeight: 'bold' }}>{sub.credits || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Dynamic Totals Row */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: borderStyle, fontSize: '0.95rem', marginBottom: '16px' }}>
                    <tbody>
                      <tr style={{ fontWeight: 'bold', height: '30px' }}>
                        <td style={{ padding: '6px', borderRight: borderStyle, width: '18%', ...hideLabelStyle }}>SUBJECTS REGISTERED:</td>
                        <td style={{ padding: '6px', borderRight: borderStyle, width: '8%', textAlign: 'center' }}>{registered}</td>
                        <td style={{ padding: '6px', borderRight: borderStyle, width: '12%', ...hideLabelStyle }}>APPEARED:</td>
                        <td style={{ padding: '6px', borderRight: borderStyle, width: '8%', textAlign: 'center' }}>{appeared}</td>
                        <td style={{ padding: '6px', borderRight: borderStyle, width: '10%', ...hideLabelStyle }}>PASSED:</td>
                        <td style={{ padding: '6px', borderRight: borderStyle, width: '8%', textAlign: 'center' }}>{passed}</td>
                        <td style={{ padding: '6px', borderRight: borderStyle, width: '10%', textAlign: 'right', ...hideLabelStyle }}>TOTAL:</td>
                        <td style={{ padding: '6px', borderRight: borderStyle, width: '7%', textAlign: 'center' }}>{totalInternal}</td>
                        <td style={{ padding: '6px', borderRight: borderStyle, width: '7%', textAlign: 'center' }}>{totalEndExam}</td>
                        <td style={{ padding: '6px', borderRight: borderStyle, width: '7%', textAlign: 'center' }}>{totalAggregate}</td>
                        <td style={{ padding: '6px', width: '5%', textAlign: 'center' }}>{totalCredits}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Aggregate in Words */}
                  <div style={{ border: borderStyle, padding: '8px 12px', fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '50px' }}>
                    <span style={hideLabelStyle}>AGGREGATE (IN WORDS): &nbsp;&nbsp;&nbsp;</span>
                    *** {convertToDigitWords(totalAggregate)} ***
                  </div>

                  {/* Date Output */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    <div>
                      <span style={hideLabelStyle}>DATE: &nbsp;&nbsp;</span>
                      {res.date || 'Saturday, Mar 26 2016'}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}
