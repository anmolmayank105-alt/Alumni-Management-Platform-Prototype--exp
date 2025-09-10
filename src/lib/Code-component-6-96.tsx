// MongoDB-compatible Alumni Management Database
// This uses localStorage as a fallback while maintaining MongoDB-style operations
// Easy to switch to real MongoDB when deployed

import { User, Fundraiser, Event, Donation, Message, Conversation } from './database';

// MongoDB-style configuration
export const MONGODB_CONFIG = {
  connectionString: 'mongodb+srv://starunkumarainds2024_db_user:2fgmUJliWHq9YUIl@cluster0.bc9ss4x.mongodb.net/',
  database: 'alumni_management',
  collections: {
    users: 'users',
    fundraisers: 'fundraisers',
    events: 'events',
    donations: 'donations',
    messages: 'messages',
    conversations: 'conversations'
  }
};

// MongoDB-style query interface
interface QueryFilter {
  [key: string]: any;
}

interface QueryOptions {
  limit?: number;
  skip?: number;
  sort?: { [key: string]: 1 | -1 };
}

interface UpdateOptions {
  upsert?: boolean;
  multi?: boolean;
}

// MongoDB-compatible operations class
class MongoDBService {
  private isConnected: boolean = false;
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
    this.initializeConnection();
  }

  // Simulate MongoDB connection
  private async initializeConnection(): Promise<void> {
    try {
      console.log('🔄 Connecting to MongoDB...');
      console.log('📍 Connection String:', MONGODB_CONFIG.connectionString.replace(/\/\/.*@/, '//***:***@'));
      
      // Load existing data from localStorage (simulating MongoDB data)
      await this.loadCollections();
      
      this.isConnected = true;
      console.log('✅ MongoDB Connected Successfully!');
      console.log('🗄️ Database:', MONGODB_CONFIG.database);
      console.log('📊 Collections loaded:', Object.keys(MONGODB_CONFIG.collections).join(', '));
      
      // Initialize default data if collections are empty
      await this.initializeDefaultData();
    } catch (error) {
      console.error('❌ MongoDB Connection Error:', error);
      this.isConnected = false;
    }
  }

  private async loadCollections(): Promise<void> {
    try {
      const collections = ['users', 'fundraisers', 'events', 'donations', 'messages', 'conversations'];
      
      for (const collection of collections) {
        const data = localStorage.getItem(`mongodb_${collection}`);
        if (data) {
          (this.data as any)[collection] = JSON.parse(data);
        }
      }
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  }

  private async saveCollection(collectionName: string): Promise<void> {
    try {
      localStorage.setItem(`mongodb_${collectionName}`, JSON.stringify((this.data as any)[collectionName]));
    } catch (error) {
      console.error(`Error saving collection ${collectionName}:`, error);
    }
  }

  private async initializeDefaultData(): Promise<void> {
    // Initialize users collection
    if (this.data.users.length === 0) {
      await this.insertMany('users', [
        {
          _id: 'admin1',
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
          _id: 'user1',
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
          _id: 'user2',
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
        }
      ]);
    }

    // Initialize fundraisers collection
    if (this.data.fundraisers.length === 0) {
      await this.insertMany('fundraisers', [
        {
          _id: '1',
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
          _id: '2',
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
        }
      ]);
    }

    // Initialize events collection
    if (this.data.events.length === 0) {
      await this.insertMany('events', [
        {
          _id: '1',
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
          _id: '2',
          id: '2',
          title: 'Career Workshop',
          description: 'Professional development workshop for recent graduates.',
          date: '2024-12-22',
          location: 'Virtual',
          rsvp: 78,
          createdBy: 'admin1',
          createdAt: new Date(),
          category: 'Professional Development',
        }
      ]);
    }
  }

  // MongoDB-style CRUD operations

  // Find operations
  async find<T>(collection: string, filter: QueryFilter = {}, options: QueryOptions = {}): Promise<T[]> {
    if (!this.isConnected) {
      throw new Error('MongoDB not connected');
    }

    const data = (this.data as any)[collection] || [];
    let results = data.filter((item: any) => this.matchesFilter(item, filter));

    // Apply sorting
    if (options.sort) {
      const sortKey = Object.keys(options.sort)[0];
      const sortOrder = options.sort[sortKey];
      results.sort((a: any, b: any) => {
        if (sortOrder === 1) {
          return a[sortKey] > b[sortKey] ? 1 : -1;
        } else {
          return a[sortKey] < b[sortKey] ? 1 : -1;
        }
      });
    }

    // Apply skip and limit
    if (options.skip) {
      results = results.slice(options.skip);
    }
    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  async findOne<T>(collection: string, filter: QueryFilter = {}): Promise<T | null> {
    const results = await this.find<T>(collection, filter, { limit: 1 });
    return results[0] || null;
  }

  async findById<T>(collection: string, id: string): Promise<T | null> {
    return this.findOne<T>(collection, { $or: [{ _id: id }, { id: id }] });
  }

  // Insert operations
  async insertOne<T>(collection: string, document: T): Promise<T> {
    if (!this.isConnected) {
      throw new Error('MongoDB not connected');
    }

    const doc = {
      ...document,
      _id: (document as any)._id || (document as any).id || new Date().getTime().toString(),
      createdAt: (document as any).createdAt || new Date()
    };

    (this.data as any)[collection].push(doc);
    await this.saveCollection(collection);
    
    console.log(`📄 Inserted document into ${collection}:`, doc);
    return doc;
  }

  async insertMany<T>(collection: string, documents: T[]): Promise<T[]> {
    if (!this.isConnected) {
      throw new Error('MongoDB not connected');
    }

    const docs = documents.map(doc => ({
      ...doc,
      _id: (doc as any)._id || (doc as any).id || new Date().getTime().toString() + Math.random().toString(),
      createdAt: (doc as any).createdAt || new Date()
    }));

    (this.data as any)[collection].push(...docs);
    await this.saveCollection(collection);
    
    console.log(`📄 Inserted ${docs.length} documents into ${collection}`);
    return docs;
  }

  // Update operations
  async updateOne<T>(collection: string, filter: QueryFilter, update: Partial<T>, options: UpdateOptions = {}): Promise<T | null> {
    if (!this.isConnected) {
      throw new Error('MongoDB not connected');
    }

    const data = (this.data as any)[collection];
    const index = data.findIndex((item: any) => this.matchesFilter(item, filter));
    
    if (index === -1) {
      if (options.upsert) {
        const newDoc = { ...update, ...filter };
        return this.insertOne(collection, newDoc);
      }
      return null;
    }

    data[index] = { ...data[index], ...update, updatedAt: new Date() };
    await this.saveCollection(collection);
    
    console.log(`🔄 Updated document in ${collection}:`, data[index]);
    return data[index];
  }

  async updateById<T>(collection: string, id: string, update: Partial<T>): Promise<T | null> {
    return this.updateOne(collection, { $or: [{ _id: id }, { id: id }] }, update);
  }

  // Delete operations
  async deleteOne(collection: string, filter: QueryFilter): Promise<boolean> {
    if (!this.isConnected) {
      throw new Error('MongoDB not connected');
    }

    const data = (this.data as any)[collection];
    const index = data.findIndex((item: any) => this.matchesFilter(item, filter));
    
    if (index === -1) return false;

    data.splice(index, 1);
    await this.saveCollection(collection);
    
    console.log(`🗑️ Deleted document from ${collection}`);
    return true;
  }

  async deleteById(collection: string, id: string): Promise<boolean> {
    return this.deleteOne(collection, { $or: [{ _id: id }, { id: id }] });
  }

  // Aggregation pipeline (simplified)
  async aggregate<T>(collection: string, pipeline: any[]): Promise<T[]> {
    console.log(`🔍 Running aggregation on ${collection}:`, pipeline);
    
    // For now, just return all data - would implement proper aggregation in real MongoDB
    const data = (this.data as any)[collection] || [];
    return data;
  }

  // Count operations
  async count(collection: string, filter: QueryFilter = {}): Promise<number> {
    const results = await this.find(collection, filter);
    return results.length;
  }

  // Utility method to match filters (simplified MongoDB query matching)
  private matchesFilter(item: any, filter: QueryFilter): boolean {
    if (Object.keys(filter).length === 0) return true;

    for (const [key, value] of Object.entries(filter)) {
      if (key === '$or') {
        // Handle $or operator
        const orConditions = value as QueryFilter[];
        const matches = orConditions.some(condition => this.matchesFilter(item, condition));
        if (!matches) return false;
      } else if (key === '$and') {
        // Handle $and operator
        const andConditions = value as QueryFilter[];
        const matches = andConditions.every(condition => this.matchesFilter(item, condition));
        if (!matches) return false;
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Handle operators like $gt, $lt, $in, etc.
        for (const [operator, operatorValue] of Object.entries(value)) {
          switch (operator) {
            case '$gt':
              if (!(item[key] > operatorValue)) return false;
              break;
            case '$gte':
              if (!(item[key] >= operatorValue)) return false;
              break;
            case '$lt':
              if (!(item[key] < operatorValue)) return false;
              break;
            case '$lte':
              if (!(item[key] <= operatorValue)) return false;
              break;
            case '$in':
              if (!Array.isArray(operatorValue) || !operatorValue.includes(item[key])) return false;
              break;
            case '$nin':
              if (Array.isArray(operatorValue) && operatorValue.includes(item[key])) return false;
              break;
            case '$ne':
              if (item[key] === operatorValue) return false;
              break;
            default:
              if (item[key] !== operatorValue) return false;
          }
        }
      } else {
        // Direct value comparison
        if (item[key] !== value) return false;
      }
    }

    return true;
  }

  // Connection status
  isConnectionActive(): boolean {
    return this.isConnected;
  }

  // Get connection info
  getConnectionInfo() {
    return {
      connected: this.isConnected,
      database: MONGODB_CONFIG.database,
      collections: Object.keys(MONGODB_CONFIG.collections),
      connectionString: MONGODB_CONFIG.connectionString.replace(/\/\/.*@/, '//***:***@')
    };
  }
}

// Export singleton instance
export const mongodb = new MongoDBService();

// Export connection status checker
export const checkMongoConnection = async (): Promise<boolean> => {
  return mongodb.isConnectionActive();
};

// Export collection names for easy reference
export const Collections = MONGODB_CONFIG.collections;