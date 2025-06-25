import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import api from '../services/api'

const ShopsPage: React.FC = () => {
  const [search, setSearch] = useState('')
  
  const { data: shopsData, isLoading } = useQuery(
    ['public-shops', search],
    () => api.get(`/public/shops?search=${search}`).then(res => res.data),
    { keepPreviousData: true }
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Find Your Perfect Barbershop
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Discover top-rated barbershops in your area
            </p>
            <div className="max-w-md mx-auto">
              <input
                type="text"
                placeholder="Search by shop name or city..."
                className="input-field"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shopsData?.data?.map((shop: any) => (
              <div key={shop.id} className="card hover:shadow-lg transition-shadow">
                <div className="aspect-w-16 aspect-h-9 mb-4">
                  {shop.logo ? (
                    <img
                      src={shop.logo}
                      alt={shop.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-lg font-medium">
                        {shop.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{shop.name}</h3>
                <p className="text-gray-600 mb-2">{shop.description}</p>
                <p className="text-sm text-gray-500 mb-4">
                  {shop.address}, {shop.city}, {shop.state}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {shop.services?.length || 0} services
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-gray-600">
                      {shop.barbers?.length || 0} barbers
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Starting from</p>
                    <p className="text-lg font-semibold text-primary-600">
                      ${Math.min(...(shop.services?.map((s: any) => s.price) || [0]))}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/shops/${shop.id}`}
                  className="block w-full btn-primary text-center"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}

        {shopsData?.data?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No barbershops found</p>
            <p className="text-gray-400">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ShopsPage
