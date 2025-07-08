import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantDomainsController } from './tenant-domains.controller';
import { TenantDomainsService } from './tenant-domains.service';
import { TenantDomain, TenantDomainSchema } from './schemas/tenant-domain.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TenantDomain.name, schema: TenantDomainSchema }])
  ],
  controllers: [TenantDomainsController],
  providers: [TenantDomainsService],
  exports: [TenantDomainsService], // Export for use in other modules
})
export class TenantDomainsModule {}