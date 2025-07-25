import express from 'express';
import cors from 'cors';
import 'dotenv/config';
// import { userOperations, roleOperations, CreateUserData, UpdateUserData, CreateRoleData, UpdateRoleData, initializeDatabase } from '../database/mongodb';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// n8n webhook proxy routes
app.get('/n8n-proxy/get-users', async (req, res) => {
  try {
    const webhookUrl = process.env.VITE_N8N_GET_USERS_WEBHOOK_URL;
    if (!webhookUrl) {
      return res.status(500).json({ error: 'VITE_N8N_GET_USERS_WEBHOOK_URL not configured' });
    }
    
    const response = await fetch(webhookUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`n8n webhook responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error proxying n8n users webhook:', error);
    res.status(500).json({ error: 'Failed to fetch users from n8n webhook' });
  }
});

app.get('/n8n-proxy/get-roles', async (req, res) => {
  try {
    const webhookUrl = process.env.VITE_N8N_GET_ROLES_WEBHOOK_URL;
    if (!webhookUrl) {
      return res.status(500).json({ error: 'VITE_N8N_GET_ROLES_WEBHOOK_URL not configured' });
    }
    
    const response = await fetch(webhookUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`n8n webhook responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error proxying n8n roles webhook:', error);
    res.status(500).json({ error: 'Failed to fetch roles from n8n webhook' });
  }
});

// Initialize database connection with better error handling
// initializeDatabase().catch(error => {
//   console.error('Failed to initialize database:', error);
//   console.error('API server will continue but database operations will fail');
// });

// Authentication middleware
const authenticateAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // In a real app, you'd verify JWT tokens here
  // For demo purposes, we'll skip authentication
  next();
};

// User routes
app.get('/api/users', authenticateAdmin, async (req, res) => {
  res.status(501).json({ error: 'User operations not implemented yet' });
});

app.get('/api/users/:id', authenticateAdmin, async (req, res) => {
  res.status(501).json({ error: 'User operations not implemented yet' });
});

app.post('/api/users', authenticateAdmin, async (req, res) => {
  res.status(501).json({ error: 'User operations not implemented yet' });
});

app.put('/api/users/:id', authenticateAdmin, async (req, res) => {
  res.status(501).json({ error: 'User operations not implemented yet' });
});

app.delete('/api/users/:id', authenticateAdmin, async (req, res) => {
  res.status(501).json({ error: 'User operations not implemented yet' });
});

// Role routes
app.get('/api/roles', authenticateAdmin, async (req, res) => {
  res.status(501).json({ error: 'Role operations not implemented yet' });
});

app.get('/api/roles/:id', authenticateAdmin, async (req, res) => {
  res.status(501).json({ error: 'Role operations not implemented yet' });
});

app.post('/api/roles', authenticateAdmin, async (req, res) => {
  res.status(501).json({ error: 'Role operations not implemented yet' });
});

app.put('/api/roles/:id', authenticateAdmin, async (req, res) => {
  res.status(501).json({ error: 'Role operations not implemented yet' });
});

app.delete('/api/roles/:id', authenticateAdmin, async (req, res) => {
  res.status(501).json({ error: 'Role operations not implemented yet' });
});

// Authentication route
app.post('/api/auth/login', async (req, res) => {
  res.status(501).json({ error: 'Authentication not implemented yet' });
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log('n8n proxy routes available at:');
  console.log('  - GET /n8n-proxy/get-users');
  console.log('  - GET /n8n-proxy/get-roles');
});

export default app;