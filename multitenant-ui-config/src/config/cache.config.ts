// src/config/cache.config.ts
// Caching configuration for Redis and in-memory cache
import { registerAs } from '@nestjs/config';

export default registerAs('cache', () => ({
  // Default cache settings
  default: {
    ttl: parseInt(process.env.CACHE_TTL, 10) || 3600, // 1 hour
    maxItems: parseInt(process.env.CACHE_MAX_ITEMS, 10) || 1000,
  },
  
  // Redis configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
    keyPrefix: 'multitenant:',
    
    // Connection options
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    
    // Connection pool
    family: 4,
    keepAlive: true,
    commandTimeout: 5000,
  },
  
  // Cache strategies for different data types
  strategies: {
    // Configuration cache (themes, pages, etc.)
    configuration: {
      ttl: 7200, // 2 hours
      keyPattern: 'config:{tenantId}:{type}:{id}',
    },
    
    // User session cache
    session: {
      ttl: 1800, // 30 minutes
      keyPattern: 'session:{userId}',
    },
    
    // API response cache
    api: {
      ttl: 300, // 5 minutes
      keyPattern: 'api:{method}:{url}:{hash}',
    },
    
    // File metadata cache
    files: {
      ttl: 3600, // 1 hour
      keyPattern: 'file:{tenantId}:{fileId}',
    },
  },
  
  // Cache warming (preload frequently accessed data)
  warming: {
    enabled: process.env.NODE_ENV === 'production',
    strategies: ['configuration', 'themes'],
    interval: 60000, // 1 minute
  },
}));