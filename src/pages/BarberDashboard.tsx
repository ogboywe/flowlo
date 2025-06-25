import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { 
  Calendar, 
  Clock, 
  User, 
  DollarSign,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Users,
  CreditCard,
  AlertTriangle
} from 'lucide-react'
import { format, isToday, isTomorrow } from 'date-fns'
import { toast } from 'react-hot-toast'

const BarberDashboard = () => {
  const queryClient = useQueryClient()
  const [showSubscriptionSetup, setShowSubscriptionSetup] = useState(false)

  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => fetch('/api/bookings', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json())
  })

  const { data: subscriptionData, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['barber-subscription'],
    queryFn: () => fetch('/api/barber/subscription', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json())
  })

  const createSubscriptionMutation = useMutation({
    mutationFn: () => 
      fetch('/api/barber/subscription', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }).then(res => res.json()),
    onSuccess: (data) => {
      if (data.client_secret) {
        window.location.href = `https://checkout.stripe.com/pay/${data.client_secret}`
      }
      queryClient.invalidateQueries({ queryKey: ['barber-subscription'] })
      toast.success('Subscription setup initiated!')
    },
    onError: () => {
      toast.error('Failed to create subscription')
    }
  })

  const handleSetupSubscription = () => {
    createSubscriptionMutation.mutate()
  }

  const bookings = bookingsData?.data || []
  const subscription = subscriptionData?.subscription
  const hasActiveSubscription = subscription?.status === 'active'

  const todayBookings = bookings.filter(booking => 
    isToday(new Date(booking.booking_datetime)) && 
    !['cancelled'].includes(booking.status)
  )

  const tomorrowBookings = bookings.filter(booking => 
    isTomorrow(new Date(booking.booking_datetime)) && 
    !['cancelled'].includes(booking.status)
  )

  const pendingBookings = bookings.filter(booking => booking.status === 'pending')

  const thisWeekEarnings = bookings
    .filter(booking => {
      const bookingDate = new Date(booking.booking_datetime)
      const now = new Date()
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
      return bookingDate >= weekStart && booking.status === 'completed'
    })
    .reduce((sum, booking) => sum + (booking.total_price * 0.7), 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const BookingCard = ({ booking, showActions = true }: { booking: any; showActions?: boolean }) => (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{booking.service?.name || 'Service'}</h3>
          <p className="text-sm text-gray-600">Client: {booking.client?.name || 'Client'}</p>
        </div>
        <Badge className={getStatusColor(booking.status)}>
          {booking.status}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
        <div className="flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          {format(new Date(booking.booking_datetime), 'h:mm a')}
        </div>
        <div className="flex items-center">
          <DollarSign className="w-3 h-3 mr-1" />
          ${booking.total_price}
        </div>
      </div>

      {booking.notes && (
        <div className="text-sm">
          <p className="text-gray-600 font-medium">Notes:</p>
          <p className="text-gray-500">{booking.notes}</p>
        </div>
      )}

      {showActions && booking.status === 'pending' && (
        <div className="flex space-x-2">
          <Button size="sm" className="flex-1">
            Accept
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            Decline
          </Button>
        </div>
      )}

      {showActions && booking.status === 'confirmed' && (
        <Button size="sm" className="w-full">
          Mark Complete
        </Button>
      )}
    </div>
  )

  if (isLoading || subscriptionLoading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Barber Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back!</p>
      </div>

      {!hasActiveSubscription && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Subscription Required
            </CardTitle>
            <CardDescription className="text-yellow-700">
              You need an active subscription ($30/month) to accept bookings and earn money.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleSetupSubscription}
              disabled={createSubscriptionMutation.isPending}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {createSubscriptionMutation.isPending ? 'Setting up...' : 'Setup $30/month Subscription'}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayBookings.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingBookings.length} pending approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tomorrow</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tomorrowBookings.length}</div>
            <p className="text-xs text-muted-foreground">
              appointments scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Week Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${thisWeekEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              70% commission rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hasActiveSubscription ? (
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800">Inactive</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              $30/month subscription
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-yellow-500" />
              Pending Approvals ({pendingBookings.length})
            </CardTitle>
            <CardDescription>
              Bookings waiting for your confirmation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingBookings.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                <p className="text-gray-500">No pending bookings to review.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingBookings.slice(0, 3).map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
                {pendingBookings.length > 3 && (
                  <Button variant="outline" className="w-full">
                    View All {pendingBookings.length} Pending
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Today's Schedule
            </CardTitle>
            <CardDescription>
              Your appointments for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayBookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments today</h3>
                <p className="text-gray-500">Enjoy your day off!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common tasks for managing your schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col">
              <Clock className="w-6 h-6 mb-2" />
              Set Availability
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <DollarSign className="w-6 h-6 mb-2" />
              View Earnings
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col"
              onClick={() => setShowSubscriptionSetup(true)}
            >
              <CreditCard className="w-6 h-6 mb-2" />
              Manage Subscription
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BarberDashboard
