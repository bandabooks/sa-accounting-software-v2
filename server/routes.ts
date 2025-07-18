import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomerSchema, insertInvoiceSchema, insertInvoiceItemSchema, insertEstimateSchema, insertEstimateItemSchema, insertPaymentSchema, customerPortalLoginSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Customers
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, validatedData);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  app.post("/api/customers/:id/portal", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { portalAccess, portalPassword } = req.body;
      const customer = await storage.setupCustomerPortal(id, { portalAccess, portalPassword });
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to setup customer portal" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCustomer(id);
      if (!deleted) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Invoices
  app.get("/api/invoices", async (req, res) => {
    try {
      const invoices = await storage.getAllInvoices();
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  app.get("/api/invoices/customer/:customerId", async (req, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      const invoices = await storage.getInvoicesByCustomer(customerId);
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer invoices" });
    }
  });

  const createInvoiceItemSchema = z.object({
    description: z.string(),
    quantity: z.string(),
    unitPrice: z.string(),
    vatRate: z.string().optional(),
    total: z.string()
  });

  const createInvoiceSchema = z.object({
    invoice: insertInvoiceSchema,
    items: z.array(createInvoiceItemSchema)
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const validatedData = createInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(validatedData.invoice, validatedData.items);
      res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  app.put("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertInvoiceSchema.partial().parse(req.body);
      const invoice = await storage.updateInvoice(id, validatedData);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });

  app.put("/api/invoices/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!["draft", "sent", "paid", "overdue"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const invoice = await storage.updateInvoiceStatus(id, status);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to update invoice status" });
    }
  });

  app.delete("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteInvoice(id);
      if (!deleted) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  });

  // Estimates
  app.get("/api/estimates", async (req, res) => {
    try {
      const estimates = await storage.getAllEstimates();
      res.json(estimates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch estimates" });
    }
  });

  app.get("/api/estimates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const estimate = await storage.getEstimate(id);
      if (!estimate) {
        return res.status(404).json({ message: "Estimate not found" });
      }
      res.json(estimate);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch estimate" });
    }
  });

  const createEstimateItemSchema = z.object({
    description: z.string(),
    quantity: z.string(),
    unitPrice: z.string(),
    vatRate: z.string().optional(),
    total: z.string()
  });

  const createEstimateSchema = z.object({
    estimate: insertEstimateSchema,
    items: z.array(createEstimateItemSchema)
  });

  app.post("/api/estimates", async (req, res) => {
    try {
      const validatedData = createEstimateSchema.parse(req.body);
      const estimate = await storage.createEstimate(validatedData.estimate, validatedData.items);
      res.status(201).json(estimate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create estimate" });
    }
  });

  app.post("/api/estimates/:id/convert-to-invoice", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.convertEstimateToInvoice(id);
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to convert estimate to invoice" });
    }
  });

  // Payment routes
  app.get("/api/payments", async (req, res) => {
    try {
      const payments = await storage.getAllPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.get("/api/invoices/:id/payments", async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const payments = await storage.getPaymentsByInvoice(invoiceId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoice payments" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const validatedData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(validatedData);
      res.status(201).json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  app.put("/api/payments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPaymentSchema.partial().parse(req.body);
      const payment = await storage.updatePayment(id, validatedData);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      res.json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update payment" });
    }
  });

  app.delete("/api/payments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePayment(id);
      if (!success) {
        return res.status(404).json({ message: "Payment not found" });
      }
      res.json({ message: "Payment deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete payment" });
    }
  });

  // Email invoice functionality
  app.post("/api/invoices/send-email", async (req, res) => {
    try {
      const { invoiceId, to, subject, message } = req.body;
      
      // For demo purposes, we'll simulate email sending
      // In production, you would integrate with SendGrid or another email service
      console.log("Email sent simulation:", { invoiceId, to, subject, message });
      
      res.json({ message: "Email sent successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ message: "Failed to send email" });
    }
  });

  // Setup recurring invoice
  app.post("/api/invoices/setup-recurring", async (req, res) => {
    try {
      const { invoiceId, frequency, intervalCount, startDate, endDate, isActive } = req.body;
      
      // For demo purposes, we'll simulate recurring invoice setup
      console.log("Recurring invoice setup:", { invoiceId, frequency, intervalCount, startDate, endDate, isActive });
      
      res.json({ message: "Recurring invoice setup complete" });
    } catch (error) {
      console.error("Error setting up recurring invoice:", error);
      res.status(500).json({ message: "Failed to setup recurring invoice" });
    }
  });

  // Customer Portal Routes
  app.post("/api/customer-portal/login", async (req, res) => {
    try {
      const { email, password } = customerPortalLoginSchema.parse(req.body);
      const customer = await storage.getCustomerByEmail(email);
      
      if (!customer || !customer.portalAccess || customer.portalPassword !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const invoices = await storage.getInvoicesByCustomer(customer.id);
      const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0);
      const paidAmount = invoices.filter(inv => inv.status === "paid")
        .reduce((sum, inv) => sum + parseFloat(inv.total), 0);
      const outstandingAmount = totalAmount - paidAmount;
      
      res.json({
        customer: {
          ...customer,
          portalPassword: undefined, // Don't send password back
        },
        invoices,
        totalAmount,
        paidAmount,
        outstandingAmount,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/customer-portal/invoice/:id/pdf", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      // In a real application, you would generate the PDF here
      // For now, we'll just return a success response
      res.json({ message: "PDF generation not implemented" });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
