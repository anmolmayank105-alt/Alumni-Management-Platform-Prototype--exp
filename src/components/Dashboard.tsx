import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  User, 
  Calendar, 
  Users, 
  TrendingUp, 
  MapPin, 
  Building, 
  ArrowRight,
  MessageCircle,
  Heart
} from 'lucide-react';

interface DashboardProps {
  user: any;
  onNavigate: (page: string) => void;
}

export function Dashboard({ user, onNavigate }: DashboardProps) {
  const quickActions = [
    {
      icon: User,
      title: 'Profile',
      description: 'Update your information and career details',
      action: () => onNavigate('profile'),
      color: 'bg-blue-500'
    },
    {
      icon: Calendar,
      title: 'Events',
      description: 'Browse upcoming alumni events and reunions',
      action: () => onNavigate('events'),
      color: 'bg-green-500'
    },
    {
      icon: Heart,
      title: 'Fundraisers',
      description: 'Support your university through meaningful contributions',
      action: () => onNavigate('fundraisers'),
      color: 'bg-red-500'
    },
    {
      icon: Users,
      title: 'Networking',
      description: 'Connect with fellow alumni in your area',
      action: () => {},
      color: 'bg-purple-500'
    }
  ];

  const recentAlumni = [
    { name: 'Sarah Johnson', year: 2020, major: 'Engineering', company: 'Google' },
    { name: 'Mike Chen', year: 2019, major: 'Business', company: 'McKinsey' },
    { name: 'Emily Davis', year: 2021, major: 'Design', company: 'Apple' },
    { name: 'Alex Rodriguez', year: 2018, major: 'Medicine', company: 'Johns Hopkins' }
  ];

  const upcomingEvents = [
    { title: 'Alumni Mixer 2024', date: 'Dec 15', location: 'Downtown Campus', rsvp: 45 },
    { title: 'Career Workshop', date: 'Dec 22', location: 'Virtual', rsvp: 78 },
    { title: 'Holiday Reunion', date: 'Dec 30', location: 'Alumni Hall', rsvp: 156 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-gray-900">Welcome back, {user.name.split(' ')[0]}!</h1>
          <p className="text-gray-600 mt-2">Here's what's happening in your alumni network</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer rounded-xl" onClick={action.action}>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`${action.color} p-3 rounded-lg`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-gray-900">{action.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 mb-4">
                    {action.description}
                  </CardDescription>
                  <Button variant="ghost" className="text-blue-600 hover:text-blue-700 p-0">
                    Explore <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Alumni */}
          <Card className="border-0 shadow-md rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Recently Joined Alumni
              </CardTitle>
              <CardDescription>New members of our growing community</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAlumni.map((alumni, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {alumni.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900 truncate">{alumni.name}</p>
                        <Badge variant="secondary" className="text-xs">'{alumni.year.toString().slice(-2)}</Badge>
                      </div>
                      <div className="flex items-center text-gray-500 space-x-3">
                        <span className="text-xs">{alumni.major}</span>
                        <Building className="w-3 h-3" />
                        <span className="text-xs">{alumni.company}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="rounded-lg">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 rounded-lg">
                View All Alumni
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="border-0 shadow-md rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <Calendar className="w-5 h-5 mr-2 text-green-600" />
                Upcoming Events
              </CardTitle>
              <CardDescription>Don't miss these exciting alumni gatherings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                      <Badge className="bg-green-100 text-green-700">{event.date}</Badge>
                    </div>
                    <div className="flex items-center text-gray-500 space-x-4 mb-3">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-xs">{event.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span className="text-xs">{event.rsvp} attending</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="rounded-lg">
                      RSVP
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 rounded-lg" onClick={() => onNavigate('events')}>
                View All Events
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Card className="border-0 shadow-md rounded-xl">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-gray-600">Network Growth</p>
              <p className="text-blue-600">+12% this month</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md rounded-xl">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-gray-600">Total Alumni</p>
              <p className="text-green-600">10,247</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md rounded-xl">
            <CardContent className="p-6 text-center">
              <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-gray-600">Events This Month</p>
              <p className="text-purple-600">8</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md rounded-xl">
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-gray-600">Active Connections</p>
              <p className="text-orange-600">156</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}