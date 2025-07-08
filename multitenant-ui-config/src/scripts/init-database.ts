// src/scripts/init-database.ts
// Enhanced version with Tenant Domains support
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../app.module';

async function initializeDatabase() {
  console.log('🔄 Starting database initialization...');

  // Create NestJS application context
  const app = await NestFactory.create(AppModule, new FastifyAdapter(), {
    logger: ['error', 'warn', 'log'],
  });

  try {
    // Get MongoDB connection
    const connection = app.get<Connection>(getConnectionToken());

    // ✅ FIXED: Check if connection and db exist
    if (!connection) {
      throw new Error('❌ Failed to get MongoDB connection');
    }

    if (connection.readyState !== 1) {
      throw new Error('❌ MongoDB connection is not ready');
    }

    // ✅ FIXED: Safely check if db exists
    if (!connection.db) {
      throw new Error('❌ Database instance is not available');
    }

    console.log('✅ Connected to MongoDB successfully');
    console.log(`📊 Database name: ${connection.db.databaseName}`);

    // Create collections if they don't exist
    await createCollections(connection);

    // Create indexes for performance
    await createIndexes(connection);

    // Insert sample data
    await insertSampleData(connection);

    console.log('✅ Database initialization completed successfully!');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1); // Exit with error code
  } finally {
    // Close the application
    await app.close();
  }
}

async function createCollections(connection: Connection) {
  console.log('📊 Creating collections...');

  // ✅ FIXED: Safe access to connection.db
  const db = connection.db;
  if (!db) {
    throw new Error('Database instance is not available');
  }

  // List of collections to create (Enhanced with tenant domains)
  const collections = [
    'tenants',
    'applications',
    'pages',
    'controls',
    'validators',
    'errormessages', // Note: MongoDB converts to lowercase
    'forms',
    'themes',
    'menuconfigurations',
    'assets',
    'configurationcache',
    'tenantdomains', // ✅ Enhanced: Added tenant domains collection
  ];

  for (const collectionName of collections) {
    try {
      // Check if collection exists
      const existingCollections = await db.listCollections({ name: collectionName }).toArray();

      if (existingCollections.length === 0) {
        await db.createCollection(collectionName);
        console.log(`  ✅ Created collection: ${collectionName}`);
      } else {
        console.log(`  ⚠️  Collection already exists: ${collectionName}`);
      }
    } catch (error) {
      console.error(`  ❌ Failed to create collection ${collectionName}:`, error.message);
    }
  }
}

async function createIndexes(connection: Connection) {
  console.log('🔍 Creating database indexes...');

  // ✅ FIXED: Safe access to connection.db
  const db = connection.db;
  if (!db) {
    throw new Error('Database instance is not available');
  }

  try {
    // Tenants collection indexes
    await db.collection('tenants').createIndex({ tenantId: 1 }, { unique: true });
    await db.collection('tenants').createIndex({ subdomain: 1 }, { unique: true });
    await db.collection('tenants').createIndex({ status: 1 });
    console.log('  ✅ Created tenants indexes');

    // Themes collection indexes
    await db.collection('themes').createIndex({ tenantId: 1, themeId: 1 }, { unique: true });
    await db.collection('themes').createIndex({ tenantId: 1, isActive: 1 });
    console.log('  ✅ Created themes indexes');

    // Pages collection indexes
    await db.collection('pages').createIndex({ tenantId: 1, applicationId: 1, pageId: 1 }, { unique: true });
    await db.collection('pages').createIndex({ tenantId: 1, route: 1 });
    console.log('  ✅ Created pages indexes');

    // Controls collection indexes
    await db.collection('controls').createIndex({ tenantId: 1, applicationId: 1, controlId: 1 }, { unique: true });
    console.log('  ✅ Created controls indexes');

    // Validators collection indexes
    await db.collection('validators').createIndex({ tenantId: 1, applicationId: 1, validatorId: 1 }, { unique: true });
    console.log('  ✅ Created validators indexes');

    // Error messages collection indexes
    await db.collection('errormessages').createIndex({ tenantId: 1, applicationId: 1, messageId: 1 }, { unique: true });
    console.log('  ✅ Created error messages indexes');

    // Forms collection indexes
    await db.collection('forms').createIndex({ tenantId: 1, applicationId: 1, formId: 1 }, { unique: true });
    console.log('  ✅ Created forms indexes');

    // Assets collection indexes
    await db.collection('assets').createIndex({ tenantId: 1, assetId: 1 }, { unique: true });
    console.log('  ✅ Created assets indexes');

    // Configuration cache collection with TTL index
    await db.collection('configurationcache').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    await db.collection('configurationcache').createIndex({ tenantId: 1, cacheKey: 1 });
    console.log('  ✅ Created cache indexes');

    // Text indexes for search functionality
    await db.collection('pages').createIndex({
      name: 'text',
      'header.title': 'text'
    });
    await db.collection('controls').createIndex({
      name: 'text',
      'properties.label': 'text'
    });
    console.log('  ✅ Created text search indexes');

    // ✅ Enhanced: Tenant Domains collection indexes
    await db.collection('tenantdomains').createIndex({ tenantId: 1 });
    await db.collection('tenantdomains').createIndex({ domain: 1 }, { unique: true });
    await db.collection('tenantdomains').createIndex({ tenantId: 1, domainType: 1 });
    await db.collection('tenantdomains').createIndex({ tenantId: 1, isDefault: 1 });
    await db.collection('tenantdomains').createIndex({ tenantId: 1, isPrimary: 1 });
    await db.collection('tenantdomains').createIndex({ status: 1 });
    await db.collection('tenantdomains').createIndex({ 'verification.verified': 1 });
    await db.collection('tenantdomains').createIndex({ tenantId: 1, domain: 1 });
    // Text search for domains
    await db.collection('tenantdomains').createIndex({ domain: 'text', notes: 'text' });
    console.log('  ✅ Created tenant domains indexes');

  } catch (error) {
    console.error('❌ Failed to create indexes:', error);
    throw error;
  }
}

async function insertSampleData(connection: Connection) {
  console.log('📝 Inserting sample data...');

  // ✅ FIXED: Safe access to connection.db
  const db = connection.db;
  if (!db) {
    throw new Error('Database instance is not available');
  }

  // Sample tenant data
  const sampleTenant = {
    tenantId: 'tenant_001',
    name: 'Demo Corporation',
    subdomain: 'demo',
    customDomain: null,
    status: 'active',
    plan: 'premium',
    settings: {
      timezone: 'UTC',
      dateFormat: 'YYYY-MM-DD',
      currency: 'USD',
      language: 'en',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Sample application data
  const sampleApplication = {
    tenantId: 'tenant_001',
    applicationId: 'app_001',
    name: 'User Management',
    description: 'User administration module',
    version: '1.0.0',
    status: 'active',
    config: {
      permissions: ['users.read', 'users.write', 'users.delete'],
      features: ['user-list', 'user-create', 'user-edit', 'user-delete'],
      integrations: ['ldap', 'oauth2', 'saml'],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Sample theme data
  const sampleTheme = {
    tenantId: 'tenant_001',
    themeId: 'default_theme',
    name: 'Default Theme',
    isActive: true,
    version: '1.0.0',
    styles: {
      compiledCSS: `
        :root { 
          --primary-color: #007bff; 
          --secondary-color: #6c757d; 
          --success-color: #28a745; 
          --danger-color: #dc3545;
          --warning-color: #ffc107;
          --info-color: #17a2b8;
          --light-color: #f8f9fa;
          --dark-color: #343a40;
        }
        .btn-primary { 
          background-color: var(--primary-color); 
          border-color: var(--primary-color); 
        }
        .btn-primary:hover {
          background-color: #0056b3;
          border-color: #0056b3;
        }
        .form-control { 
          border-radius: 0.375rem; 
          padding: 0.5rem 0.75rem; 
          border: 1px solid #ced4da;
        }
        .card {
          border-radius: 0.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
      `,
      scssSource: `
        $primary-color: #007bff; 
        $secondary-color: #6c757d; 
        $success-color: #28a745;
        $danger-color: #dc3545;
        $warning-color: #ffc107;
        $info-color: #17a2b8;
        
        :root {
          --primary-color: #{$primary-color};
          --secondary-color: #{$secondary-color};
          --success-color: #{$success-color};
          --danger-color: #{$danger-color};
          --warning-color: #{$warning-color};
          --info-color: #{$info-color};
        }
        
        .btn-primary {
          background-color: $primary-color;
          border-color: $primary-color;
          
          &:hover {
            background-color: darken($primary-color, 10%);
            border-color: darken($primary-color, 10%);
          }
        }
        
        .form-control {
          border-radius: 0.375rem;
          padding: 0.5rem 0.75rem;
          border: 1px solid #ced4da;
          
          &:focus {
            border-color: $primary-color;
            box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
          }
        }
      `,
      cssVariables: {
        '--primary-color': '#007bff',
        '--secondary-color': '#6c757d',
        '--success-color': '#28a745',
        '--danger-color': '#dc3545',
        '--warning-color': '#ffc107',
        '--info-color': '#17a2b8',
        '--light-color': '#f8f9fa',
        '--dark-color': '#343a40',
      },
    },
    componentStyles: {
      button: {
        scss: `.btn { padding: 0.5rem 1rem; border-radius: 0.375rem; font-weight: 400; transition: all 0.2s; }`,
        css: `.btn { padding: 0.5rem 1rem; border-radius: 0.375rem; font-weight: 400; transition: all 0.2s; }`,
      },
      form: {
        scss: `.form-control { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #ced4da; border-radius: 0.375rem; }`,
        css: `.form-control { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #ced4da; border-radius: 0.375rem; }`,
      },
      card: {
        scss: `.card { border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 1rem; background: white; }`,
        css: `.card { border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 1rem; background: white; }`,
      },
    },
    mediaQueries: {
      mobile: '@media (max-width: 768px)',
      tablet: '@media (min-width: 769px) and (max-width: 1024px)',
      desktop: '@media (min-width: 1025px)',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Sample page data
  const samplePage = {
    tenantId: 'tenant_001',
    applicationId: 'app_001',
    pageId: 'user_list_page',
    name: 'User List',
    route: '/users',
    pageType: 'list',
    header: {
      title: 'User Management',
      subtitle: 'Manage system users',
      showBreadcrumb: true,
      breadcrumb: [
        { label: 'Home', route: '/' },
        { label: 'Users', route: '/users' }
      ],
      actions: [
        {
          id: 'add_user',
          label: 'Add User',
          type: 'primary',
          icon: 'plus',
          action: 'navigate',
          target: '/users/create'
        },
        {
          id: 'export_users',
          label: 'Export',
          type: 'secondary',
          icon: 'download',
          action: 'api',
          target: '/api/users/export'
        }
      ]
    },
    layout: {
      type: 'standard',
      sidebar: {
        enabled: true,
        width: '250px',
        collapsible: true
      },
      footer: {
        enabled: true,
        text: '© 2024 Demo Corporation'
      }
    },
    metadata: {
      permissions: ['users.read'],
      cacheEnabled: true,
      cacheTTL: 300
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Sample control data
  const sampleControl = {
    tenantId: 'tenant_001',
    applicationId: 'app_001',
    controlId: 'user_email_input',
    name: 'Email Input',
    type: 'input',
    config: {
      inputType: 'email',
      placeholder: 'Enter email address',
      maxLength: 255,
      required: true,
      disabled: false,
      readonly: false,
      cssClass: 'form-control',
      width: '100%',
      size: 'medium',
    },
    properties: {
      label: 'Email Address',
      helpText: 'Please enter a valid email address',
      tooltip: 'This will be used for login and notifications',
    },
    dataBinding: {
      field: 'email',
      dataType: 'string',
      defaultValue: '',
      formatMask: null,
    },
    options: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // ✅ Enhanced: Sample tenant domain data
  const sampleTenantDomains = [
    {
      tenantId: 'tenant_001',
      domain: 'demo.yourapp.com',
      domainType: 'subdomain',
      status: 'active',
      isDefault: true,
      isPrimary: true,
      protocol: 'https',
      sslConfig: {
        sslEnabled: true,
        autoRenew: true,
      },
      verification: {
        verified: true,
        verificationMethod: 'dns',
        verificationDate: new Date(),
        dnsRecords: [
          {
            type: 'CNAME',
            name: 'demo',
            value: 'yourapp.com',
            ttl: 300,
          }
        ],
      },
      performanceConfig: {
        enabled: true,
        cacheHeaders: [
          {
            path: '/api/*',
            maxAge: 300,
            cacheControl: 'public, max-age=300',
          },
          {
            path: '/static/*',
            maxAge: 86400,
            cacheControl: 'public, max-age=86400',
          }
        ],
        compressionEnabled: true,
        minifyEnabled: true,
      },
      corsConfig: {
        allowedOrigins: ['https://demo.yourapp.com'],
        allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
        credentials: true,
      },
      dnsProvider: {
        provider: 'cloudflare',
        zoneId: 'zone123',
        recordId: 'record456',
        lastSyncDate: new Date(),
      },
      notes: 'Default subdomain for demo tenant',
      accessCount: 1250,
      lastAccessDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      tenantId: 'tenant_001',
      domain: 'demo-corp.com',
      domainType: 'custom',
      status: 'pending',
      isDefault: false,
      isPrimary: false,
      protocol: 'https',
      sslConfig: {
        sslEnabled: true,
        autoRenew: true,
      },
      verification: {
        verified: false,
        verificationMethod: 'dns',
        verificationToken: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
        dnsRecords: [
          {
            type: 'TXT',
            name: '_verification',
            value: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
            ttl: 300,
          },
          {
            type: 'CNAME',
            name: 'www',
            value: 'demo.yourapp.com',
            ttl: 300,
          }
        ],
      },
      performanceConfig: {
        enabled: false,
        cacheHeaders: [],
        compressionEnabled: true,
        minifyEnabled: true,
      },
      corsConfig: {
        allowedOrigins: ['https://demo-corp.com', 'https://www.demo-corp.com'],
        allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
        credentials: true,
      },
      dnsProvider: {},
      notes: 'Custom domain for demo tenant - pending DNS verification',
      accessCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      tenantId: 'tenant_001',
      domain: 'staging.demo.yourapp.com',
      domainType: 'subdomain',
      status: 'active',
      isDefault: false,
      isPrimary: false,
      protocol: 'https',
      sslConfig: {
        sslEnabled: true,
        autoRenew: true,
      },
      verification: {
        verified: true,
        verificationMethod: 'dns',
        verificationDate: new Date(Date.now() - 86400000), // 1 day ago
        dnsRecords: [
          {
            type: 'CNAME',
            name: 'staging.demo',
            value: 'staging.yourapp.com',
            ttl: 300,
          }
        ],
      },
      performanceConfig: {
        enabled: false,
        cacheHeaders: [],
        compressionEnabled: true,
        minifyEnabled: false, // Disable minification for staging
      },
      corsConfig: {
        allowedOrigins: ['*'], // More permissive for staging
        allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['*'],
        credentials: true,
      },
      dnsProvider: {
        provider: 'cloudflare',
        zoneId: 'zone123',
        recordId: 'record789',
        lastSyncDate: new Date(),
      },
      notes: 'Staging environment for demo tenant',
      accessCount: 45,
      lastAccessDate: new Date(Date.now() - 3600000), // 1 hour ago
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];

  try {
    // Insert tenant if not exists
    const existingTenant = await db.collection('tenants').findOne({ tenantId: sampleTenant.tenantId });
    if (!existingTenant) {
      await db.collection('tenants').insertOne(sampleTenant);
      console.log('  ✅ Sample tenant inserted');
    } else {
      console.log('  ⚠️  Sample tenant already exists');
    }

    // Insert application if not exists
    const existingApplication = await db.collection('applications').findOne({
      tenantId: sampleApplication.tenantId,
      applicationId: sampleApplication.applicationId
    });
    if (!existingApplication) {
      await db.collection('applications').insertOne(sampleApplication);
      console.log('  ✅ Sample application inserted');
    } else {
      console.log('  ⚠️  Sample application already exists');
    }

    // Insert theme if not exists
    const existingTheme = await db.collection('themes').findOne({
      tenantId: sampleTheme.tenantId,
      themeId: sampleTheme.themeId
    });
    if (!existingTheme) {
      await db.collection('themes').insertOne(sampleTheme);
      console.log('  ✅ Sample theme inserted');
    } else {
      console.log('  ⚠️  Sample theme already exists');
    }

    // Insert page if not exists
    const existingPage = await db.collection('pages').findOne({
      tenantId: samplePage.tenantId,
      applicationId: samplePage.applicationId,
      pageId: samplePage.pageId
    });
    if (!existingPage) {
      await db.collection('pages').insertOne(samplePage);
      console.log('  ✅ Sample page inserted');
    } else {
      console.log('  ⚠️  Sample page already exists');
    }

    // Insert control if not exists
    const existingControl = await db.collection('controls').findOne({
      tenantId: sampleControl.tenantId,
      applicationId: sampleControl.applicationId,
      controlId: sampleControl.controlId
    });
    if (!existingControl) {
      await db.collection('controls').insertOne(sampleControl);
      console.log('  ✅ Sample control inserted');
    } else {
      console.log('  ⚠️  Sample control already exists');
    }

    // ✅ Enhanced: Insert tenant domains if not exist
    for (const domainData of sampleTenantDomains) {
      const existingDomain = await db.collection('tenantdomains').findOne({
        tenantId: domainData.tenantId,
        domain: domainData.domain
      });
      if (!existingDomain) {
        await db.collection('tenantdomains').insertOne(domainData);
        console.log(`  ✅ Sample tenant domain inserted: ${domainData.domain}`);
      } else {
        console.log(`  ⚠️  Sample tenant domain already exists: ${domainData.domain}`);
      }
    }

  } catch (error) {
    console.error('❌ Failed to insert sample data:', error);
    throw error;
  }
}

// ================================================================
// ALTERNATIVE: More robust connection checker
// ================================================================

async function waitForConnection(connection: Connection, maxRetries: number = 10): Promise<void> {
  let retries = 0;

  while (retries < maxRetries) {
    if (connection.readyState === 1 && connection.db) {
      console.log('✅ Database connection is ready');
      return;
    }

    console.log(`⏳ Waiting for database connection... (${retries + 1}/${maxRetries})`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    retries++;
  }

  throw new Error('❌ Database connection timeout');
}

// Enhanced initialization function with retry logic
async function initializeDatabaseWithRetry() {
  console.log('🔄 Starting database initialization with retry logic...');

  const app = await NestFactory.create(AppModule, new FastifyAdapter(), {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const connection = app.get<Connection>(getConnectionToken());

    if (!connection) {
      throw new Error('❌ Failed to get MongoDB connection');
    }

    // Wait for connection to be ready
    await waitForConnection(connection);

    // Proceed with initialization
    await createCollections(connection);
    await createIndexes(connection);
    await insertSampleData(connection);

    console.log('✅ Database initialization completed successfully!');
    console.log('');
    console.log('📊 Sample data inserted:');
    console.log('  - 1 Tenant (Demo Corporation)');
    console.log('  - 1 Application (User Management)');
    console.log('  - 1 Theme (Default Theme)');
    console.log('  - 1 Page (User List)');
    console.log('  - 1 Control (Email Input)');
    console.log('  - 3 Tenant Domains (demo.yourapp.com, demo-corp.com, staging.demo.yourapp.com)');
    console.log('');
    console.log('🚀 You can now start your application with: npm run start:dev');
    console.log('📚 API Documentation will be available at: http://localhost:3000/api/docs');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

// ================================================================
// BONUS: Database health check function
// ================================================================

export async function checkDatabaseHealth() {
  console.log('🏥 Starting database health check...');

  const app = await NestFactory.create(AppModule, new FastifyAdapter(), {
    logger: false, // Disable logging for health check
  });

  try {
    const connection = app.get<Connection>(getConnectionToken());

    if (!connection) {
      throw new Error('No database connection available');
    }

    if (!connection.db) {
      throw new Error('Database instance is not available');
    }

    // Check connection state
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    console.log(`📊 Connection state: ${states[connection.readyState] || 'unknown'}`);
    console.log(`📊 Database name: ${connection.db.databaseName}`);

    // Check collections
    const collections = await connection.db.listCollections().toArray();
    console.log(`📊 Collections count: ${collections.length}`);

    // Check if required collections exist
    const requiredCollections = [
      'tenants', 'themes', 'pages', 'controls', 'applications', 'tenantdomains'
    ];
    const existingCollectionNames = collections.map(c => c.name);

    for (const requiredCollection of requiredCollections) {
      if (existingCollectionNames.includes(requiredCollection)) {
        const count = await connection.db.collection(requiredCollection).countDocuments();
        console.log(`  ✅ ${requiredCollection}: ${count} documents`);
      } else {
        console.log(`  ❌ ${requiredCollection}: missing`);
      }
    }

    // Check tenant domains specifically
    const tenantDomainsCount = await connection.db.collection('tenantdomains').countDocuments();
    if (tenantDomainsCount > 0) {
      const verifiedDomains = await connection.db.collection('tenantdomains')
        .countDocuments({ 'verification.verified': true });
      const activeDomains = await connection.db.collection('tenantdomains')
        .countDocuments({ status: 'active' });
      
      console.log(`  📊 Tenant Domains: ${tenantDomainsCount} total, ${verifiedDomains} verified, ${activeDomains} active`);
    }

    console.log('✅ Database health check completed');

  } catch (error) {
    console.error('❌ Database health check failed:', error);
    throw error;
  } finally {
    await app.close();
  }
}

// ================================================================
// Export functions for use in other scripts
// ================================================================

export { initializeDatabase, initializeDatabaseWithRetry, createCollections, createIndexes, insertSampleData };

// Run the initialization if this file is executed directly
if (require.main === module) {
  initializeDatabaseWithRetry().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}