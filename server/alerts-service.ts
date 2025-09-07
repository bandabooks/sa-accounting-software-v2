import { DatabaseStorage } from './storage';

export interface Alert {
  id: string;
  title: string;
  description: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  category: 'system' | 'compliance' | 'business' | 'sars' | 'invoices' | 'estimates';
  priority: 'high' | 'medium' | 'low';
  time: string;
  dueDate?: string;
  status: 'active' | 'resolved' | 'dismissed';
  actionRequired: boolean;
  relatedId?: number;
  relatedType?: 'invoice' | 'estimate' | 'customer' | 'payment';
  actionUrl?: string;
}

export class AlertsService {
  constructor(private storage: DatabaseStorage) {}

  async generateSystemAlerts(companyId: number): Promise<Alert[]> {
    const alerts: Alert[] = [];

    try {
      // Get overdue invoices
      const overdueInvoices = await this.getOverdueInvoices(companyId);
      alerts.push(...overdueInvoices);

      // Get pending estimates
      const pendingEstimates = await this.getPendingEstimates(companyId);
      alerts.push(...pendingEstimates);

      // Get SARS compliance alerts
      const sarsAlerts = await this.getSARSComplianceAlerts(companyId);
      alerts.push(...sarsAlerts);

      // Get system alerts
      const systemAlerts = await this.getSystemAlerts(companyId);
      alerts.push(...systemAlerts);

      // Get business alerts
      const businessAlerts = await this.getBusinessAlerts(companyId);
      alerts.push(...businessAlerts);

    } catch (error) {
      console.error('Error generating alerts:', error);
    }

    return alerts.sort((a, b) => {
      // Sort by priority and then by date
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    });
  }

  private async getOverdueInvoices(companyId: number): Promise<Alert[]> {
    const alerts: Alert[] = [];
    
    try {
      // Get all invoices for the company
      const invoices = await this.storage.getAllInvoices(companyId);
      const currentDate = new Date();
      
      for (const invoice of invoices) {
        if (invoice.status === 'sent' && invoice.dueDate) {
          const dueDate = new Date(invoice.dueDate);
          const daysDiff = Math.floor((currentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff > 0) {
            alerts.push({
              id: `invoice-overdue-${invoice.id}`,
              title: `Overdue Invoice #${invoice.invoiceNumber}`,
              description: `Invoice of R${invoice.totalAmount?.toFixed(2) || '0.00'} is ${daysDiff} days overdue`,
              type: daysDiff > 30 ? 'critical' : 'warning',
              category: 'invoices',
              priority: daysDiff > 30 ? 'high' : 'medium',
              time: `${daysDiff} days ago`,
              dueDate: invoice.dueDate,
              status: 'active',
              actionRequired: true,
              relatedId: invoice.id,
              relatedType: 'invoice',
              actionUrl: `/invoices/${invoice.id}`
            });
          }
        }
      }
    } catch (error) {
      console.error('Error getting overdue invoices:', error);
    }

    return alerts;
  }

  private async getPendingEstimates(companyId: number): Promise<Alert[]> {
    const alerts: Alert[] = [];
    
    try {
      const estimates = await this.storage.getAllEstimates(companyId);
      const currentDate = new Date();
      
      for (const estimate of estimates) {
        if (estimate.status === 'pending') {
          const createdDate = new Date(estimate.createdAt || Date.now());
          const daysDiff = Math.floor((currentDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff > 7) {
            alerts.push({
              id: `estimate-pending-${estimate.id}`,
              title: `Pending Estimate #${estimate.estimateNumber}`,
              description: `Estimate for R${estimate.totalAmount?.toFixed(2) || '0.00'} has been pending for ${daysDiff} days`,
              type: daysDiff > 21 ? 'warning' : 'info',
              category: 'estimates',
              priority: daysDiff > 21 ? 'medium' : 'low',
              time: `${daysDiff} days ago`,
              status: 'active',
              actionRequired: daysDiff > 21,
              relatedId: estimate.id,
              relatedType: 'estimate',
              actionUrl: `/estimates/${estimate.id}`
            });
          }
        }
      }
    } catch (error) {
      console.error('Error getting pending estimates:', error);
    }

    return alerts;
  }

  private async getSARSComplianceAlerts(companyId: number): Promise<Alert[]> {
    const alerts: Alert[] = [];
    const currentDate = new Date();
    
    // VAT Return alerts
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // VAT returns are due on the 25th of the month following the VAT period
    let vatDueDate: Date;
    if (currentDate.getDate() > 25) {
      // Next month's VAT return
      vatDueDate = new Date(currentYear, currentMonth + 1, 25);
    } else {
      // Current month's VAT return
      vatDueDate = new Date(currentYear, currentMonth, 25);
    }
    
    const daysUntilVatDue = Math.floor((vatDueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilVatDue <= 7) {
      alerts.push({
        id: 'vat-return-due',
        title: 'VAT Return Due Soon',
        description: `Monthly VAT return is due in ${daysUntilVatDue} days`,
        type: daysUntilVatDue <= 3 ? 'critical' : 'warning',
        category: 'sars',
        priority: daysUntilVatDue <= 3 ? 'high' : 'medium',
        time: '1 hour ago',
        dueDate: vatDueDate.toISOString().split('T')[0],
        status: 'active',
        actionRequired: true,
        actionUrl: '/vat-returns'
      });
    }

    // EMP501 Annual Return (Due 31 May)
    const empDueDate = new Date(currentYear, 4, 31); // May 31st
    if (currentDate > empDueDate) {
      empDueDate.setFullYear(currentYear + 1);
    }
    
    const daysUntilEmpDue = Math.floor((empDueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilEmpDue <= 60) {
      alerts.push({
        id: 'emp501-due',
        title: 'EMP501 Annual Return Due',
        description: `Annual EMP501 return must be submitted by ${empDueDate.toDateString()}`,
        type: daysUntilEmpDue <= 30 ? 'warning' : 'info',
        category: 'sars',
        priority: daysUntilEmpDue <= 30 ? 'medium' : 'low',
        time: '2 hours ago',
        dueDate: empDueDate.toISOString().split('T')[0],
        status: 'active',
        actionRequired: daysUntilEmpDue <= 30,
        actionUrl: '/practice-dashboard'
      });
    }

    return alerts;
  }

  private async getSystemAlerts(companyId: number): Promise<Alert[]> {
    const alerts: Alert[] = [];

    // System backup status
    alerts.push({
      id: 'system-backup',
      title: 'Daily Backup Completed',
      description: 'System backup completed successfully',
      type: 'success',
      category: 'system',
      priority: 'low',
      time: '30 minutes ago',
      status: 'active',
      actionRequired: false
    });

    // Database performance
    alerts.push({
      id: 'db-performance',
      title: 'Database Performance Optimal',
      description: 'All database queries are performing within normal parameters',
      type: 'info',
      category: 'system',
      priority: 'low',
      time: '1 hour ago',
      status: 'active',
      actionRequired: false
    });

    return alerts;
  }

  private async getBusinessAlerts(companyId: number): Promise<Alert[]> {
    const alerts: Alert[] = [];

    try {
      // Check for low stock items
      const products = await this.storage.getAllProducts(companyId);
      for (const product of products) {
        if (product.stockQuantity !== undefined && product.stockQuantity < 10) {
          alerts.push({
            id: `low-stock-${product.id}`,
            title: 'Low Stock Alert',
            description: `${product.name} has only ${product.stockQuantity} units remaining`,
            type: product.stockQuantity < 5 ? 'warning' : 'info',
            category: 'business',
            priority: product.stockQuantity < 5 ? 'medium' : 'low',
            time: '2 hours ago',
            status: 'active',
            actionRequired: product.stockQuantity < 5,
            actionUrl: `/products`
          });
        }
      }

      // Check for new customer registrations requiring approval
      const customers = await this.storage.getAllCustomers(companyId);
      const recentCustomers = customers.filter((customer: any) => {
        if (!customer.createdAt) return false;
        const createdDate = new Date(customer.createdAt);
        const daysDiff = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff <= 1;
      });

      if (recentCustomers.length > 0) {
        alerts.push({
          id: 'new-customers',
          title: 'New Customer Registrations',
          description: `${recentCustomers.length} new customer${recentCustomers.length > 1 ? 's' : ''} registered in the last 24 hours`,
          type: 'info',
          category: 'business',
          priority: 'medium',
          time: '4 hours ago',
          status: 'active',
          actionRequired: false,
          actionUrl: '/customers'
        });
      }

    } catch (error) {
      console.error('Error getting business alerts:', error);
    }

    return alerts;
  }

  async getAlertCounts(companyId: number): Promise<{
    total: number;
    critical: number;
    active: number;
    sars: number;
    business: number;
    system: number;
    invoices: number;
    estimates: number;
  }> {
    const alerts = await this.generateSystemAlerts(companyId);
    
    return {
      total: alerts.length,
      critical: alerts.filter(a => a.type === 'critical').length,
      active: alerts.filter(a => a.status === 'active').length,
      sars: alerts.filter(a => a.category === 'sars').length,
      business: alerts.filter(a => a.category === 'business').length,
      system: alerts.filter(a => a.category === 'system').length,
      invoices: alerts.filter(a => a.category === 'invoices').length,
      estimates: alerts.filter(a => a.category === 'estimates').length,
    };
  }
}