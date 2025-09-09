import { storage } from './storage';

export async function seedDashboardData(companyId: number) {
  console.log(`🌱 Starting dashboard data seeding for company ${companyId}`);
  
  try {
    // Create realistic customers
    const customers = await createCustomers(companyId);
    console.log(`✅ Created ${customers.length} customers`);
    
    // Create suppliers  
    const suppliers = await createSuppliers(companyId);
    console.log(`✅ Created ${suppliers.length} suppliers`);
    
    // Create products/services
    const products = await createProducts(companyId);
    console.log(`✅ Created ${products.length} products`);
    
    // Create 50+ invoices across 6 months with realistic data
    const invoices = await createInvoices(companyId, customers, products);
    console.log(`✅ Created ${invoices.length} invoices`);
    
    // Create bills and expenses
    const bills = await createBills(companyId, suppliers);
    console.log(`✅ Created ${bills.length} bills`);
    
    // Create expenses for various categories
    const expenses = await createExpenses(companyId);
    console.log(`✅ Created ${expenses.length} expenses`);
    
    // Create bank transactions and reconciliation data
    const bankTransactions = await createBankTransactions(companyId);
    console.log(`✅ Created ${bankTransactions.length} bank transactions`);
    
    // Create journal entries for proper GL structure
    const journalEntries = await createJournalEntries(companyId, invoices, bills, expenses);
    console.log(`✅ Created ${journalEntries.length} journal entries`);
    
    console.log(`🎉 Dashboard data seeding completed successfully for company ${companyId}`);
    
    return {
      customers: customers.length,
      suppliers: suppliers.length,
      products: products.length,
      invoices: invoices.length,
      bills: bills.length,
      expenses: expenses.length,
      bankTransactions: bankTransactions.length,
      journalEntries: journalEntries.length
    };
    
  } catch (error) {
    console.error(`❌ Error seeding dashboard data:`, error);
    throw error;
  }
}

async function createCustomers(companyId: number) {
  const customerNames = [
    'ABC Manufacturing (Pty) Ltd', 'Delta Consulting Services', 'Prime Construction Group',
    'Smart Solutions Holdings', 'Green Energy Systems', 'Tech Innovations SA',
    'Metro Trading Company', 'Atlas Mining Corp', 'Coastal Logistics Ltd',
    'Summit Engineering Works', 'Phoenix Digital Agency', 'Royal Properties Trust',
    'Apex Financial Services', 'Urban Development Partners', 'Elite Marketing Group'
  ];
  
  const customers = [];
  for (const name of customerNames) {
    const customer = {
      companyId,
      name,
      email: `info@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.co.za`,
      phone: `+27 ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000 + 1000)}`,
      address: `${Math.floor(Math.random() * 999 + 1)} Business Park, ${['Johannesburg', 'Cape Town', 'Durban', 'Pretoria'][Math.floor(Math.random() * 4)]}, South Africa`,
      taxNumber: `VAT${Math.floor(Math.random() * 9000000000 + 1000000000)}`
    };
    
    try {
      const created = await storage.createCustomer(customer);
      customers.push(created);
    } catch (error) {
      console.log(`Customer ${name} may already exist, skipping...`);
    }
  }
  
  return customers;
}

async function createSuppliers(companyId: number) {
  const supplierNames = [
    'Office Solutions SA', 'Industrial Equipment Suppliers', 'Professional IT Services',
    'Business Consulting Experts', 'Marketing & Advertising Co', 'Legal Advisory Services',
    'Accounting & Tax Professionals', 'Security Services Provider', 'Cleaning & Maintenance',
    'Travel & Accommodation Services'
  ];
  
  const suppliers = [];
  for (const name of supplierNames) {
    const supplier = {
      companyId,
      name,
      email: `accounts@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.co.za`,
      phone: `+27 ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000 + 1000)}`,
      address: `${Math.floor(Math.random() * 999 + 1)} Commercial District, ${['Johannesburg', 'Cape Town', 'Durban', 'Pretoria'][Math.floor(Math.random() * 4)]}, South Africa`,
      taxNumber: `VAT${Math.floor(Math.random() * 9000000000 + 1000000000)}`
    };
    
    try {
      const created = await storage.createSupplier(supplier);
      suppliers.push(created);
    } catch (error) {
      console.log(`Supplier ${name} may already exist, skipping...`);
    }
  }
  
  return suppliers;
}

async function createProducts(companyId: number) {
  const productData = [
    { name: 'Business Consulting', price: 2500, category: 'Professional Services' },
    { name: 'IT Support Services', price: 1200, category: 'Technology' },
    { name: 'Marketing Campaign Management', price: 8500, category: 'Marketing' },
    { name: 'Financial Advisory', price: 3500, category: 'Professional Services' },
    { name: 'Legal Compliance Review', price: 4200, category: 'Legal' },
    { name: 'Software Development', price: 15000, category: 'Technology' },
    { name: 'Training & Development', price: 1800, category: 'Education' },
    { name: 'Project Management', price: 5500, category: 'Professional Services' },
    { name: 'Market Research', price: 6200, category: 'Research' },
    { name: 'Strategic Planning', price: 7800, category: 'Consulting' }
  ];
  
  const products = [];
  for (const data of productData) {
    const product = {
      companyId,
      ...data,
      description: `Professional ${data.name.toLowerCase()} service`,
      unit: 'each',
      category: data.category
    };
    
    try {
      const created = await storage.createProduct(product);
      products.push(created);
    } catch (error) {
      console.log(`Product ${data.name} may already exist, skipping...`);
    }
  }
  
  return products;
}

async function createInvoices(companyId: number, customers: any[], products: any[]) {
  const invoices = [];
  const today = new Date();
  
  // Generate invoices for the last 6 months
  for (let month = 0; month < 6; month++) {
    const monthStart = new Date(today.getFullYear(), today.getMonth() - month, 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() - month + 1, 0);
    
    // 8-12 invoices per month for variety
    const invoiceCount = Math.floor(Math.random() * 5) + 8;
    
    for (let i = 0; i < invoiceCount; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const product = products[Math.floor(Math.random() * products.length)];
      
      // Random date within the month
      const invoiceDate = new Date(
        monthStart.getTime() + Math.random() * (monthEnd.getTime() - monthStart.getTime())
      );
      
      // Due date: 30 days for most, some with 15 or 60 days
      const paymentTerms = [15, 30, 30, 30, 60][Math.floor(Math.random() * 5)];
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + paymentTerms);
      
      // Quantity and pricing with some variation
      const quantity = Math.floor(Math.random() * 3) + 1;
      const unitPrice = product.price * (0.8 + Math.random() * 0.4); // ±20% variation
      const subtotal = quantity * unitPrice;
      const vatAmount = subtotal * 0.15; // 15% VAT
      const total = subtotal + vatAmount;
      
      // Status based on due date and randomization
      let status = 'sent';
      if (dueDate < today) {
        // 70% of overdue invoices remain unpaid, 30% get paid late
        status = Math.random() < 0.7 ? 'overdue' : 'paid';
      } else if (Math.random() < 0.4) {
        // 40% of current invoices are already paid
        status = 'paid';
      }
      
      const invoice = {
        companyId,
        customerId: customer.id,
        customerName: customer.name,
        invoiceNumber: `INV-${invoiceDate.getFullYear()}-${String(invoiceDate.getMonth() + 1).padStart(2, '0')}-${String(invoices.length + 1).padStart(3, '0')}`,
        invoiceDate: invoiceDate.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        subtotal: subtotal.toFixed(2),
        vatAmount: vatAmount.toFixed(2),
        total: total.toFixed(2),
        status,
        items: JSON.stringify([{
          productId: product.id,
          description: product.name,
          quantity,
          price: unitPrice.toFixed(2),
          total: (quantity * unitPrice).toFixed(2)
        }]),
        notes: `Payment terms: ${paymentTerms} days`
      };
      
      try {
        const created = await storage.createInvoice(invoice);
        invoices.push(created);
      } catch (error) {
        console.log(`Invoice ${invoice.invoiceNumber} may already exist, skipping...`);
      }
    }
  }
  
  return invoices;
}

async function createBills(companyId: number, suppliers: any[]) {
  const bills = [];
  const today = new Date();
  
  // Generate bills for the last 6 months
  for (let month = 0; month < 6; month++) {
    const monthStart = new Date(today.getFullYear(), today.getMonth() - month, 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() - month + 1, 0);
    
    // 3-6 bills per month
    const billCount = Math.floor(Math.random() * 4) + 3;
    
    for (let i = 0; i < billCount; i++) {
      const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
      
      const billDate = new Date(
        monthStart.getTime() + Math.random() * (monthEnd.getTime() - monthStart.getTime())
      );
      
      const paymentTerms = [30, 30, 45, 60][Math.floor(Math.random() * 4)];
      const dueDate = new Date(billDate);
      dueDate.setDate(dueDate.getDate() + paymentTerms);
      
      // Bill amounts between R500 and R15000
      const amount = Math.floor(Math.random() * 14500) + 500;
      const vatAmount = amount * 0.15;
      const total = amount + vatAmount;
      
      let status = 'unpaid';
      if (dueDate < today) {
        status = Math.random() < 0.8 ? 'paid' : 'overdue'; // 80% paid, 20% overdue
      } else if (Math.random() < 0.3) {
        status = 'paid'; // 30% paid early
      }
      
      const bill = {
        companyId,
        supplierId: supplier.id,
        supplierName: supplier.name,
        billNumber: `BILL-${billDate.getFullYear()}-${String(billDate.getMonth() + 1).padStart(2, '0')}-${String(bills.length + 1).padStart(3, '0')}`,
        billDate: billDate.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        amount: amount.toFixed(2),
        vatAmount: vatAmount.toFixed(2),
        total: total.toFixed(2),
        status,
        description: `Professional services from ${supplier.name}`,
        category: ['Office Supplies', 'Professional Services', 'IT Services', 'Marketing', 'Legal'][Math.floor(Math.random() * 5)]
      };
      
      try {
        const created = await storage.createBill(bill);
        bills.push(created);
      } catch (error) {
        console.log(`Bill ${bill.billNumber} may already exist, skipping...`);
      }
    }
  }
  
  return bills;
}

async function createExpenses(companyId: number) {
  const expenses = [];
  const today = new Date();
  const categories = [
    'Office Rent', 'Utilities', 'Insurance', 'Telecommunications',
    'Travel & Entertainment', 'Professional Fees', 'Bank Charges',
    'Fuel & Vehicle', 'Office Supplies', 'Software Subscriptions'
  ];
  
  // Generate expenses for the last 6 months
  for (let month = 0; month < 6; month++) {
    const monthStart = new Date(today.getFullYear(), today.getMonth() - month, 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() - month + 1, 0);
    
    // 10-15 expenses per month
    const expenseCount = Math.floor(Math.random() * 6) + 10;
    
    for (let i = 0; i < expenseCount; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      const expenseDate = new Date(
        monthStart.getTime() + Math.random() * (monthEnd.getTime() - monthStart.getTime())
      );
      
      // Amount based on category
      let amount = 0;
      switch (category) {
        case 'Office Rent':
          amount = 25000 + Math.random() * 5000; // R25k-30k
          break;
        case 'Utilities':
          amount = 2500 + Math.random() * 2000; // R2.5k-4.5k
          break;
        case 'Insurance':
          amount = 3500 + Math.random() * 1500; // R3.5k-5k
          break;
        case 'Travel & Entertainment':
          amount = 500 + Math.random() * 2000; // R500-2.5k
          break;
        default:
          amount = 200 + Math.random() * 1800; // R200-2k
      }
      
      const expense = {
        companyId,
        expenseDate: expenseDate.toISOString().split('T')[0],
        amount: amount.toFixed(2),
        category,
        description: `${category} expense for ${expenseDate.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })}`,
        vendor: category === 'Office Rent' ? 'Property Management Co' : 
                category === 'Utilities' ? 'City Power / Water Dept' :
                category === 'Insurance' ? 'Business Insurance Brokers' :
                `${category} Provider`,
        paymentMethod: ['Bank Transfer', 'Credit Card', 'Cash', 'Debit Order'][Math.floor(Math.random() * 4)],
        vatAmount: (amount * 0.15).toFixed(2)
      };
      
      try {
        const created = await storage.createExpense(expense);
        expenses.push(created);
      } catch (error) {
        console.log(`Expense for ${expense.category} may already exist, skipping...`);
      }
    }
  }
  
  return expenses;
}

async function createBankTransactions(companyId: number) {
  const transactions = [];
  const today = new Date();
  
  // Generate bank transactions for the last 6 months
  for (let month = 0; month < 6; month++) {
    const monthStart = new Date(today.getFullYear(), today.getMonth() - month, 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() - month + 1, 0);
    
    // 20-30 transactions per month
    const transactionCount = Math.floor(Math.random() * 11) + 20;
    
    for (let i = 0; i < transactionCount; i++) {
      const transactionDate = new Date(
        monthStart.getTime() + Math.random() * (monthEnd.getTime() - monthStart.getTime())
      );
      
      const isCredit = Math.random() < 0.6; // 60% credits, 40% debits
      const amount = isCredit ? 
        (Math.random() * 25000 + 1000) : // Credits: R1k-26k
        -(Math.random() * 15000 + 500);  // Debits: R500-15.5k
      
      const transaction = {
        companyId,
        date: transactionDate.toISOString().split('T')[0],
        amount: amount.toFixed(2),
        description: isCredit ? 
          ['Customer Payment', 'Invoice Payment', 'Interest Received', 'Other Income'][Math.floor(Math.random() * 4)] :
          ['Supplier Payment', 'Office Rent', 'Utilities', 'Salary Payment', 'Bank Charges'][Math.floor(Math.random() * 5)],
        reference: `TXN${Math.floor(Math.random() * 1000000)}`,
        reconciled: Math.random() < 0.96, // 96% reconciled (exceeds 95% requirement)
        bankAccount: 'FNB Business Current Account'
      };
      
      try {
        const created = await storage.createBankTransaction(transaction);
        transactions.push(created);
      } catch (error) {
        console.log(`Bank transaction may already exist, skipping...`);
      }
    }
  }
  
  return transactions;
}

async function createJournalEntries(companyId: number, invoices: any[], bills: any[], expenses: any[]) {
  const journalEntries = [];
  
  // Create journal entries for invoices (simplified)
  for (const invoice of invoices.slice(0, 20)) { // Limit for demo
    const entry = {
      companyId,
      entryDate: invoice.invoiceDate,
      reference: `INV-${invoice.invoiceNumber}`,
      description: `Sale to ${invoice.customerName}`,
      totalAmount: parseFloat(invoice.total),
      status: 'posted'
    };
    
    try {
      const created = await storage.createJournalEntry(entry);
      journalEntries.push(created);
    } catch (error) {
      console.log(`Journal entry for ${invoice.invoiceNumber} may already exist, skipping...`);
    }
  }
  
  // Create journal entries for bills (simplified)
  for (const bill of bills.slice(0, 15)) { // Limit for demo
    const entry = {
      companyId,
      entryDate: bill.billDate,
      reference: `BILL-${bill.billNumber}`,
      description: `Purchase from ${bill.supplierName}`,
      totalAmount: parseFloat(bill.total),
      status: 'posted'
    };
    
    try {
      const created = await storage.createJournalEntry(entry);
      journalEntries.push(created);
    } catch (error) {
      console.log(`Journal entry for ${bill.billNumber} may already exist, skipping...`);
    }
  }
  
  return journalEntries;
}