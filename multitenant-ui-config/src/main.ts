// src/main.ts
// Application bootstrap file
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  // Create NestJS application with Fastify adapter
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),  // Enable Fastify logging
  );

  // Get configuration service
  const configService = app.get(ConfigService);

  // Enable CORS for cross-origin requests
  app.enableCors({
    origin: true,  // Allow all origins in development
    credentials: true,  // Allow credentials
  });

  // Global validation pipe for request validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,        // Automatically transform payloads
      whitelist: true,        // Strip unknown properties
      forbidNonWhitelisted: true,  // Throw error for unknown properties
    }),
  );

  // Swagger API documentation setup
  const config = new DocumentBuilder()
    .setTitle('Multi-Tenant UI Configuration API')
    .setDescription('API for managing multi-tenant UI configurations')
    .setVersion('1.0')
    .addBearerAuth()  // Add JWT authentication
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Start the server
  const port = configService.get<number>('app.port');
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();