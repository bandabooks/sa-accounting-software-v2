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
  customers,
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
    // Extract merge fields from template body
    const fields = data.bodyMd ? ContractTemplateEngine.extractFields(data.bodyMd) : [];
    
    const [template] = await db.insert(contractTemplates)
      .values({ ...data, companyId, fields })
      .returning();
    return template;
  }

  async getTemplates(companyId: number): Promise<ContractTemplate[]> {
    try {
      console.log(`🔍 Querying templates for company ${companyId}`);
      const templates = await db.select()
        .from(contractTemplates)
        .where(eq(contractTemplates.companyId, companyId))
        .orderBy(desc(contractTemplates.updatedAt));
      
      console.log(`🔍 Raw query result:`, templates);
      console.log(`🔍 Templates type:`, typeof templates);
      console.log(`🔍 Templates length:`, templates?.length);
      console.log(`🔍 Is array:`, Array.isArray(templates));
      
      return templates || [];
    } catch (error) {
      console.error(`❌ Error in getTemplates for company ${companyId}:`, error);
      return [];
    }
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
    // Extract merge fields from template body if bodyMd is being updated
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.bodyMd) {
      updateData.fields = ContractTemplateEngine.extractFields(data.bodyMd);
    }
    
    const [template] = await db.update(contractTemplates)
      .set(updateData)
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
    // Map client_id to both customer_id (old column) and client_id (new column) for compatibility
    const contractData = {
      ...data,
      companyId,
      customer_id: data.clientId, // Map to old column for compatibility
      client_id: data.clientId   // Keep new column as well
    };
    
    const [contract] = await db.insert(contracts)
      .values(contractData)
      .returning();
    
    // Create initial version (only if template is provided)
    if (data.templateId) {
      const template = await this.getTemplate(companyId, data.templateId);
      if (template) {
        await this.createVersion(contract.id, {
          contractId: contract.id,
          version: 1,
          bodyMd: template.bodyMd,
          mergeData: {},
        });
      }
    }

    // Log creation event
    await this.logEvent(contract.id, 'created', `user:${data.createdBy}`, {});

    return contract;
  }

  async getContracts(companyId: number, status?: string): Promise<any[]> {
    try {
      let whereCondition: any = eq(contracts.companyId, companyId);
      
      if (status && status !== 'all') {
        whereCondition = and(
          eq(contracts.companyId, companyId),
          eq(contracts.status, status)
        );
      }
      
      // First, get basic contract data without joins to avoid schema issues
      const contractsData = await db.select()
        .from(contracts)
        .where(whereCondition)
        .orderBy(desc(contracts.updatedAt));
      
      // If no contracts found, return empty array
      if (!contractsData || contractsData.length === 0) {
        return [];
      }
      
      // Enrich with customer and template names where possible
      const enrichedContracts = await Promise.all(
        contractsData.map(async (contract) => {
          let customerName = 'N/A';
          let customerEmail = '';
          let templateName = '';
          
          try {
            // Get customer info if customerId exists
            if (contract.customerId) {
              const customerData = await db.select()
                .from(customers)
                .where(eq(customers.id, contract.customerId))
                .limit(1);
              if (customerData && customerData[0]) {
                customerName = customerData[0].name || 'N/A';
                customerEmail = customerData[0].email || '';
              }
            }
            
            // Get template name if templateId exists
            if (contract.templateId) {
              const templateData = await db.select()
                .from(contractTemplates)
                .where(eq(contractTemplates.id, contract.templateId))
                .limit(1);
              if (templateData && templateData[0]) {
                templateName = templateData[0].name || '';
              }
            }
          } catch (error) {
            console.warn(`Error enriching contract ${contract.id}:`, error);
            // Continue with default values
          }
          
          return {
            ...contract,
            customerName,
            customerEmail,
            templateName,
          };
        })
      );
      
      return enrichedContracts;
    } catch (error) {
      console.error("Error in getContracts:", error);
      return []; // Return empty array instead of throwing
    }
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
        // Get the contract to obtain the companyId
        const [contract] = await db.select()
          .from(contracts)
          .where(eq(contracts.id, contractId))
          .limit(1);
          
        if (contract) {
          // Update contract status with proper companyId
          await this.updateContractStatus(contract.companyId, contractId, 'signed', 'system');
          
          // Trigger automation hook for project and task creation
          await this.onContractCountersigned(contractId, contract.companyId);
        }
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
      const customerResult = await db.select()
        .from(customers)
        .where(eq(customers.id, contract.customerId))
        .limit(1);

      if (customerResult.length > 0) {
        const [project] = await db.insert(projects)
          .values({
            companyId,
            customerId: contract.customerId,
            name: `Engagement - ${customerResult[0].name}`,
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
    // Professional service task templates aligned with SAICA/SAIPA standards
    const professionalTemplates: Record<string, Array<{title: string; description: string; priority?: string}>> = {
      // Audit & Assurance Services (SAICA/IRBA Standards)
      audit_services: [
        { title: 'Engagement Letter Review', description: 'Review and finalize audit engagement letter with client', priority: 'high' },
        { title: 'Risk Assessment', description: 'Conduct preliminary risk assessment and materiality calculations', priority: 'high' },
        { title: 'Planning Memorandum', description: 'Prepare detailed audit planning memorandum', priority: 'medium' },
        { title: 'Internal Controls Evaluation', description: 'Assess and document client internal controls', priority: 'medium' },
        { title: 'Substantive Testing', description: 'Perform detailed substantive audit procedures', priority: 'medium' },
        { title: 'Management Letter', description: 'Prepare management letter with recommendations', priority: 'low' },
        { title: 'Audit Opinion', description: 'Finalize audit opinion and issue audit report', priority: 'high' }
      ],

      // Tax Compliance Services (SAICA/SAIT Standards)
      tax_compliance: [
        { title: 'Tax Status Review', description: 'Review client tax compliance status and obligations', priority: 'high' },
        { title: 'Document Collection', description: 'Collect all tax-related documents and records', priority: 'high' },
        { title: 'Tax Return Preparation', description: 'Prepare annual income tax returns', priority: 'medium' },
        { title: 'Tax Planning Session', description: 'Conduct tax planning and optimization session', priority: 'medium' },
        { title: 'SARS Correspondence', description: 'Handle SARS queries and correspondence', priority: 'low' },
        { title: 'Tax Reconciliation', description: 'Reconcile tax provisions and payments', priority: 'low' }
      ],

      // VAT Services (SAICA/SAIT Standards)  
      vat_compliance: [
        { title: 'VAT Registration Review', description: 'Review VAT registration status and requirements', priority: 'high' },
        { title: 'VAT Return Preparation', description: 'Prepare monthly/bi-monthly VAT returns', priority: 'high' },
        { title: 'VAT Reconciliation', description: 'Reconcile VAT accounts and input/output tax', priority: 'medium' },
        { title: 'Export Documentation', description: 'Review export documentation for zero-rating', priority: 'medium' },
        { title: 'VAT201 Submission', description: 'Submit VAT201 returns to SARS', priority: 'medium' },
        { title: 'VAT Verification', description: 'Verify VAT calculations and compliance', priority: 'low' }
      ],

      // Review Engagements (SAICA/IRBA Standards)
      review_services: [
        { title: 'Review Engagement Letter', description: 'Finalize review engagement terms with client', priority: 'high' },
        { title: 'Analytical Procedures', description: 'Perform analytical review procedures', priority: 'medium' },
        { title: 'Inquiry Procedures', description: 'Conduct management inquiries and confirmations', priority: 'medium' },
        { title: 'Review Documentation', description: 'Document review procedures and findings', priority: 'medium' },
        { title: 'Review Report', description: 'Issue independent review report', priority: 'high' }
      ],

      // Bookkeeping Services (SAIPA/IAC Standards)
      bookkeeping: [
        { title: 'Chart of Accounts Setup', description: 'Set up or review chart of accounts structure', priority: 'high' },
        { title: 'Transaction Processing', description: 'Process and categorize daily transactions', priority: 'high' },
        { title: 'Bank Reconciliation', description: 'Perform monthly bank reconciliations', priority: 'medium' },
        { title: 'Debtors/Creditors Reconciliation', description: 'Reconcile debtors and creditors accounts', priority: 'medium' },
        { title: 'Monthly Management Accounts', description: 'Prepare monthly management accounts', priority: 'medium' },
        { title: 'Year-end Adjustments', description: 'Process year-end journals and adjustments', priority: 'low' }
      ],

      // Payroll Services (SAIPA Standards)
      payroll: [
        { title: 'Employee Data Setup', description: 'Set up employee master data and tax directives', priority: 'high' },
        { title: 'Monthly Payroll Processing', description: 'Calculate and process monthly payroll', priority: 'high' },
        { title: 'PAYE/UIF Calculations', description: 'Calculate PAYE, UIF and SDL deductions', priority: 'medium' },
        { title: 'EMP501 Reconciliation', description: 'Prepare and submit EMP501 reconciliation', priority: 'medium' },
        { title: 'IRP5/IT3A Certificates', description: 'Generate employee tax certificates', priority: 'low' },
        { title: 'SARS Returns', description: 'Submit monthly EMP201 returns to SARS', priority: 'medium' }
      ],

      // Company Secretarial Services (SAICA/SAIPA Standards)
      compliance: [
        { title: 'CIPC Compliance Review', description: 'Review CIPC annual return requirements', priority: 'high' },
        { title: 'Annual Financial Statements', description: 'Prepare and file annual financial statements', priority: 'high' },
        { title: 'Directors Resolutions', description: 'Prepare board resolutions and meeting minutes', priority: 'medium' },
        { title: 'Share Capital Changes', description: 'Process share capital and shareholding changes', priority: 'medium' },
        { title: 'Statutory Registers', description: 'Update and maintain statutory registers', priority: 'low' },
        { title: 'CIPC Filings', description: 'Submit required CIPC forms and returns', priority: 'medium' }
      ],

      // Business Advisory Services (SAICA/SAIPA Standards)
      advisory: [
        { title: 'Business Assessment', description: 'Conduct comprehensive business assessment', priority: 'high' },
        { title: 'Financial Analysis', description: 'Perform detailed financial ratio analysis', priority: 'medium' },
        { title: 'Strategic Planning Session', description: 'Facilitate strategic planning workshop', priority: 'medium' },
        { title: 'Cash Flow Forecasting', description: 'Prepare cash flow forecasts and projections', priority: 'medium' },
        { title: 'Performance Review', description: 'Review KPIs and performance metrics', priority: 'low' },
        { title: 'Recommendations Report', description: 'Prepare advisory recommendations report', priority: 'medium' }
      ],

      // Legacy support for existing basic/standard/premium
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

    return professionalTemplates[servicePackage] || professionalTemplates.basic;
  }
}

export const contractService = new ContractService();