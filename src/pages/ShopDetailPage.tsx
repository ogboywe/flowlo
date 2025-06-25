import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { useAuth } from '../App'
import api from '../services/api'

const ShopDetailPage: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>()
  const { user } = useAuth()

  const { data: shop, isLoading } = useQuery(
    ['shop', shopId],
    () => api.get(`/public/shops/${shopId}`).then(res => res.data),
    { enabled: !!shopId }
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Shop not found</h1>
          <Link to="/shops" className="btn-primary">
            Browse Other Shops
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              {shop.logo ? (
                <img
                  src={shop.logo}
                  alt={shop.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-4xl font-bold">
                    {shop.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{shop.name}</h1>
              <p className="text-lg text-gray-600 mb-6">{shop.description}</p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {shop.address}, {shop.city}, {shop.state} {shop.zip_code}
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {shop.phone}
                </div>
                {shop.website && (
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                    </svg>
                    <a href={shop.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                      Visit Website
                    </a>
                  </div>
                )}
              </div>

              {user?.role === 'client' && (
                <Link
                  to={`/book/${shop.id}`}
                  className="btn-primary text-lg px-8 py-3"
                >
                  Book Appointment
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Services</h2>
            <div className="space-y-4">
              {shop.services?.map((service: any) => (
                <div key={service.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-600">{service.description}</p>
                    <p className="text-sm text-gray-500">{service.duration} minutes</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary-600">${service.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Team</h2>
            <div className="space-y-4">
              {shop.barbers?.map((barber: any) => (
                <div key={barber.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-primary-600 font-semibold">
                      {barber.user.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{barber.user.name}</h3>
                    <p className="text-sm text-gray-600">{barber.bio}</p>
                    {barber.specialties && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {barber.specialties.map((specialty: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShopDetailPage
