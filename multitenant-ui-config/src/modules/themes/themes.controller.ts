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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ThemesService, CreateThemeDto, UpdateThemeDto } from './themes.service';
import { Theme } from './schemas/theme.schema';

@ApiTags('themes')
@Controller('themes')
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new theme' })
  create(@Body() createThemeDto: CreateThemeDto): Promise<Theme> {
    return this.themesService.create(createThemeDto);
  }

  @Get('tenant/:tenantId')
  @ApiOperation({ summary: 'Get all themes for a tenant' })
  findByTenant(@Param('tenantId') tenantId: string): Promise<Theme[]> {
    return this.themesService.findByTenant(tenantId);
  }

  @Get('tenant/:tenantId/active')
  @ApiOperation({ summary: 'Get active theme for a tenant' })
  findActiveTheme(@Param('tenantId') tenantId: string): Promise<Theme | null> {
    return this.themesService.findActiveTheme(tenantId);
  }

  @Get(':tenantId/:themeId')
  @ApiOperation({ summary: 'Get specific theme' })
  findOne(
    @Param('tenantId') tenantId: string,
    @Param('themeId') themeId: string,
  ): Promise<Theme> {
    return this.themesService.findOne(tenantId, themeId);
  }

  @Patch(':tenantId/:themeId')
  @ApiOperation({ summary: 'Update theme' })
  update(
    @Param('tenantId') tenantId: string,
    @Param('themeId') themeId: string,
    @Body() updateThemeDto: UpdateThemeDto,
  ): Promise<Theme> {
    return this.themesService.update(tenantId, themeId, updateThemeDto);
  }

  @Patch(':tenantId/:themeId/activate')
  @ApiOperation({ summary: 'Set theme as active' })
  setActiveTheme(
    @Param('tenantId') tenantId: string,
    @Param('themeId') themeId: string,
  ): Promise<Theme> {
    return this.themesService.setActiveTheme(tenantId, themeId);
  }

  @Delete(':tenantId/:themeId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete theme' })
  remove(
    @Param('tenantId') tenantId: string,
    @Param('themeId') themeId: string,
  ): Promise<void> {
    return this.themesService.remove(tenantId, themeId);
  }
}