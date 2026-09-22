import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OperationsLayout } from './layouts/OperationsLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';

// Public & Citizen Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { PublicReportPage } from './pages/PublicReportPage';
import { PublicIssuesPage } from './pages/PublicIssuesPage';
import { IssueDetailsPage } from './pages/IssueDetailsPage';
import { DashboardPage } from './pages/DashboardPage';
import { MyReportsPage } from './pages/MyReportsPage';
import { ProfilePage } from './pages/ProfilePage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminIssuesPage } from './pages/admin/AdminIssuesPage';
import { AdminTriagePage } from './pages/admin/AdminTriagePage';
import { AdminWorkOrdersPage } from './pages/admin/AdminWorkOrdersPage';
import { AdminVerificationPage } from './pages/admin/AdminVerificationPage';
import { AdminConstructionPage } from './pages/admin/AdminConstructionPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';
import { AdminSmartMaintenancePage } from './pages/admin/AdminSmartMaintenancePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<OperationsLayout />}>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/report" element={<PublicReportPage />} />
          <Route path="/issues" element={<PublicIssuesPage />} />
          <Route path="/issues/:id" element={<IssueDetailsPage />} />

          {/* Protected Citizen Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/my-reports" element={<MyReportsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/issues" element={<AdminIssuesPage />} />
            <Route path="/admin/triage" element={<AdminTriagePage />} />
            <Route path="/admin/work-orders" element={<AdminWorkOrdersPage />} />
            <Route path="/admin/verification" element={<AdminVerificationPage />} />
            <Route path="/admin/construction" element={<AdminConstructionPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
            <Route path="/admin/profile" element={<AdminProfilePage />} />
            <Route path="/admin/maintenance" element={<AdminSmartMaintenancePage />} />
          </Route>

          {/* Legacy route aliases redirected cleanly to admin equivalents */}
          <Route path="/operations/dashboard" element={<Navigate to="/admin" replace />} />
          <Route path="/operations/triage" element={<Navigate to="/admin/triage" replace />} />
          <Route path="/operations/work-orders" element={<Navigate to="/admin/work-orders" replace />} />
          <Route path="/operations/verification" element={<Navigate to="/admin/verification" replace />} />
          <Route path="/operations/construction" element={<Navigate to="/admin/construction" replace />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
