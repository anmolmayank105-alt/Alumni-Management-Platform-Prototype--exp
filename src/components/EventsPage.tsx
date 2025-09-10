import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Search,
  Filter,
  Heart,
  Share2
} from 'lucide-react';
import { fallbackDatabase as mongoDatabase } from '../lib/fallbackDatabase';

interface EventsPageProps {
  user: any;
}

export function EventsPage({ user }: EventsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [rsvpEvents, setRsvpEvents] = useState<Set<string>>(new Set());
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const allEvents = await mongoDatabase.getAllEvents();
      setEvents(allEvents);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load events:', error);
      setLoading(false);
    }
  };

  const handleRSVP = async (eventId: string) => {
    try {
      const event = await mongoDatabase.getEventById(eventId);
      if (event) {
        const newRsvpEvents = new Set(rsvpEvents);
        let newRsvpCount = event.rsvp;
        
        if (newRsvpEvents.has(eventId)) {
          newRsvpEvents.delete(eventId);
          newRsvpCount = Math.max(0, newRsvpCount - 1);
        } else {
          newRsvpEvents.add(eventId);
          newRsvpCount = newRsvpCount + 1;
        }
        
        await mongoDatabase.updateEvent(eventId, { rsvp: newRsvpCount });
        setRsvpEvents(newRsvpEvents);
        
        // Reload events to show updated counts
        await loadEvents();
      }
    } catch (error) {
      console.error('Failed to update RSVP:', error);
    }
  };

  const upcomingEvents = [
    {
      id: '1',
      title: 'Annual Alumni Gala 2024',
      date: 'December 15, 2024',
      time: '7:00 PM - 11:00 PM',
      location: 'Grand Ballroom, Downtown Campus',
      description: 'Join us for an evening of celebration, networking, and recognition of outstanding alumni achievements.',
      attendees: 245,
      capacity: 300,
      category: 'Networking',
      image: 'bg-gradient-to-r from-blue-500 to-purple-600',
      featured: true
    },
    {
      id: '2',
      title: 'Tech Industry Career Workshop',
      date: 'December 22, 2024',
      time: '2:00 PM - 5:00 PM',
      location: 'Virtual Event',
      description: 'Learn about the latest trends in technology and get career advice from industry leaders.',
      attendees: 89,
      capacity: 150,
      category: 'Career',
      image: 'bg-gradient-to-r from-green-500 to-teal-600'
    },
    {
      id: '3',
      title: 'Holiday Reunion Party',
      date: 'December 30, 2024',
      time: '6:00 PM - 10:00 PM',
      location: 'Alumni Hall, Main Campus',
      description: 'Celebrate the holidays with fellow alumni in a festive atmosphere.',
      attendees: 156,
      capacity: 200,
      category: 'Social',
      image: 'bg-gradient-to-r from-red-500 to-pink-600'
    },
    {
      id: '4',
      title: 'Entrepreneurship Panel',
      date: 'January 8, 2025',
      time: '3:00 PM - 6:00 PM',
      location: 'Innovation Center',
      description: 'Hear from successful alumni entrepreneurs about their journey and get startup advice.',
      attendees: 67,
      capacity: 100,
      category: 'Career',
      image: 'bg-gradient-to-r from-orange-500 to-yellow-600'
    },
    {
      id: '5',
      title: 'Alumni Sports Tournament',
      date: 'January 15, 2025',
      time: '10:00 AM - 4:00 PM',
      location: 'University Sports Complex',
      description: 'Compete in various sports with fellow alumni and relive your college days.',
      attendees: 78,
      capacity: 120,
      category: 'Recreation',
      image: 'bg-gradient-to-r from-indigo-500 to-blue-600'
    }
  ];

  const pastEvents = [
    {
      id: '6',
      title: 'Fall Networking Mixer',
      date: 'November 20, 2024',
      location: 'City Center Hotel',
      attendees: 189,
      category: 'Networking'
    },
    {
      id: '7',
      title: 'Alumni Homecoming',
      date: 'October 15, 2024',
      location: 'University Stadium',
      attendees: 1250,
      category: 'Social'
    }
  ];

  const filteredEvents = upcomingEvents.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-gray-900">Alumni Events</h1>
          <p className="text-gray-600 mt-2">Discover and join exciting events with your fellow alumni</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-lg"
              />
            </div>
            <Button variant="outline" className="rounded-lg">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="past">Past Events</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6">
            {/* Featured Event */}
            {filteredEvents.some(event => event.featured) && (
              <div className="mb-8">
                <h2 className="text-gray-900 mb-4">Featured Event</h2>
                {filteredEvents.filter(event => event.featured).map(event => (
                  <Card key={event.id} className="border-0 shadow-lg rounded-xl overflow-hidden">
                    <div className={`h-32 ${event.image} flex items-center justify-center`}>
                      <Badge className="bg-white text-gray-900">Featured</Badge>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="secondary">{event.category}</Badge>
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              {Math.round((event.attendees / event.capacity) * 100)}% Full
                            </Badge>
                          </div>
                          <h3 className="text-gray-900 mb-2">{event.title}</h3>
                          <p className="text-gray-600 mb-4">{event.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>{event.date}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span>{event.location}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6 lg:mt-0 lg:ml-6 flex flex-col items-end">
                          <div className="flex items-center text-gray-500 mb-4">
                            <Users className="w-4 h-4 mr-2" />
                            <span>{event.attendees}/{event.capacity} attending</span>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant={rsvpEvents.has(event.id) ? "default" : "outline"}
                              onClick={() => handleRSVP(event.id)}
                              className="rounded-lg"
                            >
                              {rsvpEvents.has(event.id) ? 'RSVP\'d' : 'RSVP'}
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-lg">
                              <Heart className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-lg">
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Regular Events */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredEvents.filter(event => !event.featured).map(event => (
                <Card key={event.id} className="border-0 shadow-md rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                  <div className={`h-24 ${event.image}`}></div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{event.category}</Badge>
                      <div className="flex items-center text-gray-500">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{event.attendees}</span>
                      </div>
                    </div>
                    <CardTitle className="text-gray-900">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">{event.description}</CardDescription>
                    
                    <div className="space-y-2 text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Button
                        variant={rsvpEvents.has(event.id) ? "default" : "outline"}
                        onClick={() => handleRSVP(event.id)}
                        className="rounded-lg"
                      >
                        {rsvpEvents.has(event.id) ? 'RSVP\'d' : 'RSVP'}
                      </Button>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" className="rounded-lg">
                          <Heart className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-lg">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="past" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pastEvents.map(event => (
                <Card key={event.id} className="border-0 shadow-md rounded-xl opacity-75">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{event.category}</Badge>
                      <div className="flex items-center text-gray-500">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{event.attendees} attended</span>
                      </div>
                    </div>
                    <CardTitle className="text-gray-900">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <Button variant="outline" disabled className="rounded-lg">
                      Event Completed
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}