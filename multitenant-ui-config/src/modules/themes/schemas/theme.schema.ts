// src/modules/themes/schemas/theme.schema.ts
// Schema for storing theme and styling information
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseDocument } from '../../../common/schemas/base.schema';

export type ThemeDocument = Theme & Document;

@Schema({ timestamps: true })
export class Theme extends BaseDocument {
  @Prop({ required: true, index: true })
  themeId: string;  // Unique theme identifier

  @Prop({ required: true })
  name: string;  // Theme display name

  @Prop({ default: false })
  isActive: boolean;  // Whether theme is currently active

  @Prop({ default: '1.0.0' })
  version: string;  // Theme version for tracking changes

  @Prop({
    type: {
      // Compiled CSS ready for browser consumption
      compiledCSS: { type: String, default: '' },
      
      // Original SCSS source code for editing
      scssSource: { type: String, default: '' },
      
      // CSS custom properties (CSS variables)
      cssVariables: {
        type: Map,
        of: String,
        default: new Map(),
      },
    },
  })
  styles: {
    compiledCSS: string;
    scssSource: string;
    cssVariables: Map<string, string>;
  };

  @Prop({
    type: {
      // Component-specific styles
      button: {
        scss: { type: String, default: '' },
        css: { type: String, default: '' },
      },
      form: {
        scss: { type: String, default: '' },
        css: { type: String, default: '' },
      },
      card: {
        scss: { type: String, default: '' },
        css: { type: String, default: '' },
      },
    },
  })
  componentStyles: {
    button: { scss: string; css: string };
    form: { scss: string; css: string };
    card: { scss: string; css: string };
  };

  @Prop({
    type: {
      // Responsive breakpoints
      mobile: { type: String, default: '@media (max-width: 768px)' },
      tablet: { type: String, default: '@media (min-width: 769px) and (max-width: 1024px)' },
      desktop: { type: String, default: '@media (min-width: 1025px)' },
    },
  })
  mediaQueries: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
}

export const ThemeSchema = SchemaFactory.createForClass(Theme);

// Compound index for tenant-specific theme queries
ThemeSchema.index({ tenantId: 1, themeId: 1 });
ThemeSchema.index({ tenantId: 1, isActive: 1 });