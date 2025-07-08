import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant, TenantDocument } from './schemas/tenant.schema';

export interface CreateTenantDto {
  tenantId: string;
  name: string;
  subdomain: string;
  customDomain?: string;
  plan?: string;
  settings?: {
    timezone?: string;
    dateFormat?: string;
    currency?: string;
    language?: string;
  };
}

export interface UpdateTenantDto {
  name?: string;
  customDomain?: string;
  status?: string;
  plan?: string;
  settings?: {
    timezone?: string;
    dateFormat?: string;
    currency?: string;
    language?: string;
  };
}

@Injectable()
export class TenantsService {
  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    try {
      const createdTenant = new this.tenantModel(createTenantDto);
      return await createdTenant.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Tenant ID or subdomain already exists');
      }
      throw error;
    }
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantModel.find().exec();
  }

  async findOne(tenantId: string): Promise<Tenant> {
    const tenant = await this.tenantModel.findOne({ tenantId }).exec();
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }
    return tenant;
  }

  async findBySubdomain(subdomain: string): Promise<Tenant> {
    const tenant = await this.tenantModel.findOne({ subdomain }).exec();
    if (!tenant) {
      throw new NotFoundException(`Tenant with subdomain ${subdomain} not found`);
    }
    return tenant;
  }

  async update(tenantId: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const updatedTenant = await this.tenantModel
      .findOneAndUpdate({ tenantId }, updateTenantDto, { new: true })
      .exec();
    
    if (!updatedTenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }
    return updatedTenant;
  }

  async remove(tenantId: string): Promise<void> {
    const result = await this.tenantModel.deleteOne({ tenantId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }
  }
}