import { Router } from "express";
import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "../db";
import {
  payrollPeriods,
  employeePayrolls,
  sarsReturns,
  payrollSettings,
  employees,
  companies,
} from "@shared/schema";
import { authenticate } from "../auth";

const router = Router();

// Get payroll periods for a company
router.get("/periods", authenticate, async (req: any, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ error: "Company ID required" });
    }

    const periods = await db
      .select()
      .from(payrollPeriods)
      .where(eq(payrollPeriods.companyId, companyId))
      .orderBy(desc(payrollPeriods.createdAt));

    res.json(periods);
  } catch (error) {
    console.error("Error fetching payroll periods:", error);
    res.status(500).json({ error: "Failed to fetch payroll periods" });
  }
});

// Create new payroll period
router.post("/periods", authenticate, async (req: any, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ error: "Company ID required" });
    }

    const { periodName, startDate, endDate, payDate } = req.body;

    if (!periodName || !startDate || !endDate || !payDate) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const [period] = await db
      .insert(payrollPeriods)
      .values({
        companyId,
        periodName,
        startDate,
        endDate,
        payDate,
        status: "draft",
        createdBy: req.user?.id,
      })
      .returning();

    res.json(period);
  } catch (error) {
    console.error("Error creating payroll period:", error);
    res.status(500).json({ error: "Failed to create payroll period" });
  }
});

// Process payroll for a period
router.post("/periods/:periodId/process", authenticate, async (req: any, res) => {
  try {
    const companyId = req.user?.companyId;
    const periodId = parseInt(req.params.periodId);

    if (!companyId || !periodId) {
      return res.status(400).json({ error: "Company ID and Period ID required" });
    }

    // Get period details
    const [period] = await db
      .select()
      .from(payrollPeriods)
      .where(and(
        eq(payrollPeriods.id, periodId),
        eq(payrollPeriods.companyId, companyId)
      ));

    if (!period) {
      return res.status(404).json({ error: "Payroll period not found" });
    }

    // Get all active employees for the company
    const activeEmployees = await db
      .select()
      .from(employees)
      .where(and(
        eq(employees.companyId, companyId),
        eq(employees.status, "active")
      ));

    // Process payroll for each employee
    const payrollPromises = activeEmployees.map(async (employee) => {
      // Calculate payroll amounts
      const basicSalary = parseFloat(employee.basicSalary || "0");
      const allowances = basicSalary * 0.1; // 10% allowances
      const grossPay = basicSalary + allowances;
      
      // South African tax calculations (simplified)
      const payeTax = calculatePAYE(grossPay);
      const uifEmployee = Math.min(grossPay * 0.01, 177.12); // 1% UIF, max R177.12
      const uifEmployer = Math.min(grossPay * 0.01, 177.12);
      const sdl = grossPay * 0.01; // 1% SDL
      
      const totalDeductions = payeTax + uifEmployee;
      const netPay = grossPay - totalDeductions;

      // Insert or update employee payroll
      await db
        .insert(employeePayrolls)
        .values({
          companyId,
          periodId,
          employeeId: employee.id,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          employeeNumber: employee.employeeNumber,
          basicSalary: basicSalary.toFixed(2),
          allowances: allowances.toFixed(2),
          grossPay: grossPay.toFixed(2),
          payeTax: payeTax.toFixed(2),
          uifEmployee: uifEmployee.toFixed(2),
          uifEmployer: uifEmployer.toFixed(2),
          sdl: sdl.toFixed(2),
          totalDeductions: totalDeductions.toFixed(2),
          netPay: netPay.toFixed(2),
          taxableIncome: grossPay.toFixed(2),
          status: "processed",
        })
        .onConflictDoUpdate({
          target: [employeePayrolls.periodId, employeePayrolls.employeeId],
          set: {
            basicSalary: basicSalary.toFixed(2),
            allowances: allowances.toFixed(2),
            grossPay: grossPay.toFixed(2),
            payeTax: payeTax.toFixed(2),
            uifEmployee: uifEmployee.toFixed(2),
            uifEmployer: uifEmployer.toFixed(2),
            sdl: sdl.toFixed(2),
            totalDeductions: totalDeductions.toFixed(2),
            netPay: netPay.toFixed(2),
            status: "processed",
            updatedAt: new Date(),
          },
        });

      return {
        grossPay,
        payeTax,
        uifEmployee,
        uifEmployer,
        sdl,
        netPay,
      };
    });

    const payrollResults = await Promise.all(payrollPromises);

    // Calculate totals
    const totals = payrollResults.reduce(
      (acc, result) => ({
        totalGrossPay: acc.totalGrossPay + result.grossPay,
        totalPAYE: acc.totalPAYE + result.payeTax,
        totalUIF: acc.totalUIF + result.uifEmployee,
        totalEmployerUIF: acc.totalEmployerUIF + result.uifEmployer,
        totalSDL: acc.totalSDL + result.sdl,
        totalNetPay: acc.totalNetPay + result.netPay,
      }),
      {
        totalGrossPay: 0,
        totalPAYE: 0,
        totalUIF: 0,
        totalEmployerUIF: 0,
        totalSDL: 0,
        totalNetPay: 0,
      }
    );

    // Update period with totals
    await db
      .update(payrollPeriods)
      .set({
        totalEmployees: activeEmployees.length,
        totalGrossPay: totals.totalGrossPay.toFixed(2),
        totalNetPay: totals.totalNetPay.toFixed(2),
        totalPAYE: totals.totalPAYE.toFixed(2),
        totalUIF: totals.totalUIF.toFixed(2),
        totalSDL: totals.totalSDL.toFixed(2),
        totalEmployerUIF: totals.totalEmployerUIF.toFixed(2),
        status: "processing",
        updatedAt: new Date(),
        updatedBy: req.user?.id,
      })
      .where(eq(payrollPeriods.id, periodId));

    res.json({ message: "Payroll processed successfully", totals });
  } catch (error) {
    console.error("Error processing payroll:", error);
    res.status(500).json({ error: "Failed to process payroll" });
  }
});

// Get employee payrolls for a period
router.get("/employee-payrolls", authenticate, async (req: any, res) => {
  try {
    const companyId = req.user?.companyId;
    const { periodId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: "Company ID required" });
    }

    let payrolls;
    if (periodId) {
      payrolls = await db
        .select()
        .from(employeePayrolls)
        .where(and(
          eq(employeePayrolls.companyId, companyId),
          eq(employeePayrolls.periodId, parseInt(periodId as string))
        ))
        .orderBy(desc(employeePayrolls.createdAt));
    } else {
      payrolls = await db
        .select()
        .from(employeePayrolls)
        .where(eq(employeePayrolls.companyId, companyId))
        .orderBy(desc(employeePayrolls.createdAt));
    }

    res.json(payrolls);
  } catch (error) {
    console.error("Error fetching employee payrolls:", error);
    res.status(500).json({ error: "Failed to fetch employee payrolls" });
  }
});

// Get SARS returns
router.get("/sars-returns", authenticate, async (req: any, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ error: "Company ID required" });
    }

    const returns = await db
      .select()
      .from(sarsReturns)
      .where(eq(sarsReturns.companyId, companyId))
      .orderBy(desc(sarsReturns.createdAt));

    res.json(returns);
  } catch (error) {
    console.error("Error fetching SARS returns:", error);
    res.status(500).json({ error: "Failed to fetch SARS returns" });
  }
});

// Generate EMP201 return
router.post("/sars/emp201", authenticate, async (req: any, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ error: "Company ID required" });
    }

    const { period, totalEmployees, totalPAYE } = req.body;

    if (!period) {
      return res.status(400).json({ error: "Period is required" });
    }

    // Get company details
    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId));

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    // Get payroll totals for the period
    const payrollTotals = await db
      .select({
        totalGrossPay: sql<number>`COALESCE(SUM(${employeePayrolls.grossPay}), 0)`,
        totalPAYE: sql<number>`COALESCE(SUM(${employeePayrolls.payeTax}), 0)`,
        totalUIF: sql<number>`COALESCE(SUM(${employeePayrolls.uifEmployee}), 0)`,
        totalSDL: sql<number>`COALESCE(SUM(${employeePayrolls.sdl}), 0)`,
        employeeCount: sql<number>`COUNT(*)`,
      })
      .from(employeePayrolls)
      .where(eq(employeePayrolls.companyId, companyId));

    const totals = payrollTotals[0] || {
      totalGrossPay: 0,
      totalPAYE: 0,
      totalUIF: 0,
      totalSDL: 0,
      employeeCount: 0,
    };

    // Generate EMP201 return data
    const emp201Data = {
      companyName: company.name,
      companyId: company.companyId,
      period,
      employees: totals.employeeCount,
      grossPay: totals.totalGrossPay,
      payeTax: totals.totalPAYE,
      uifContribution: totals.totalUIF,
      sdlContribution: totals.totalSDL,
      generatedAt: new Date().toISOString(),
    };

    // Create SARS return record
    const [sarsReturn] = await db
      .insert(sarsReturns)
      .values({
        companyId,
        returnType: "EMP201",
        period,
        taxYear: new Date().getFullYear().toString(),
        status: "generated",
        totalEmployees: totals.employeeCount,
        totalPAYE: totals.totalPAYE.toFixed(2),
        totalUIF: totals.totalUIF.toFixed(2),
        totalSDL: totals.totalSDL.toFixed(2),
        totalGrossPay: totals.totalGrossPay.toFixed(2),
        totalTaxableIncome: totals.totalGrossPay.toFixed(2),
        generatedData: emp201Data,
        createdBy: req.user?.id,
      })
      .returning();

    res.json({ sarsReturn, emp201Data });
  } catch (error) {
    console.error("Error generating EMP201:", error);
    res.status(500).json({ error: "Failed to generate EMP201" });
  }
});

// Get payroll settings
router.get("/settings", authenticate, async (req: any, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ error: "Company ID required" });
    }

    const [settings] = await db
      .select()
      .from(payrollSettings)
      .where(eq(payrollSettings.companyId, companyId));

    res.json(settings || {});
  } catch (error) {
    console.error("Error fetching payroll settings:", error);
    res.status(500).json({ error: "Failed to fetch payroll settings" });
  }
});

// Update payroll settings
router.put("/settings", authenticate, async (req: any, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ error: "Company ID required" });
    }

    const settingsData = req.body;

    const [settings] = await db
      .insert(payrollSettings)
      .values({
        companyId,
        ...settingsData,
      })
      .onConflictDoUpdate({
        target: payrollSettings.companyId,
        set: {
          ...settingsData,
          updatedAt: new Date(),
        },
      })
      .returning();

    res.json(settings);
  } catch (error) {
    console.error("Error updating payroll settings:", error);
    res.status(500).json({ error: "Failed to update payroll settings" });
  }
});

// Simplified PAYE calculation function (South African tax brackets)
function calculatePAYE(annualGrossPay: number): number {
  // Convert monthly to annual
  const annual = annualGrossPay * 12;
  
  // South African PAYE tax brackets for 2024
  const brackets = [
    { min: 0, max: 237100, rate: 0.18 },
    { min: 237101, max: 370500, rate: 0.26 },
    { min: 370501, max: 512800, rate: 0.31 },
    { min: 512801, max: 673000, rate: 0.36 },
    { min: 673001, max: 857900, rate: 0.39 },
    { min: 857901, max: Infinity, rate: 0.41 },
  ];

  let tax = 0;
  let previousMax = 0;

  for (const bracket of brackets) {
    if (annual > bracket.min) {
      const taxableAmount = Math.min(annual, bracket.max) - previousMax;
      tax += taxableAmount * bracket.rate;
      previousMax = bracket.max;
    } else {
      break;
    }
  }

  // Apply tax rebates (simplified)
  const primaryRebate = 17235; // 2024 primary rebate
  tax = Math.max(0, tax - primaryRebate);

  // Return monthly tax
  return tax / 12;
}

export default router;