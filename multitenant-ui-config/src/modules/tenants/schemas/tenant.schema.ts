// src/modules/tenants/schemas/tenant.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TenantDocument = Tenant & Document;

@Schema({ timestamps: true })
export class Tenant {
  @Prop({ required: true, unique: true, index: true })
  tenantId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  subdomain: string;

  @Prop()
  customDomain?: string;

  @Prop({ enum: ['active', 'inactive', 'suspended'], default: 'active' })
  status: string;

  @Prop({ enum: ['basic', 'premium', 'enterprise'], default: 'basic' })
  plan: string;

  @Prop({
    type: {
      timezone: { type: String, default: 'UTC' },
      dateFormat: { type: String, default: 'YYYY-MM-DD' },
      currency: { type: String, default: 'USD' },
      language: { type: String, default: 'en' },
    },
  })
  settings: {
    timezone: string;
    dateFormat: string;
    currency: string;
    language: string;
  };
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);

// Create indexes
TenantSchema.index({ tenantId: 1 });
TenantSchema.index({ subdomain: 1 });
TenantSchema.index({ status: 1 });