// src/scripts/init-database.ts
// Fixed version - handles undefined connection.db properly
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

  // List of collections to create
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
        }
        .btn-primary { 
          background-color: var(--primary-color); 
          border-color: var(--primary-color); 
        }
        .form-control { 
          border-radius: 0.375rem; 
          padding: 0.5rem 0.75rem; 
        }
      `,
      scssSource: `
        $primary-color: #007bff; 
        $secondary-color: #6c757d; 
        $success-color: #28a745;
        
        :root {
          --primary-color: #{$primary-color};
          --secondary-color: #{$secondary-color};
          --success-color: #{$success-color};
        }
        
        .btn-primary {
          background-color: $primary-color;
          border-color: $primary-color;
          
          &:hover {
            background-color: darken($primary-color, 10%);
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
      },
    },
    componentStyles: {
      button: {
        scss: `.btn { padding: 0.5rem 1rem; border-radius: 0.375rem; font-weight: 400; }`,
        css: `.btn { padding: 0.5rem 1rem; border-radius: 0.375rem; font-weight: 400; }`,
      },
      form: {
        scss: `.form-control { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #ced4da; }`,
        css: `.form-control { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #ced4da; }`,
      },
      card: {
        scss: `.card { border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 1rem; }`,
        css: `.card { border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 1rem; }`,
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
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
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
