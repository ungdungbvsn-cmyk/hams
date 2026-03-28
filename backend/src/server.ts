import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'HAMS API is running smoothly',
    version: '1.2.3-DEBUG-DB-V2',
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// Direct DB Test Route - MUST be before app.use('/api', routes)
app.get('/api/debug-db', async (req, res) => {
  try {
    const prisma = (await import('./prisma')).default;
    const count = await prisma.user.count();
    const firstUser = await prisma.user.findFirst({ include: { role: true } });
    
    res.json({
      success: true,
      userCount: count,
      firstUser: firstUser ? {
        id: firstUser.id,
        username: firstUser.username,
        role: firstUser.role?.name
      } : null,
      env: {
        nodeEnv: process.env.NODE_ENV,
        hasDbUrl: !!process.env.DATABASE_URL
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      stack: error.stack
    });
  }
});

// Routes
app.use('/api', routes);

// Start server
app.listen(PORT, () => {
  console.log(`Server v1.2.3-DEBUG-DB-V2 running on port ${PORT}`);
  console.log('Registered Routes: /health, /api/debug-db, /api/*');
});
