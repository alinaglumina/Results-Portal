import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ResultSearch from './components/ResultSearch';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        
        {/* TOP COMPONENT / ROUTER VIEW SWITCH */}
        <Routes>
          
          {/* 1. PUBLIC STUDENT RESULTS PORTAL */}
          <Route path="/" element={
            <>
              <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src="/logo.png" alt="JNTUA Logo" style={{ height: '52px', width: 'auto' }} />
                  <div>
                    <h1 style={{ fontSize: '1.3rem', margin: 0, fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>
                      JNTUA Results Portal
                    </h1>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                      Jawaharlal Nehru Technological University Anantapur
                    </span>
                  </div>
                </div>
              </header>
              <main style={{ padding: '40px 20px' }}>
                <ResultSearch />
              </main>
            </>
          } />

          {/* 2. COMPLETELY SEPARATED ADMIN PORTAL */}
          <Route path="/admin" element={
            <main style={{ padding: '40px 20px' }}>
              <AdminDashboard />
            </main>
          } />

        </Routes>

      </div>
    </Router>
  );
}
