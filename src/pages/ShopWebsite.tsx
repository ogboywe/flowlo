import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { 
  MapPin, 
  Phone, 
  Clock, 
  Star,
  Calendar,
  Scissors,
  User,
  ArrowLeft
} from 'lucide-react'
import { format } from 'date-fns'

const ShopWebsite = () => {
  const { shopId } = useParams()
  const navigate = useNavigate()

  const { data: websiteData, isLoading } = useQuery({
    queryKey: ['shop-website', shopId],
    queryFn: () => fetch(`http://localhost:8000/api/shop/${shopId}/website`).then(res => res.json())
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!websiteData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Shop Not Found</h1>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    )
  }

  const { shop, website, barbers, services } = websiteData

  return (
    <div className="min-h-screen bg-gray-50">
      <div 
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16"
        style={{ backgroundColor: website.theme_color }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <Button 
            variant="outline" 
            className="mb-6 text-white border-white hover:bg-white hover:text-gray-900"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">{shop.name}</h1>
            <p className="text-xl mb-6 opacity-90">{shop.description}</p>
            
            <div className="flex flex-wrap justify-center gap-6 text-lg">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                {shop.address}, {shop.city}, {shop.state} {shop.zip_code}
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                {shop.phone}
              </div>
              <div className="flex items-center">
                <Star className="w-5 h-5 mr-2 fill-current" />
                4.8 Rating
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Scissors className="w-6 h-6 mr-2" />
                  Our Services
                </CardTitle>
                <CardDescription>
                  Professional barbering services tailored to your style
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <div key={service.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{service.name}</h3>
                        <span className="text-xl font-bold text-green-600">${service.price}</span>
                      </div>
                      <p className="text-gray-600 mb-2">{service.description}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {service.duration} minutes
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-6 h-6 mr-2" />
                  Meet Our Barbers
                </CardTitle>
                <CardDescription>
                  Experienced professionals ready to serve you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {barbers.map((barber) => (
                    <div key={barber.id} className="text-center">
                      <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <User className="w-12 h-12 text-gray-600" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{barber.user.name}</h3>
                      <p className="text-gray-600 mb-3">{barber.bio}</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {barber.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-6 h-6 mr-2" />
                  Book Appointment
                </CardTitle>
                <CardDescription>
                  Schedule your visit today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full mb-4"
                  onClick={() => navigate(`/book?shop=${shop.id}`)}
                >
                  Book Now
                </Button>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                    <div>
                      <div className="font-medium">Hours</div>
                      <div className="text-gray-600">Mon-Fri: 9AM-7PM</div>
                      <div className="text-gray-600">Sat: 9AM-6PM</div>
                      <div className="text-gray-600">Sun: 10AM-5PM</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-500" />
                  <span>{shop.phone}</span>
                </div>
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 mr-2 text-gray-500 mt-1" />
                  <div>
                    <div>{shop.address}</div>
                    <div>{shop.city}, {shop.state} {shop.zip_code}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-6 h-6 mr-2" />
                  Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold">4.8</div>
                  <div className="flex justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <div className="text-gray-600">Based on 127 reviews</div>
                </div>
                <div className="space-y-3">
                  <div className="border-l-4 border-blue-500 pl-3">
                    <div className="font-medium">Great service!</div>
                    <div className="text-sm text-gray-600">- John D.</div>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-3">
                    <div className="font-medium">Professional and friendly</div>
                    <div className="text-sm text-gray-600">- Sarah M.</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShopWebsite
