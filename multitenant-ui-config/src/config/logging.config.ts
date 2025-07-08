// src/config/logging.config.ts
// Comprehensive logging configuration
import { registerAs } from '@nestjs/config';

export default registerAs('logging', () => ({
  // Log level configuration
  level: process.env.LOG_LEVEL || 'info',
  
  // File logging
  file: {
    enabled: true,
    path: process.env.LOG_FILE_PATH || './logs',
    filename: 'application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: process.env.LOG_MAX_SIZE || '20m',
    maxFiles: process.env.LOG_MAX_FILES || '14d',
    zippedArchive: true,
  },
  
  // Console logging
  console: {
    enabled: true,
    colorize: process.env.NODE_ENV === 'development',
    timestamp: true,
    
    // Format for different environments
    format: process.env.NODE_ENV === 'production' ? 'json' : 'simple',
  },
  
  // Error logging (separate file for errors)
  error: {
    enabled: true,
    filename: 'error-%DATE%.log',
    level: 'error',
    handleExceptions: true,
    handleRejections: true,
  },
  
  // Request logging
  http: {
    enabled: true,
    format: process.env.NODE_ENV === 'production' 
      ? ':remote-addr - :method :url :status :res[content-length] - :response-time ms'
      : 'dev',
    skip: (req, res) => res.statusCode < 400, // Only log errors in production
  },
  
  // Database query logging
  database: {
    enabled: process.env.NODE_ENV === 'development',
    logQueries: true,
    logSlowQueries: true,
    slowQueryThreshold: 1000, // 1 second
  },
  
  // Custom log contexts
  contexts: {
    tenant: true,      // Include tenant information in logs
    user: true,        // Include user information in logs
    request: true,     // Include request ID for tracing
    performance: true, // Include performance metrics
  },
}));