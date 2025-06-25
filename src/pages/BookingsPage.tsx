import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '../services/api'

const BookingsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('all')
  const queryClient = useQueryClient()

  const { data: bookingsData, isLoading } = useQuery(
    'bookings',
    () => api.get('/bookings').then(res => res.data)
  )

  const updateStatusMutation = useMutation(
    ({ bookingId, status }: { bookingId: number; status: string }) =>
      api.put(`/bookings/${bookingId}/status`, { status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bookings')
      }
    }
  )

  const cancelBookingMutation = useMutation(
    (bookingId: number) => api.delete(`/bookings/${bookingId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bookings')
      }
    }
  )

  const filteredBookings = bookingsData?.data?.filter((booking: any) => {
    if (statusFilter === 'all') return true
    return booking.status === statusFilter
  }) || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'no_show':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <div className="flex space-x-2">
          <select
            className="input-field"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No bookings found</p>
          <a href="/shops" className="btn-primary">
            Book Your First Appointment
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking: any) => (
            <div key={booking.id} className="card">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {booking.service.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Shop:</span> {booking.shop.name}
                    </p>
                    <p>
                      <span className="font-medium">Barber:</span> {booking.barber.user.name}
                    </p>
                    <p>
                      <span className="font-medium">Date:</span>{' '}
                      {new Date(booking.booking_datetime).toLocaleDateString()} at{' '}
                      {new Date(booking.booking_datetime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p>
                      <span className="font-medium">Duration:</span> {booking.service.duration} minutes
                    </p>
                    {booking.notes && (
                      <p>
                        <span className="font-medium">Notes:</span> {booking.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end space-y-2">
                  <p className="text-lg font-bold text-primary-600">
                    ${booking.total_price}
                  </p>
                  
                  <div className="flex space-x-2">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatusMutation.mutate({
                            bookingId: booking.id,
                            status: 'confirmed'
                          })}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => cancelBookingMutation.mutate(booking.id)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    
                    {booking.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => updateStatusMutation.mutate({
                            bookingId: booking.id,
                            status: 'completed'
                          })}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Mark Complete
                        </button>
                        <button
                          onClick={() => cancelBookingMutation.mutate(booking.id)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BookingsPage
