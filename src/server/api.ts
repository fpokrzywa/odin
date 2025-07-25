import express from 'express';
import cors from 'cors';
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3001;

// Add basic middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// n8n webhook proxy routes
app.get('/n8n-proxy/get-users', async (req, res) => {
  try {
    const webhookUrl = String(process.env.VITE_N8N_GET_USERS_WEBHOOK_URL || '');
    console.log('🔄 Attempting to fetch users from webhook:', webhookUrl);
    if (!webhookUrl || webhookUrl === '') {
      console.error('❌ VITE_N8N_GET_USERS_WEBHOOK_URL not configured');
      return res.status(500).json({ error: 'VITE_N8N_GET_USERS_WEBHOOK_URL not configured' });
    }
    
    const response = await fetch(webhookUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('❌ n8n webhook error:', response.status, response.statusText);
      throw new Error(`n8n webhook responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Successfully fetched users from webhook');
    res.json(data);
  } catch (error) {
    console.error('Error proxying n8n users webhook:', error);
    res.status(500).json({ error: 'Failed to fetch users from n8n webhook' });
  }
});

app.get('/n8n-proxy/get-roles', async (req, res) => {
  try {
    const webhookUrl = String(process.env.VITE_N8N_GET_ROLES_WEBHOOK_URL || '');
    console.log('🔄 Attempting to fetch roles from webhook:', webhookUrl);
    if (!webhookUrl || webhookUrl === '') {
      console.error('❌ VITE_N8N_GET_ROLES_WEBHOOK_URL not configured');
      return res.status(500).json({ error: 'VITE_N8N_GET_ROLES_WEBHOOK_URL not configured' });
    }
    
    const response = await fetch(webhookUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('❌ n8n webhook error:', response.status, response.statusText);
      throw new Error(`n8n webhook responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Successfully fetched roles from webhook');
    res.json(data);
  } catch (error) {
    console.error('Error proxying n8n roles webhook:', error);
    res.status(500).json({ error: 'Failed to fetch roles from n8n webhook' });
  }
});

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
  console.log(`Health check available at http://localhost:${PORT}/health`);
  console.log('Environment check:');
  console.log('  - VITE_N8N_GET_USERS_WEBHOOK_URL:', process.env.VITE_N8N_GET_USERS_WEBHOOK_URL ? '✅ Configured' : '❌ Missing');
  console.log('  - VITE_N8N_GET_ROLES_WEBHOOK_URL:', process.env.VITE_N8N_GET_ROLES_WEBHOOK_URL ? '✅ Configured' : '❌ Missing');
  console.log('n8n proxy routes available at:');
  console.log('  - GET /n8n-proxy/get-users');
  console.log('  - GET /n8n-proxy/get-roles');
}).on('error', (err) => {
  console.error('❌ Failed to start server:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please kill the existing process or use a different port.`);
  }
  process.exit(1);
});

module.exports = app;