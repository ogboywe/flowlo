import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'react-query'
import api from '../services/api'

const BookingPage: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>()
  const navigate = useNavigate()
  const [selectedService, setSelectedService] = useState<any>(null)
  const [selectedBarber, setSelectedBarber] = useState<any>(null)
  const [selectedDateTime, setSelectedDateTime] = useState('')
  const [notes, setNotes] = useState('')

  const { data: shop } = useQuery(
    ['shop', shopId],
    () => api.get(`/public/shops/${shopId}`).then(res => res.data),
    { enabled: !!shopId }
  )

  const createBookingMutation = useMutation(
    (bookingData: any) => api.post('/bookings', bookingData),
    {
      onSuccess: () => {
        navigate('/bookings')
      }
    }
  )

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedService || !selectedBarber || !selectedDateTime) {
      alert('Please fill in all required fields')
      return
    }

    createBookingMutation.mutate({
      service_id: selectedService.id,
      barber_id: selectedBarber.id,
      booking_datetime: selectedDateTime,
      notes,
    })
  }

  const generateTimeSlots = (): Date[] => {
    const slots: Date[] = []
    const today = new Date()
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      for (let hour = 9; hour <= 17; hour++) {
        const timeSlot = new Date(date)
        timeSlot.setHours(hour, 0, 0, 0)
        slots.push(timeSlot)
      }
    }
    
    return slots
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Appointment</h1>
        <p className="text-gray-600">at {shop.name}</p>
      </div>

      <form onSubmit={handleBooking} className="space-y-8">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Service</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shop.services?.map((service: any) => (
              <div
                key={service.id}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  selectedService?.id === service.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedService(service)}
              >
                <h3 className="font-semibold text-gray-900">{service.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{service.duration} min</span>
                  <span className="font-bold text-primary-600">${service.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedService && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Barber</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shop.barbers?.map((barber: any) => (
                <div
                  key={barber.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedBarber?.id === barber.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedBarber(barber)}
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-primary-600 font-semibold">
                        {barber.user.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{barber.user.name}</h3>
                      <p className="text-sm text-gray-600">{barber.bio}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedBarber && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Date & Time</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {generateTimeSlots().slice(0, 24).map((slot, index) => (
                <button
                  key={index}
                  type="button"
                  className={`p-3 text-sm border rounded-lg transition-colors ${
                    selectedDateTime === slot.toISOString()
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedDateTime(slot.toISOString())}
                >
                  <div className="font-medium">
                    {slot.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="text-xs">
                    {slot.toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit' 
                    })}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedDateTime && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Notes</h2>
            <textarea
              className="input-field"
              rows={4}
              placeholder="Any special requests or notes for your barber..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        )}

        {selectedService && selectedBarber && selectedDateTime && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-medium">{selectedService.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Barber:</span>
                <span className="font-medium">{selectedBarber.user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date & Time:</span>
                <span className="font-medium">
                  {new Date(selectedDateTime).toLocaleDateString()} at{' '}
                  {new Date(selectedDateTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{selectedService.duration} minutes</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary-600">${selectedService.price}</span>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={createBookingMutation.isLoading}
              className="w-full btn-primary mt-6 text-lg py-3"
            >
              {createBookingMutation.isLoading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}

export default BookingPage
