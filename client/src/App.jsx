import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DonorPage from './pages/DonorPage';
import RequesterPage from './pages/RequesterPage';
import OurAreaPage from './pages/OurAreaPage';
import BloodBanksDirectoryPage from './pages/BloodBanksDirectoryPage';
import BloodBankCityPage from './pages/BloodBankCityPage';
import BloodBankDetailPage from './pages/BloodBankDetailPage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/donor" element={<DonorPage />} />
        <Route path="/requester" element={<RequesterPage />} />
        <Route path="/our-area" element={<OurAreaPage />} />
        
        {/* Blood Banks Directory, City listing, and Depot Inspection Flow */}
        <Route path="/blood-banks" element={<BloodBanksDirectoryPage />} />
        <Route path="/blood-banks/:city" element={<BloodBankCityPage />} />
        <Route path="/blood-banks/:city/:id" element={<BloodBankDetailPage />} />

        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}
