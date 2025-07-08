// src/modules/pages/schemas/page.schema.ts
// Schema for page configurations
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseDocument } from '../../../common/schemas/base.schema';

export type PageDocument = Page & Document;

@Schema({ timestamps: true })
export class Page extends BaseDocument {
  @Prop({ required: true })
  applicationId: string;  // Which application this page belongs to

  @Prop({ required: true, index: true })
  pageId: string;  // Unique page identifier

  @Prop({ required: true })
  name: string;  // Page display name

  @Prop({ required: true })
  route: string;  // URL route for the page

  @Prop({ enum: ['list', 'form', 'dashboard', 'custom'], default: 'custom' })
  pageType: string;  // Type of page for different behaviors

  @Prop({
    type: {
      // Page header configuration
      title: { type: String, required: true },
      subtitle: { type: String, default: '' },
      showBreadcrumb: { type: Boolean, default: true },
      breadcrumb: [{
        label: { type: String, required: true },
        route: { type: String, required: true },
      }],
      actions: [{
        id: { type: String, required: true },
        label: { type: String, required: true },
        type: { type: String, enum: ['primary', 'secondary', 'danger'], default: 'primary' },
        icon: { type: String, default: '' },
        action: { type: String, enum: ['navigate', 'modal', 'api'], default: 'navigate' },
        target: { type: String, required: true },
      }],
    },
  })
  header: {
    title: string;
    subtitle: string;
    showBreadcrumb: boolean;
    breadcrumb: Array<{ label: string; route: string }>;
    actions: Array<{
      id: string;
      label: string;
      type: string;
      icon: string;
      action: string;
      target: string;
    }>;
  };

  @Prop({
    type: {
      // Page layout configuration
      type: { type: String, enum: ['standard', 'fluid', 'sidebar'], default: 'standard' },
      sidebar: {
        enabled: { type: Boolean, default: false },
        width: { type: String, default: '250px' },
        collapsible: { type: Boolean, default: true },
      },
      footer: {
        enabled: { type: Boolean, default: true },
        text: { type: String, default: '' },
      },
    },
  })
  layout: {
    type: string;
    sidebar: {
      enabled: boolean;
      width: string;
      collapsible: boolean;
    };
    footer: {
      enabled: boolean;
      text: string;
    };
  };

  @Prop({
    type: {
      // Page metadata
      permissions: [{ type: String }],  // Required permissions to access page
      cacheEnabled: { type: Boolean, default: true },
      cacheTTL: { type: Number, default: 300 },  // Cache time-to-live in seconds
    },
  })
  metadata: {
    permissions: string[];
    cacheEnabled: boolean;
    cacheTTL: number;
  };
}

export const PageSchema = SchemaFactory.createForClass(Page);

// Compound indexes for efficient queries
PageSchema.index({ tenantId: 1, applicationId: 1, pageId: 1 });
PageSchema.index({ tenantId: 1, route: 1 });