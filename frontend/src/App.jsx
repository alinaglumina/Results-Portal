import React, { useState } from 'react';
import ResultSearch from './components/ResultSearch';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  // Controls current view: 'student' | 'admin'
  const [view, setView] = useState('student');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Top Header & Navigation */}
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          
          {/* Institute Branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.5rem' }}>🎓</span>
            <h1 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, color: '#1e293b' }}>
              Institute Results Portal
            </h1>
          </div>

          {/* View Switcher Tabs */}
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

      {/* Main Content Area */}
      <main style={{ padding: '40px 20px' }}>
        {view === 'student' ? <ResultSearch /> : <AdminDashboard />}
      </main>

    </div>
  );
}