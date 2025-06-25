import React from 'react'
import { useQuery } from 'react-query'
import api from '../services/api'

const AdminDashboard: React.FC = () => {
  const { data: stats } = useQuery('dashboard-stats', () =>
    api.get('/dashboard/stats').then(res => res.data)
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Shops</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats?.total_shops || 0}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Active Shops</h3>
          <p className="text-2xl font-bold text-green-600 mt-2">{stats?.active_shops || 0}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Users</h3>
          <p className="text-2xl font-bold text-primary-600 mt-2">{stats?.total_users || 0}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Bookings</h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">{stats?.total_bookings || 0}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Monthly Revenue</h3>
          <p className="text-2xl font-bold text-green-600 mt-2">${stats?.monthly_revenue || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Shop Approval Rate</span>
              <span className="font-semibold">
                {stats?.active_shops && stats?.total_shops 
                  ? Math.round((stats.active_shops / stats.total_shops) * 100) 
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Bookings per Shop</span>
              <span className="font-semibold">
                {stats?.total_bookings && stats?.active_shops 
                  ? Math.round(stats.total_bookings / stats.active_shops) 
                  : 0}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full btn-primary">
              Review Pending Shops
            </button>
            <button className="w-full btn-secondary">
              Manage Users
            </button>
            <button className="w-full btn-secondary">
              Platform Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
