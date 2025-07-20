import type { Express } from "express";
import { storage } from "./storage";

export function registerVATRoutes(app: Express) {
  // Get company VAT settings
  app.get("/api/companies/:companyId/vat-settings", async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const company = await storage.getCompany(companyId);
      
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }

      const vatSettings = {
        vatInclusivePricing: company.vatInclusivePricing || false,
        defaultVatRate: parseFloat(company.defaultVatRate || "15.00"),
        isVatRegistered: company.isVatRegistered || false,
        vatRegistrationNumber: company.vatRegistrationNumber || "",
        vatPeriodMonths: company.vatPeriodMonths || 2,
        vatSubmissionDay: company.vatSubmissionDay || 25
      };

      res.json(vatSettings);
    } catch (error) {
      console.error("Error fetching VAT settings:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update company VAT settings
  app.put("/api/companies/:companyId/vat-settings", async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const { vatInclusivePricing, defaultVatRate } = req.body;

      const updatedCompany = await storage.updateCompany(companyId, {
        vatInclusivePricing: vatInclusivePricing,
        defaultVatRate: defaultVatRate.toString()
      });

      if (!updatedCompany) {
        return res.status(404).json({ error: "Company not found" });
      }

      res.json({
        vatInclusivePricing: updatedCompany.vatInclusivePricing,
        defaultVatRate: parseFloat(updatedCompany.defaultVatRate || "15.00")
      });
    } catch (error) {
      console.error("Error updating VAT settings:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get available VAT types for company
  app.get("/api/companies/:companyId/vat-types", async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      
      // Return South African standard VAT types
      const vatTypes = [
        {
          id: 1,
          code: "STD",
          name: "Standard Rate",
          rate: "15.00",
          description: "Standard VAT rate of 15%",
          isActive: true,
          isSystemType: true,
          category: "Standard"
        },
        {
          id: 2,
          code: "ZER",
          name: "Zero Rated",
          rate: "0.00",
          description: "Zero-rated supplies (exports, basic foods)",
          isActive: true,
          isSystemType: true,
          category: "Zero Rated"
        },
        {
          id: 3,
          code: "EXE",
          name: "Exempt",
          rate: "0.00",
          description: "VAT-exempt supplies (financial services)",
          isActive: true,
          isSystemType: true,
          category: "Exempt"
        },
        {
          id: 4,
          code: "OUT",
          name: "Out of Scope",
          rate: "0.00",
          description: "Non-business activities",
          isActive: true,
          isSystemType: true,
          category: "Out of Scope"
        }
      ];

      res.json(vatTypes);
    } catch (error) {
      console.error("Error fetching VAT types:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // VAT calculation endpoint
  app.post("/api/vat/calculate", async (req, res) => {
    try {
      const { amount, vatRate, isVATInclusive } = req.body;
      
      const rate = vatRate / 100;
      let netAmount, vatAmount, grossAmount;

      if (isVATInclusive) {
        grossAmount = amount;
        netAmount = grossAmount / (1 + rate);
        vatAmount = grossAmount - netAmount;
      } else {
        netAmount = amount;
        vatAmount = netAmount * rate;
        grossAmount = netAmount + vatAmount;
      }

      res.json({
        netAmount: Math.round(netAmount * 100) / 100,
        vatAmount: Math.round(vatAmount * 100) / 100,
        grossAmount: Math.round(grossAmount * 100) / 100,
        vatRate,
        isInclusive: isVATInclusive
      });
    } catch (error) {
      console.error("Error calculating VAT:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}