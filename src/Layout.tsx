import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/button'
import { 
  Calendar, 
  Home, 
  LogOut, 
  Settings, 
  Store,
  Users,
  BarChart3
} from 'lucide-react'

const Layout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const getNavItems = () => {
    const baseItems = [
      { to: '/dashboard', icon: Home, label: 'Dashboard' },
      { to: '/bookings', icon: Calendar, label: 'Bookings' },
    ]

    if (user?.role === 'barber') {
      return [
        { to: '/barber/dashboard', icon: Home, label: 'Dashboard' },
        { to: '/bookings', icon: Calendar, label: 'My Bookings' },
      ]
    }

    if (user?.role === 'shop_owner') {
      return [
        { to: '/owner/dashboard', icon: Home, label: 'Dashboard' },
        { to: '/bookings', icon: Calendar, label: 'All Bookings' },
        { to: '/shops', icon: Store, label: 'My Shops' },
        { to: '/staff', icon: Users, label: 'Staff' },
        { to: '/analytics', icon: BarChart3, label: 'Analytics' },
      ]
    }

    if (user?.role === 'admin') {
      return [
        { to: '/admin/dashboard', icon: Home, label: 'Admin Dashboard' },
        { to: '/shops', icon: Store, label: 'All Shops' },
        { to: '/users', icon: Users, label: 'Users' },
        { to: '/analytics', icon: BarChart3, label: 'Platform Analytics' },
      ]
    }

    return baseItems
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">Flowlo</h1>
          <p className="text-sm text-gray-600">Barber Booking Platform</p>
        </div>
        
        <nav className="mt-6">
          {getNavItems().map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-64 p-6 border-t">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
