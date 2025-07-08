import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Page, PageDocument } from './schemas/page.schema';

export interface CreatePageDto {
  tenantId: string;
  applicationId: string;
  pageId: string;
  name: string;
  route: string;
  pageType?: string;
  header: {
    title: string;
    subtitle?: string;
    showBreadcrumb?: boolean;
    breadcrumb?: Array<{ label: string; route: string }>;
    actions?: Array<{
      id: string;
      label: string;
      type?: string;
      icon?: string;
      action?: string;
      target: string;
    }>;
  };
  layout?: {
    type?: string;
    sidebar?: {
      enabled?: boolean;
      width?: string;
      collapsible?: boolean;
    };
    footer?: {
      enabled?: boolean;
      text?: string;
    };
  };
  metadata?: {
    permissions?: string[];
    cacheEnabled?: boolean;
    cacheTTL?: number;
  };
}

export interface UpdatePageDto {
  name?: string;
  route?: string;
  pageType?: string;
  header?: {
    title?: string;
    subtitle?: string;
    showBreadcrumb?: boolean;
    breadcrumb?: Array<{ label: string; route: string }>;
    actions?: Array<{
      id: string;
      label: string;
      type?: string;
      icon?: string;
      action?: string;
      target: string;
    }>;
  };
  layout?: {
    type?: string;
    sidebar?: {
      enabled?: boolean;
      width?: string;
      collapsible?: boolean;
    };
    footer?: {
      enabled?: boolean;
      text?: string;
    };
  };
  metadata?: {
    permissions?: string[];
    cacheEnabled?: boolean;
    cacheTTL?: number;
  };
}

@Injectable()
export class PagesService {
  constructor(
    @InjectModel(Page.name) private pageModel: Model<PageDocument>,
  ) {}

  async create(createPageDto: CreatePageDto): Promise<Page> {
    const createdPage = new this.pageModel(createPageDto);
    return await createdPage.save();
  }

  async findByTenant(tenantId: string): Promise<Page[]> {
    return this.pageModel.find({ tenantId }).exec();
  }

  async findByApplication(tenantId: string, applicationId: string): Promise<Page[]> {
    return this.pageModel.find({ tenantId, applicationId }).exec();
  }

  async findOne(tenantId: string, applicationId: string, pageId: string): Promise<Page> {
    const page = await this.pageModel.findOne({ tenantId, applicationId, pageId }).exec();
    if (!page) {
      throw new NotFoundException(`Page ${pageId} not found`);
    }
    return page;
  }

  async findByRoute(tenantId: string, route: string): Promise<Page | null> {
    return this.pageModel.findOne({ tenantId, route }).exec();
  }

  async update(
    tenantId: string, 
    applicationId: string, 
    pageId: string, 
    updatePageDto: UpdatePageDto
  ): Promise<Page> {
    const updatedPage = await this.pageModel
      .findOneAndUpdate(
        { tenantId, applicationId, pageId }, 
        updatePageDto, 
        { new: true }
      )
      .exec();
    
    if (!updatedPage) {
      throw new NotFoundException(`Page ${pageId} not found`);
    }
    return updatedPage;
  }

  async remove(tenantId: string, applicationId: string, pageId: string): Promise<void> {
    const result = await this.pageModel.deleteOne({ tenantId, applicationId, pageId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Page ${pageId} not found`);
    }
  }
}