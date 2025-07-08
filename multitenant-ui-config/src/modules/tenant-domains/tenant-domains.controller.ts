import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  HttpCode,
  HttpStatus,
  Query
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { 
  TenantDomainsService, 
  CreateTenantDomainDto, 
  UpdateTenantDomainDto,
  DomainVerificationDto 
} from './tenant-domains.service';
import { TenantDomain } from './schemas/tenant-domain.schema';

@ApiTags('tenant-domains')
@Controller('tenant-domains')
export class TenantDomainsController {
  constructor(private readonly tenantDomainsService: TenantDomainsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tenant domain mapping' })
  @ApiResponse({ status: 201, description: 'Domain mapping created successfully' })
  @ApiResponse({ status: 409, description: 'Domain already exists' })
  create(@Body() createTenantDomainDto: CreateTenantDomainDto): Promise<TenantDomain> {
    return this.tenantDomainsService.create(createTenantDomainDto);
  }

  @Get('tenant/:tenantId')
  @ApiOperation({ summary: 'Get all domains for a tenant' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by domain type' })
  @ApiResponse({ status: 200, description: 'List of tenant domains' })
  findByTenant(
    @Param('tenantId') tenantId: string,
    @Query('type') type?: string,
  ): Promise<TenantDomain[]> {
    if (type) {
      return this.tenantDomainsService.findByTenantAndType(tenantId, type);
    }
    return this.tenantDomainsService.findByTenant(tenantId);
  }

  @Get('domain/:domain')
  @ApiOperation({ summary: 'Get tenant by domain' })
  @ApiResponse({ status: 200, description: 'Tenant domain found' })
  @ApiResponse({ status: 404, description: 'Domain not found' })
  findByDomain(@Param('domain') domain: string): Promise<TenantDomain | null> {
    return this.tenantDomainsService.findByDomain(domain);
  }

  @Get('tenant/:tenantId/default')
  @ApiOperation({ summary: 'Get default domain for a tenant' })
  @ApiResponse({ status: 200, description: 'Default domain found' })
  findDefaultDomain(@Param('tenantId') tenantId: string): Promise<TenantDomain | null> {
    return this.tenantDomainsService.findDefaultDomain(tenantId);
  }

  @Get('tenant/:tenantId/primary')
  @ApiOperation({ summary: 'Get primary domain for a tenant' })
  @ApiResponse({ status: 200, description: 'Primary domain found' })
  findPrimaryDomain(@Param('tenantId') tenantId: string): Promise<TenantDomain | null> {
    return this.tenantDomainsService.findPrimaryDomain(tenantId);
  }

  @Get('tenant/:tenantId/stats')
  @ApiOperation({ summary: 'Get domain statistics for a tenant' })
  @ApiResponse({ status: 200, description: 'Domain statistics' })
  getStatsByTenant(@Param('tenantId') tenantId: string): Promise<any> {
    return this.tenantDomainsService.getStatsByTenant(tenantId);
  }

  @Get(':tenantId/:domain')
  @ApiOperation({ summary: 'Get specific domain for a tenant' })
  @ApiResponse({ status: 200, description: 'Domain found' })
  @ApiResponse({ status: 404, description: 'Domain not found' })
  findOne(
    @Param('tenantId') tenantId: string,
    @Param('domain') domain: string,
  ): Promise<TenantDomain> {
    return this.tenantDomainsService.findOne(tenantId, domain);
  }

  @Get(':tenantId/:domain/verification')
  @ApiOperation({ summary: 'Get domain verification instructions' })
  @ApiResponse({ status: 200, description: 'Verification instructions' })
  getVerificationInstructions(
    @Param('tenantId') tenantId: string,
    @Param('domain') domain: string,
  ): Promise<any> {
    return this.tenantDomainsService.getVerificationInstructions(tenantId, domain);
  }

  @Patch(':tenantId/:domain')
  @ApiOperation({ summary: 'Update domain configuration' })
  @ApiResponse({ status: 200, description: 'Domain updated successfully' })
  @ApiResponse({ status: 404, description: 'Domain not found' })
  update(
    @Param('tenantId') tenantId: string,
    @Param('domain') domain: string,
    @Body() updateTenantDomainDto: UpdateTenantDomainDto,
  ): Promise<TenantDomain> {
    return this.tenantDomainsService.update(tenantId, domain, updateTenantDomainDto);
  }

  @Patch(':tenantId/:domain/verify')
  @ApiOperation({ summary: 'Verify domain ownership' })
  @ApiResponse({ status: 200, description: 'Domain verification initiated' })
  verifyDomain(
    @Param('tenantId') tenantId: string,
    @Param('domain') domain: string,
    @Body() verificationDto: DomainVerificationDto,
  ): Promise<TenantDomain> {
    return this.tenantDomainsService.verifyDomain(tenantId, domain, verificationDto);
  }

  @Patch(':tenantId/:domain/set-default')
  @ApiOperation({ summary: 'Set domain as default' })
  @ApiResponse({ status: 200, description: 'Domain set as default' })
  setAsDefault(
    @Param('tenantId') tenantId: string,
    @Param('domain') domain: string,
  ): Promise<TenantDomain> {
    return this.tenantDomainsService.setAsDefault(tenantId, domain);
  }

  @Patch(':tenantId/:domain/set-primary')
  @ApiOperation({ summary: 'Set domain as primary' })
  @ApiResponse({ status: 200, description: 'Domain set as primary' })
  setAsPrimary(
    @Param('tenantId') tenantId: string,
    @Param('domain') domain: string,
  ): Promise<TenantDomain> {
    return this.tenantDomainsService.setAsPrimary(tenantId, domain);
  }

  @Delete(':tenantId/:domain')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete domain mapping' })
  @ApiResponse({ status: 204, description: 'Domain deleted successfully' })
  @ApiResponse({ status: 404, description: 'Domain not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete primary or default domain' })
  remove(
    @Param('tenantId') tenantId: string,
    @Param('domain') domain: string,
  ): Promise<void> {
    return this.tenantDomainsService.remove(tenantId, domain);
  }
}