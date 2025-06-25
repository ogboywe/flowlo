import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from 'sonner'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ShopsPage from './pages/ShopsPage'
import ShopDetailPage from './pages/ShopDetailPage'
import BookingPage from './pages/BookingPage'
import BookingsPage from './pages/BookingsPage'
import ClientDashboard from './pages/ClientDashboard'
import BarberDashboard from './pages/BarberDashboard'
import ShopOwnerDashboard from './pages/ShopOwnerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import OnboardingDashboard from './pages/OnboardingDashboard'
import ShopWebsite from './pages/ShopWebsite'
import ShopReports from './pages/ShopReports'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/shops" element={<ShopsPage />} />
              <Route path="/shops/:shopId" element={<ShopDetailPage />} />
              <Route path="/book/:shopId" element={<BookingPage />} />
              
              <Route element={<Layout />}>
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <ClientDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/bookings" 
                  element={
                    <ProtectedRoute>
                      <BookingsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/barber/dashboard" 
                  element={
                    <ProtectedRoute roles={['barber']}>
                      <BarberDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/owner/dashboard" 
                  element={
                    <ProtectedRoute roles={['shop_owner']}>
                      <ShopOwnerDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/book" element={<BookingPage />} />
                <Route 
                  path="/bookings" 
                  element={
                    <ProtectedRoute>
                      <BookingsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/client/dashboard" 
                  element={
                    <ProtectedRoute roles={['client']}>
                      <ClientDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/barber/dashboard" 
                  element={
                    <ProtectedRoute roles={['barber']}>
                      <BarberDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/shop-owner/dashboard" 
                  element={
                    <ProtectedRoute roles={['shop_owner']}>
                      <ShopOwnerDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <ProtectedRoute roles={['admin', 'super_admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/onboarding/dashboard" 
                  element={
                    <ProtectedRoute roles={['onboarder', 'admin', 'super_admin']}>
                      <OnboardingDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/shop/:shopId/website" 
                  element={<ShopWebsite />} 
                />
                <Route 
                  path="/shop/:shopId/reports" 
                  element={
                    <ProtectedRoute roles={['shop_owner', 'admin', 'super_admin']}>
                      <ShopReports />
                    </ProtectedRoute>
                  } 
                />
              </Route>
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
