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

// Health Check & Diagnostics
app.get('/health', async (req, res) => {
  let dbStatus = 'UNKNOWN';
  let dbError = null;
  let userCount = -1;

  try {
    const prisma = (await import('./prisma')).default;
    userCount = await prisma.user.count();
    dbStatus = 'CONNECTED';
  } catch (err: any) {
    dbStatus = 'FAILED';
    dbError = err.message;
  }

  res.status(dbStatus === 'CONNECTED' ? 200 : 500).json({ 
    status: dbStatus,
    message: dbStatus === 'CONNECTED' ? 'HAMS API is running smoothly' : 'HAMS API has database connection issues',
    version: '1.2.3-DIAG-V3',
    db: {
      status: dbStatus,
      error: dbError,
      userCount: userCount
    },
    env: {
      nodeEnv: process.env.NODE_ENV,
      hasDbUrl: !!process.env.DATABASE_URL,
      port: PORT
    },
    timestamp: new Date().toISOString()
  });
});

// Main API Routes
app.use('/api', routes);

// Start server
app.listen(PORT, () => {
  console.log(`Server v1.2.3-DEBUG-DB-V2 running on port ${PORT}`);
  console.log('Registered Routes: /health, /api/debug-db, /api/*');
});
