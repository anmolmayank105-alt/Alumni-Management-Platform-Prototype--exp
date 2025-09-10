import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { 
  MessageCircle, 
  Search, 
  Send, 
  Sparkles,
  GraduationCap,
  Building,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Users,
  Clock
} from 'lucide-react';
import { fallbackDatabase as mongoDatabase } from '../lib/fallbackDatabase';
import { type User, type Message, type Conversation } from '../lib/database';

interface ChatPageProps {
  user: any;
}

export function ChatPage({ user }: ChatPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredAlumni, setFilteredAlumni] = useState<User[]>([]);
  const [showAlumniSearch, setShowAlumniSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
    loadUserCache();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    const allConversations = await mongoDatabase.getAllConversations();
    const userConversations = allConversations
      .filter(conv => conv.participants.includes(user.id))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    setConversations(userConversations);
  };

  const loadMessages = async (conversationId: string) => {
    const conversationMessages = await mongoDatabase.getMessagesByConversation(conversationId);
    setMessages(conversationMessages);
  };

  // AI-based search function
  const searchAlumni = (query: string) => {
    if (!query.trim()) {
      setFilteredAlumni([]);
      return;
    }

    const allUsers = Object.values(usersCache).filter((u): u is User => {
      const user_ = u as User;
      return user_.id !== user.id && user_.role === 'alumni';
    });
    
    // AI-like search with multiple criteria and scoring
    const searchResults = allUsers.map((alumni: User) => {
      let score = 0;
      const searchLower = query.toLowerCase();
      
      // Name matching (highest priority)
      if (alumni.name.toLowerCase().includes(searchLower)) {
        score += 10;
      }
      
      // Major/field matching
      if (alumni.major?.toLowerCase().includes(searchLower)) {
        score += 8;
      }
      
      // Company matching
      if (alumni.company?.toLowerCase().includes(searchLower)) {
        score += 6;
      }
      
      // Position matching
      if (alumni.position?.toLowerCase().includes(searchLower)) {
        score += 5;
      }
      
      // Graduation year matching
      if (alumni.graduationYear && query.includes(alumni.graduationYear.toString())) {
        score += 7;
      }
      
      // Email matching
      if (alumni.email.toLowerCase().includes(searchLower)) {
        score += 4;
      }
      
      // Bio matching
      if (alumni.bio?.toLowerCase().includes(searchLower)) {
        score += 3;
      }
      
      // Similar graduation years (within 2 years)
      if (user.graduationYear && alumni.graduationYear) {
        const yearDiff = Math.abs(user.graduationYear - alumni.graduationYear);
        if (yearDiff <= 2) {
          score += 2;
        }
      }
      
      // Same major bonus
      if (user.major && alumni.major === user.major) {
        score += 3;
      }
      
      return { alumni, score };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(result => result.alumni);

    setFilteredAlumni(searchResults);
  };

  const startConversation = async (otherUserId: string) => {
    // Check if conversation already exists
    const existingConv = conversations.find(conv => 
      conv.participants.includes(otherUserId) && conv.participants.includes(user.id)
    );
    
    if (existingConv) {
      setSelectedConversation(existingConv.id);
    } else {
      // Create new conversation
      const newConversation = await mongoDatabase.createConversation({
        participants: [user.id, otherUserId]
      });
      setSelectedConversation(newConversation.id);
      loadConversations();
    }
    
    setShowAlumniSearch(false);
    setSearchTerm('');
    setFilteredAlumni([]);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const conversation = conversations.find(c => c.id === selectedConversation);
    if (!conversation) return;

    const receiverId = conversation.participants.find(p => p !== user.id);
    if (!receiverId) return;

    const message = await mongoDatabase.createMessage({
      conversationId: selectedConversation,
      senderId: user.id,
      receiverId,
      content: newMessage.trim(),
      read: false
    });

    setMessages([...messages, message]);
    setNewMessage('');
    loadConversations();
  };

  const [usersCache, setUsersCache] = useState<{[key: string]: User}>({});

  const getOtherUser = (conversation: Conversation): User | null => {
    const otherUserId = conversation.participants.find(p => p !== user.id);
    return otherUserId ? usersCache[otherUserId] || null : null;
  };

  const loadUserCache = async () => {
    const allUsers = await mongoDatabase.getAllUsers();
    const cache: {[key: string]: User} = {};
    allUsers.forEach(user => {
      cache[user.id] = user;
    });
    setUsersCache(cache);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-gray-900">Alumni Chat</h1>
              <p className="text-gray-600 mt-2">Connect and chat with fellow alumni</p>
            </div>
            <Button 
              onClick={() => setShowAlumniSearch(!showAlumniSearch)}
              className="mt-4 sm:mt-0 rounded-lg bg-blue-600 hover:bg-blue-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Find Alumni
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="lg:col-span-4 border-0 shadow-md rounded-xl overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                Conversations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {conversations.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No conversations yet</p>
                    <p className="text-sm">Use AI search to find and chat with alumni</p>
                  </div>
                ) : (
                  conversations.map(conversation => {
                    const otherUser = getOtherUser(conversation);
                    if (!otherUser) return null;

                    return (
                      <div
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation.id)}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedConversation === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-blue-600 text-white">
                              {getInitials(otherUser.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-gray-900 truncate">{otherUser.name}</h4>
                              {conversation.lastMessage && (
                                <span className="text-xs text-gray-500">
                                  {formatTime(conversation.lastMessage.createdAt)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              {otherUser.position} at {otherUser.company}
                            </p>
                            {conversation.lastMessage && (
                              <p className="text-sm text-gray-500 truncate">
                                {conversation.lastMessage.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-8 border-0 shadow-md rounded-xl overflow-hidden flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <CardHeader className="pb-3 border-b">
                  {(() => {
                    const conversation = conversations.find(c => c.id === selectedConversation);
                    const otherUser = conversation ? getOtherUser(conversation) : null;
                    
                    if (!otherUser) return null;

                    return (
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-blue-600 text-white">
                            {getInitials(otherUser.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-gray-900">{otherUser.name}</h3>
                          <p className="text-sm text-gray-600">
                            {otherUser.position} at {otherUser.company} • Class of {otherUser.graduationYear}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </CardHeader>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message, index) => {
                      const isOwnMessage = message.senderId === user.id;
                      const showDate = index === 0 || 
                        formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);

                      return (
                        <div key={message.id}>
                          {showDate && (
                            <div className="text-center text-xs text-gray-500 mb-4">
                              {formatDate(message.createdAt)}
                            </div>
                          )}
                          <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                isOwnMessage
                                  ? 'bg-blue-600 text-white rounded-br-sm'
                                  : 'bg-gray-200 text-gray-900 rounded-bl-sm'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                                }`}
                              >
                                {formatTime(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="rounded-lg"
                    />
                    <Button 
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="rounded-lg"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-gray-900 mb-2">Select a conversation</h3>
                  <p>Choose a conversation from the list to start chatting</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* AI Alumni Search Modal */}
        {showAlumniSearch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
                  AI Alumni Search
                </CardTitle>
                <CardDescription>
                  Search for alumni by name, major, company, graduation year, or any other criteria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search alumni (e.g., 'Computer Science 2018', 'Google engineer', 'Jane Smith')..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        searchAlumni(e.target.value);
                      }}
                      className="pl-10 rounded-lg"
                    />
                  </div>

                  <ScrollArea className="h-96">
                    {filteredAlumni.length === 0 && searchTerm ? (
                      <div className="text-center text-gray-500 py-8">
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No alumni found matching your search</p>
                        <p className="text-sm">Try different keywords or criteria</p>
                      </div>
                    ) : filteredAlumni.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Start typing to search for alumni</p>
                        <p className="text-sm">Use AI-powered search to find alumni by any criteria</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredAlumni.map(alumni => (
                          <div
                            key={alumni.id}
                            onClick={() => startConversation(alumni.id)}
                            className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <div className="flex items-start space-x-3">
                              <Avatar className="w-12 h-12">
                                <AvatarFallback className="bg-blue-600 text-white">
                                  {getInitials(alumni.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h4 className="text-gray-900">{alumni.name}</h4>
                                <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                                  {alumni.position && alumni.company && (
                                    <div className="flex items-center">
                                      <Building className="w-3 h-3 mr-1" />
                                      <span>{alumni.position} at {alumni.company}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                                  {alumni.major && (
                                    <div className="flex items-center">
                                      <GraduationCap className="w-3 h-3 mr-1" />
                                      <span>{alumni.major}</span>
                                    </div>
                                  )}
                                  {alumni.graduationYear && (
                                    <div className="flex items-center">
                                      <Calendar className="w-3 h-3 mr-1" />
                                      <span>Class of {alumni.graduationYear}</span>
                                    </div>
                                  )}
                                </div>
                                {alumni.bio && (
                                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{alumni.bio}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>

                <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAlumniSearch(false);
                      setSearchTerm('');
                      setFilteredAlumni([]);
                    }}
                    className="rounded-lg"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}