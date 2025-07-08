import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';

// Import configuration files
import databaseConfig from './config/database.config';
import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import fileUploadConfig from './config/file-upload.config';
import cacheConfig from './config/cache.config';
import emailConfig from './config/email.config';
import loggingConfig from './config/logging.config';

// Import feature modules
import { TenantsModule } from './modules/tenants/tenants.module';
import { ThemesModule } from './modules/themes/themes.module';
import { PagesModule } from './modules/pages/pages.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { ControlsModule } from './modules/controls/controls.module';

@Module({
  imports: [
    // Global configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV}`,
        '.env',
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
    }),
    
    // Database connection module
    DatabaseModule,
    
    // Feature modules
    TenantsModule,
    ThemesModule,
    PagesModule,
    ApplicationsModule,
    ControlsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}