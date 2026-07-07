import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { DashboardLayout } from './components/DashboardLayout';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import RegisterEvent from './pages/RegisterEvent';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminEvents from './pages/AdminEvents';
import AdminRegistrations from './pages/AdminRegistrations';
import AdminBroadcast from './pages/AdminBroadcast';
import AdminGallery from './pages/AdminGallery';
import Profile from './pages/Profile';
import MyEnrolls from './pages/MyEnrolls';
import Gallery from './pages/Gallery';
import Highlights from './pages/Highlights';
import AdminHighlights from './pages/AdminHighlights';
import AdminGuests from './pages/AdminGuests';
import Landing from './pages/Landing';
import AdminEvaluation from './pages/AdminEvaluation';
import Support from './pages/Support';
import AdminCoordinators from './pages/AdminCoordinators';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Private User Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/events" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Events />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/events/register/:id" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <RegisterEvent />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/registrations" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <MyEnrolls />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Profile />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/gallery" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Gallery />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/highlights" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Highlights />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/support" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Support />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Private Admin Routes */}
            <Route path="/admin/analytics" element={
              <AdminRoute>
                <DashboardLayout>
                  <AdminAnalytics />
                </DashboardLayout>
              </AdminRoute>
            } />
            <Route path="/admin/events" element={
              <AdminRoute>
                <DashboardLayout>
                  <AdminEvents />
                </DashboardLayout>
              </AdminRoute>
            } />
            <Route path="/admin/registrations" element={
              <AdminRoute>
                <DashboardLayout>
                  <AdminRegistrations />
                </DashboardLayout>
              </AdminRoute>
            } />
            <Route path="/admin/broadcast" element={
              <AdminRoute>
                <DashboardLayout>
                  <AdminBroadcast />
                </DashboardLayout>
              </AdminRoute>
            } />
            <Route path="/admin/gallery" element={
              <AdminRoute>
                <DashboardLayout>
                  <AdminGallery />
                </DashboardLayout>
              </AdminRoute>
            } />
            <Route path="/admin/highlights" element={
              <AdminRoute>
                <DashboardLayout>
                  <AdminHighlights />
                </DashboardLayout>
              </AdminRoute>
            } />
            <Route path="/admin/guests" element={
              <AdminRoute>
                <DashboardLayout>
                  <AdminGuests />
                </DashboardLayout>
              </AdminRoute>
            } />

            <Route path="/admin/evaluation" element={
              <AdminRoute>
                <DashboardLayout>
                  <AdminEvaluation />
                </DashboardLayout>
              </AdminRoute>
            } />

            <Route path="/admin/coordinators" element={
              <AdminRoute>
                <DashboardLayout>
                  <AdminCoordinators />
                </DashboardLayout>
              </AdminRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;