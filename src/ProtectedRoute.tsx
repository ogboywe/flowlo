import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  roles?: string[]
  permissions?: string[]
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles, permissions }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  const hasPermission = (userRole: string, requiredPermissions?: string[]) => {
    if (!requiredPermissions) return true
    
    const rolePermissions: Record<string, string[]> = {
      'super_admin': ['all'],
      'admin': ['manage_shops', 'view_reports', 'manage_users'],
      'onboarder': ['create_shops', 'generate_credentials'],
      'shop_owner': ['manage_own_shop', 'view_own_reports', 'manage_barbers'],
      'barber': ['view_own_data', 'manage_appointments'],
      'client': ['book_appointments', 'view_own_bookings']
    }
    
    const userPermissions = rolePermissions[userRole] || []
    return userPermissions.includes('all') || 
           requiredPermissions.some(perm => userPermissions.includes(perm))
  }

  if (permissions && !hasPermission(user.role, permissions)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
