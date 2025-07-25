import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { userOperations, roleOperations, CreateUserData, UpdateUserData, CreateRoleData, UpdateRoleData, initializeDatabase } from '../database/mongodb';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Initialize database connection with better error handling
initializeDatabase().catch(error => {
  console.error('Failed to initialize database:', error);
  console.error('API server will continue but database operations will fail');
});

// Authentication middleware
const authenticateAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // In a real app, you'd verify JWT tokens here
  // For demo purposes, we'll skip authentication
  next();
};

// User routes
app.get('/api/users', authenticateAdmin, async (req, res) => {
  try {
    const users = await userOperations.getAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const user = await userOperations.getById(parseInt(req.params.id));
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.post('/api/users', authenticateAdmin, async (req, res) => {
  try {
    const userData: CreateUserData = req.body;
    
    // Validate required fields
    if (!userData.email || !userData.password || !userData.role_id) {
      return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    const user = await userOperations.create(userData);
    res.status(201).json(user);
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT' || error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
});

app.put('/api/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const userData: UpdateUserData = req.body;
    const user = await userOperations.update(parseInt(req.params.id), userData);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT' || error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update user' });
    }
  }
});

app.delete('/api/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const success = await userOperations.delete(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Role routes
app.get('/api/roles', authenticateAdmin, async (req, res) => {
  try {
    const roles = await roleOperations.getAll();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

app.get('/api/roles/:id', authenticateAdmin, async (req, res) => {
  try {
    const role = await roleOperations.getById(parseInt(req.params.id));
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json(role);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch role' });
  }
});

app.post('/api/roles', authenticateAdmin, async (req, res) => {
  try {
    const roleData: CreateRoleData = req.body;
    
    if (!roleData.name || !roleData.permissions) {
      return res.status(400).json({ error: 'Name and permissions are required' });
    }

    const role = await roleOperations.create(roleData);
    res.status(201).json(role);
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT' || error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'Role name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create role' });
    }
  }
});

app.put('/api/roles/:id', authenticateAdmin, async (req, res) => {
  try {
    const roleData: UpdateRoleData = req.body;
    const role = await roleOperations.update(parseInt(req.params.id), roleData);
    
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    res.json(role);
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT' || error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'Role name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update role' });
    }
  }
});

app.delete('/api/roles/:id', authenticateAdmin, async (req, res) => {
  try {
    const success = await roleOperations.delete(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json({ message: 'Role deleted successfully' });
  } catch (error: any) {
    if (error.message.includes('Cannot delete role')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to delete role' });
    }
  }
});

// Authentication route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await userOperations.getByEmail(email);
    if (!user || !userOperations.verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is disabled' });
    }

    // Update last login
    await userOperations.updateLastLogin(user.id);

    // In a real app, you'd generate a JWT token here
    const { password_hash, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token: 'demo-token' });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});

export default app;