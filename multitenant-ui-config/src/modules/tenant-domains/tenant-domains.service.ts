import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TenantDomain, TenantDomainDocument } from './schemas/tenant-domain.schema';

export interface CreateTenantDomainDto {
  tenantId: string;
  domain: string;
  domainType: 'subdomain' | 'custom' | 'both';
  protocol?: 'http' | 'https' | 'both';
  isDefault?: boolean;
  isPrimary?: boolean;
  redirectTo?: string;
  sslConfig?: {
    sslEnabled?: boolean;
    autoRenew?: boolean;
  };
  corsConfig?: {
    allowedOrigins?: string[];
    allowedMethods?: string[];
    allowedHeaders?: string[];
    credentials?: boolean;
  };
  notes?: string;
}

export interface UpdateTenantDomainDto {
  domainType?: 'subdomain' | 'custom' | 'both';
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
  protocol?: 'http' | 'https' | 'both';
  isDefault?: boolean;
  isPrimary?: boolean;
  redirectTo?: string;
  sslConfig?: {
    sslEnabled?: boolean;
    sslCertificate?: string;
    sslExpiryDate?: Date;
    autoRenew?: boolean;
  };
  verification?: {
    verified?: boolean;
    verificationMethod?: 'dns' | 'file' | 'email';
    verificationToken?: string;
    verificationDate?: Date;
    dnsRecords?: Array<{
      type: 'A' | 'CNAME' | 'TXT' | 'MX';
      name: string;
      value: string;
      ttl?: number;
    }>;
  };
  performanceConfig?: {
    enabled?: boolean;
    compressionEnabled?: boolean;
    minifyEnabled?: boolean;
  };
  corsConfig?: {
    allowedOrigins?: string[];
    allowedMethods?: string[];
    allowedHeaders?: string[];
    credentials?: boolean;
  };
  notes?: string;
}

export interface DomainVerificationDto {
  verificationMethod: 'dns' | 'file' | 'email';
  dnsRecords?: Array<{
    type: 'A' | 'CNAME' | 'TXT' | 'MX';
    name: string;
    value: string;
    ttl?: number;
  }>;
}

@Injectable()
export class TenantDomainsService {
  constructor(
    @InjectModel(TenantDomain.name) private tenantDomainModel: Model<TenantDomainDocument>,
  ) {}

  async create(createTenantDomainDto: CreateTenantDomainDto): Promise<TenantDomain> {
    try {
      // Validate domain format
      this.validateDomain(createTenantDomainDto.domain);

      // Check if domain already exists
      const existingDomain = await this.tenantDomainModel.findOne({ 
        domain: createTenantDomainDto.domain 
      }).exec();
      
      if (existingDomain) {
        throw new ConflictException(`Domain ${createTenantDomainDto.domain} is already registered`);
      }

      // If setting as default or primary, unset others
      if (createTenantDomainDto.isDefault) {
        await this.tenantDomainModel.updateMany(
          { tenantId: createTenantDomainDto.tenantId },
          { isDefault: false }
        ).exec();
      }

      if (createTenantDomainDto.isPrimary) {
        await this.tenantDomainModel.updateMany(
          { tenantId: createTenantDomainDto.tenantId },
          { isPrimary: false }
        ).exec();
      }

      // Set default values
      const domainData = {
        ...createTenantDomainDto,
        verification: {
          verified: false,
          verificationMethod: 'dns',
          verificationToken: this.generateVerificationToken(),
          dnsRecords: [],
        },
        performanceConfig: {
          enabled: false,
          cacheHeaders: [],
          compressionEnabled: true,
          minifyEnabled: true,
        },
        corsConfig: createTenantDomainDto.corsConfig || {
          allowedOrigins: ['*'],
          allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
          allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
          credentials: true,
        },
        sslConfig: {
          sslEnabled: true,
          autoRenew: true,
          ...createTenantDomainDto.sslConfig,
        },
        dnsProvider: {},
        accessCount: 0,
      };

      const createdDomain = new this.tenantDomainModel(domainData);
      return await createdDomain.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Domain already exists');
      }
      throw error;
    }
  }

  async findByTenant(tenantId: string): Promise<TenantDomain[]> {
    return this.tenantDomainModel.find({ tenantId }).exec();
  }

  async findByDomain(domain: string): Promise<TenantDomain | null> {
    // Update access count and last access date
    const tenantDomain = await this.tenantDomainModel.findOneAndUpdate(
      { domain, status: 'active' },
      { 
        $inc: { accessCount: 1 },
        lastAccessDate: new Date(),
      },
      { new: true }
    ).exec();

    return tenantDomain;
  }

  async findDefaultDomain(tenantId: string): Promise<TenantDomain | null> {
    return this.tenantDomainModel.findOne({ 
      tenantId, 
      isDefault: true, 
      status: 'active' 
    }).exec();
  }

  async findPrimaryDomain(tenantId: string): Promise<TenantDomain | null> {
    return this.tenantDomainModel.findOne({ 
      tenantId, 
      isPrimary: true, 
      status: 'active' 
    }).exec();
  }

  async findOne(tenantId: string, domain: string): Promise<TenantDomain> {
    const tenantDomain = await this.tenantDomainModel.findOne({ 
      tenantId, 
      domain 
    }).exec();
    
    if (!tenantDomain) {
      throw new NotFoundException(`Domain ${domain} not found for tenant ${tenantId}`);
    }
    return tenantDomain;
  }

  async update(
    tenantId: string, 
    domain: string, 
    updateTenantDomainDto: UpdateTenantDomainDto
  ): Promise<TenantDomain> {
    // If setting as default or primary, unset others
    if (updateTenantDomainDto.isDefault) {
      await this.tenantDomainModel.updateMany(
        { tenantId, domain: { $ne: domain } },
        { isDefault: false }
      ).exec();
    }

    if (updateTenantDomainDto.isPrimary) {
      await this.tenantDomainModel.updateMany(
        { tenantId, domain: { $ne: domain } },
        { isPrimary: false }
      ).exec();
    }

    const updatedDomain = await this.tenantDomainModel
      .findOneAndUpdate(
        { tenantId, domain }, 
        updateTenantDomainDto, 
        { new: true }
      )
      .exec();
    
    if (!updatedDomain) {
      throw new NotFoundException(`Domain ${domain} not found for tenant ${tenantId}`);
    }
    return updatedDomain;
  }

  async verifyDomain(
    tenantId: string, 
    domain: string, 
    verificationDto: DomainVerificationDto
  ): Promise<TenantDomain> {
    const tenantDomain = await this.findOne(tenantId, domain);

    // Generate verification token if not exists
    if (!tenantDomain.verification.verificationToken) {
      tenantDomain.verification.verificationToken = this.generateVerificationToken();
    }

    // Update verification details
    const updateData = {
      'verification.verificationMethod': verificationDto.verificationMethod,
      'verification.dnsRecords': verificationDto.dnsRecords || [],
    };

    // In a real implementation, you would verify the domain here
    // For now, we'll simulate verification
    const isVerified = await this.performDomainVerification(tenantDomain, verificationDto);

    if (isVerified) {
      updateData['verification.verified'] = true;
      updateData['verification.verificationDate'] = new Date();
      updateData['status'] = 'active';
    }

    const updatedDomain = await this.tenantDomainModel
      .findOneAndUpdate(
        { tenantId, domain },
        updateData,
        { new: true }
      )
      .exec();

    return updatedDomain!;
  }

  async setAsDefault(tenantId: string, domain: string): Promise<TenantDomain> {
    // Unset current default
    await this.tenantDomainModel.updateMany(
      { tenantId },
      { isDefault: false }
    ).exec();

    // Set new default
    const updatedDomain = await this.tenantDomainModel
      .findOneAndUpdate(
        { tenantId, domain },
        { isDefault: true },
        { new: true }
      )
      .exec();

    if (!updatedDomain) {
      throw new NotFoundException(`Domain ${domain} not found for tenant ${tenantId}`);
    }
    return updatedDomain;
  }

  async setAsPrimary(tenantId: string, domain: string): Promise<TenantDomain> {
    // Unset current primary
    await this.tenantDomainModel.updateMany(
      { tenantId },
      { isPrimary: false }
    ).exec();

    // Set new primary
    const updatedDomain = await this.tenantDomainModel
      .findOneAndUpdate(
        { tenantId, domain },
        { isPrimary: true },
        { new: true }
      )
      .exec();

    if (!updatedDomain) {
      throw new NotFoundException(`Domain ${domain} not found for tenant ${tenantId}`);
    }
    return updatedDomain;
  }

  async remove(tenantId: string, domain: string): Promise<void> {
    const tenantDomain = await this.findOne(tenantId, domain);
    
    // Prevent deletion of primary or default domains
    if (tenantDomain.isPrimary || tenantDomain.isDefault) {
      throw new BadRequestException('Cannot delete primary or default domain');
    }

    const result = await this.tenantDomainModel.deleteOne({ tenantId, domain }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Domain ${domain} not found for tenant ${tenantId}`);
    }
  }

  async findByTenantAndType(tenantId: string, domainType: string): Promise<TenantDomain[]> {
    return this.tenantDomainModel.find({ tenantId, domainType }).exec();
  }

  async getVerificationInstructions(tenantId: string, domain: string): Promise<any> {
    const tenantDomain = await this.findOne(tenantId, domain);
    
    return {
      domain: domain,
      verificationToken: tenantDomain.verification.verificationToken,
      verificationMethod: tenantDomain.verification.verificationMethod,
      instructions: {
        dns: {
          recordType: 'TXT',
          name: `_verification.${domain}`,
          value: tenantDomain.verification.verificationToken,
          ttl: 300,
        },
        file: {
          fileName: 'domain-verification.txt',
          content: tenantDomain.verification.verificationToken,
          path: `https://${domain}/.well-known/domain-verification.txt`,
        },
        email: {
          recipients: [
            `admin@${domain}`,
            `webmaster@${domain}`,
            `postmaster@${domain}`,
          ],
          subject: 'Domain Verification Required',
          verificationLink: `https://yourapp.com/verify-domain?token=${tenantDomain.verification.verificationToken}`,
        },
      },
    };
  }

  async getStatsByTenant(tenantId: string): Promise<any> {
    const domains = await this.findByTenant(tenantId);
    
    return {
      total: domains.length,
      active: domains.filter(d => d.status === 'active').length,
      verified: domains.filter(d => d.verification.verified).length,
      byType: {
        subdomain: domains.filter(d => d.domainType === 'subdomain').length,
        custom: domains.filter(d => d.domainType === 'custom').length,
        both: domains.filter(d => d.domainType === 'both').length,
      },
      totalAccess: domains.reduce((sum, d) => sum + d.accessCount, 0),
      lastAccess: Math.max(...domains.map(d => d.lastAccessDate?.getTime() || 0)),
    };
  }

  // Private helper methods
  private validateDomain(domain: string): void {
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
    
    if (!domainRegex.test(domain)) {
      throw new BadRequestException('Invalid domain format');
    }

    if (domain.length > 253) {
      throw new BadRequestException('Domain name too long');
    }
  }

  private generateVerificationToken(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }

  private async performDomainVerification(
    tenantDomain: TenantDomain, 
    verificationDto: DomainVerificationDto
  ): Promise<boolean> {
    // This is a simplified verification simulation
    // In a real implementation, you would:
    // 1. For DNS: Query DNS records to check for verification token
    // 2. For file: Make HTTP request to check for verification file
    // 3. For email: Send verification email and wait for confirmation

    switch (verificationDto.verificationMethod) {
      case 'dns':
        // Simulate DNS verification
        return this.verifyDnsRecords(tenantDomain.domain, verificationDto.dnsRecords || []);
      
      case 'file':
        // Simulate file verification
        return this.verifyFileMethod(tenantDomain.domain, tenantDomain.verification.verificationToken!);
      
      case 'email':
        // Simulate email verification
        return this.verifyEmailMethod(tenantDomain.domain);
      
      default:
        return false;
    }
  }

  private async verifyDnsRecords(domain: string, records: any[]): Promise<boolean> {
    // Simulate DNS verification - in real implementation, use DNS lookup
    console.log(`Verifying DNS records for ${domain}:`, records);
    return true; // Simulate successful verification
  }

  private async verifyFileMethod(domain: string, token: string): Promise<boolean> {
    // Simulate file verification - in real implementation, make HTTP request
    console.log(`Verifying file method for ${domain} with token ${token}`);
    return true; // Simulate successful verification
  }

  private async verifyEmailMethod(domain: string): Promise<boolean> {
    // Simulate email verification - in real implementation, send email
    console.log(`Verifying email method for ${domain}`);
    return true; // Simulate successful verification
  }
}