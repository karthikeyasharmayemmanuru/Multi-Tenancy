import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  HttpCode,
  HttpStatus 
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApplicationsService, CreateApplicationDto, UpdateApplicationDto } from './applications.service';
import { Application } from './schemas/application.schema';

@ApiTags('applications')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new application' })
  create(@Body() createApplicationDto: CreateApplicationDto): Promise<Application> {
    return this.applicationsService.create(createApplicationDto);
  }

  @Get('tenant/:tenantId')
  @ApiOperation({ summary: 'Get all applications for a tenant' })
  findByTenant(@Param('tenantId') tenantId: string): Promise<Application[]> {
    return this.applicationsService.findByTenant(tenantId);
  }

  @Get(':tenantId/:applicationId')
  @ApiOperation({ summary: 'Get specific application' })
  findOne(
    @Param('tenantId') tenantId: string,
    @Param('applicationId') applicationId: string,
  ): Promise<Application> {
    return this.applicationsService.findOne(tenantId, applicationId);
  }

  @Patch(':tenantId/:applicationId')
  @ApiOperation({ summary: 'Update application' })
  update(
    @Param('tenantId') tenantId: string,
    @Param('applicationId') applicationId: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ): Promise<Application> {
    return this.applicationsService.update(tenantId, applicationId, updateApplicationDto);
  }

  @Delete(':tenantId/:applicationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete application' })
  remove(
    @Param('tenantId') tenantId: string,
    @Param('applicationId') applicationId: string,
  ): Promise<void> {
    return this.applicationsService.remove(tenantId, applicationId);
  }
}