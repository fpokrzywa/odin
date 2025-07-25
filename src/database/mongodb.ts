import { MongoClient, Db, Collection } from 'mongodb';
import bcrypt from 'bcryptjs';

const CONNECTION_STRING = process.env.MONGODB_CONNECTION_STRING || 'mongodb://localhost:27017';
const DATABASE_NAME = process.env.MONGODB_DATABASE_NAME;
const COLLECTION_NAME = process.env.MONGODB_COLLECTION_NAME;

let client: MongoClient | null = null;
let db: Db | null = null;

// User interface
export interface User {
  _id?: string;
  id?: number;
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  role_id: number;
  role_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  last_login?: string;
}

// Role interface
export interface Role {
  _id?: string;
  id: number;
  name: string;
  description?: string;
  permissions: string;
  created_at: string;
  updated_at?: string;
}

// Type definitions for create/update operations
export type CreateUserData = Omit<User, '_id' | 'id' | 'created_at' | 'updated_at' | 'role_name'>;
export type UpdateUserData = Partial<Omit<User, '_id' | 'id' | 'created_at' | 'updated_at' | 'role_name'>>;
export type CreateRoleData = Omit<Role, '_id' | 'id' | 'created_at' | 'updated_at'>;
export type UpdateRoleData = Partial<Omit<Role, '_id' | 'id' | 'created_at' | 'updated_at'>>;

// Connect to MongoDB
const connectToDatabase = async (): Promise<Db> => {
  if (db) {
    return db;
  }

  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('Connection string:', CONNECTION_STRING.replace(/:[^:@]*@/, ':****@'));
    
    client = new MongoClient(CONNECTION_STRING, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    await client.connect();
    console.log('MongoDB client connected successfully');
    
    db = client.db(DATABASE_NAME);
    console.log(`Connected to database: ${DATABASE_NAME}`);
    
    // Test the connection
    await db.admin().ping();
    console.log('MongoDB ping successful');
    
    // Initialize default data if needed
    await initializeDefaultData();
    
    return db;
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw error;
  }
};

// Initialize default roles and admin user
const initializeDefaultData = async () => {
  if (!db) return;

  try {
    const usersCollection = db.collection(COLLECTION_NAME);
    const rolesCollection = db.collection('roles');

    // Check if roles exist, if not create default roles
    const rolesCount = await rolesCollection.countDocuments();
    if (rolesCount === 0) {
      const defaultRoles = [
        {
          id: 1,
          name: 'Admin',
          description: 'Full system access',
          permissions: JSON.stringify(['user_management', 'role_management', 'system_settings']),
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          name: 'User',
          description: 'Standard user access',
          permissions: JSON.stringify(['basic_access']),
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          name: 'Manager',
          description: 'Manager level access',
          permissions: JSON.stringify(['basic_access', 'team_management']),
          created_at: new Date().toISOString()
        }
      ];

      await rolesCollection.insertMany(defaultRoles);
      console.log('Default roles created');
    }

    // Check if admin user exists, if not create default admin
    const adminUser = await usersCollection.findOne({ email: 'freddie@3cpublish.com' });
    if (!adminUser) {
      const hashedPassword = bcrypt.hashSync('Appdev2025!', 10);
      const defaultAdmin = {
        id: 1,
        email: 'freddie@3cpublish.com',
        password_hash: hashedPassword,
        first_name: 'Freddie',
        last_name: 'Admin',
        role_id: 1,
        is_active: true,
        created_at: new Date().toISOString()
      };

      await usersCollection.insertOne(defaultAdmin);
      console.log('Default admin user created');
    }
  } catch (error) {
    console.error('Error initializing default data:', error);
  }
};

// Get next ID for a collection
const getNextId = async (collectionName: string): Promise<number> => {
  if (!db) throw new Error('Database not connected');
  
  const collection = db.collection(collectionName);
  const lastDoc = await collection.findOne({}, { sort: { id: -1 } });
  return lastDoc ? (lastDoc.id || 0) + 1 : 1;
};

// User operations
export const userOperations = {
  getAll: async (): Promise<User[]> => {
    const database = await connectToDatabase();
    const usersCollection = database.collection(COLLECTION_NAME);
    const rolesCollection = database.collection('roles');
    
    const users = await usersCollection.find({}).sort({ created_at: -1 }).toArray();
    const roles = await rolesCollection.find({}).toArray();
    
    // Join user data with role names
    const usersWithRoles = users.map(user => {
      const role = roles.find(r => r.id === user.role_id);
      return {
        ...user,
        role_name: role?.name || 'Unknown'
      };
    });
    
    return usersWithRoles as User[];
  },

  getById: async (id: number): Promise<User | undefined> => {
    const database = await connectToDatabase();
    const usersCollection = database.collection(COLLECTION_NAME);
    const rolesCollection = database.collection('roles');
    
    const user = await usersCollection.findOne({ id });
    if (!user) return undefined;
    
    const role = await rolesCollection.findOne({ id: user.role_id });
    
    return {
      ...user,
      role_name: role?.name || 'Unknown'
    } as User;
  },

  getByEmail: async (email: string): Promise<User | undefined> => {
    const database = await connectToDatabase();
    const usersCollection = database.collection(COLLECTION_NAME);
    const rolesCollection = database.collection('roles');
    
    const user = await usersCollection.findOne({ email });
    if (!user) return undefined;
    
    const role = await rolesCollection.findOne({ id: user.role_id });
    
    return {
      ...user,
      role_name: role?.name || 'Unknown'
    } as User;
  },

  create: async (userData: CreateUserData): Promise<{ id: number }> => {
    const database = await connectToDatabase();
    const usersCollection = database.collection(COLLECTION_NAME);
    
    const id = await getNextId(COLLECTION_NAME);
    const newUser = {
      ...userData,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await usersCollection.insertOne(newUser);
    return { id };
  },

  update: async (id: number, userData: UpdateUserData): Promise<User | null> => {
    const database = await connectToDatabase();
    const usersCollection = database.collection(COLLECTION_NAME);
    
    const updateData = {
      ...userData,
      updated_at: new Date().toISOString()
    };
    
    const result = await usersCollection.updateOne(
      { id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return null;
    }
    
    return await userOperations.getById(id) || null;
  },

  delete: async (id: number): Promise<boolean> => {
    const database = await connectToDatabase();
    const usersCollection = database.collection(COLLECTION_NAME);
    
    const result = await usersCollection.deleteOne({ id });
    return result.deletedCount > 0;
  },

  verifyPassword: (password: string, hash: string): boolean => {
    return bcrypt.compareSync(password, hash);
  },

  updateLastLogin: async (id: number): Promise<void> => {
    const database = await connectToDatabase();
    const usersCollection = database.collection(COLLECTION_NAME);
    
    await usersCollection.updateOne(
      { id },
      { $set: { last_login: new Date().toISOString() } }
    );
  }
};

// Role operations
export const roleOperations = {
  getAll: async (): Promise<Role[]> => {
    const database = await connectToDatabase();
    const rolesCollection = database.collection('roles');
    
    const roles = await rolesCollection.find({}).sort({ id: 1 }).toArray();
    return roles as Role[];
  },

  getById: async (id: number): Promise<Role | undefined> => {
    const database = await connectToDatabase();
    const rolesCollection = database.collection('roles');
    
    const role = await rolesCollection.findOne({ id });
    return role as Role | undefined;
  },

  create: async (roleData: CreateRoleData): Promise<{ id: number }> => {
    const database = await connectToDatabase();
    const rolesCollection = database.collection('roles');
    
    const id = await getNextId('roles');
    const newRole = {
      ...roleData,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await rolesCollection.insertOne(newRole);
    return { id };
  },

  update: async (id: number, roleData: UpdateRoleData): Promise<Role | null> => {
    const database = await connectToDatabase();
    const rolesCollection = database.collection('roles');
    
    const updateData = {
      ...roleData,
      updated_at: new Date().toISOString()
    };
    
    const result = await rolesCollection.updateOne(
      { id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return null;
    }
    
    return await roleOperations.getById(id) || null;
  },

  delete: async (id: number): Promise<boolean> => {
    const database = await connectToDatabase();
    const rolesCollection = database.collection('roles');
    const usersCollection = database.collection(COLLECTION_NAME);
    
    // Check if any users have this role
    const usersWithRole = await usersCollection.countDocuments({ role_id: id });
    if (usersWithRole > 0) {
      throw new Error('Cannot delete role: users are assigned to this role');
    }
    
    const result = await rolesCollection.deleteOne({ id });
    return result.deletedCount > 0;
  }
};

// Initialize database connection
export const initializeDatabase = async () => {
  try {
    await connectToDatabase();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

// Close database connection
export const closeDatabase = async () => {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('Database connection closed');
  }
};