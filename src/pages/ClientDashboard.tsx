import React from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import api from '../services/api'

const ClientDashboard: React.FC = () => {
  const { data: stats } = useQuery('dashboard-stats', () =>
    api.get('/dashboard/stats').then(res => res.data)
  )

  const { data: recentBookings } = useQuery('recent-bookings', () =>
    api.get('/dashboard/recent-bookings').then(res => res.data)
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
        <p className="text-gray-600">Manage your appointments and discover new barbershops</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Bookings</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Bookings</span>
              <span className="font-semibold">{stats?.total_bookings || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Upcoming</span>
              <span className="font-semibold text-primary-600">{stats?.upcoming_bookings || 0}</span>
            </div>
          </div>
          <Link
            to="/bookings"
            className="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium"
          >
            View all bookings →
          </Link>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/shops"
              className="block w-full btn-primary text-center"
            >
              Find Barbershops
            </Link>
            <Link
              to="/bookings"
              className="block w-full btn-secondary text-center"
            >
              Manage Bookings
            </Link>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h3>
        {recentBookings && recentBookings.length > 0 ? (
          <div className="space-y-3">
            {recentBookings.slice(0, 5).map((booking: any) => (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{booking.service.name}</p>
                  <p className="text-sm text-gray-600">
                    {booking.shop.name} • {booking.barber.user.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(booking.booking_datetime).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {booking.status}
                  </span>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    ${booking.total_price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No bookings yet</p>
            <Link to="/shops" className="btn-primary">
              Book Your First Appointment
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default ClientDashboard
