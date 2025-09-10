// Simple fallback database service that works with localStorage
// This ensures the app loads while we debug MongoDB connection issues

import { User, Fundraiser, Event, Donation, Message, Conversation } from './database';

class FallbackDatabase {
  private data: {
    users: User[];
    fundraisers: Fundraiser[];
    events: Event[];
    donations: Donation[];
    messages: Message[];
    conversations: Conversation[];
  } = {
    users: [],
    fundraisers: [],
    events: [],
    donations: [],
    messages: [],
    conversations: []
  };

  constructor() {
    console.log('🔄 Initializing fallback database...');
    this.loadFromStorage();
    this.initializeDefaultData();
    console.log('✅ Fallback database ready');
  }

  private loadFromStorage() {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        console.log('Not in browser environment, skipping localStorage load');
        return;
      }

      const userData = localStorage.getItem('alumni_users');
      const fundraiserData = localStorage.getItem('alumni_fundraisers');
      const eventData = localStorage.getItem('alumni_events');
      const donationData = localStorage.getItem('alumni_donations');
      const messageData = localStorage.getItem('alumni_messages');
      const conversationData = localStorage.getItem('alumni_conversations');

      if (userData) this.data.users = JSON.parse(userData);
      if (fundraiserData) this.data.fundraisers = JSON.parse(fundraiserData);
      if (eventData) this.data.events = JSON.parse(eventData);
      if (donationData) this.data.donations = JSON.parse(donationData);
      if (messageData) this.data.messages = JSON.parse(messageData);
      if (conversationData) this.data.conversations = JSON.parse(conversationData);
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        console.log('Not in browser environment, skipping localStorage save');
        return;
      }

      localStorage.setItem('alumni_users', JSON.stringify(this.data.users));
      localStorage.setItem('alumni_fundraisers', JSON.stringify(this.data.fundraisers));
      localStorage.setItem('alumni_events', JSON.stringify(this.data.events));
      localStorage.setItem('alumni_donations', JSON.stringify(this.data.donations));
      localStorage.setItem('alumni_messages', JSON.stringify(this.data.messages));
      localStorage.setItem('alumni_conversations', JSON.stringify(this.data.conversations));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  private initializeDefaultData() {
    if (this.data.users.length === 0) {
      this.data.users = [
        {
          id: 'admin1',
          email: 'admin@university.edu',
          password: 'admin123',
          name: 'Admin User',
          role: 'admin',
          userType: 'management',
          college: 'State University',
          department: 'Administration',
          createdAt: new Date(),
        },
        {
          id: 'user1',
          email: 'john.doe@university.edu',
          password: 'password123',
          name: 'John Doe',
          role: 'alumni',
          userType: 'alumni',
          graduationYear: 2018,
          major: 'Computer Science',
          branch: 'Software Engineering',
          company: 'Tech Corp',
          position: 'Software Engineer',
          college: 'State University',
          location: 'San Francisco, CA',
          skills: ['JavaScript', 'React', 'Node.js', 'Python'],
          experience: '5 years',
          bio: 'Passionate about web development and mentoring junior developers.',
          createdAt: new Date(),
        }
      ];
    }

    if (this.data.fundraisers.length === 0) {
      this.data.fundraisers = [
        {
          id: '1',
          title: 'New Engineering Lab Construction',
          description: 'Help us build a state-of-the-art engineering laboratory.',
          goal: 500000,
          raised: 342500,
          donors: 156,
          category: 'Facilities',
          endDate: '2025-03-15',
          featured: true,
          image: 'bg-gradient-to-r from-blue-500 to-cyan-600',
          createdBy: 'admin1',
          createdAt: new Date(),
          status: 'active',
        }
      ];
    }

    if (this.data.events.length === 0) {
      this.data.events = [
        {
          id: '1',
          title: 'Alumni Mixer 2024',
          description: 'Join us for an evening of networking.',
          date: '2024-12-15',
          location: 'Downtown Campus',
          rsvp: 45,
          maxAttendees: 100,
          createdBy: 'admin1',
          createdAt: new Date(),
          category: 'Networking',
        }
      ];
    }

    this.saveToStorage();
  }

  // User operations
  async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = this.data.users.find(u => u.email === email && u.password === password);
    return user || null;
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const user: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    this.data.users.push(user);
    this.saveToStorage();
    return user;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.data.users.find(u => u.id === id) || null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const userIndex = this.data.users.findIndex(u => u.id === id);
    if (userIndex === -1) return null;

    this.data.users[userIndex] = { ...this.data.users[userIndex], ...updates };
    this.saveToStorage();
    return this.data.users[userIndex];
  }

  async getAllUsers(): Promise<User[]> {
    return [...this.data.users];
  }

  // Fundraiser operations 13
  async getAllFundraisers(): Promise<Fundraiser[]> {
    return [...this.data.fundraisers];
  }

  async getFundraisers(): Promise<Fundraiser[]> {
    return this.data.fundraisers.filter(f => f.status === 'active');
  }

  async getCompletedFundraisers(): Promise<Fundraiser[]> {
    return this.data.fundraisers.filter(f => f.status === 'completed');
  }

  async createFundraiser(fundraiserData: Omit<Fundraiser, 'id' | 'createdAt' | 'raised' | 'donors'>): Promise<Fundraiser> {
    const fundraiser: Fundraiser = {
      ...fundraiserData,
      id: Date.now().toString(),
      raised: 0,
      donors: 0,
      createdAt: new Date(),
    };
    this.data.fundraisers.push(fundraiser);
    this.saveToStorage();
    return fundraiser;
  }

  async updateFundraiser(id: string, updates: Partial<Fundraiser>): Promise<Fundraiser | null> {
    const index = this.data.fundraisers.findIndex(f => f.id === id);
    if (index === -1) return null;

    this.data.fundraisers[index] = { ...this.data.fundraisers[index], ...updates };
    this.saveToStorage();
    return this.data.fundraisers[index];
  }

  async getFundraiserById(id: string): Promise<Fundraiser | null> {
    return this.data.fundraisers.find(f => f.id === id) || null;
  }

  // Donation operations
  async createDonation(donationData: Omit<Donation, 'id' | 'createdAt'>): Promise<Donation> {
    const donation: Donation = {
      ...donationData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    this.data.donations.push(donation);

    // Update fundraiser stats
    const fundraiser = await this.getFundraiserById(donationData.fundraiserId);
    if (fundraiser && donationData.status === 'completed') {
      await this.updateFundraiser(donationData.fundraiserId, {
        raised: fundraiser.raised + donationData.amount,
        donors: fundraiser.donors + 1,
      });
    }

    this.saveToStorage();
    return donation;
  }

  async getDonationsByUser(userId: string): Promise<Donation[]> {
    return this.data.donations.filter(d => d.userId === userId);
  }

  async getDonationsByFundraiser(fundraiserId: string): Promise<Donation[]> {
    return this.data.donations.filter(d => d.fundraiserId === fundraiserId);
  }

  // Event operations
  async getAllEvents(): Promise<Event[]> {
    return [...this.data.events];
  }

  async getEventById(id: string): Promise<Event | null> {
    return this.data.events.find(e => e.id === id) || null;
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event | null> {
    const eventIndex = this.data.events.findIndex(e => e.id === id);
    if (eventIndex === -1) return null;

    this.data.events[eventIndex] = { ...this.data.events[eventIndex], ...updates };
    this.saveToStorage();
    return this.data.events[eventIndex];
  }

  async createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'rsvp'>): Promise<Event> {
    const event: Event = {
      ...eventData,
      id: Date.now().toString(),
      rsvp: 0,
      createdAt: new Date(),
    };
    this.data.events.push(event);
    this.saveToStorage();
    return event;
  }

  // Message operations
  async createMessage(messageData: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
    const message: Message = {
      ...messageData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    this.data.messages.push(message);
    this.saveToStorage();
    return message;
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return this.data.messages.filter(m => m.conversationId === conversationId);
  }

  // Conversation operations
  async createConversation(conversationData: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Conversation> {
    const conversation: Conversation = {
      ...conversationData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.data.conversations.push(conversation);
    this.saveToStorage();
    return conversation;
  }

  async getAllConversations(): Promise<Conversation[]> {
    return [...this.data.conversations];
  }

  // Statistics
  async getStats() {
    const totalRaised = this.data.fundraisers.reduce((sum, f) => sum + f.raised, 0);
    const totalDonors = new Set(this.data.donations.map(d => d.userId)).size;
    const activeCampaigns = this.data.fundraisers.filter(f => f.status === 'active').length;

    return {
      totalRaised,
      totalDonors,
      activeCampaigns,
      completedCampaigns: 0,
      successRate: 85,
      totalUsers: this.data.users.length,
      totalEvents: this.data.events.length,
    };
  }

  async getConnectionStatus() {
    return {
      connected: true,
      info: {
        database: 'alumni_management_fallback',
        mode: 'Fallback LocalStorage Database',
        collections: ['users', 'fundraisers', 'events', 'donations', 'messages', 'conversations'],
        status: 'Active'
      }
    };
  }
}

export const fallbackDatabase = new FallbackDatabase();
