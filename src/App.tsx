import React, { createContext, useContext, useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import api from './services/api'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ClientDashboard from './pages/ClientDashboard'
import ShopOwnerDashboard from './pages/ShopOwnerDashboard'
import BarberDashboard from './pages/BarberDashboard'
import AdminDashboard from './pages/AdminDashboard'
import ShopsPage from './pages/ShopsPage'
import ShopDetailPage from './pages/ShopDetailPage'
import BookingPage from './pages/BookingPage'
import BookingsPage from './pages/BookingsPage'

interface User {
  id: number
  name: string
  email: string
  role: 'client' | 'barber' | 'shop_owner' | 'admin'
  phone?: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [isLoading, setIsLoading] = useState(true)

  const { refetch } = useQuery(
    'me',
    () => api.get('/auth/me').then(res => res.data.user),
    {
      enabled: !!token,
      onSuccess: (userData) => {
        setUser(userData)
        setIsLoading(false)
      },
      onError: () => {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
        setIsLoading(false)
      }
    }
  )

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      refetch()
    } else {
      setIsLoading(false)
    }
  }, [token, refetch])

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password })
    const { user: userData, token: authToken } = response.data
    
    localStorage.setItem('token', authToken)
    setToken(authToken)
    setUser(userData)
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
  }

  const register = async (userData: any) => {
    const response = await api.post('/auth/register', userData)
    const { user: newUser, token: authToken } = response.data
    
    localStorage.setItem('token', authToken)
    setToken(authToken)
    setUser(newUser)
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    delete api.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

const ProtectedRoute: React.FC<{ 
  children: React.ReactNode
  allowedRoles?: string[]
}> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />
  }

  return <>{children}</>
}

const DashboardRouter: React.FC = () => {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" />

  switch (user.role) {
    case 'client':
      return <ClientDashboard />
    case 'barber':
      return <BarberDashboard />
    case 'shop_owner':
      return <ShopOwnerDashboard />
    case 'admin':
      return <AdminDashboard />
    default:
      return <Navigate to="/login" />
  }
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/shops" element={<ShopsPage />} />
          <Route path="/shops/:shopId" element={<ShopDetailPage />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <DashboardRouter />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/bookings" element={
            <ProtectedRoute>
              <Layout>
                <BookingsPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/book/:shopId" element={
            <ProtectedRoute allowedRoles={['client']}>
              <Layout>
                <BookingPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/barber" element={
            <ProtectedRoute allowedRoles={['barber']}>
              <Layout>
                <BarberDashboard />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
