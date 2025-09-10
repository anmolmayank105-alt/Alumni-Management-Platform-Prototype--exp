import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  UserPlus, 
  CalendarPlus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Mail,
  Phone
} from 'lucide-react';
import { fallbackDatabase as mongoDatabase } from '../lib/fallbackDatabase';

interface AdminDashboardProps {
  user: any;
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    category: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allUsers, allEvents, platformStats] = await Promise.all([
        mongoDatabase.getAllUsers(),
        mongoDatabase.getAllEvents(),
        mongoDatabase.getStats()
      ]);
      
      setUsers(allUsers);
      setEvents(allEvents);
      setStats(platformStats);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    try {
      if (!newEvent.title || !newEvent.date || !newEvent.location) {
        alert('Please fill in all required fields');
        return;
      }

      const eventDateTime = newEvent.time ? 
        `${newEvent.date}T${newEvent.time}` : 
        newEvent.date;

      await mongoDatabase.createEvent({
        title: newEvent.title,
        description: newEvent.description,
        date: eventDateTime,
        location: newEvent.location,
        category: newEvent.category || 'General',
        createdBy: user.id
      });

      // Reload events
      await loadData();

      setNewEvent({
        title: '',
        date: '',
        time: '',
        location: '',
        description: '',
        category: ''
      });

      alert('Event created successfully!');
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('Failed to create event. Please try again.');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const statsCards = [
    { title: 'Total Users', value: stats?.totalUsers || 0, change: '+12%', icon: Users, color: 'text-blue-600' },
    { title: 'Active Events', value: stats?.totalEvents || 0, change: '+2', icon: Calendar, color: 'text-green-600' },
    { title: 'Total Fundraisers', value: stats?.totalFundraisers || 0, change: '+8%', icon: TrendingUp, color: 'text-purple-600' },
    { title: 'Total Donations', value: stats?.totalDonations || 0, change: '+24%', icon: UserPlus, color: 'text-orange-600' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage alumni network and events</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="border-0 shadow-md rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600">{stat.title}</p>
                      <p className={`text-2xl ${stat.color} mt-1`}>{stat.value}</p>
                      <p className="text-green-600 text-sm mt-1">{stat.change}</p>
                    </div>
                    <div className={`p-3 rounded-lg bg-gray-100`}>
                      <IconComponent className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="alumni" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="alumni">Alumni Management</TabsTrigger>
            <TabsTrigger value="events">Event Management</TabsTrigger>
          </TabsList>

          <TabsContent value="alumni" className="space-y-6">
            {/* Alumni Management */}
            <Card className="border-0 shadow-md rounded-xl">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-gray-900">Alumni Directory</CardTitle>
                    <CardDescription>Manage registered alumni members</CardDescription>
                  </div>
                  <Button className="mt-4 sm:mt-0 rounded-lg">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Alumni
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search alumni..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 rounded-lg"
                  />
                </div>

                {/* Alumni List */}
                <div className="space-y-4">
                  {filteredUsers.map((alumnus) => (
                    <div key={alumnus.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {alumnus.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-gray-900">{alumnus.name}</h4>
                            <Badge variant={alumnus.status === 'Active' ? 'default' : 'secondary'}>
                              {alumnus.status}
                            </Badge>
                          </div>
                          <p className="text-gray-600">{alumnus.email}</p>
                          <p className="text-gray-500">Class of {alumnus.year} • {alumnus.major}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" className="rounded-lg">
                          <Mail className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-lg">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-lg">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            {/* Event Management */}
            <Card className="border-0 shadow-md rounded-xl">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-gray-900">Event Management</CardTitle>
                    <CardDescription>Create and manage alumni events</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="mt-4 sm:mt-0 rounded-lg">
                        <CalendarPlus className="w-4 h-4 mr-2" />
                        Create Event
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md rounded-xl">
                      <DialogHeader>
                        <DialogTitle>Create New Event</DialogTitle>
                        <DialogDescription>
                          Add a new event for the alumni community
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Event Title</Label>
                          <Input
                            id="title"
                            placeholder="Alumni Networking Event"
                            value={newEvent.title}
                            onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                            className="rounded-lg"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                              id="date"
                              type="date"
                              value={newEvent.date}
                              onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                              className="rounded-lg"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="time">Time</Label>
                            <Input
                              id="time"
                              type="time"
                              value={newEvent.time}
                              onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                              className="rounded-lg"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            placeholder="University Campus"
                            value={newEvent.location}
                            onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                            className="rounded-lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select onValueChange={(value) => setNewEvent({...newEvent, category: value})}>
                            <SelectTrigger className="rounded-lg">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="networking">Networking</SelectItem>
                              <SelectItem value="career">Career</SelectItem>
                              <SelectItem value="social">Social</SelectItem>
                              <SelectItem value="recreation">Recreation</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            placeholder="Event description..."
                            value={newEvent.description}
                            onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                            className="rounded-lg"
                            rows={3}
                          />
                        </div>
                        <Button onClick={handleCreateEvent} className="w-full rounded-lg">
                          Create Event
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {/* Events List */}
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-gray-900">{event.title}</h4>
                          <Badge variant={event.status === 'Published' ? 'default' : 'secondary'}>
                            {event.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600">{event.date}</p>
                        <p className="text-gray-500">{event.attendees} attendees</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" className="rounded-lg">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-lg text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-lg">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}