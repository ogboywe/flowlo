import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  BarChart3,
  Star,
  ArrowUpRight
} from 'lucide-react'
import { format } from 'date-fns'

const ShopReports = () => {
  const { shopId } = useParams()

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['shop-reports', shopId],
    queryFn: () => fetch(`http://localhost:8000/api/shop/${shopId}/reports`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json())
  })

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    )
  }

  if (!reportsData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Reports Not Available</h1>
          <p className="text-gray-600">Unable to load shop reports.</p>
        </div>
      </div>
    )
  }

  const { total_revenue, total_tips, shop_commission, total_bookings, barber_performance, recent_bookings } = reportsData

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shop Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive business analytics and performance metrics</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <BarChart3 className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${total_revenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +12.5%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shop Commission</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${shop_commission.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +8.2%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tips</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${total_tips.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +15.3%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total_bookings}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +5.7%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Barber Performance
            </CardTitle>
            <CardDescription>
              Individual barber metrics and earnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {barber_performance.map((performance: any) => (
                <div key={performance.barber_id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{performance.name}</h3>
                      <p className="text-sm text-gray-600">Barber ID: {performance.barber_id}</p>
                    </div>
                    <Badge variant="secondary">
                      Commission Earned
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-gray-900">{performance.total_bookings}</div>
                      <div className="text-gray-600">Bookings</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">${performance.total_revenue.toFixed(2)}</div>
                      <div className="text-gray-600">Revenue</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">$0.00</div>
                      <div className="text-gray-600">Tips</div>
                    </div>
                    <div>
                      <div className="font-medium text-green-600">${performance.commission_earned.toFixed(2)}</div>
                      <div className="text-gray-600">Earned</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Recent Bookings
            </CardTitle>
            <CardDescription>
              Latest appointments and transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recent_bookings.slice(0, 8).map((booking: any) => (
                <div key={booking.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{booking.service?.name || 'Service'}</div>
                    <div className="text-xs text-gray-600">
                      {booking.appointment_time ? format(new Date(booking.appointment_time), 'MMM d, h:mm a') : 'No date'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">${booking.total_amount || '0.00'}</div>
                    <Badge 
                      variant={booking.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Commission Settings
          </CardTitle>
          <CardDescription>
            Current commission rates and earnings distribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Shop Default Commission Rate</span>
                <span className="text-lg font-bold">40%</span>
              </div>
              <p className="text-sm text-gray-600">
                Default commission rate for new barbers
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-blue-900">Shop Earnings</span>
                  <span className="text-lg font-bold text-blue-900">${shop_commission.toFixed(2)}</span>
                </div>
                <p className="text-sm text-blue-700">
                  Total commission earned by shop
                </p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-green-900">Barber Earnings</span>
                  <span className="text-lg font-bold text-green-900">
                    ${barber_performance.reduce((sum: number, p: any) => sum + p.commission_earned, 0).toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-green-700">
                  Total commission earned by barbers
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ShopReports
