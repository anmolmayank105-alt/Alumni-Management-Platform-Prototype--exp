// MongoDB-compatible Database Service for Alumni Management Platform
// This service provides all the same functionality as the original database
// but uses MongoDB-style operations that can easily be switched to real MongoDB

import { mongodb, Collections, checkMongoConnection } from './mongodb';
import { User, Fundraiser, Event, Donation, Message, Conversation } from './database';

class MongoAlumniDatabase {
  constructor() {
    this.initialize();
  }

  private async initialize() {
    const connected = await checkMongoConnection();
    if (connected) {
      console.log('🎓 Alumni Management Database initialized with MongoDB');
      console.log('📊 Connection info:', mongodb.getConnectionInfo());
    } else {
      console.warn('⚠️ MongoDB connection failed, falling back to localStorage');
    }
  }

  // ========== USER OPERATIONS ==========

  async authenticateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await mongodb.findOne<User>(Collections.users, { 
        email: email, 
        password: password 
      });
      
      if (user) {
        console.log('✅ User authenticated:', user.name);
      } else {
        console.log('❌ Authentication failed for:', email);
      }
      
      return user;
    } catch (error) {
      console.error('Auth error:', error);
      return null;
    }
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    try {
      const user: User = {
        ...userData,
        id: new Date().getTime().toString(),
        createdAt: new Date(),
      };

      const savedUser = await mongodb.insertOne<User>(Collections.users, user);
      console.log('👤 New user created:', savedUser.name);
      return savedUser;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      return await mongodb.findById<User>(Collections.users, id);
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      const updatedUser = await mongodb.updateById<User>(Collections.users, id, updates);
      if (updatedUser) {
        console.log('👤 User updated:', updatedUser.name);
      }
      return updatedUser;
    } catch (error) {
      console.error('Update user error:', error);
      return null;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await mongodb.find<User>(Collections.users);
    } catch (error) {
      console.error('Get all users error:', error);
      return [];
    }
  }

  async searchUsers(query: string): Promise<User[]> {
    try {
      // MongoDB would use text search, for now we'll simulate it
      const users = await mongodb.find<User>(Collections.users);
      const lowercaseQuery = query.toLowerCase();
      
      return users.filter(user => 
        user.name.toLowerCase().includes(lowercaseQuery) ||
        user.email.toLowerCase().includes(lowercaseQuery) ||
        (user.company && user.company.toLowerCase().includes(lowercaseQuery)) ||
        (user.major && user.major.toLowerCase().includes(lowercaseQuery)) ||
        (user.skills && user.skills.some(skill => skill.toLowerCase().includes(lowercaseQuery)))
      );
    } catch (error) {
      console.error('Search users error:', error);
      return [];
    }
  }

  // ========== FUNDRAISER OPERATIONS ==========

  async getAllFundraisers(): Promise<Fundraiser[]> {
    try {
      return await mongodb.find<Fundraiser>(Collections.fundraisers, {}, {
        sort: { createdAt: -1 }
      });
    } catch (error) {
      console.error('Get all fundraisers error:', error);
      return [];
    }
  }

  async getFundraisers(): Promise<Fundraiser[]> {
    try {
      return await mongodb.find<Fundraiser>(Collections.fundraisers, {
        status: 'active'
      }, {
        sort: { featured: -1, createdAt: -1 }
      });
    } catch (error) {
      console.error('Get fundraisers error:', error);
      return [];
    }
  }

  async getCompletedFundraisers(): Promise<Fundraiser[]> {
    try {
      return await mongodb.find<Fundraiser>(Collections.fundraisers, {
        status: 'completed'
      }, {
        sort: { createdAt: -1 }
      });
    } catch (error) {
      console.error('Get completed fundraisers error:', error);
      return [];
    }
  }

  async createFundraiser(fundraiserData: Omit<Fundraiser, 'id' | 'createdAt' | 'raised' | 'donors'>): Promise<Fundraiser> {
    try {
      const fundraiser: Fundraiser = {
        ...fundraiserData,
        id: new Date().getTime().toString(),
        raised: 0,
        donors: 0,
        createdAt: new Date(),
      };

      const savedFundraiser = await mongodb.insertOne<Fundraiser>(Collections.fundraisers, fundraiser);
      console.log('💰 New fundraiser created:', savedFundraiser.title);
      return savedFundraiser;
    } catch (error) {
      console.error('Create fundraiser error:', error);
      throw error;
    }
  }

  async updateFundraiser(id: string, updates: Partial<Fundraiser>): Promise<Fundraiser | null> {
    try {
      const updatedFundraiser = await mongodb.updateById<Fundraiser>(Collections.fundraisers, id, updates);
      if (updatedFundraiser) {
        console.log('💰 Fundraiser updated:', updatedFundraiser.title);
      }
      return updatedFundraiser;
    } catch (error) {
      console.error('Update fundraiser error:', error);
      return null;
    }
  }

  async getFundraiserById(id: string): Promise<Fundraiser | null> {
    try {
      return await mongodb.findById<Fundraiser>(Collections.fundraisers, id);
    } catch (error) {
      console.error('Get fundraiser error:', error);
      return null;
    }
  }

  // ========== EVENT OPERATIONS ==========

  async getAllEvents(): Promise<Event[]> {
    try {
      return await mongodb.find<Event>(Collections.events, {}, {
        sort: { date: 1 }
      });
    } catch (error) {
      console.error('Get all events error:', error);
      return [];
    }
  }

  async getEventById(id: string): Promise<Event | null> {
    try {
      return await mongodb.findById<Event>(Collections.events, id);
    } catch (error) {
      console.error('Get event error:', error);
      return null;
    }
  }

  async createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'rsvp'>): Promise<Event> {
    try {
      const event: Event = {
        ...eventData,
        id: new Date().getTime().toString(),
        rsvp: 0,
        createdAt: new Date(),
      };

      const savedEvent = await mongodb.insertOne<Event>(Collections.events, event);
      console.log('📅 New event created:', savedEvent.title);
      return savedEvent;
    } catch (error) {
      console.error('Create event error:', error);
      throw error;
    }
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event | null> {
    try {
      const updatedEvent = await mongodb.updateById<Event>(Collections.events, id, updates);
      if (updatedEvent) {
        console.log('📅 Event updated:', updatedEvent.title);
      }
      return updatedEvent;
    } catch (error) {
      console.error('Update event error:', error);
      return null;
    }
  }

  // ========== DONATION OPERATIONS ==========

  async createDonation(donationData: Omit<Donation, 'id' | 'createdAt'>): Promise<Donation> {
    try {
      const donation: Donation = {
        ...donationData,
        id: new Date().getTime().toString(),
        createdAt: new Date(),
      };

      const savedDonation = await mongodb.insertOne<Donation>(Collections.donations, donation);

      // Update fundraiser stats if donation is completed
      if (donationData.status === 'completed') {
        const fundraiser = await this.getFundraiserById(donationData.fundraiserId);
        if (fundraiser) {
          await this.updateFundraiser(donationData.fundraiserId, {
            raised: fundraiser.raised + donationData.amount,
            donors: fundraiser.donors + 1,
          });
        }
      }

      console.log('💳 New donation recorded:', `$${donation.amount} to fundraiser ${donation.fundraiserId}`);
      return savedDonation;
    } catch (error) {
      console.error('Create donation error:', error);
      throw error;
    }
  }

  async getDonationsByUser(userId: string): Promise<Donation[]> {
    try {
      return await mongodb.find<Donation>(Collections.donations, {
        userId: userId
      }, {
        sort: { createdAt: -1 }
      });
    } catch (error) {
      console.error('Get user donations error:', error);
      return [];
    }
  }

  async getDonationsByFundraiser(fundraiserId: string): Promise<Donation[]> {
    try {
      return await mongodb.find<Donation>(Collections.donations, {
        fundraiserId: fundraiserId
      }, {
        sort: { createdAt: -1 }
      });
    } catch (error) {
      console.error('Get fundraiser donations error:', error);
      return [];
    }
  }

  // ========== MESSAGE OPERATIONS ==========

  async createMessage(messageData: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
    try {
      const message: Message = {
        ...messageData,
        id: new Date().getTime().toString(),
        createdAt: new Date(),
      };

      const savedMessage = await mongodb.insertOne<Message>(Collections.messages, message);

      // Update conversation last message
      await this.updateConversation(messageData.conversationId, {
        lastMessage: savedMessage,
        updatedAt: new Date(),
      });

      console.log('💬 New message created in conversation:', messageData.conversationId);
      return savedMessage;
    } catch (error) {
      console.error('Create message error:', error);
      throw error;
    }
  }

  async getMessageById(id: string): Promise<Message | null> {
    try {
      return await mongodb.findById<Message>(Collections.messages, id);
    } catch (error) {
      console.error('Get message error:', error);
      return null;
    }
  }

  async getMessagesByUser(userId: string): Promise<Message[]> {
    try {
      return await mongodb.find<Message>(Collections.messages, {
        $or: [
          { senderId: userId },
          { receiverId: userId }
        ]
      }, {
        sort: { createdAt: -1 }
      });
    } catch (error) {
      console.error('Get user messages error:', error);
      return [];
    }
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    try {
      return await mongodb.find<Message>(Collections.messages, {
        conversationId: conversationId
      }, {
        sort: { createdAt: 1 }
      });
    } catch (error) {
      console.error('Get conversation messages error:', error);
      return [];
    }
  }

  // ========== CONVERSATION OPERATIONS ==========

  async createConversation(conversationData: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Conversation> {
    try {
      const conversation: Conversation = {
        ...conversationData,
        id: new Date().getTime().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const savedConversation = await mongodb.insertOne<Conversation>(Collections.conversations, conversation);
      console.log('💬 New conversation created:', savedConversation.id);
      return savedConversation;
    } catch (error) {
      console.error('Create conversation error:', error);
      throw error;
    }
  }

  async getConversationById(id: string): Promise<Conversation | null> {
    try {
      return await mongodb.findById<Conversation>(Collections.conversations, id);
    } catch (error) {
      console.error('Get conversation error:', error);
      return null;
    }
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | null> {
    try {
      return await mongodb.updateById<Conversation>(Collections.conversations, id, updates);
    } catch (error) {
      console.error('Update conversation error:', error);
      return null;
    }
  }

  async getAllConversations(): Promise<Conversation[]> {
    try {
      return await mongodb.find<Conversation>(Collections.conversations, {}, {
        sort: { updatedAt: -1 }
      });
    } catch (error) {
      console.error('Get all conversations error:', error);
      return [];
    }
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      return await mongodb.find<Conversation>(Collections.conversations, {
        participants: { $in: [userId] }
      }, {
        sort: { updatedAt: -1 }
      });
    } catch (error) {
      console.error('Get user conversations error:', error);
      return [];
    }
  }

  // ========== STATISTICS AND ANALYTICS ==========

  async getStats() {
    try {
      const [fundraisers, donations, users, events] = await Promise.all([
        this.getAllFundraisers(),
        mongodb.find<Donation>(Collections.donations),
        this.getAllUsers(),
        this.getAllEvents()
      ]);

      const totalRaised = fundraisers.reduce((sum, f) => sum + f.raised, 0);
      const totalDonors = new Set(donations.map(d => d.userId)).size;
      const activeCampaigns = fundraisers.filter(f => f.status === 'active').length;
      const completedCampaigns = fundraisers.filter(f => f.status === 'completed').length;
      const successRate = fundraisers.length > 0 ? 
        Math.round((completedCampaigns / fundraisers.length) * 100) : 0;

      const stats = {
        totalRaised,
        totalDonors,
        activeCampaigns,
        completedCampaigns,
        successRate,
        totalUsers: users.length,
        totalEvents: events.length,
        totalFundraisers: fundraisers.length,
        totalDonations: donations.length
      };

      console.log('📊 Platform statistics calculated:', stats);
      return stats;
    } catch (error) {
      console.error('Get stats error:', error);
      return {
        totalRaised: 0,
        totalDonors: 0,
        activeCampaigns: 0,
        completedCampaigns: 0,
        successRate: 0,
        totalUsers: 0,
        totalEvents: 0,
        totalFundraisers: 0,
        totalDonations: 0
      };
    }
  }

  // ========== DATABASE STATUS ==========

  async getConnectionStatus() {
    return {
      connected: mongodb.isConnectionActive(),
      info: mongodb.getConnectionInfo(),
      timestamp: new Date()
    };
  }
}

// Export singleton instance
export const mongoDatabase = new MongoAlumniDatabase();

// Export for backward compatibility with existing code
export { mongoDatabase as database };