import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ApplicationDocument = Application & Document;

@Schema({ 
  timestamps: true,
  collection: 'applications'
})
export class Application {
  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ required: true, index: true })
  applicationId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ default: '1.0.0' })
  version: string;

  @Prop({ 
    enum: ['active', 'inactive', 'maintenance'], 
    default: 'active' 
  })
  status: string;

  @Prop({
    type: {
      permissions: [{ type: String }],
      features: [{ type: String }],
      integrations: [{ type: String }],
    },
  })
  config: {
    permissions: string[];
    features: string[];
    integrations: string[];
  };
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);

// Create compound indexes
ApplicationSchema.index({ tenantId: 1, applicationId: 1 }, { unique: true });
ApplicationSchema.index({ tenantId: 1, status: 1 });