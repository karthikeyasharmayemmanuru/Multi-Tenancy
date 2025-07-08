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
import { PagesService, CreatePageDto, UpdatePageDto } from './pages.service';
import { Page } from './schemas/page.schema';

@ApiTags('pages')
@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new page' })
  create(@Body() createPageDto: CreatePageDto): Promise<Page> {
    return this.pagesService.create(createPageDto);
  }

  @Get('tenant/:tenantId')
  @ApiOperation({ summary: 'Get all pages for a tenant' })
  findByTenant(@Param('tenantId') tenantId: string): Promise<Page[]> {
    return this.pagesService.findByTenant(tenantId);
  }

  @Get('tenant/:tenantId/application/:applicationId')
  @ApiOperation({ summary: 'Get pages by application' })
  findByApplication(
    @Param('tenantId') tenantId: string,
    @Param('applicationId') applicationId: string,
  ): Promise<Page[]> {
    return this.pagesService.findByApplication(tenantId, applicationId);
  }

  @Get(':tenantId/:applicationId/:pageId')
  @ApiOperation({ summary: 'Get specific page' })
  findOne(
    @Param('tenantId') tenantId: string,
    @Param('applicationId') applicationId: string,
    @Param('pageId') pageId: string,
  ): Promise<Page> {
    return this.pagesService.findOne(tenantId, applicationId, pageId);
  }

  @Patch(':tenantId/:applicationId/:pageId')
  @ApiOperation({ summary: 'Update page' })
  update(
    @Param('tenantId') tenantId: string,
    @Param('applicationId') applicationId: string,
    @Param('pageId') pageId: string,
    @Body() updatePageDto: UpdatePageDto,
  ): Promise<Page> {
    return this.pagesService.update(tenantId, applicationId, pageId, updatePageDto);
  }

  @Delete(':tenantId/:applicationId/:pageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete page' })
  remove(
    @Param('tenantId') tenantId: string,
    @Param('applicationId') applicationId: string,
    @Param('pageId') pageId: string,
  ): Promise<void> {
    return this.pagesService.remove(tenantId, applicationId, pageId);
  }
}