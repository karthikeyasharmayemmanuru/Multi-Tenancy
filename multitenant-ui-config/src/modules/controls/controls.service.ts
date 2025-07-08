import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Control, ControlDocument } from './schemas/control.schema';

export interface CreateControlDto {
  tenantId: string;
  applicationId: string;
  controlId: string;
  name: string;
  type: string;
  config?: {
    inputType?: string;
    placeholder?: string;
    maxLength?: number;
    required?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    cssClass?: string;
    width?: string;
    size?: string;
  };
  properties: {
    label: string;
    helpText?: string;
    tooltip?: string;
  };
  dataBinding: {
    field: string;
    dataType?: string;
    defaultValue?: string;
    formatMask?: string;
  };
  options?: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
}

export interface UpdateControlDto {
  name?: string;
  type?: string;
  config?: {
    inputType?: string;
    placeholder?: string;
    maxLength?: number;
    required?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    cssClass?: string;
    width?: string;
    size?: string;
  };
  properties?: {
    label?: string;
    helpText?: string;
    tooltip?: string;
  };
  dataBinding?: {
    field?: string;
    dataType?: string;
    defaultValue?: string;
    formatMask?: string;
  };
  options?: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
}

@Injectable()
export class ControlsService {
  constructor(
    @InjectModel(Control.name) private controlModel: Model<ControlDocument>,
  ) {}

  async create(createControlDto: CreateControlDto): Promise<Control> {
    const createdControl = new this.controlModel(createControlDto);
    return await createdControl.save();
  }

  async findByTenant(tenantId: string): Promise<Control[]> {
    return this.controlModel.find({ tenantId }).exec();
  }

  async findByApplication(tenantId: string, applicationId: string): Promise<Control[]> {
    return this.controlModel.find({ tenantId, applicationId }).exec();
  }

  async findByType(tenantId: string, type: string): Promise<Control[]> {
    return this.controlModel.find({ tenantId, type }).exec();
  }

  async findOne(tenantId: string, applicationId: string, controlId: string): Promise<Control> {
    const control = await this.controlModel.findOne({ tenantId, applicationId, controlId }).exec();
    if (!control) {
      throw new NotFoundException(`Control ${controlId} not found`);
    }
    return control;
  }

  async update(
    tenantId: string, 
    applicationId: string, 
    controlId: string, 
    updateControlDto: UpdateControlDto
  ): Promise<Control> {
    const updatedControl = await this.controlModel
      .findOneAndUpdate(
        { tenantId, applicationId, controlId }, 
        updateControlDto, 
        { new: true }
      )
      .exec();
    
    if (!updatedControl) {
      throw new NotFoundException(`Control ${controlId} not found`);
    }
    return updatedControl;
  }

  async remove(tenantId: string, applicationId: string, controlId: string): Promise<void> {
    const result = await this.controlModel.deleteOne({ tenantId, applicationId, controlId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Control ${controlId} not found`);
    }
  }
}