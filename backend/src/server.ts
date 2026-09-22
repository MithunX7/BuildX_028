import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectToDatabase, isDbConnected } from './config/database';
import authRoutes from './routes/authRoutes';
import issueRoutes from './routes/issueRoutes';
import workOrderRoutes from './routes/workOrderRoutes';
import constructionRoutes from './routes/constructionRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import adminRoutes from './routes/adminRoutes';
import maintenanceRoutes from './routes/maintenanceRoutes';
import { ensureStorageDirectory } from './services/storageService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

ensureStorageDirectory();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static uploads serving
app.use('/uploads', express.static(path.resolve(process.env.STORAGE_PATH || './uploads')));
// Seed images fallback (tracked in git, always available)
app.use('/uploads', express.static(path.resolve('./public/seed-images')));

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Nagpur Civic Infrastructure Backend API',
    databaseConnected: isDbConnected(),
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/work-orders', workOrderRoutes);
app.use('/api/construction-projects', constructionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/maintenance', maintenanceRoutes);

// Error Fallback
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('[Unhandled Server Error]', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: err.message || 'Internal server error',
    },
  });
});

async function startServer() {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`[Server] Nagpur Civic API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[Server] Failed to start server due to DB connection error:', error);
    app.listen(PORT, () => {
      console.log(`[Server] Nagpur Civic API running in degraded mode on http://localhost:${PORT}`);
    });
  }
}

if (require.main === module) {
  startServer();
}

export default app;
