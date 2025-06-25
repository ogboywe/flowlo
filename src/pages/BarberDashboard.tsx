import React from 'react'
import { useQuery } from 'react-query'
import api from '../services/api'

const BarberDashboard: React.FC = () => {
  const { data: stats } = useQuery('dashboard-stats', () =>
    api.get('/dashboard/stats').then(res => res.data)
  )

  const { data: recentBookings } = useQuery('recent-bookings', () =>
    api.get('/dashboard/recent-bookings').then(res => res.data)
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Barber Dashboard</h1>
        <p className="text-gray-600">Manage your appointments and track your earnings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Bookings</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats?.total_bookings || 0}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Pending</h3>
          <p className="text-2xl font-bold text-yellow-600 mt-2">{stats?.pending_bookings || 0}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Monthly Earnings</h3>
          <p className="text-2xl font-bold text-green-600 mt-2">${stats?.monthly_earnings || 0}</p>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Appointments</h3>
        {recentBookings && recentBookings.length > 0 ? (
          <div className="space-y-3">
            {recentBookings
              .filter((booking: any) => {
                const today = new Date().toDateString()
                const bookingDate = new Date(booking.booking_datetime).toDateString()
                return today === bookingDate
              })
              .map((booking: any) => (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{booking.service.name}</p>
                    <p className="text-sm text-gray-600">Client: {booking.client.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.booking_datetime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
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
            <p className="text-gray-500">No appointments for today</p>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h3>
        {recentBookings && recentBookings.length > 0 ? (
          <div className="space-y-3">
            {recentBookings.slice(0, 10).map((booking: any) => (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{booking.service.name}</p>
                  <p className="text-sm text-gray-600">Client: {booking.client.name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(booking.booking_datetime).toLocaleDateString()} at{' '}
                    {new Date(booking.booking_datetime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
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
            <p className="text-gray-500">No bookings yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default BarberDashboard
