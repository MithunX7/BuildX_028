import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OperationsLayout } from './layouts/OperationsLayout';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { TriagePage } from './pages/TriagePage';
import { WorkOrdersPage } from './pages/WorkOrdersPage';
import { VerificationPage } from './pages/VerificationPage';
import { ConstructionPage } from './pages/ConstructionPage';
import { PublicReportPage } from './pages/PublicReportPage';
import { PublicIssuesPage } from './pages/PublicIssuesPage';
import { LoginPage } from './pages/LoginPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<OperationsLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/report" element={<PublicReportPage />} />
          <Route path="/issues" element={<PublicIssuesPage />} />
          <Route path="/operations/dashboard" element={<DashboardPage />} />
          <Route path="/operations/triage" element={<TriagePage />} />
          <Route path="/operations/work-orders" element={<WorkOrdersPage />} />
          <Route path="/operations/verification" element={<VerificationPage />} />
          <Route path="/operations/construction" element={<ConstructionPage />} />
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
