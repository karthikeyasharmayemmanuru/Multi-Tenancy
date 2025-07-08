import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../app.module';

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
    const requiredCollections = ['tenants', 'themes', 'pages', 'controls'];
    const existingCollectionNames = collections.map(c => c.name);
    
    for (const requiredCollection of requiredCollections) {
      if (existingCollectionNames.includes(requiredCollection)) {
        const count = await connection.db.collection(requiredCollection).countDocuments();
        console.log(`  ✅ ${requiredCollection}: ${count} documents`);
      } else {
        console.log(`  ❌ ${requiredCollection}: missing`);
      }
    }

    console.log('✅ Database health check completed');
    
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    throw error;
  } finally {
    await app.close();
  }
}