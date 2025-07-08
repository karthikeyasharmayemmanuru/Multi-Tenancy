import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { Tenant, TenantSchema } from './schemas/tenant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tenant.name, schema: TenantSchema }])
  ],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService], // Export for use in other modules
})
export class TenantsModule {}