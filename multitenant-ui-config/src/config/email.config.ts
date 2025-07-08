// src/config/email.config.ts
// Email service configuration
import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  // SMTP configuration
  smtp: {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    
    // Advanced SMTP options
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: 14, // messages per second
  },
  
  // Default email settings
  defaults: {
    from: process.env.SMTP_USER || 'noreply@yourdomain.com',
    replyTo: process.env.SMTP_REPLY_TO,
  },
  
  // Email templates
  templates: {
    baseUrl: './src/templates/email',
    engine: 'handlebars',
    extension: '.hbs',
    
    // Template configurations
    welcome: {
      subject: 'Welcome to {{appName}}',
      template: 'welcome',
    },
    passwordReset: {
      subject: 'Password Reset Request',
      template: 'password-reset',
    },
    tenantCreated: {
      subject: 'Your tenant has been created',
      template: 'tenant-created',
    },
  },
  
  // Queue configuration for async email sending
  queue: {
    enabled: true,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
}));