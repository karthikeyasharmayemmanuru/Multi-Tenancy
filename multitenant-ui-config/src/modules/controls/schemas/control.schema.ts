import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ControlDocument = Control & Document;

@Schema({ 
  timestamps: true,
  collection: 'controls'
})
export class Control {
  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ required: true })
  applicationId: string;

  @Prop({ required: true, index: true })
  controlId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ 
    enum: ['input', 'select', 'checkbox', 'radio', 'textarea', 'datepicker', 'button'], 
    required: true 
  })
  type: string;

  @Prop({
    type: {
      inputType: { type: String, default: 'text' },
      placeholder: { type: String, default: '' },
      maxLength: { type: Number },
      required: { type: Boolean, default: false },
      disabled: { type: Boolean, default: false },
      readonly: { type: Boolean, default: false },
      cssClass: { type: String, default: 'form-control' },
      width: { type: String, default: '100%' },
      size: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
    },
  })
  config: {
    inputType: string;
    placeholder: string;
    maxLength?: number;
    required: boolean;
    disabled: boolean;
    readonly: boolean;
    cssClass: string;
    width: string;
    size: string;
  };

  @Prop({
    type: {
      label: { type: String, required: true },
      helpText: { type: String, default: '' },
      tooltip: { type: String, default: '' },
    },
  })
  properties: {
    label: string;
    helpText: string;
    tooltip: string;
  };

  @Prop({
    type: {
      field: { type: String, required: true },
      dataType: { type: String, enum: ['string', 'number', 'boolean', 'date'], default: 'string' },
      defaultValue: { type: String, default: '' },
      formatMask: { type: String },
    },
  })
  dataBinding: {
    field: string;
    dataType: string;
    defaultValue: string;
    formatMask?: string;
  };

  @Prop({
    type: [{
      value: { type: String, required: true },
      label: { type: String, required: true },
      disabled: { type: Boolean, default: false },
    }],
    default: [],
  })
  options: Array<{
    value: string;
    label: string;
    disabled: boolean;
  }>;
}

export const ControlSchema = SchemaFactory.createForClass(Control);

// Create compound indexes
ControlSchema.index({ tenantId: 1, applicationId: 1, controlId: 1 }, { unique: true });
ControlSchema.index({ tenantId: 1, type: 1 });