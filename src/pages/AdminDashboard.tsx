import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { 
  Users, 
  Store, 
  DollarSign, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const AdminDashboard = () => {
  const queryClient = useQueryClient()

  const { data: shopsData, isLoading: shopsLoading } = useQuery({
    queryKey: ['admin-shops'],
    queryFn: () => fetch('/api/admin/shops', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json())
  })

  const { data: pendingShopsData, isLoading: pendingLoading } = useQuery({
    queryKey: ['admin-pending-shops'],
    queryFn: () => fetch('/api/admin/pending-shops', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json())
  })

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => fetch('/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json())
  })

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => fetch('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json())
  })

  const approveShopMutation = useMutation({
    mutationFn: (shopId: string) => 
      fetch(`/api/admin/shops/${shopId}/approve`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-shops'] })
      queryClient.invalidateQueries({ queryKey: ['admin-shops'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      toast.success('Shop approved successfully!')
    },
    onError: () => {
      toast.error('Failed to approve shop')
    }
  })

  const rejectShopMutation = useMutation({
    mutationFn: ({ shopId, reason }: { shopId: string; reason: string }) => 
      fetch(`/api/admin/shops/${shopId}/reject`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-shops'] })
      queryClient.invalidateQueries({ queryKey: ['admin-shops'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      toast.success('Shop rejected successfully!')
    },
    onError: () => {
      toast.error('Failed to reject shop')
    }
  })

  const shops = shopsData?.data || []
  const pendingShops = pendingShopsData?.data || []
  const users = usersData?.data || []
  const stats = statsData || {}

  const handleApproveShop = (shopId: string) => {
    approveShopMutation.mutate(shopId)
  }

  const handleRejectShop = (shopId: string) => {
    const reason = prompt('Please provide a reason for rejection:')
    if (reason) {
      rejectShopMutation.mutate({ shopId, reason })
    }
  }

  if (shopsLoading || usersLoading || pendingLoading || statsLoading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shops</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_shops || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active_shops || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending_shops || 0}</div>
            <p className="text-xs text-muted-foreground">
              Shops awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_users || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total_barbers || 0} barbers, {stats.total_shop_owners || 0} owners
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats.monthly_revenue || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.approval_rate || 0}% approval rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending Shops ({pendingShops.length})</TabsTrigger>
          <TabsTrigger value="shops">All Shops ({shops.length})</TabsTrigger>
          <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
                Review Pending Shops
              </CardTitle>
              <CardDescription>
                Shops waiting for approval to join the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingShops.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                  <p className="text-gray-500">No shops pending approval.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingShops.map((shop) => (
                    <div key={shop.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{shop.name}</h3>
                          <p className="text-sm text-gray-600">Owner: {shop.owner?.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">{shop.city}, {shop.state}</p>
                          <p className="text-sm text-gray-500">{shop.phone}</p>
                          {shop.description && (
                            <p className="text-sm text-gray-600 mt-2">{shop.description}</p>
                          )}
                        </div>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          Pending
                        </Badge>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleApproveShop(shop.id)}
                          disabled={approveShopMutation.isPending}
                        >
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleRejectShop(shop.id)}
                          disabled={rejectShopMutation.isPending}
                        >
                          <ThumbsDown className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shops">
          <Card>
            <CardHeader>
              <CardTitle>All Shops</CardTitle>
              <CardDescription>
                Complete list of shops on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shops.map((shop) => (
                  <div key={shop.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{shop.name}</h3>
                        <p className="text-sm text-gray-600">Owner: {shop.owner?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{shop.city}, {shop.state}</p>
                      </div>
                      <Badge 
                        variant={shop.subscription_status === 'active' ? 'default' : 'secondary'}
                        className={
                          shop.subscription_status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : shop.subscription_status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {shop.subscription_status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Platform Users</CardTitle>
              <CardDescription>
                All registered users on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        {user.phone && (
                          <p className="text-sm text-gray-500">{user.phone}</p>
                        )}
                      </div>
                      <Badge variant="outline">
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdminDashboard
