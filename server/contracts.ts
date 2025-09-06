import { eq, and, desc } from "drizzle-orm";
import { db } from "./db";
import {
  contractTemplates,
  contractBlocks,
  contracts,
  contractVersions,
  contractSigners,
  contractEvents,
  contractTokens,
  clients,
  projects,
  tasks,
  type ContractTemplate,
  type Contract,
  type ContractVersion,
  type ContractSigner,
  type InsertContractTemplate,
  type InsertContract,
  type InsertContractVersion,
  type InsertContractSigner,
  type InsertContractEvent,
  type InsertContractToken,
} from "../shared/schema";
import { createHash, randomBytes } from "crypto";
import Handlebars from "handlebars";

// Template engine for merge fields
export class ContractTemplateEngine {
  static compile(template: string) {
    return Handlebars.compile(template);
  }

  static render(template: string, data: any): string {
    const compiled = this.compile(template);
    return compiled(data);
  }

  static extractFields(template: string): string[] {
    const matches = template.match(/{{([^}]+)}}/g) || [];
    return matches.map(match => match.replace(/[{}]/g, ''));
  }
}

// Contract service for managing templates and contracts
export class ContractService {
  // Template management
  async createTemplate(companyId: number, data: InsertContractTemplate): Promise<ContractTemplate> {
    const [template] = await db.insert(contractTemplates)
      .values({ ...data, companyId })
      .returning();
    return template;
  }

  async getTemplates(companyId: number): Promise<ContractTemplate[]> {
    return db.select()
      .from(contractTemplates)
      .where(eq(contractTemplates.companyId, companyId))
      .orderBy(desc(contractTemplates.updatedAt));
  }

  async getTemplate(companyId: number, templateId: number): Promise<ContractTemplate | null> {
    const [template] = await db.select()
      .from(contractTemplates)
      .where(and(
        eq(contractTemplates.id, templateId),
        eq(contractTemplates.companyId, companyId)
      ));
    return template || null;
  }

  async updateTemplate(companyId: number, templateId: number, data: Partial<InsertContractTemplate>): Promise<ContractTemplate | null> {
    const [template] = await db.update(contractTemplates)
      .set({ ...data, updatedAt: new Date() })
      .where(and(
        eq(contractTemplates.id, templateId),
        eq(contractTemplates.companyId, companyId)
      ))
      .returning();
    return template || null;
  }

  async deleteTemplate(companyId: number, templateId: number): Promise<boolean> {
    const result = await db.delete(contractTemplates)
      .where(and(
        eq(contractTemplates.id, templateId),
        eq(contractTemplates.companyId, companyId)
      ));
    return (result.rowCount ?? 0) > 0;
  }

  // Contract management
  async createContract(companyId: number, data: InsertContract): Promise<Contract> {
    const [contract] = await db.insert(contracts)
      .values({ ...data, companyId })
      .returning();
    
    // Create initial version
    const template = await this.getTemplate(companyId, data.templateId);
    if (template) {
      await this.createVersion(contract.id, {
        contractId: contract.id,
        version: 1,
        bodyMd: template.bodyMd,
        mergeData: {},
      });
    }

    // Log creation event
    await this.logEvent(contract.id, 'created', `user:${data.createdBy}`, {});

    return contract;
  }

  async getContracts(companyId: number, status?: string): Promise<Contract[]> {
    const query = db.select()
      .from(contracts)
      .where(eq(contracts.companyId, companyId));
    
    if (status) {
      query.where(and(
        eq(contracts.companyId, companyId),
        eq(contracts.status, status)
      ));
    }

    return query.orderBy(desc(contracts.updatedAt));
  }

  async getContract(companyId: number, contractId: number): Promise<Contract | null> {
    const [contract] = await db.select()
      .from(contracts)
      .where(and(
        eq(contracts.id, contractId),
        eq(contracts.companyId, companyId)
      ));
    return contract || null;
  }

  async getContractWithDetails(companyId: number, contractId: number) {
    const contract = await this.getContract(companyId, contractId);
    if (!contract) return null;

    const [template, version, signers, events] = await Promise.all([
      this.getTemplate(companyId, contract.templateId),
      this.getCurrentVersion(contractId),
      this.getSigners(contractId),
      this.getEvents(contractId)
    ]);

    return {
      contract,
      template,
      version,
      signers,
      events
    };
  }

  async updateContractStatus(companyId: number, contractId: number, status: string, actor: string): Promise<boolean> {
    const [updated] = await db.update(contracts)
      .set({ status, updatedAt: new Date() })
      .where(and(
        eq(contracts.id, contractId),
        eq(contracts.companyId, companyId)
      ))
      .returning();

    if (updated) {
      await this.logEvent(contractId, 'status_changed', actor, { newStatus: status });
      return true;
    }
    return false;
  }

  async insertTemplateIntoContract(companyId: number, contractId: number, templateId: number): Promise<any> {
    // Get the template
    const template = await this.getTemplate(companyId, templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Get the contract
    const contract = await this.getContract(companyId, contractId);
    if (!contract) {
      throw new Error("Contract not found");
    }

    // Create a new version with the template content
    const currentVersion = await this.getCurrentVersion(contractId);
    const nextVersionNumber = currentVersion ? currentVersion.version + 1 : 1;

    const newVersion = await this.createVersion(contractId, {
      contractId: contractId,
      version: nextVersionNumber,
      bodyMd: template.bodyMd,
      mergeData: {},
    });

    // Log the insertion event
    await this.logEvent(contractId, 'template_inserted', `system`, { 
      templateId,
      templateName: template.name,
      version: nextVersionNumber
    });

    return newVersion;
  }

  async sendContractEmail(companyId: number, contractId: number): Promise<any> {
    // Get the contract
    const contract = await this.getContract(companyId, contractId);
    if (!contract) {
      throw new Error("Contract not found");
    }

    // Log the email sending event
    await this.logEvent(contractId, 'email_sent', `system`, { 
      sentAt: new Date().toISOString()
    });

    // Email sending logic would go here
    // For now, just return success
    return { emailSent: true, contractId };
  }

  // Version management
  async createVersion(contractId: number, data: InsertContractVersion): Promise<ContractVersion> {
    const [version] = await db.insert(contractVersions)
      .values({ ...data, contractId })
      .returning();
    return version;
  }

  async getCurrentVersion(contractId: number): Promise<ContractVersion | null> {
    const [version] = await db.select()
      .from(contractVersions)
      .where(eq(contractVersions.contractId, contractId))
      .orderBy(desc(contractVersions.version))
      .limit(1);
    return version || null;
  }

  async renderContract(contractId: number, mergeData: any): Promise<string> {
    const version = await this.getCurrentVersion(contractId);
    if (!version) throw new Error('Contract version not found');

    return ContractTemplateEngine.render(version.bodyMd, mergeData);
  }

  // Signer management
  async addSigner(contractId: number, data: InsertContractSigner): Promise<ContractSigner> {
    const [signer] = await db.insert(contractSigners)
      .values({ ...data, contractId })
      .returning();
    return signer;
  }

  async getSigners(contractId: number): Promise<ContractSigner[]> {
    return db.select()
      .from(contractSigners)
      .where(eq(contractSigners.contractId, contractId))
      .orderBy(contractSigners.orderIndex);
  }

  async updateSigner(signerId: number, data: Partial<ContractSigner>): Promise<ContractSigner | null> {
    const [signer] = await db.update(contractSigners)
      .set(data)
      .where(eq(contractSigners.id, signerId))
      .returning();
    return signer || null;
  }

  // Signature process
  async signContract(contractId: number, signerId: number, signatureData: any, ip: string, userAgent: string): Promise<boolean> {
    const [signer] = await db.update(contractSigners)
      .set({
        hasSigned: true,
        signedAt: new Date(),
        signatureData,
        ip,
        userAgent
      })
      .where(eq(contractSigners.id, signerId))
      .returning();

    if (signer) {
      await this.logEvent(contractId, 'signed', `signer:${signerId}`, {
        signerName: signer.name,
        signatureMethod: signatureData.method,
        ip,
        userAgent
      });

      // Check if all signers have signed
      const allSigners = await this.getSigners(contractId);
      const allSigned = allSigners.every(s => s.hasSigned);
      
      if (allSigned) {
        await this.updateContractStatus(0, contractId, 'signed', 'system'); // companyId not needed for status update
      }

      return true;
    }
    return false;
  }

  // Token management for magic links and OTP
  async generateToken(contractId: number, signerId: number): Promise<string> {
    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');

    await db.insert(contractTokens)
      .values({
        contractId,
        signerId,
        tokenHash,
        used: false
      });

    return token;
  }

  async validateToken(token: string): Promise<{ contractId: number; signerId: number } | null> {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    
    const [tokenRecord] = await db.select()
      .from(contractTokens)
      .where(and(
        eq(contractTokens.tokenHash, tokenHash),
        eq(contractTokens.used, false)
      ));

    return tokenRecord ? { contractId: tokenRecord.contractId, signerId: tokenRecord.signerId } : null;
  }

  async useToken(token: string): Promise<boolean> {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    
    const [updated] = await db.update(contractTokens)
      .set({ used: true })
      .where(eq(contractTokens.tokenHash, tokenHash))
      .returning();

    return !!updated;
  }

  // OTP management
  async generateOTP(contractId: number, signerId: number): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const otpHash = createHash('sha256').update(otp).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.update(contractTokens)
      .set({
        otpHash,
        otpExpiresAt: expiresAt
      })
      .where(and(
        eq(contractTokens.contractId, contractId),
        eq(contractTokens.signerId, signerId)
      ));

    await this.logEvent(contractId, 'otp_sent', `signer:${signerId}`, {});

    return otp;
  }

  async verifyOTP(contractId: number, signerId: number, otp: string): Promise<boolean> {
    const otpHash = createHash('sha256').update(otp).digest('hex');
    
    const [tokenRecord] = await db.select()
      .from(contractTokens)
      .where(and(
        eq(contractTokens.contractId, contractId),
        eq(contractTokens.signerId, signerId),
        eq(contractTokens.otpHash, otpHash)
      ));

    if (!tokenRecord || !tokenRecord.otpExpiresAt || tokenRecord.otpExpiresAt < new Date()) {
      return false;
    }

    await this.logEvent(contractId, 'otp_verified', `signer:${signerId}`, {});
    return true;
  }

  // Event logging
  async logEvent(contractId: number, kind: string, actor: string, meta: any): Promise<void> {
    await db.insert(contractEvents)
      .values({
        contractId,
        kind,
        actor,
        meta
      });
  }

  async getEvents(contractId: number): Promise<any[]> {
    return db.select()
      .from(contractEvents)
      .where(eq(contractEvents.contractId, contractId))
      .orderBy(desc(contractEvents.createdAt));
  }

  // Automation hooks
  async onContractCountersigned(contractId: number, companyId: number): Promise<void> {
    const contract = await this.getContract(companyId, contractId);
    if (!contract) return;

    // Create project if none exists
    if (!contract.projectId) {
      const customer = await db.select()
        .from(customers)
        .where(eq(customers.id, contract.customerId))
        .limit(1);

      if (customer.length > 0) {
        const [project] = await db.insert(projects)
          .values({
            companyId,
            customerId: contract.customerId,
            name: `Engagement - ${customer[0].name}`,
            description: `Auto-created from contract #${contractId}`,
            status: 'active',
            createdBy: contract.createdBy
          })
          .returning();

        // Update contract with project ID
        await db.update(contracts)
          .set({ projectId: project.id })
          .where(eq(contracts.id, contractId));

        // Create initial tasks based on service package
        const template = await this.getTemplate(companyId, contract.templateId);
        if (template?.servicePackage) {
          await this.createServiceTasks(project.id, template.servicePackage, companyId, contract.createdBy);
        }
      }
    }

    await this.logEvent(contractId, 'project_created', 'system', {});
  }

  private async createServiceTasks(projectId: number, servicePackage: string, companyId: number, createdBy: number): Promise<void> {
    const taskTemplates = this.getServiceTaskTemplates(servicePackage);
    
    for (const template of taskTemplates) {
      await db.insert(tasks)
        .values({
          companyId,
          projectId,
          title: template.title,
          description: template.description,
          status: 'todo',
          priority: template.priority || 'medium',
          createdBy
        });
    }
  }

  private getServiceTaskTemplates(servicePackage: string): Array<{title: string; description: string; priority?: string}> {
    const templates: Record<string, Array<{title: string; description: string; priority?: string}>> = {
      basic: [
        { title: 'Initial Client Meeting', description: 'Conduct initial consultation with client', priority: 'high' },
        { title: 'Document Collection', description: 'Collect all required documents from client' },
        { title: 'Compliance Review', description: 'Review client compliance requirements' }
      ],
      standard: [
        { title: 'Initial Client Meeting', description: 'Conduct initial consultation with client', priority: 'high' },
        { title: 'Document Collection', description: 'Collect all required documents from client' },
        { title: 'Compliance Review', description: 'Review client compliance requirements' },
        { title: 'Tax Planning Session', description: 'Conduct tax planning session with client' },
        { title: 'Monthly Review Setup', description: 'Set up monthly review process' }
      ],
      premium: [
        { title: 'Initial Client Meeting', description: 'Conduct initial consultation with client', priority: 'high' },
        { title: 'Document Collection', description: 'Collect all required documents from client' },
        { title: 'Compliance Review', description: 'Review client compliance requirements' },
        { title: 'Tax Planning Session', description: 'Conduct tax planning session with client' },
        { title: 'Monthly Review Setup', description: 'Set up monthly review process' },
        { title: 'Strategic Planning', description: 'Develop strategic business plan with client' },
        { title: 'Advanced Reporting Setup', description: 'Configure advanced reporting and analytics' }
      ]
    };

    return templates[servicePackage] || templates.basic;
  }
}

export const contractService = new ContractService();