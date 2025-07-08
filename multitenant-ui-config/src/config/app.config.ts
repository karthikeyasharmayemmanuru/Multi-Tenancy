// Fixed version - handles undefined environment variables properly
import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  // Basic app info
  name: process.env.APP_NAME || 'MultiTenant UI Config',
  version: process.env.APP_VERSION || '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  
  // Server configuration - FIXED: Handle undefined PORT
  server: {
    port: parseInt(process.env.PORT || '3000', 10),  // ✅ Fixed: Provide default string
    host: process.env.HOST || 'localhost',
    apiPrefix: process.env.API_PREFIX || 'api/v1',
  },
  
  // CORS configuration - FIXED: Handle undefined CORS_ORIGIN
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:4200'],
    credentials: process.env.CORS_CREDENTIALS === 'true',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
  },
  
  // Feature flags - FIXED: Proper boolean conversion
  features: {
    swagger: process.env.ENABLE_SWAGGER === 'true',
    rateLimiting: process.env.ENABLE_RATE_LIMITING === 'true',
    caching: process.env.ENABLE_CACHING === 'true',
    fileUpload: process.env.ENABLE_FILE_UPLOAD === 'true',
    emailNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
  },
  
  // Rate limiting configuration - FIXED: Handle undefined numbers
  rateLimiting: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
    limit: parseInt(process.env.RATE_LIMIT_LIMIT || '100', 10),
    skipIf: process.env.RATE_LIMIT_SKIP_IF === 'true',
  },
  
  // Static files configuration
  static: {
    filesPath: process.env.STATIC_FILES_PATH || './uploads',
    filesUrl: process.env.STATIC_FILES_URL || '/uploads',
    tempPath: process.env.TEMP_FILES_PATH || './temp',
  },
  
  // SCSS/CSS compilation
  scss: {
    inputPath: process.env.SASS_PATH || './src/assets/scss',
    outputPath: process.env.SASS_OUTPUT_PATH || './dist/css',
    outputStyle: process.env.SASS_OUTPUT_STYLE || 'compressed',
    autoprefixer: {
      browsers: process.env.AUTOPREFIXER_BROWSERS || 'last 2 versions, > 1%',
    },
  },
  
  // External services
  external: {
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
      apiKey: process.env.CLOUDINARY_API_KEY || '',
      apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    },
    sentry: {
      dsn: process.env.SENTRY_DSN || '',
    },
    analytics: {
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || '',
    },
  },
}));