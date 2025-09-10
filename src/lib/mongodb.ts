// MongoDB Alumni Management Database
// Real MongoDB connection using the provided connection string
// No localStorage fallback - all data stored in MongoDB

import { MongoClient, Db, Collection, ObjectId, Document } from 'mongodb';
import { User, Fundraiser, Event, Donation, Message, Conversation } from './database';

// MongoDB configuration
export const MONGODB_CONFIG = {
  connectionString: import.meta.env.VITE_MONGODB_CONNECTION_STRING || 'mongodb+srv://starunkumarainds2024_db_user:2fgmUJliWHq9YUIl@cluster0.bc9ss4x.mongodb.net/',
  database: import.meta.env.VITE_MONGODB_DATABASE_NAME || 'alumni_management',
  collections: {
    users: 'users',
    fundraisers: 'fundraisers',
    events: 'events',
    donations: 'donations',
    messages: 'messages',
    conversations: 'conversations'
  }
};

// MongoDB query interfaces
import { Filter, FindOptions } from 'mongodb';

interface QueryOptions {
  limit?: number;
  skip?: number;
  sort?: { [key: string]: 1 | -1 };
}

interface UpdateOptions {
  upsert?: boolean;
}

// MongoDB operations class
class MongoDBService {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnected: boolean = false;

  constructor() {
    // Initialize connection in background, don't block constructor
    this.initializeConnection().catch(error => {
      console.error('MongoDB initialization failed:', error);
    });
  }

  // Real MongoDB connection
  private async initializeConnection(): Promise<void> {
    try {
      console.log('🔄 Connecting to MongoDB...');
      console.log('📍 Connection String:', MONGODB_CONFIG.connectionString.replace(/\/\/.*@/, '//***:***@'));
      
      // Create MongoDB client with shorter timeout for faster failure
      this.client = new MongoClient(MONGODB_CONFIG.connectionString, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 3000,
        socketTimeoutMS: 30000,
        connectTimeoutMS: 3000,
      });
      
      // Connect to MongoDB
      await this.client.connect();
      
      // Test the connection
      await this.client.db(MONGODB_CONFIG.database).command({ ping: 1 });
      
      this.db = this.client.db(MONGODB_CONFIG.database);
      this.isConnected = true;
      
      console.log('✅ MongoDB Connected Successfully!');
      console.log('🗄️ Database:', MONGODB_CONFIG.database);
      console.log('📊 Collections:', Object.keys(MONGODB_CONFIG.collections).join(', '));
      console.log('🎯 Status: Using Real MongoDB Connection');
      
      // Initialize default data if collections are empty
      await this.initializeDefaultData();
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      this.isConnected = false;
      
      // Don't throw error - let the app continue with disconnected state
      console.warn('⚠️ App will continue without MongoDB connection');
    }
  }

  private getCollection<T extends Document>(collectionName: string): Collection<T> {
    if (!this.db) {
      throw new Error('MongoDB not connected');
    }
    return this.db.collection<T>(collectionName);
  }

  private async initializeDefaultData(): Promise<void> {
    try {
      // Check if users collection is empty and initialize with default data
      const usersCount = await this.count('users');
      if (usersCount === 0) {
        console.log('🔄 Initializing default users...');
        await this.insertMany('users', [
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
          }
        ] as User[]);
      }

      // Check if fundraisers collection is empty and initialize with default data
      const fundraisersCount = await this.count('fundraisers');
      if (fundraisersCount === 0) {
        console.log('🔄 Initializing default fundraisers...');
        await this.insertMany('fundraisers', [
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
          }
        ] as Fundraiser[]);
      }

      // Check if events collection is empty and initialize with default data
      const eventsCount = await this.count('events');
      if (eventsCount === 0) {
        console.log('🔄 Initializing default events...');
        await this.insertMany('events', [
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
          }
        ] as Event[]);
      }
    } catch (error) {
      console.error('Error initializing default data:', error);
    }
  }

  // MongoDB CRUD operations

  // Find operations
  async find<T extends Document>(collection: string, filter: Filter<T> = {}, options: QueryOptions = {}): Promise<T[]> {
    if (!this.isConnected || !this.db) {
      console.warn('MongoDB not connected, returning empty results');
      return [];
    }

    try {
      const col = this.getCollection<T>(collection);
      let cursor = col.find(filter);

      // Apply sorting
      if (options.sort) {
        cursor = cursor.sort(options.sort);
      }

      // Apply skip and limit
      if (options.skip) {
        cursor = cursor.skip(options.skip);
      }
      if (options.limit) {
        cursor = cursor.limit(options.limit);
      }

      const results = await cursor.toArray();
      return results as T[];
    } catch (error) {
      console.error(`Error finding documents in ${collection}:`, error);
      return [];
    }
  }

  async findOne<T extends Document>(collection: string, filter: Filter<T> = {}): Promise<T | null> {
    if (!this.isConnected || !this.db) {
      console.warn('MongoDB not connected, returning null');
      return null;
    }

    try {
      const col = this.getCollection<T>(collection);
      const result = await col.findOne(filter);
      return result as T | null;
    } catch (error) {
      console.error(`Error finding document in ${collection}:`, error);
      return null;
    }
  }

  async findById<T extends Document>(collection: string, id: string): Promise<T | null> {
    return this.findOne<T>(collection, { $or: [{ _id: id }, { id: id }] } as Filter<T>);
  }

  // Insert operations
  async insertOne<T extends Document>(collection: string, document: any): Promise<T> {
    if (!this.isConnected || !this.db) {
      throw new Error('MongoDB not connected');
    }

    try {
      const col = this.getCollection<T>(collection);
      const doc = {
        ...document,
        createdAt: document.createdAt || new Date()
      };

      const result = await col.insertOne(doc);
      console.log(`📄 Inserted document into ${collection}:`, result.insertedId);
      
      // Return the inserted document
      return { ...doc, _id: result.insertedId } as T;
    } catch (error) {
      console.error(`Error inserting document into ${collection}:`, error);
      throw error;
    }
  }

  async insertMany<T extends Document>(collection: string, documents: any[]): Promise<T[]> {
    if (!this.isConnected || !this.db) {
      throw new Error('MongoDB not connected');
    }

    try {
      const col = this.getCollection<T>(collection);
      const docs = documents.map(doc => ({
        ...doc,
        createdAt: doc.createdAt || new Date()
      }));

      const result = await col.insertMany(docs);
      console.log(`📄 Inserted ${Object.keys(result.insertedIds).length} documents into ${collection}`);
      
      // Return the inserted documents with their IDs
      return docs.map((doc, index) => ({
        ...doc,
        _id: result.insertedIds[index]
      })) as T[];
    } catch (error) {
      console.error(`Error inserting documents into ${collection}:`, error);
      throw error;
    }
  }

  // Update operations
  async updateOne<T extends Document>(collection: string, filter: Filter<T>, update: Partial<T>, options: UpdateOptions = {}): Promise<T | null> {
    if (!this.isConnected || !this.db) {
      throw new Error('MongoDB not connected');
    }

    try {
      const col = this.getCollection<T>(collection);
      const updateDoc = {
        $set: {
          ...update,
          updatedAt: new Date()
        }
      };

      const result = await col.findOneAndUpdate(
        filter,
        updateDoc,
        { 
          returnDocument: 'after',
          upsert: options.upsert || false
        }
      );

      if (result && result.value) {
        console.log(`🔄 Updated document in ${collection}`);
        return result.value as T;
      }
      
      return null;
    } catch (error) {
      console.error(`Error updating document in ${collection}:`, error);
      return null;
    }
  }

  async updateById<T extends Document>(collection: string, id: string, update: Partial<T>): Promise<T | null> {
    return this.updateOne(collection, { $or: [{ _id: id }, { id: id }] } as Filter<T>, update);
  }

  // Delete operations
  async deleteOne(collection: string, filter: Filter<Document>): Promise<boolean> {
    if (!this.isConnected || !this.db) {
      throw new Error('MongoDB not connected');
    }

    try {
      const col = this.getCollection(collection);
      const result = await col.deleteOne(filter);
      
      if (result.deletedCount > 0) {
        console.log(`🗑️ Deleted document from ${collection}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error deleting document from ${collection}:`, error);
      return false;
    }
  }

  async deleteById(collection: string, id: string): Promise<boolean> {
    return this.deleteOne(collection, { $or: [{ _id: id }, { id: id }] } as Filter<Document>);
  }

  // Aggregation pipeline
  async aggregate<T extends Document>(collection: string, pipeline: any[]): Promise<T[]> {
    if (!this.isConnected || !this.db) {
      throw new Error('MongoDB not connected');
    }

    try {
      const col = this.getCollection<T>(collection);
      const cursor = col.aggregate(pipeline);
      const results = await cursor.toArray();
      console.log(`🔍 Ran aggregation on ${collection}:`, pipeline.length, 'stages');
      return results as T[];
    } catch (error) {
      console.error(`Error running aggregation on ${collection}:`, error);
      return [];
    }
  }

  // Count operations
  async count(collection: string, filter: Filter<Document> = {}): Promise<number> {
    if (!this.isConnected || !this.db) {
      throw new Error('MongoDB not connected');
    }

    try {
      const col = this.getCollection(collection);
      const count = await col.countDocuments(filter);
      return count;
    } catch (error) {
      console.error(`Error counting documents in ${collection}:`, error);
      return 0;
    }
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
      connectionString: MONGODB_CONFIG.connectionString.replace(/\/\/.*@/, '//***:***@'),
      mode: 'Real MongoDB Connection',
      status: this.isConnected ? 'Active' : 'Disconnected'
    };
  }

  // Close connection
  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      console.log('🔌 MongoDB connection closed');
    }
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