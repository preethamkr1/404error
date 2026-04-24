import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import AppPage from './pages/AppPage.jsx';
import UserMap from './pages/UserMap.jsx';
import ShopDashboard from './pages/ShopDashboard.jsx';
import BusinessLandingPage from './pages/BusinessLandingPage.jsx';
import ShopAuthPage from './pages/ShopAuthPage.jsx';
import PrintPage from './pages/PrintPage.jsx';
import SecurePrintModule from './pages/SecurePrintModule.jsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/upload" element={<AppPage />} />
        <Route path="/nearby" element={<UserMap />} />
        
        {/* Business Partner Routes */}
        <Route path="/business" element={<BusinessLandingPage />} />
        <Route path="/business/auth" element={<ShopAuthPage />} />
        <Route path="/business/dashboard" element={<ShopDashboard />} />
        <Route path="/business/print" element={<PrintPage />} />
        <Route path="/secure-print" element={<SecurePrintModule />} />
      </Routes>
    </Router>
  );
}

export default App; 