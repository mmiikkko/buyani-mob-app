import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from '../db/index.js';
import authRoutes from './routes/auth.js';
import { user } from '../db/schema.js';
import { sql } from 'drizzle-orm';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Buyani API is running' });
});

// Database health check
app.get('/health/db', async (req, res) => {
  try {
    // Test database connection with a simple query
    await db.execute(sql`SELECT 1`);
    
    // Try to query user table (might not exist yet)
    try {
      await db.select().from(user).limit(1);
      res.json({ 
        status: 'ok', 
        message: 'Database connection successful',
        tables: 'User table exists'
      });
    } catch (tableError: any) {
      if (tableError.code === 'ER_NO_SUCH_TABLE') {
        res.json({ 
          status: 'ok', 
          message: 'Database connection successful',
          warning: 'User table does not exist yet. Run migrations to create tables.'
        });
      } else {
        throw tableError;
      }
    }
  } catch (error: any) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Database connection failed',
      error: error.message 
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);

// Test database connection on startup
async function testDatabaseConnection() {
  try {
    await db.execute(sql`SELECT 1`);
    console.log('✅ Database connection successful');
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    console.error('⚠️  Server will start, but database operations may fail.');
    console.error('💡 Run "npm run test:db" to diagnose connection issues.');
  }
}

app.listen(PORT, async () => {
  console.log(`🚀 Buyani API server running on port ${PORT}`);
  await testDatabaseConnection();
});

