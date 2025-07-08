// src/config/index.ts
// Central configuration loader that combines all config modules
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './database.config';
import appConfig from './app.config';
import authConfig from './auth.config';
import fileUploadConfig from './file-upload.config';
import cacheConfig from './cache.config';
import emailConfig from './email.config';
import loggingConfig from './logging.config';

export const configModules = ConfigModule.forRoot({
  isGlobal: true,                    // Make configuration available globally
  cache: true,                       // Cache configuration for performance
  expandVariables: true,             // Allow variable expansion like ${VAR}
  envFilePath: [
    `.env.${process.env.NODE_ENV}`,  // Environment-specific file first
    '.env',                          // Fallback to default .env
  ],
  load: [
    databaseConfig,
    appConfig,
    authConfig,
    fileUploadConfig,
    cacheConfig,
    emailConfig,
    loggingConfig,
  ],
  validationOptions: {
    allowUnknown: false,             // Don't allow unknown environment variables
    abortEarly: true,                // Stop on first validation error
  },
});

// Export all individual configs for direct import if needed
export {
  databaseConfig,
  appConfig,
  authConfig,
  fileUploadConfig,
  cacheConfig,
  emailConfig,
  loggingConfig,
};