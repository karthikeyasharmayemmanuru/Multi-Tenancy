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
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ControlsService, CreateControlDto, UpdateControlDto } from './controls.service';
import { Control } from './schemas/control.schema';

@ApiTags('controls')
@Controller('controls')
export class ControlsController {
  constructor(private readonly controlsService: ControlsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new control' })
  create(@Body() createControlDto: CreateControlDto): Promise<Control> {
    return this.controlsService.create(createControlDto);
  }

  @Get('tenant/:tenantId')
  @ApiOperation({ summary: 'Get all controls for a tenant' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by control type' })
  findByTenant(
    @Param('tenantId') tenantId: string,
    @Query('type') type?: string,
  ): Promise<Control[]> {
    if (type) {
      return this.controlsService.findByType(tenantId, type);
    }
    return this.controlsService.findByTenant(tenantId);
  }

  @Get('tenant/:tenantId/application/:applicationId')
  @ApiOperation({ summary: 'Get controls by application' })
  findByApplication(
    @Param('tenantId') tenantId: string,
    @Param('applicationId') applicationId: string,
  ): Promise<Control[]> {
    return this.controlsService.findByApplication(tenantId, applicationId);
  }

  @Get(':tenantId/:applicationId/:controlId')
  @ApiOperation({ summary: 'Get specific control' })
  findOne(
    @Param('tenantId') tenantId: string,
    @Param('applicationId') applicationId: string,
    @Param('controlId') controlId: string,
  ): Promise<Control> {
    return this.controlsService.findOne(tenantId, applicationId, controlId);
  }

  @Patch(':tenantId/:applicationId/:controlId')
  @ApiOperation({ summary: 'Update control' })
  update(
    @Param('tenantId') tenantId: string,
    @Param('applicationId') applicationId: string,
    @Param('controlId') controlId: string,
    @Body() updateControlDto: UpdateControlDto,
  ): Promise<Control> {
    return this.controlsService.update(tenantId, applicationId, controlId, updateControlDto);
  }

  @Delete(':tenantId/:applicationId/:controlId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete control' })
  remove(
    @Param('tenantId') tenantId: string,
    @Param('applicationId') applicationId: string,
    @Param('controlId') controlId: string,
  ): Promise<void> {
    return this.controlsService.remove(tenantId, applicationId, controlId);
  }
}