import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDatabase, isDbConnected } from './config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check with Database Status
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Nagpur Civic Infrastructure Backend API',
    databaseConnected: isDbConnected(),
    timestamp: new Date().toISOString(),
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
    // Still listen for diagnostics if DB is unreachable
    app.listen(PORT, () => {
      console.log(`[Server] Nagpur Civic API running in degraded mode on http://localhost:${PORT}`);
    });
  }
}

// If executed directly
if (require.main === module) {
  startServer();
}

export default app;
