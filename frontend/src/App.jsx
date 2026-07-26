import React, { useState } from 'react';
import ResultSearch from './components/ResultSearch';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [view, setView] = useState('student');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* JNTUA Navigation Header */}
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          
          {/* JNTUA Branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo.png" alt="JNTUA Logo" style={{ height: '48px', width: 'auto' }} />
            <div>
              <h1 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>
                JNTUA Results Portal
              </h1>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                Jawaharlal Nehru Technological University Anantapur
              </span>
            </div>
          </div>

          {/* View Switcher */}
          <nav style={{ display: 'flex', gap: '4px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
            <button
              onClick={() => setView('student')}
              style={{
                padding: '8px 16px',
                fontSize: '0.9rem',
                fontWeight: 600,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: view === 'student' ? '#ffffff' : 'transparent',
                color: view === 'student' ? '#2563eb' : '#64748b',
                boxShadow: view === 'student' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              Student Search
            </button>
            <button
              onClick={() => setView('admin')}
              style={{
                padding: '8px 16px',
                fontSize: '0.9rem',
                fontWeight: 600,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: view === 'admin' ? '#ffffff' : 'transparent',
                color: view === 'admin' ? '#2563eb' : '#64748b',
                boxShadow: view === 'admin' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              Admin Portal
            </button>
          </nav>

        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '40px 20px' }}>
        {view === 'student' ? <ResultSearch /> : <AdminDashboard />}
      </main>

    </div>
  );
}
