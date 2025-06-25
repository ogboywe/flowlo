import React from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import api from '../services/api'

const ShopOwnerDashboard: React.FC = () => {
  const { data: stats } = useQuery('dashboard-stats', () =>
    api.get('/dashboard/stats').then(res => res.data)
  )

  const { data: recentBookings } = useQuery('recent-bookings', () =>
    api.get('/dashboard/recent-bookings').then(res => res.data)
  )

  const { data: shops } = useQuery('my-shops', () =>
    api.get('/shops').then(res => res.data.data)
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Shop Owner Dashboard</h1>
        <p className="text-gray-600">Manage your barbershops and track performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Bookings</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats?.total_bookings || 0}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Pending</h3>
          <p className="text-2xl font-bold text-yellow-600 mt-2">{stats?.pending_bookings || 0}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Monthly Revenue</h3>
          <p className="text-2xl font-bold text-green-600 mt-2">${stats?.monthly_revenue || 0}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Barbers</h3>
          <p className="text-2xl font-bold text-primary-600 mt-2">{stats?.total_barbers || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Shops</h3>
          {shops && shops.length > 0 ? (
            <div className="space-y-3">
              {shops.map((shop: any) => (
                <div key={shop.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{shop.name}</p>
                    <p className="text-sm text-gray-600">{shop.city}, {shop.state}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                      shop.subscription_status === 'active' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {shop.subscription_status}
                    </span>
                  </div>
                  <Link
                    to={`/shops/${shop.id}/manage`}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Manage
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No shops yet</p>
              <button className="btn-primary">
                Create Your First Shop
              </button>
            </div>
          )}
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
                      {booking.client.name} • {booking.barber.user.name}
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
              <p className="text-gray-500">No recent bookings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ShopOwnerDashboard
