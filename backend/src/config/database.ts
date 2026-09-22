import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://aashukamblee_db_user:admin1234@ac-lv8p85n-shard-00-00.pycykvl.mongodb.net:27017,ac-lv8p85n-shard-00-01.pycykvl.mongodb.net:27017,ac-lv8p85n-shard-00-02.pycykvl.mongodb.net:27017/nagpur_civic?ssl=true&replicaSet=atlas-iqurnh-shard-0&authSource=admin&retryWrites=true&w=majority';

let isConnected = false;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (isConnected) {
    return mongoose;
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4
    });

    isConnected = true;
    console.log(`[Database] Successfully connected to MongoDB Atlas (Database: ${conn.connection.name})`);

    mongoose.connection.on('error', (err) => {
      console.error('[Database] MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database] MongoDB disconnected. Attempting reconnection...');
      isConnected = false;
    });

    return conn;
  } catch (error) {
    console.error('[Database] Fatal: Failed to connect to MongoDB Atlas:', error);
    throw error;
  }
}

export function isDbConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}
