import mongoose from 'mongoose';
import { config } from './env.js';

let mongodInstance: any = null;

export const connectDB = async (): Promise<void> => {
  try {
    mongoose.set('strictQuery', false);

    console.log(`[PFIS Database] Attempting connection to MongoDB at: ${config.mongoUri}...`);

    // Attempt primary connection with 3000ms serverSelectionTimeoutMS
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });

    console.log(`[PFIS Database] Connected successfully to MongoDB: ${mongoose.connection.name}`);
  } catch (error: any) {
    console.warn(`[PFIS Database Notice] Primary MongoDB not reachable (${error.message}).`);
    console.log('[PFIS Database] Starting embedded in-memory MongoDB engine for zero-setup demo mode...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create({
        instance: {
          dbName: 'pfis',
        },
      });

      const uri = mongodInstance.getUri();
      console.log(`[PFIS Database] In-Memory MongoDB running at: ${uri}`);

      await mongoose.connect(uri);
      console.log('[PFIS Database] Successfully connected to In-Memory MongoDB instance!');

      // Automatically populate seed data for instant evaluation
      const { runAutomaticSeed } = await import('../seed/seed.js');
      await runAutomaticSeed();
    } catch (memErr: any) {
      console.error('[PFIS Database Fatal Error] Failed to initialize embedded MongoDB:', memErr.message);
      throw memErr;
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error('[PFIS Database Error]', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[PFIS Database] MongoDB disconnected.');
  });
};

export const closeDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
  } catch (e) {
    console.error('Error closing DB', e);
  }
};
