import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { 
  UserPlus, 
  Store, 
  Key, 
  History,
  Plus,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

const OnboardingDashboard = () => {
  const queryClient = useQueryClient()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    shop_name: '',
    shop_description: '',
    shop_address: '',
    shop_city: '',
    shop_state: '',
    shop_zip_code: '',
    shop_phone: '',
    owner_name: '',
    owner_email: '',
    commission_rate: 0.4
  })

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['onboarding-history'],
    queryFn: () => fetch('http://localhost:8000/api/onboarding/history', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json())
  })

  const { data: credentialsData, isLoading: credentialsLoading } = useQuery({
    queryKey: ['generated-credentials'],
    queryFn: () => fetch('http://localhost:8000/api/credentials', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json())
  })

  const createShopMutation = useMutation({
    mutationFn: (data: typeof formData) => 
      fetch('http://localhost:8000/api/onboarding/shop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      }).then(res => res.json()),
    onSuccess: (data) => {
      toast.success('Shop and owner created successfully!')
      setShowCreateForm(false)
      setFormData({
        shop_name: '',
        shop_description: '',
        shop_address: '',
        shop_city: '',
        shop_state: '',
        shop_zip_code: '',
        shop_phone: '',
        owner_name: '',
        owner_email: '',
        commission_rate: 0.4
      })
      queryClient.invalidateQueries({ queryKey: ['onboarding-history'] })
      queryClient.invalidateQueries({ queryKey: ['generated-credentials'] })
    },
    onError: () => {
      toast.error('Failed to create shop')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createShopMutation.mutate(formData)
  }

  const history = historyData?.data || []
  const credentials = credentialsData?.data || []

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Onboarding Dashboard</h1>
          <p className="text-gray-600 mt-1">Create new shops and manage owner credentials</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Shop
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shops Created</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{history.length}</div>
            <p className="text-xs text-muted-foreground">
              Shops onboarded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credentials Generated</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{credentials.length}</div>
            <p className="text-xs text-muted-foreground">
              Login credentials created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active This Month</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {history.filter(h => {
                const created = new Date(h.created_at)
                const now = new Date()
                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              New shops this month
            </p>
          </CardContent>
        </Card>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="w-5 h-5 mr-2" />
              Create New Shop & Owner
            </CardTitle>
            <CardDescription>
              Generate shop and owner account with login credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Shop Name</label>
                  <Input
                    value={formData.shop_name}
                    onChange={(e) => setFormData({...formData, shop_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Owner Name</label>
                  <Input
                    value={formData.owner_name}
                    onChange={(e) => setFormData({...formData, owner_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Owner Email</label>
                  <Input
                    type="email"
                    value={formData.owner_email}
                    onChange={(e) => setFormData({...formData, owner_email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <Input
                    value={formData.shop_phone}
                    onChange={(e) => setFormData({...formData, shop_phone: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <Input
                    value={formData.shop_address}
                    onChange={(e) => setFormData({...formData, shop_address: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <Input
                    value={formData.shop_city}
                    onChange={(e) => setFormData({...formData, shop_city: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <Input
                    value={formData.shop_state}
                    onChange={(e) => setFormData({...formData, shop_state: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ZIP Code</label>
                  <Input
                    value={formData.shop_zip_code}
                    onChange={(e) => setFormData({...formData, shop_zip_code: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Commission Rate</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.commission_rate}
                    onChange={(e) => setFormData({...formData, commission_rate: parseFloat(e.target.value)})}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Shop Description</label>
                <Textarea
                  value={formData.shop_description}
                  onChange={(e) => setFormData({...formData, shop_description: e.target.value})}
                  rows={3}
                  required
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit" disabled={createShopMutation.isPending}>
                  {createShopMutation.isPending ? 'Creating...' : 'Create Shop & Owner'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="w-5 h-5 mr-2" />
              Onboarding History
            </CardTitle>
            <CardDescription>
              Recently created shops and owners
            </CardDescription>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8">
                <Store className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No shops created yet</h3>
                <p className="text-gray-500">Start onboarding your first shop.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.slice(0, 5).map((record) => (
                  <div key={record.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{record.shop_name}</h3>
                        <p className="text-sm text-gray-600">{record.owner_name} - {record.owner_email}</p>
                      </div>
                      <Badge variant="secondary">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {record.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      Created {format(new Date(record.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="w-5 h-5 mr-2" />
              Generated Credentials
            </CardTitle>
            <CardDescription>
              Login credentials for shop owners and barbers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {credentialsLoading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : credentials.length === 0 ? (
              <div className="text-center py-8">
                <Key className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No credentials generated</h3>
                <p className="text-gray-500">Credentials will appear here as you create them.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {credentials.slice(0, 5).map((cred) => (
                  <div key={cred.user_id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{cred.email}</h3>
                        <p className="text-sm text-gray-600">Password: {cred.password}</p>
                      </div>
                      <Badge variant={cred.role === 'shop_owner' ? 'default' : 'secondary'}>
                        {cred.role.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      Created {format(new Date(cred.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default OnboardingDashboard
