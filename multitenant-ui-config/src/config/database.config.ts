// src/config/database.config.ts
// Fixed version - handles undefined environment variables properly
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  // Primary database connection - FIXED: Handle undefined URI
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/multitenant_ui_config',
  dbName: process.env.MONGODB_DB_NAME || 'multitenant_ui_config',
  
  // Connection options for MongoDB - FIXED: Handle undefined numbers
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    
    // Connection pooling - FIXED: Proper parseInt with defaults
    maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '10', 10),
    minPoolSize: 2,
    
    // Timeouts - FIXED: Handle undefined timeout values
    serverSelectionTimeoutMS: parseInt(process.env.MONGODB_TIMEOUT || '5000', 10),
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    
    // Buffering (disable for better error handling)
    bufferMaxEntries: 0,
    bufferCommands: false,
    
    // Retry logic
    retryWrites: true,
    retryReads: true,
    
    // Read preferences for scaling
    readPreference: process.env.NODE_ENV === 'production' ? 'secondaryPreferred' : 'primary',
    
    // Write concern
    w: 'majority',
    
    // Compression
    compressors: ['zstd', 'snappy', 'zlib'],
    
    // Monitoring
    monitorCommands: process.env.NODE_ENV === 'development',
  },
  
  // Index creation options
  indexes: {
    background: true,
    unique: true,
  },
  
  // GridFS configuration for file storage
  gridfs: {
    bucketName: 'uploads',
    chunkSizeBytes: 261120, // 255KB chunks
  },
}));