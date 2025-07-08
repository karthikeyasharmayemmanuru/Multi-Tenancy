import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Theme, ThemeDocument } from './schemas/theme.schema';

export interface CreateThemeDto {
  tenantId: string;
  themeId: string;
  name: string;
  styles?: {
    compiledCSS?: string;
    scssSource?: string;
    cssVariables?: Record<string, string>;
  };
  componentStyles?: {
    button?: { scss?: string; css?: string };
    form?: { scss?: string; css?: string };
    card?: { scss?: string; css?: string };
  };
}

export interface UpdateThemeDto {
  name?: string;
  isActive?: boolean;
  version?: string;
  styles?: {
    compiledCSS?: string;
    scssSource?: string;
    cssVariables?: Record<string, string>;
  };
  componentStyles?: {
    button?: { scss?: string; css?: string };
    form?: { scss?: string; css?: string };
    card?: { scss?: string; css?: string };
  };
}

@Injectable()
export class ThemesService {
  constructor(
    @InjectModel(Theme.name) private themeModel: Model<ThemeDocument>,
  ) {}

  async create(createThemeDto: CreateThemeDto): Promise<Theme> {
    const createdTheme = new this.themeModel(createThemeDto);
    return await createdTheme.save();
  }

  async findByTenant(tenantId: string): Promise<Theme[]> {
    return this.themeModel.find({ tenantId }).exec();
  }

  async findOne(tenantId: string, themeId: string): Promise<Theme> {
    const theme = await this.themeModel.findOne({ tenantId, themeId }).exec();
    if (!theme) {
      throw new NotFoundException(`Theme ${themeId} not found for tenant ${tenantId}`);
    }
    return theme;
  }

  async findActiveTheme(tenantId: string): Promise<Theme | null> {
    return this.themeModel.findOne({ tenantId, isActive: true }).exec();
  }

  async update(tenantId: string, themeId: string, updateThemeDto: UpdateThemeDto): Promise<Theme> {
    const updatedTheme = await this.themeModel
      .findOneAndUpdate({ tenantId, themeId }, updateThemeDto, { new: true })
      .exec();
    
    if (!updatedTheme) {
      throw new NotFoundException(`Theme ${themeId} not found for tenant ${tenantId}`);
    }
    return updatedTheme;
  }

  async setActiveTheme(tenantId: string, themeId: string): Promise<Theme> {
    // Deactivate all themes for this tenant
    await this.themeModel.updateMany(
      { tenantId },
      { isActive: false }
    ).exec();

    // Activate the specified theme
    const activatedTheme = await this.themeModel
      .findOneAndUpdate(
        { tenantId, themeId },
        { isActive: true },
        { new: true }
      )
      .exec();

    if (!activatedTheme) {
      throw new NotFoundException(`Theme ${themeId} not found for tenant ${tenantId}`);
    }

    return activatedTheme;
  }

  async remove(tenantId: string, themeId: string): Promise<void> {
    const result = await this.themeModel.deleteOne({ tenantId, themeId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Theme ${themeId} not found for tenant ${tenantId}`);
    }
  }
}