import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from root or local
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pfis',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pfis',
  jwtSecret: process.env.JWT_SECRET || 'pfis_super_secure_jwt_secret_key_2026_sih',
  jwtExpiresIn: '7d',
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
};
