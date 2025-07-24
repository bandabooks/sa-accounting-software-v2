import { apiRequest } from "./queryClient";
import type { 
  Customer, 
  InsertCustomer, 
  Invoice, 
  InsertInvoice, 
  InvoiceWithItems, 
  InvoiceWithCustomer,
  Estimate,
  EstimateWithItems,
  EstimateWithCustomer,
  InsertInvoiceItem 
} from "@shared/schema";

// Dashboard API
export const dashboardApi = {
  getStats: () => 
    apiRequest("/api/dashboard/stats", "GET").then(res => res.json()),
};

// Customers API
export const customersApi = {
  getAll: (): Promise<Customer[]> => 
    apiRequest("/api/customers", "GET").then(res => res.json()),
  
  getById: (id: number): Promise<Customer> => 
    apiRequest(`/api/customers/${id}`, "GET").then(res => res.json()),
  
  create: (customer: InsertCustomer): Promise<Customer> => 
    apiRequest("/api/customers", "POST", customer).then(res => res.json()),
  
  update: (id: number, customer: Partial<InsertCustomer>): Promise<Customer> => 
    apiRequest(`/api/customers/${id}`, "PUT", customer).then(res => res.json()),
  
  delete: (id: number): Promise<void> => 
    apiRequest(`/api/customers/${id}`, "DELETE").then(() => {}),
  
  setupPortal: (id: number, data: any): Promise<Customer> => 
    apiRequest(`/api/customers/${id}/portal`, "POST", data).then(res => res.json()),
  
  getByCustomer: (customerId: number): Promise<InvoiceWithCustomer[]> => 
    apiRequest(`/api/invoices/customer/${customerId}`, "GET").then(res => res.json()),
};

// Invoices API
export const invoicesApi = {
  getAll: (): Promise<InvoiceWithCustomer[]> => 
    apiRequest("/api/invoices", "GET").then(res => res.json()),
  
  getById: (id: number): Promise<InvoiceWithItems> => 
    apiRequest(`/api/invoices/${id}`, "GET").then(res => res.json()),
  
  create: (data: { invoice: InsertInvoice; items: Omit<InsertInvoiceItem, 'invoiceId'>[] }): Promise<InvoiceWithItems> => 
    apiRequest("/api/invoices", "POST", data).then(res => res.json()),
  
  update: (id: number, invoice: Partial<InsertInvoice>): Promise<Invoice> => 
    apiRequest(`/api/invoices/${id}`, "PUT", invoice).then(res => res.json()),
  
  updateStatus: (id: number, status: string): Promise<Invoice> => 
    apiRequest(`/api/invoices/${id}/status`, "PUT", { status }).then(res => res.json()),
  
  getByCustomer: (customerId: number): Promise<InvoiceWithCustomer[]> => 
    apiRequest(`/api/invoices/customer/${customerId}`, "GET").then(res => res.json()),
  
  delete: (id: number): Promise<void> => 
    apiRequest(`/api/invoices/${id}`, "DELETE").then(() => {}),
};

// Estimates API
export const estimatesApi = {
  getAll: (): Promise<EstimateWithCustomer[]> => 
    apiRequest("/api/estimates", "GET").then(res => res.json()),
  
  getById: (id: number): Promise<EstimateWithItems> => 
    apiRequest(`/api/estimates/${id}`, "GET").then(res => res.json()),
  
  create: (data: any): Promise<EstimateWithItems> => 
    apiRequest("/api/estimates", "POST", data).then(res => res.json()),
  
  convertToInvoice: (id: number): Promise<InvoiceWithItems> => 
    apiRequest(`/api/estimates/${id}/convert-to-invoice`, "POST").then(res => res.json()),
};
