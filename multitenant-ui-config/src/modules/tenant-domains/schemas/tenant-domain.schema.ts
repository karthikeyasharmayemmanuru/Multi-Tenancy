import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TenantDomainDocument = TenantDomain & Document;

@Schema({ 
  timestamps: true,
  collection: 'tenantdomains'
})
export class TenantDomain {
  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ required: true, unique: true, index: true })
  domain: string;

  @Prop({ 
    enum: ['subdomain', 'custom', 'both'], 
    required: true,
    index: true 
  })
  domainType: string;

  @Prop({ 
    enum: ['active', 'inactive', 'pending', 'suspended'], 
    default: 'active',
    index: true 
  })
  status: string;

  @Prop({ default: false })
  isDefault: boolean;

  @Prop({ default: false })
  isPrimary: boolean;

  @Prop({ 
    enum: ['http', 'https', 'both'], 
    default: 'https' 
  })
  protocol: string;

  @Prop()
  redirectTo?: string;

  @Prop({
    type: {
      sslEnabled: { type: Boolean, default: true },
      sslCertificate: { type: String },
      sslExpiryDate: { type: Date },
      autoRenew: { type: Boolean, default: true },
    },
  })
  sslConfig: {
    sslEnabled: boolean;
    sslCertificate?: string;
    sslExpiryDate?: Date;
    autoRenew: boolean;
  };

  @Prop({
    type: {
      verified: { type: Boolean, default: false },
      verificationMethod: { type: String, enum: ['dns', 'file', 'email'], default: 'dns' },
      verificationToken: { type: String },
      verificationDate: { type: Date },
      dnsRecords: [{
        type: { type: String, enum: ['A', 'CNAME', 'TXT', 'MX'] },
        name: { type: String },
        value: { type: String },
        ttl: { type: Number, default: 300 },
      }],
    },
  })
  verification: {
    verified: boolean;
    verificationMethod: string;
    verificationToken?: string;
    verificationDate?: Date;
    dnsRecords: Array<{
      type: string;
      name: string;
      value: string;
      ttl: number;
    }>;
  };

  @Prop({
    type: {
      provider: { type: String }, // 'cloudflare', 'route53', 'godaddy', etc.
      zoneId: { type: String },
      recordId: { type: String },
      lastSyncDate: { type: Date },
    },
  })
  dnsProvider: {
    provider?: string;
    zoneId?: string;
    recordId?: string;
    lastSyncDate?: Date;
  };

  @Prop({
    type: {
      enabled: { type: Boolean, default: false },
      cacheHeaders: [{
        path: { type: String },
        maxAge: { type: Number },
        cacheControl: { type: String },
      }],
      compressionEnabled: { type: Boolean, default: true },
      minifyEnabled: { type: Boolean, default: true },
    },
  })
  performanceConfig: {
    enabled: boolean;
    cacheHeaders: Array<{
      path: string;
      maxAge: number;
      cacheControl: string;
    }>;
    compressionEnabled: boolean;
    minifyEnabled: boolean;
  };

  @Prop({
    type: {
      allowedOrigins: [{ type: String }],
      allowedMethods: [{ type: String }],
      allowedHeaders: [{ type: String }],
      credentials: { type: Boolean, default: true },
    },
  })
  corsConfig: {
    allowedOrigins: string[];
    allowedMethods: string[];
    allowedHeaders: string[];
    credentials: boolean;
  };

  @Prop()
  notes?: string;

  @Prop()
  lastAccessDate?: Date;

  @Prop({ default: 0 })
  accessCount: number;
}

export const TenantDomainSchema = SchemaFactory.createForClass(TenantDomain);

// Create indexes for performance and uniqueness
TenantDomainSchema.index({ tenantId: 1 });
TenantDomainSchema.index({ domain: 1 }, { unique: true });
TenantDomainSchema.index({ tenantId: 1, domainType: 1 });
TenantDomainSchema.index({ tenantId: 1, isDefault: 1 });
TenantDomainSchema.index({ tenantId: 1, isPrimary: 1 });
TenantDomainSchema.index({ status: 1 });
TenantDomainSchema.index({ 'verification.verified': 1 });

// Compound index for fast tenant-domain lookups
TenantDomainSchema.index({ tenantId: 1, domain: 1 });

// Text index for domain search
TenantDomainSchema.index({ domain: 'text', notes: 'text' });