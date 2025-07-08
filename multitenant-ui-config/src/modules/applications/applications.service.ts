import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Application, ApplicationDocument } from './schemas/application.schema';

export interface CreateApplicationDto {
  tenantId: string;
  applicationId: string;
  name: string;
  description?: string;
  version?: string;
  config?: {
    permissions?: string[];
    features?: string[];
    integrations?: string[];
  };
}

export interface UpdateApplicationDto {
  name?: string;
  description?: string;
  version?: string;
  status?: string;
  config?: {
    permissions?: string[];
    features?: string[];
    integrations?: string[];
  };
}

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectModel(Application.name) private applicationModel: Model<ApplicationDocument>,
  ) {}

  async create(createApplicationDto: CreateApplicationDto): Promise<Application> {
    const createdApplication = new this.applicationModel(createApplicationDto);
    return await createdApplication.save();
  }

  async findByTenant(tenantId: string): Promise<Application[]> {
    return this.applicationModel.find({ tenantId }).exec();
  }

  async findOne(tenantId: string, applicationId: string): Promise<Application> {
    const application = await this.applicationModel.findOne({ tenantId, applicationId }).exec();
    if (!application) {
      throw new NotFoundException(`Application ${applicationId} not found for tenant ${tenantId}`);
    }
    return application;
  }

  async update(
    tenantId: string, 
    applicationId: string, 
    updateApplicationDto: UpdateApplicationDto
  ): Promise<Application> {
    const updatedApplication = await this.applicationModel
      .findOneAndUpdate(
        { tenantId, applicationId }, 
        updateApplicationDto, 
        { new: true }
      )
      .exec();
    
    if (!updatedApplication) {
      throw new NotFoundException(`Application ${applicationId} not found for tenant ${tenantId}`);
    }
    return updatedApplication;
  }

  async remove(tenantId: string, applicationId: string): Promise<void> {
    const result = await this.applicationModel.deleteOne({ tenantId, applicationId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Application ${applicationId} not found for tenant ${tenantId}`);
    }
  }
}