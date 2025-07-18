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
    apiRequest("GET", "/api/dashboard/stats").then(res => res.json()),
};

// Customers API
export const customersApi = {
  getAll: (): Promise<Customer[]> => 
    apiRequest("GET", "/api/customers").then(res => res.json()),
  
  getById: (id: number): Promise<Customer> => 
    apiRequest("GET", `/api/customers/${id}`).then(res => res.json()),
  
  create: (customer: InsertCustomer): Promise<Customer> => 
    apiRequest("POST", "/api/customers", customer).then(res => res.json()),
  
  update: (id: number, customer: Partial<InsertCustomer>): Promise<Customer> => 
    apiRequest("PUT", `/api/customers/${id}`, customer).then(res => res.json()),
  
  delete: (id: number): Promise<void> => 
    apiRequest("DELETE", `/api/customers/${id}`).then(() => {}),
  
  setupPortal: (id: number, data: any): Promise<Customer> => 
    apiRequest("POST", `/api/customers/${id}/portal`, data).then(res => res.json()),
  
  getByCustomer: (customerId: number): Promise<InvoiceWithCustomer[]> => 
    apiRequest("GET", `/api/invoices/customer/${customerId}`).then(res => res.json()),
};

// Invoices API
export const invoicesApi = {
  getAll: (): Promise<InvoiceWithCustomer[]> => 
    apiRequest("GET", "/api/invoices").then(res => res.json()),
  
  getById: (id: number): Promise<InvoiceWithItems> => 
    apiRequest("GET", `/api/invoices/${id}`).then(res => res.json()),
  
  create: (data: { invoice: InsertInvoice; items: Omit<InsertInvoiceItem, 'invoiceId'>[] }): Promise<InvoiceWithItems> => 
    apiRequest("POST", "/api/invoices", data).then(res => res.json()),
  
  update: (id: number, invoice: Partial<InsertInvoice>): Promise<Invoice> => 
    apiRequest("PUT", `/api/invoices/${id}`, invoice).then(res => res.json()),
  
  updateStatus: (id: number, status: string): Promise<Invoice> => 
    apiRequest("PUT", `/api/invoices/${id}/status`, { status }).then(res => res.json()),
  
  getByCustomer: (customerId: number): Promise<InvoiceWithCustomer[]> => 
    apiRequest("GET", `/api/invoices/customer/${customerId}`).then(res => res.json()),
  
  delete: (id: number): Promise<void> => 
    apiRequest("DELETE", `/api/invoices/${id}`).then(() => {}),
};

// Estimates API
export const estimatesApi = {
  getAll: (): Promise<EstimateWithCustomer[]> => 
    apiRequest("GET", "/api/estimates").then(res => res.json()),
  
  getById: (id: number): Promise<EstimateWithItems> => 
    apiRequest("GET", `/api/estimates/${id}`).then(res => res.json()),
  
  create: (data: any): Promise<EstimateWithItems> => 
    apiRequest("POST", "/api/estimates", data).then(res => res.json()),
  
  convertToInvoice: (id: number): Promise<InvoiceWithItems> => 
    apiRequest("POST", `/api/estimates/${id}/convert-to-invoice`).then(res => res.json()),
};
