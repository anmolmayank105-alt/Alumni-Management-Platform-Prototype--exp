// Simple in-memory database with localStorage persistence
// In a real application, this would be replaced with a proper database like PostgreSQL, MongoDB, etc.

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'alumni' | 'admin' | 'student' | 'teacher' | 'management';
  userType: 'alumni' | 'student' | 'teacher' | 'management';
  graduationYear?: number;
  enrollmentYear?: number;
  major?: string;
  branch?: string;
  department?: string;
  company?: string;
  position?: string;
  phone?: string;
  bio?: string;
  college?: string;
  location?: string;
  skills?: string[];
  experience?: string;
  createdAt: Date;
}

export interface Fundraiser {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  donors: number;
  category: string;
  endDate: string;
  featured?: boolean;
  image?: string;
  createdBy: string;
  createdAt: Date;
  status: 'active' | 'completed' | 'cancelled';
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  rsvp: number;
  maxAttendees?: number;
  createdBy: string;
  createdAt: Date;
  category: string;
}

export interface Donation {
  id: string;
  fundraiserId: string;
  userId: string;
  amount: number;
  paymentMethod: 'upi' | 'card' | 'netbanking';
  transactionId: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  updatedAt: Date;
  createdAt: Date;
}

class Database {
  private users: User[] = [];
  private fundraisers: Fundraiser[] = [];
  private events: Event[] = [];
  private donations: Donation[] = [];
  private messages: Message[] = [];
  private conversations: Conversation[] = [];

  constructor() {
    this.loadFromStorage();
    this.initializeDefaultData();
  }

  private loadFromStorage() {
    try {
      const userData = localStorage.getItem('alumni_users');
      const fundraiserData = localStorage.getItem('alumni_fundraisers');
      const eventData = localStorage.getItem('alumni_events');
      const donationData = localStorage.getItem('alumni_donations');
      const messageData = localStorage.getItem('alumni_messages');
      const conversationData = localStorage.getItem('alumni_conversations');

      if (userData) this.users = JSON.parse(userData);
      if (fundraiserData) this.fundraisers = JSON.parse(fundraiserData);
      if (eventData) this.events = JSON.parse(eventData);
      if (donationData) this.donations = JSON.parse(donationData);
      if (messageData) this.messages = JSON.parse(messageData);
      if (conversationData) this.conversations = JSON.parse(conversationData);
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('alumni_users', JSON.stringify(this.users));
      localStorage.setItem('alumni_fundraisers', JSON.stringify(this.fundraisers));
      localStorage.setItem('alumni_events', JSON.stringify(this.events));
      localStorage.setItem('alumni_donations', JSON.stringify(this.donations));
      localStorage.setItem('alumni_messages', JSON.stringify(this.messages));
      localStorage.setItem('alumni_conversations', JSON.stringify(this.conversations));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  private initializeDefaultData() {
    // Initialize default users if none exist
    if (this.users.length === 0) {
      this.users = [
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
        },
        {
          id: 'user2',
          email: 'jane.smith@university.edu',
          password: 'password123',
          name: 'Jane Smith',
          role: 'alumni',
          userType: 'alumni',
          graduationYear: 2019,
          major: 'Business Administration',
          branch: 'Finance',
          company: 'Finance Inc',
          position: 'Financial Analyst',
          college: 'State University',
          location: 'New York, NY',
          skills: ['Financial Analysis', 'Excel', 'Bloomberg Terminal', 'Risk Management'],
          experience: '4 years',
          bio: 'Specialized in corporate finance and investment analysis.',
          createdAt: new Date(),
        },
        {
          id: 'user3',
          email: 'mike.johnson@university.edu',
          password: 'password123',
          name: 'Mike Johnson',
          role: 'alumni',
          userType: 'alumni',
          graduationYear: 2020,
          major: 'Mechanical Engineering',
          branch: 'Automotive Engineering',
          company: 'Tesla',
          position: 'Design Engineer',
          college: 'State University',
          location: 'Austin, TX',
          skills: ['CAD Design', 'SolidWorks', 'MATLAB', 'Product Development'],
          experience: '3 years',
          bio: 'Working on sustainable transportation solutions.',
          createdAt: new Date(),
        },
        {
          id: 'user4',
          email: 'sarah.williams@university.edu',
          password: 'password123',
          name: 'Sarah Williams',
          role: 'alumni',
          userType: 'alumni',
          graduationYear: 2017,
          major: 'Marketing',
          branch: 'Digital Marketing',
          company: 'Google',
          position: 'Product Marketing Manager',
          college: 'State University',
          location: 'Mountain View, CA',
          skills: ['Digital Marketing', 'Analytics', 'Brand Strategy', 'Content Marketing'],
          experience: '6 years',
          bio: 'Leading product marketing for cloud solutions.',
          createdAt: new Date(),
        },
        {
          id: 'user5',
          email: 'david.brown@university.edu',
          password: 'password123',
          name: 'David Brown',
          role: 'alumni',
          userType: 'alumni',
          graduationYear: 2018,
          major: 'Computer Science',
          branch: 'Artificial Intelligence',
          company: 'Microsoft',
          position: 'Senior Software Engineer',
          college: 'State University',
          location: 'Seattle, WA',
          skills: ['Machine Learning', 'Python', 'TensorFlow', 'Cloud Computing'],
          experience: '5 years',
          bio: 'Building scalable cloud applications and AI solutions.',
          createdAt: new Date(),
        },
        {
          id: 'user6',
          email: 'emily.davis@university.edu',
          password: 'password123',
          name: 'Emily Davis',
          role: 'alumni',
          userType: 'alumni',
          graduationYear: 2019,
          major: 'Psychology',
          branch: 'Clinical Psychology',
          company: 'Healthcare Plus',
          position: 'Clinical Psychologist',
          college: 'State University',
          location: 'Boston, MA',
          skills: ['Therapy', 'Assessment', 'Research', 'Patient Care'],
          experience: '4 years',
          bio: 'Helping patients with mental health and wellness.',
          createdAt: new Date(),
        },
        {
          id: 'teacher1',
          email: 'prof.anderson@university.edu',
          password: 'password123',
          name: 'Prof. Robert Anderson',
          role: 'teacher',
          userType: 'teacher',
          department: 'Computer Science',
          college: 'State University',
          position: 'Professor',
          major: 'Computer Science',
          experience: '15 years',
          skills: ['Teaching', 'Research', 'Data Structures', 'Algorithms'],
          bio: 'Teaching computer science fundamentals and conducting research in algorithms.',
          createdAt: new Date(),
        },
        {
          id: 'student1',
          email: 'alex.chen@university.edu',
          password: 'password123',
          name: 'Alex Chen',
          role: 'student',
          userType: 'student',
          enrollmentYear: 2022,
          major: 'Computer Science',
          branch: 'Machine Learning',
          college: 'State University',
          skills: ['Python', 'Java', 'Machine Learning', 'Data Analysis'],
          bio: 'Third-year student passionate about AI and machine learning.',
          createdAt: new Date(),
        },
        {
          id: 'student2',
          email: 'lisa.martinez@university.edu',
          password: 'password123',
          name: 'Lisa Martinez',
          role: 'student',
          userType: 'student',
          enrollmentYear: 2023,
          major: 'Business Administration',
          branch: 'Marketing',
          college: 'State University',
          skills: ['Marketing', 'Social Media', 'Analytics', 'Communication'],
          bio: 'Second-year business student interested in digital marketing.',
          createdAt: new Date(),
        }
      ];
    }

    // Initialize default fundraisers if none exist
    if (this.fundraisers.length === 0) {
      this.fundraisers = [
        {
          id: '1',
          title: 'New Engineering Lab Construction',
          description: 'Help us build a state-of-the-art engineering laboratory to provide students with hands-on learning experiences.',
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
        },
        {
          id: '2',
          title: 'Alumni Scholarship Fund',
          description: 'Support deserving students with financial assistance to pursue their education dreams.',
          goal: 250000,
          raised: 185000,
          donors: 89,
          category: 'Scholarships',
          endDate: '2025-06-30',
          image: 'bg-gradient-to-r from-green-500 to-emerald-600',
          createdBy: 'admin1',
          createdAt: new Date(),
          status: 'active',
        },
      ];
    }

    // Initialize default events if none exist
    if (this.events.length === 0) {
      this.events = [
        {
          id: '1',
          title: 'Alumni Mixer 2024',
          description: 'Join us for an evening of networking and reconnecting with fellow alumni.',
          date: '2024-12-15',
          location: 'Downtown Campus',
          rsvp: 45,
          maxAttendees: 100,
          createdBy: 'admin1',
          createdAt: new Date(),
          category: 'Networking',
        },
        {
          id: '2',
          title: 'Career Workshop',
          description: 'Professional development workshop for recent graduates.',
          date: '2024-12-22',
          location: 'Virtual',
          rsvp: 78,
          createdBy: 'admin1',
          createdAt: new Date(),
          category: 'Professional Development',
        },
      ];
    }

    this.saveToStorage();
  }

  // User operations
  authenticateUser(email: string, password: string): User | null {
    const user = this.users.find(u => u.email === email && u.password === password);
    return user || null;
  }

  createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    const user: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    this.users.push(user);
    this.saveToStorage();
    return user;
  }

  getUserById(id: string): User | null {
    return this.users.find(u => u.id === id) || null;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) return null;

    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    this.saveToStorage();
    return this.users[userIndex];
  }

  getAllUsers(): User[] {
    return [...this.users];
  }

  // Fundraiser operations
  getAllFundraisers(): Fundraiser[] {
    return [...this.fundraisers];
  }

  getFundraisers(): Fundraiser[] {
    return this.fundraisers.filter(f => f.status === 'active');
  }

  getCompletedFundraisers(): Fundraiser[] {
    return this.fundraisers.filter(f => f.status === 'completed');
  }

  createFundraiser(fundraiserData: Omit<Fundraiser, 'id' | 'createdAt' | 'raised' | 'donors'>): Fundraiser {
    const fundraiser: Fundraiser = {
      ...fundraiserData,
      id: Date.now().toString(),
      raised: 0,
      donors: 0,
      createdAt: new Date(),
    };
    this.fundraisers.push(fundraiser);
    this.saveToStorage();
    return fundraiser;
  }

  updateFundraiser(id: string, updates: Partial<Fundraiser>): Fundraiser | null {
    const index = this.fundraisers.findIndex(f => f.id === id);
    if (index === -1) return null;

    this.fundraisers[index] = { ...this.fundraisers[index], ...updates };
    this.saveToStorage();
    return this.fundraisers[index];
  }

  getFundraiserById(id: string): Fundraiser | null {
    return this.fundraisers.find(f => f.id === id) || null;
  }

  // Event operations
  getAllEvents(): Event[] {
    return [...this.events];
  }

  getEventById(id: string): Event | null {
    return this.events.find(e => e.id === id) || null;
  }

  createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'rsvp'>): Event {
    const event: Event = {
      ...eventData,
      id: Date.now().toString(),
      rsvp: 0,
      createdAt: new Date(),
    };
    this.events.push(event);
    this.saveToStorage();
    return event;
  }

  updateEvent(id: string, updates: Partial<Event>): Event | null {
    const index = this.events.findIndex(e => e.id === id);
    if (index === -1) return null;

    this.events[index] = { ...this.events[index], ...updates };
    this.saveToStorage();
    return this.events[index];
  }

  // Donation operations
  createDonation(donationData: Omit<Donation, 'id' | 'createdAt'>): Donation {
    const donation: Donation = {
      ...donationData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    this.donations.push(donation);

    // Update fundraiser stats
    const fundraiser = this.getFundraiserById(donationData.fundraiserId);
    if (fundraiser && donationData.status === 'completed') {
      this.updateFundraiser(donationData.fundraiserId, {
        raised: fundraiser.raised + donationData.amount,
        donors: fundraiser.donors + 1,
      });
    }

    this.saveToStorage();
    return donation;
  }

  getDonationsByUser(userId: string): Donation[] {
    return this.donations.filter(d => d.userId === userId);
  }

  getDonationsByFundraiser(fundraiserId: string): Donation[] {
    return this.donations.filter(d => d.fundraiserId === fundraiserId);
  }

  // Message operations
  createMessage(messageData: Omit<Message, 'id' | 'createdAt'>): Message {
    const message: Message = {
      ...messageData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    this.messages.push(message);

    // Update conversation last message
    const conversation = this.getConversationById(messageData.conversationId);
    if (conversation) {
      conversation.lastMessage = message;
      conversation.updatedAt = new Date();
      this.updateConversation(conversation.id, conversation);
    }

    this.saveToStorage();
    return message;
  }

  getMessageById(id: string): Message | null {
    return this.messages.find(m => m.id === id) || null;
  }

  getMessagesByUser(userId: string): Message[] {
    return this.messages.filter(m => m.senderId === userId || m.receiverId === userId);
  }

  getMessagesByConversation(conversationId: string): Message[] {
    return this.messages.filter(m => m.conversationId === conversationId);
  }

  // Conversation operations
  createConversation(conversationData: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>): Conversation {
    const conversation: Conversation = {
      ...conversationData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.conversations.push(conversation);
    this.saveToStorage();
    return conversation;
  }

  getConversationById(id: string): Conversation | null {
    return this.conversations.find(c => c.id === id) || null;
  }

  updateConversation(id: string, updates: Partial<Conversation>): Conversation | null {
    const index = this.conversations.findIndex(c => c.id === id);
    if (index === -1) return null;

    this.conversations[index] = { ...this.conversations[index], ...updates };
    this.saveToStorage();
    return this.conversations[index];
  }

  getAllConversations(): Conversation[] {
    return [...this.conversations];
  }

  // Statistics
  getStats() {
    const totalRaised = this.fundraisers.reduce((sum, f) => sum + f.raised, 0);
    const totalDonors = new Set(this.donations.map(d => d.userId)).size;
    const activeCampaigns = this.fundraisers.filter(f => f.status === 'active').length;
    const completedCampaigns = this.fundraisers.filter(f => f.status === 'completed').length;
    const successRate = this.fundraisers.length > 0 ? 
      Math.round((completedCampaigns / this.fundraisers.length) * 100) : 0;

    return {
      totalRaised,
      totalDonors,
      activeCampaigns,
      completedCampaigns,
      successRate,
      totalUsers: this.users.length,
      totalEvents: this.events.length,
    };
  }
}

// Export singleton instance
export const database = new Database();