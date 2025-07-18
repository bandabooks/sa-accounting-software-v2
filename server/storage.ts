import { 
  customers, 
  invoices, 
  invoiceItems, 
  estimates, 
  estimateItems, 
  users,
  type Customer, 
  type InsertCustomer,
  type Invoice,
  type InsertInvoice,
  type InvoiceItem,
  type InsertInvoiceItem,
  type Estimate,
  type InsertEstimate,
  type EstimateItem,
  type InsertEstimateItem,
  type User, 
  type InsertUser,
  type InvoiceWithCustomer,
  type InvoiceWithItems,
  type EstimateWithCustomer,
  type EstimateWithItems
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Customers
  getAllCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;

  // Invoices
  getAllInvoices(): Promise<InvoiceWithCustomer[]>;
  getInvoice(id: number): Promise<InvoiceWithItems | undefined>;
  getInvoiceByNumber(invoiceNumber: string): Promise<InvoiceWithItems | undefined>;
  createInvoice(invoice: InsertInvoice, items: InsertInvoiceItem[]): Promise<InvoiceWithItems>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  updateInvoiceStatus(id: number, status: string): Promise<Invoice | undefined>;
  deleteInvoice(id: number): Promise<boolean>;

  // Invoice Items
  getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]>;
  createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem>;
  updateInvoiceItem(id: number, item: Partial<InsertInvoiceItem>): Promise<InvoiceItem | undefined>;
  deleteInvoiceItem(id: number): Promise<boolean>;

  // Estimates
  getAllEstimates(): Promise<EstimateWithCustomer[]>;
  getEstimate(id: number): Promise<EstimateWithItems | undefined>;
  createEstimate(estimate: InsertEstimate, items: InsertEstimateItem[]): Promise<EstimateWithItems>;
  updateEstimate(id: number, estimate: Partial<InsertEstimate>): Promise<Estimate | undefined>;
  deleteEstimate(id: number): Promise<boolean>;
  convertEstimateToInvoice(estimateId: number): Promise<InvoiceWithItems>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalRevenue: string;
    outstandingInvoices: string;
    totalCustomers: number;
    vatDue: string;
    recentInvoices: InvoiceWithCustomer[];
    revenueByMonth: { month: string; revenue: number }[];
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private customers: Map<number, Customer>;
  private invoices: Map<number, Invoice>;
  private invoiceItems: Map<number, InvoiceItem>;
  private estimates: Map<number, Estimate>;
  private estimateItems: Map<number, EstimateItem>;
  private currentUserId: number;
  private currentCustomerId: number;
  private currentInvoiceId: number;
  private currentInvoiceItemId: number;
  private currentEstimateId: number;
  private currentEstimateItemId: number;

  constructor() {
    this.users = new Map();
    this.customers = new Map();
    this.invoices = new Map();
    this.invoiceItems = new Map();
    this.estimates = new Map();
    this.estimateItems = new Map();
    this.currentUserId = 1;
    this.currentCustomerId = 1;
    this.currentInvoiceId = 1;
    this.currentInvoiceItemId = 1;
    this.currentEstimateId = 1;
    this.currentEstimateItemId = 1;

    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create default user
    const defaultUser: User = {
      id: 1,
      username: "admin",
      password: "password",
      name: "John Smith",
      email: "admin@thinkmybiz.com",
      role: "admin"
    };
    this.users.set(1, defaultUser);
    this.currentUserId = 2;

    // Create sample customers
    const sampleCustomers: Customer[] = [
      {
        id: 1,
        name: "Sekele Holding",
        email: "info@sekele.co.za",
        phone: "+27 11 123 4567",
        address: "123 Business Street",
        city: "Johannesburg",
        postalCode: "2001",
        vatNumber: "4123456789",
        createdAt: new Date("2024-01-15")
      },
      {
        id: 2,
        name: "Tshobi Restaurant",
        email: "orders@tshobi.co.za",
        phone: "+27 21 234 5678",
        address: "456 Food Avenue",
        city: "Cape Town",
        postalCode: "8001",
        vatNumber: "4234567890",
        createdAt: new Date("2024-02-20")
      },
      {
        id: 3,
        name: "TNT Liquor Distribution",
        email: "sales@tnt-liquor.co.za",
        phone: "+27 31 345 6789",
        address: "789 Distribution Road",
        city: "Durban",
        postalCode: "4001",
        vatNumber: "4345678901",
        createdAt: new Date("2024-03-10")
      }
    ];

    sampleCustomers.forEach(customer => {
      this.customers.set(customer.id, customer);
    });
    this.currentCustomerId = 4;

    // Create sample invoices
    const sampleInvoices: Invoice[] = [
      {
        id: 1,
        invoiceNumber: "INV-2024-001",
        customerId: 1,
        issueDate: new Date("2024-12-16"),
        dueDate: new Date("2025-01-15"),
        status: "paid",
        subtotal: "7608.70",
        vatAmount: "1141.30",
        total: "8750.00",
        notes: "Professional services rendered",
        createdAt: new Date("2024-12-16")
      },
      {
        id: 2,
        invoiceNumber: "INV-2024-002",
        customerId: 2,
        issueDate: new Date("2024-12-15"),
        dueDate: new Date("2025-01-14"),
        status: "sent",
        subtotal: "2130.43",
        vatAmount: "319.57",
        total: "2450.00",
        notes: "Catering services",
        createdAt: new Date("2024-12-15")
      },
      {
        id: 3,
        invoiceNumber: "INV-2024-003",
        customerId: 3,
        issueDate: new Date("2024-12-14"),
        dueDate: new Date("2024-12-28"),
        status: "overdue",
        subtotal: "13286.96",
        vatAmount: "1993.04",
        total: "15280.00",
        notes: "Bulk order delivery",
        createdAt: new Date("2024-12-14")
      }
    ];

    sampleInvoices.forEach(invoice => {
      this.invoices.set(invoice.id, invoice);
    });
    this.currentInvoiceId = 4;

    // Create sample invoice items
    const sampleItems: InvoiceItem[] = [
      {
        id: 1,
        invoiceId: 1,
        description: "Business Consulting Services",
        quantity: "10.00",
        unitPrice: "760.87",
        vatRate: "15.00",
        total: "8750.00"
      },
      {
        id: 2,
        invoiceId: 2,
        description: "Catering Package - Premium",
        quantity: "1.00",
        unitPrice: "2130.43",
        vatRate: "15.00",
        total: "2450.00"
      },
      {
        id: 3,
        invoiceId: 3,
        description: "Liquor Distribution Services",
        quantity: "5.00",
        unitPrice: "2657.39",
        vatRate: "15.00",
        total: "15280.00"
      }
    ];

    sampleItems.forEach(item => {
      this.invoiceItems.set(item.id, item);
    });
    this.currentInvoiceItemId = 4;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      role: insertUser.role || "admin",
      email: insertUser.email || null
    };
    this.users.set(id, user);
    return user;
  }

  // Customers
  async getAllCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values()).sort((a, b) => b.id - a.id);
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.currentCustomerId++;
    const customer: Customer = { 
      ...insertCustomer, 
      id, 
      createdAt: new Date(),
      email: insertCustomer.email || null,
      phone: insertCustomer.phone || null,
      address: insertCustomer.address || null,
      city: insertCustomer.city || null,
      postalCode: insertCustomer.postalCode || null,
      vatNumber: insertCustomer.vatNumber || null
    };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: number, updateData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;
    
    const updatedCustomer = { ...customer, ...updateData };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    return this.customers.delete(id);
  }

  // Invoices
  async getAllInvoices(): Promise<InvoiceWithCustomer[]> {
    const invoiceList = Array.from(this.invoices.values()).sort((a, b) => b.id - a.id);
    return invoiceList.map(invoice => ({
      ...invoice,
      customer: this.customers.get(invoice.customerId)!
    }));
  }

  async getInvoice(id: number): Promise<InvoiceWithItems | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;

    const customer = this.customers.get(invoice.customerId);
    const items = Array.from(this.invoiceItems.values()).filter(item => item.invoiceId === id);
    
    if (!customer) return undefined;

    return {
      ...invoice,
      customer,
      items
    };
  }

  async getInvoiceByNumber(invoiceNumber: string): Promise<InvoiceWithItems | undefined> {
    const invoice = Array.from(this.invoices.values()).find(inv => inv.invoiceNumber === invoiceNumber);
    if (!invoice) return undefined;

    return this.getInvoice(invoice.id);
  }

  async createInvoice(insertInvoice: InsertInvoice, items: InsertInvoiceItem[]): Promise<InvoiceWithItems> {
    const id = this.currentInvoiceId++;
    const invoice: Invoice = { 
      ...insertInvoice, 
      id, 
      createdAt: new Date(),
      status: insertInvoice.status || "draft",
      notes: insertInvoice.notes || null
    };
    this.invoices.set(id, invoice);

    const createdItems: InvoiceItem[] = [];
    for (const item of items) {
      const itemId = this.currentInvoiceItemId++;
      const invoiceItem: InvoiceItem = { ...item, id: itemId, invoiceId: id, vatRate: item.vatRate || "20" };
      this.invoiceItems.set(itemId, invoiceItem);
      createdItems.push(invoiceItem);
    }

    const customer = this.customers.get(insertInvoice.customerId)!;
    return {
      ...invoice,
      customer,
      items: createdItems
    };
  }

  async updateInvoice(id: number, updateData: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;
    
    const updatedInvoice = { ...invoice, ...updateData };
    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }

  async updateInvoiceStatus(id: number, status: string): Promise<Invoice | undefined> {
    return this.updateInvoice(id, { status });
  }

  async deleteInvoice(id: number): Promise<boolean> {
    // Delete associated items
    const items = Array.from(this.invoiceItems.values()).filter(item => item.invoiceId === id);
    items.forEach(item => this.invoiceItems.delete(item.id));
    
    return this.invoices.delete(id);
  }

  // Invoice Items
  async getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
    return Array.from(this.invoiceItems.values()).filter(item => item.invoiceId === invoiceId);
  }

  async createInvoiceItem(insertItem: InsertInvoiceItem): Promise<InvoiceItem> {
    const id = this.currentInvoiceItemId++;
    const item: InvoiceItem = { ...insertItem, id, vatRate: insertItem.vatRate || "20" };
    this.invoiceItems.set(id, item);
    return item;
  }

  async updateInvoiceItem(id: number, updateData: Partial<InsertInvoiceItem>): Promise<InvoiceItem | undefined> {
    const item = this.invoiceItems.get(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, ...updateData };
    this.invoiceItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteInvoiceItem(id: number): Promise<boolean> {
    return this.invoiceItems.delete(id);
  }

  // Estimates
  async getAllEstimates(): Promise<EstimateWithCustomer[]> {
    const estimateList = Array.from(this.estimates.values()).sort((a, b) => b.id - a.id);
    return estimateList.map(estimate => ({
      ...estimate,
      customer: this.customers.get(estimate.customerId)!
    }));
  }

  async getEstimate(id: number): Promise<EstimateWithItems | undefined> {
    const estimate = this.estimates.get(id);
    if (!estimate) return undefined;

    const customer = this.customers.get(estimate.customerId);
    const items = Array.from(this.estimateItems.values()).filter(item => item.estimateId === id);
    
    if (!customer) return undefined;

    return {
      ...estimate,
      customer,
      items
    };
  }

  async createEstimate(insertEstimate: InsertEstimate, items: InsertEstimateItem[]): Promise<EstimateWithItems> {
    const id = this.currentEstimateId++;
    const estimate: Estimate = { 
      ...insertEstimate, 
      id, 
      createdAt: new Date(),
      status: insertEstimate.status || "draft",
      notes: insertEstimate.notes || null
    };
    this.estimates.set(id, estimate);

    const createdItems: EstimateItem[] = [];
    for (const item of items) {
      const itemId = this.currentEstimateItemId++;
      const estimateItem: EstimateItem = { ...item, id: itemId, estimateId: id, vatRate: item.vatRate || "20" };
      this.estimateItems.set(itemId, estimateItem);
      createdItems.push(estimateItem);
    }

    const customer = this.customers.get(insertEstimate.customerId)!;
    return {
      ...estimate,
      customer,
      items: createdItems
    };
  }

  async updateEstimate(id: number, updateData: Partial<InsertEstimate>): Promise<Estimate | undefined> {
    const estimate = this.estimates.get(id);
    if (!estimate) return undefined;
    
    const updatedEstimate = { ...estimate, ...updateData };
    this.estimates.set(id, updatedEstimate);
    return updatedEstimate;
  }

  async deleteEstimate(id: number): Promise<boolean> {
    // Delete associated items
    const items = Array.from(this.estimateItems.values()).filter(item => item.estimateId === id);
    items.forEach(item => this.estimateItems.delete(item.id));
    
    return this.estimates.delete(id);
  }

  async convertEstimateToInvoice(estimateId: number): Promise<InvoiceWithItems> {
    const estimate = await this.getEstimate(estimateId);
    if (!estimate) throw new Error("Estimate not found");

    // Generate invoice number
    const invoiceCount = this.invoices.size;
    const invoiceNumber = `INV-2024-${String(invoiceCount + 1).padStart(3, '0')}`;

    const insertInvoice: InsertInvoice = {
      invoiceNumber,
      customerId: estimate.customerId,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: "draft",
      subtotal: estimate.subtotal,
      vatAmount: estimate.vatAmount,
      total: estimate.total,
      notes: estimate.notes
    };

    const insertItems: InsertInvoiceItem[] = estimate.items.map(item => ({
      invoiceId: 0, // Will be set by createInvoice
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      vatRate: item.vatRate,
      total: item.total
    }));

    return this.createInvoice(insertInvoice, insertItems);
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalRevenue: string;
    outstandingInvoices: string;
    totalCustomers: number;
    vatDue: string;
    recentInvoices: InvoiceWithCustomer[];
    revenueByMonth: { month: string; revenue: number }[];
  }> {
    const allInvoices = Array.from(this.invoices.values());
    const paidInvoices = allInvoices.filter(inv => inv.status === "paid");
    const outstandingInvoices = allInvoices.filter(inv => inv.status !== "paid");
    
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0);
    const totalOutstanding = outstandingInvoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0);
    const totalVat = paidInvoices.reduce((sum, inv) => sum + parseFloat(inv.vatAmount), 0);

    const recentInvoices = await this.getAllInvoices();
    
    // Generate mock revenue by month data
    const revenueByMonth = [
      { month: "Jul", revenue: 180000 },
      { month: "Aug", revenue: 210000 },
      { month: "Sep", revenue: 195000 },
      { month: "Oct", revenue: 230000 },
      { month: "Nov", revenue: 220000 },
      { month: "Dec", revenue: 245680 }
    ];

    return {
      totalRevenue: totalRevenue.toFixed(2),
      outstandingInvoices: totalOutstanding.toFixed(2),
      totalCustomers: this.customers.size,
      vatDue: (totalVat * 0.15).toFixed(2), // Simplified VAT calculation
      recentInvoices: recentInvoices.slice(0, 5),
      revenueByMonth
    };
  }
}

export const storage = new MemStorage();
