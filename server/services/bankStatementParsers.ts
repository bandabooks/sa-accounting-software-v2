/**
 * Bank Statement Parsers for Major South African Banks
 * 
 * Supports: FNB, ABSA, Standard Bank, Nedbank
 * Features: Auto-detection, format standardization, error handling
 */

import * as XLSX from 'xlsx';

export interface StandardizedTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  balance?: number;
  reference?: string;
  category?: string;
  originalData?: any;
}

export interface BankStatementParseResult {
  bankName: string;
  accountNumber?: string;
  statementPeriod?: {
    from: string;
    to: string;
  };
  transactions: StandardizedTransaction[];
  metadata: {
    totalTransactions: number;
    totalCredits: number;
    totalDebits: number;
    openingBalance?: number;
    closingBalance?: number;
  };
  errors: string[];
}

export enum SouthAfricanBanks {
  FNB = 'FNB',
  ABSA = 'ABSA', 
  STANDARD_BANK = 'Standard Bank',
  NEDBANK = 'Nedbank',
  CAPITEC = 'Capitec',
  DISCOVERY_BANK = 'Discovery Bank'
}

export interface BankParser {
  bankName: SouthAfricanBanks;
  identify(headers: string[], firstRow?: any[]): boolean;
  parse(data: any[][]): StandardizedTransaction[];
  extractMetadata?(data: any[][]): Partial<BankStatementParseResult['metadata']>;
}

/**
 * FNB Bank Statement Parser
 * Format: Date, Description, Debit, Credit, Balance
 */
class FNBParser implements BankParser {
  bankName = SouthAfricanBanks.FNB;

  identify(headers: string[]): boolean {
    const headerText = headers.join('|').toLowerCase();
    const fnbPatterns = [
      'date.*description.*debit.*credit.*balance',
      'transaction date.*description.*amount.*balance',
      'date.*narrative.*debit.*credit.*running balance'
    ];
    
    return fnbPatterns.some(pattern => 
      headerText.match(pattern.replace(/\*/g, '.*'))
    );
  }

  parse(data: any[][]): StandardizedTransaction[] {
    const transactions: StandardizedTransaction[] = [];
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length < 4) continue;

      const [dateStr, description, debit, credit, balance] = row;
      
      if (!dateStr || !description) continue;

      const debitAmount = this.parseAmount(debit);
      const creditAmount = this.parseAmount(credit);
      
      if (debitAmount === 0 && creditAmount === 0) continue;

      const amount = creditAmount > 0 ? creditAmount : -debitAmount;
      const type = amount > 0 ? 'credit' : 'debit';

      transactions.push({
        date: this.parseDate(dateStr),
        description: this.cleanDescription(description),
        amount: Math.abs(amount),
        type,
        balance: this.parseAmount(balance),
        originalData: row
      });
    }

    return transactions;
  }

  private parseAmount(value: any): number {
    if (!value || value === '') return 0;
    const cleaned = String(value).replace(/[^\d.-]/g, '');
    return parseFloat(cleaned) || 0;
  }

  private parseDate(dateStr: string): string {
    // FNB typically uses YYYY/MM/DD or DD/MM/YYYY
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    // Try different formats
    const parts = dateStr.split(/[\/\-]/);
    if (parts.length === 3) {
      const [p1, p2, p3] = parts;
      // Try YYYY/MM/DD first
      if (p1.length === 4) {
        return `${p1}-${p2.padStart(2, '0')}-${p3.padStart(2, '0')}`;
      }
      // Try DD/MM/YYYY
      return `${p3}-${p2.padStart(2, '0')}-${p1.padStart(2, '0')}`;
    }
    
    return new Date().toISOString().split('T')[0];
  }

  private cleanDescription(desc: string): string {
    return String(desc).trim().replace(/\s+/g, ' ');
  }
}

/**
 * ABSA Bank Statement Parser
 * Format: Date, Transaction Details, Value Date, Debit, Credit, Balance
 */
class ABSAParser implements BankParser {
  bankName = SouthAfricanBanks.ABSA;

  identify(headers: string[]): boolean {
    const headerText = headers.join('|').toLowerCase();
    const absaPatterns = [
      'date.*transaction details.*value date.*debit.*credit.*balance',
      'posting date.*description.*debit amount.*credit amount.*balance',
      'date.*details.*amount.*balance'
    ];
    
    return absaPatterns.some(pattern => 
      headerText.match(pattern.replace(/\*/g, '.*'))
    );
  }

  parse(data: any[][]): StandardizedTransaction[] {
    const transactions: StandardizedTransaction[] = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length < 5) continue;

      const [date, details, valueDate, debit, credit, balance] = row;
      
      if (!date || !details) continue;

      const debitAmount = this.parseAmount(debit);
      const creditAmount = this.parseAmount(credit);
      
      if (debitAmount === 0 && creditAmount === 0) continue;

      const amount = creditAmount > 0 ? creditAmount : -debitAmount;
      const type = amount > 0 ? 'credit' : 'debit';

      transactions.push({
        date: this.parseDate(date),
        description: this.cleanDescription(details),
        amount: Math.abs(amount),
        type,
        balance: this.parseAmount(balance),
        reference: valueDate ? String(valueDate) : undefined,
        originalData: row
      });
    }

    return transactions;
  }

  private parseAmount(value: any): number {
    if (!value || value === '') return 0;
    const cleaned = String(value).replace(/[^\d.-]/g, '');
    return parseFloat(cleaned) || 0;
  }

  private parseDate(dateStr: string): string {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    const parts = dateStr.split(/[\/\-]/);
    if (parts.length === 3) {
      const [p1, p2, p3] = parts;
      if (p1.length === 4) {
        return `${p1}-${p2.padStart(2, '0')}-${p3.padStart(2, '0')}`;
      }
      return `${p3}-${p2.padStart(2, '0')}-${p1.padStart(2, '0')}`;
    }
    
    return new Date().toISOString().split('T')[0];
  }

  private cleanDescription(desc: string): string {
    return String(desc).trim().replace(/\s+/g, ' ');
  }
}

/**
 * Standard Bank Statement Parser
 * Format: Date, Description, Amount, Balance
 */
class StandardBankParser implements BankParser {
  bankName = SouthAfricanBanks.STANDARD_BANK;

  identify(headers: string[]): boolean {
    const headerText = headers.join('|').toLowerCase();
    const sbPatterns = [
      'date.*description.*amount.*balance',
      'transaction date.*narrative.*amount.*running balance',
      'posting date.*transaction description.*transaction amount.*balance'
    ];
    
    return sbPatterns.some(pattern => 
      headerText.match(pattern.replace(/\*/g, '.*'))
    );
  }

  parse(data: any[][]): StandardizedTransaction[] {
    const transactions: StandardizedTransaction[] = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length < 4) continue;

      const [date, description, amount, balance] = row;
      
      if (!date || !description || !amount) continue;

      const parsedAmount = this.parseAmount(amount);
      if (parsedAmount === 0) continue;

      const type = parsedAmount > 0 ? 'credit' : 'debit';

      transactions.push({
        date: this.parseDate(date),
        description: this.cleanDescription(description),
        amount: Math.abs(parsedAmount),
        type,
        balance: this.parseAmount(balance),
        originalData: row
      });
    }

    return transactions;
  }

  private parseAmount(value: any): number {
    if (!value || value === '') return 0;
    const str = String(value);
    
    // Handle negative amounts in parentheses
    const isNegative = str.includes('(') && str.includes(')');
    const cleaned = str.replace(/[^\d.-]/g, '');
    const amount = parseFloat(cleaned) || 0;
    
    return isNegative ? -amount : amount;
  }

  private parseDate(dateStr: string): string {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    const parts = dateStr.split(/[\/\-]/);
    if (parts.length === 3) {
      const [p1, p2, p3] = parts;
      if (p1.length === 4) {
        return `${p1}-${p2.padStart(2, '0')}-${p3.padStart(2, '0')}`;
      }
      return `${p3}-${p2.padStart(2, '0')}-${p1.padStart(2, '0')}`;
    }
    
    return new Date().toISOString().split('T')[0];
  }

  private cleanDescription(desc: string): string {
    return String(desc).trim().replace(/\s+/g, ' ');
  }
}

/**
 * Nedbank Statement Parser
 * Format: Date, Description, Debit, Credit, Balance
 */
class NedbankParser implements BankParser {
  bankName = SouthAfricanBanks.NEDBANK;

  identify(headers: string[]): boolean {
    const headerText = headers.join('|').toLowerCase();
    const nedbankPatterns = [
      'date.*description.*debit.*credit.*balance',
      'transaction date.*transaction description.*debit amount.*credit amount.*balance',
      'posting date.*narrative.*debit.*credit.*running balance'
    ];
    
    return nedbankPatterns.some(pattern => 
      headerText.match(pattern.replace(/\*/g, '.*'))
    );
  }

  parse(data: any[][]): StandardizedTransaction[] {
    const transactions: StandardizedTransaction[] = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length < 5) continue;

      const [date, description, debit, credit, balance] = row;
      
      if (!date || !description) continue;

      const debitAmount = this.parseAmount(debit);
      const creditAmount = this.parseAmount(credit);
      
      if (debitAmount === 0 && creditAmount === 0) continue;

      const amount = creditAmount > 0 ? creditAmount : -debitAmount;
      const type = amount > 0 ? 'credit' : 'debit';

      transactions.push({
        date: this.parseDate(date),
        description: this.cleanDescription(description),
        amount: Math.abs(amount),
        type,
        balance: this.parseAmount(balance),
        originalData: row
      });
    }

    return transactions;
  }

  private parseAmount(value: any): number {
    if (!value || value === '') return 0;
    const cleaned = String(value).replace(/[^\d.-]/g, '');
    return parseFloat(cleaned) || 0;
  }

  private parseDate(dateStr: string): string {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    const parts = dateStr.split(/[\/\-]/);
    if (parts.length === 3) {
      const [p1, p2, p3] = parts;
      if (p1.length === 4) {
        return `${p1}-${p2.padStart(2, '0')}-${p3.padStart(2, '0')}`;
      }
      return `${p3}-${p2.padStart(2, '0')}-${p1.padStart(2, '0')}`;
    }
    
    return new Date().toISOString().split('T')[0];
  }

  private cleanDescription(desc: string): string {
    return String(desc).trim().replace(/\s+/g, ' ');
  }
}

/**
 * Main Bank Statement Parser Service
 */
export class BankStatementParserService {
  private parsers: BankParser[] = [
    new FNBParser(),
    new ABSAParser(),
    new StandardBankParser(),
    new NedbankParser()
  ];

  /**
   * Parse bank statement file and detect bank automatically
   */
  async parseStatement(fileBuffer: Buffer, filename: string): Promise<BankStatementParseResult> {
    const errors: string[] = [];
    
    try {
      // Read file based on extension
      const data = await this.readFile(fileBuffer, filename);
      
      if (!data || data.length === 0) {
        throw new Error('Empty or invalid file');
      }

      // Get headers for bank identification
      const headers = data[0] || [];
      const parser = this.identifyBank(headers, data[1]);
      
      if (!parser) {
        errors.push('Could not identify bank format. Trying generic parsing...');
        return this.parseGenericStatement(data, errors);
      }

      console.log(`🏦 Detected bank: ${parser.bankName}`);

      // Parse transactions
      const transactions = parser.parse(data);
      
      // Calculate metadata
      const metadata = this.calculateMetadata(transactions);

      return {
        bankName: parser.bankName,
        transactions,
        metadata,
        errors
      };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown parsing error';
      errors.push(errorMsg);
      
      return {
        bankName: 'Unknown',
        transactions: [],
        metadata: {
          totalTransactions: 0,
          totalCredits: 0,
          totalDebits: 0
        },
        errors
      };
    }
  }

  /**
   * Identify bank from statement format
   */
  private identifyBank(headers: string[], firstDataRow?: any[]): BankParser | null {
    for (const parser of this.parsers) {
      if (parser.identify(headers, firstDataRow)) {
        return parser;
      }
    }
    return null;
  }

  /**
   * Read file based on extension
   */
  private async readFile(buffer: Buffer, filename: string): Promise<any[][]> {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'csv':
        return this.parseCSV(buffer);
      case 'xlsx':
      case 'xls':
        return this.parseExcel(buffer);
      case 'pdf':
        return await this.parsePDF(buffer);
      default:
        throw new Error(`Unsupported file format: ${extension}`);
    }
  }

  /**
   * Parse CSV file
   */
  private parseCSV(buffer: Buffer): any[][] {
    const text = buffer.toString('utf-8');
    const lines = text.split('\n').filter(line => line.trim());
    
    return lines.map(line => {
      // Handle quoted CSV values
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      values.push(current.trim());
      return values;
    });
  }

  /**
   * Parse Excel file
   */
  private parseExcel(buffer: Buffer): any[][] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const data = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1, 
      defval: '',
      blankrows: false 
    }) as any[][];
    
    return data;
  }

  /**
   * Parse PDF file - Extract transactions from SA bank statement PDFs
   */
  private async parsePDF(buffer: Buffer): Promise<any[][]> {
    try {
      // Dynamically import pdf-parse to avoid module loading issues
      const { default: pdfParse } = await import('pdf-parse');
      
      const pdfData = await pdfParse(buffer);
      const text = pdfData.text;
      
      // Try to identify bank from PDF text
      const bankType = this.identifyBankFromPDFText(text);
      
      // Parse based on identified bank format
      switch (bankType) {
        case SouthAfricanBanks.FNB:
          return this.parseFNBPDF(text);
        case SouthAfricanBanks.ABSA:
          return this.parseABSAPDF(text);
        case SouthAfricanBanks.STANDARD_BANK:
          return this.parseStandardBankPDF(text);
        case SouthAfricanBanks.NEDBANK:
          return this.parseNedbankPDF(text);
        default:
          return this.parseGenericPDF(text);
      }
    } catch (error) {
      console.error('PDF parsing error:', error);
      throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Identify bank from PDF text content
   */
  private identifyBankFromPDFText(text: string): SouthAfricanBanks | null {
    const lowerText = text.toLowerCase();
    
    // FNB patterns
    if (lowerText.includes('first national bank') || 
        lowerText.includes('fnb') || 
        lowerText.includes('rand merchant bank')) {
      return SouthAfricanBanks.FNB;
    }
    
    // ABSA patterns
    if (lowerText.includes('absa bank') || 
        lowerText.includes('amalgamated banks') ||
        lowerText.includes('absa') && lowerText.includes('statement')) {
      return SouthAfricanBanks.ABSA;
    }
    
    // Standard Bank patterns
    if (lowerText.includes('standard bank') || 
        lowerText.includes('stanbic') ||
        lowerText.includes('the standard bank')) {
      return SouthAfricanBanks.STANDARD_BANK;
    }
    
    // Nedbank patterns
    if (lowerText.includes('nedbank') || 
        lowerText.includes('nedcor') ||
        lowerText.includes('ned bank')) {
      return SouthAfricanBanks.NEDBANK;
    }
    
    return null;
  }

  /**
   * Parse FNB PDF statement format
   */
  private parseFNBPDF(text: string): any[][] {
    const lines = text.split('\n').filter(line => line.trim());
    const transactions: any[][] = [];
    
    // Common FNB PDF headers
    const headers = ['Date', 'Description', 'Debit', 'Credit', 'Balance'];
    transactions.push(headers);
    
    // FNB transaction pattern: DD/MM/YYYY description amount balance
    const fnbPattern = /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([\d\s,.-]+)\s+([\d\s,.-]+)$/;
    const fnbSimplePattern = /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([\d\s,.-]+)$/;
    
    for (const line of lines) {
      const match = fnbPattern.exec(line.trim()) || fnbSimplePattern.exec(line.trim());
      
      if (match) {
        const [, date, description, ...amounts] = match;
        
        if (amounts.length >= 2) {
          // Has separate debit/credit columns
          const [amount1, amount2] = amounts;
          const isDebit = this.isDebitAmount(amount1);
          transactions.push([
            date,
            description.trim(),
            isDebit ? this.cleanPDFAmount(amount1) : '',
            isDebit ? '' : this.cleanPDFAmount(amount1),
            this.cleanPDFAmount(amount2)
          ]);
        } else if (amounts.length === 1) {
          // Single amount - determine debit/credit from sign or context
          const amount = amounts[0];
          const isDebit = this.isDebitAmount(amount) || description.toLowerCase().includes('payment') || 
                          description.toLowerCase().includes('withdrawal') || description.toLowerCase().includes('debit');
          transactions.push([
            date,
            description.trim(),
            isDebit ? this.cleanPDFAmount(amount) : '',
            isDebit ? '' : this.cleanPDFAmount(amount),
            ''
          ]);
        }
      }
    }
    
    return transactions;
  }

  /**
   * Parse ABSA PDF statement format
   */
  private parseABSAPDF(text: string): any[][] {
    const lines = text.split('\n').filter(line => line.trim());
    const transactions: any[][] = [];
    
    const headers = ['Date', 'Transaction Details', 'Value Date', 'Debit', 'Credit', 'Balance'];
    transactions.push(headers);
    
    // ABSA pattern: DD/MM/YYYY description value_date debit credit balance
    const absaPattern = /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(\d{2}\/\d{2}\/\d{4})?\s*([\d\s,.-]+)\s*([\d\s,.-]+)?\s*([\d\s,.-]+)?$/;
    
    for (const line of lines) {
      const match = absaPattern.exec(line.trim());
      
      if (match) {
        const [, date, description, valueDate, amount1, amount2, amount3] = match;
        
        // ABSA typically has: date, description, [value_date], amount, balance
        if (amount3) {
          // Full format with separate debit/credit
          const isDebit = this.isDebitAmount(amount1);
          transactions.push([
            date,
            description.trim(),
            valueDate || '',
            isDebit ? this.cleanPDFAmount(amount1) : '',
            isDebit ? '' : this.cleanPDFAmount(amount1),
            this.cleanPDFAmount(amount3)
          ]);
        } else if (amount2) {
          // Format: date, description, amount, balance
          const isDebit = this.isDebitAmount(amount1) || description.toLowerCase().includes('debit');
          transactions.push([
            date,
            description.trim(),
            '',
            isDebit ? this.cleanPDFAmount(amount1) : '',
            isDebit ? '' : this.cleanPDFAmount(amount1),
            this.cleanPDFAmount(amount2)
          ]);
        }
      }
    }
    
    return transactions;
  }

  /**
   * Parse Standard Bank PDF statement format
   */
  private parseStandardBankPDF(text: string): any[][] {
    const lines = text.split('\n').filter(line => line.trim());
    const transactions: any[][] = [];
    
    const headers = ['Date', 'Description', 'Amount', 'Balance'];
    transactions.push(headers);
    
    // Standard Bank pattern: DD/MM/YYYY description amount balance
    const sbPattern = /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([\d\s,.-]+)\s+([\d\s,.-]+)$/;
    
    for (const line of lines) {
      const match = sbPattern.exec(line.trim());
      
      if (match) {
        const [, date, description, amount, balance] = match;
        
        transactions.push([
          date,
          description.trim(),
          this.cleanPDFAmount(amount),
          this.cleanPDFAmount(balance)
        ]);
      }
    }
    
    return transactions;
  }

  /**
   * Parse Nedbank PDF statement format
   */
  private parseNedbankPDF(text: string): any[][] {
    const lines = text.split('\n').filter(line => line.trim());
    const transactions: any[][] = [];
    
    const headers = ['Date', 'Description', 'Debit', 'Credit', 'Balance'];
    transactions.push(headers);
    
    // Nedbank pattern: DD/MM/YYYY description debit credit balance
    const nedbankPattern = /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([\d\s,.-]+)?\s*([\d\s,.-]+)?\s*([\d\s,.-]+)$/;
    
    for (const line of lines) {
      const match = nedbankPattern.exec(line.trim());
      
      if (match) {
        const [, date, description, amount1, amount2, balance] = match;
        
        if (amount2 && balance) {
          // Full format: date, description, debit, credit, balance
          transactions.push([
            date,
            description.trim(),
            this.cleanPDFAmount(amount1 || ''),
            this.cleanPDFAmount(amount2),
            this.cleanPDFAmount(balance)
          ]);
        } else if (amount1 && amount2) {
          // Format: date, description, amount, balance
          const isDebit = this.isDebitAmount(amount1) || description.toLowerCase().includes('debit');
          transactions.push([
            date,
            description.trim(),
            isDebit ? this.cleanPDFAmount(amount1) : '',
            isDebit ? '' : this.cleanPDFAmount(amount1),
            this.cleanPDFAmount(amount2)
          ]);
        }
      }
    }
    
    return transactions;
  }

  /**
   * Parse generic PDF format when bank cannot be identified
   */
  private parseGenericPDF(text: string): any[][] {
    const lines = text.split('\n').filter(line => line.trim());
    const transactions: any[][] = [];
    
    // Look for table headers in the text
    const headerLine = lines.find(line => {
      const lower = line.toLowerCase();
      return (lower.includes('date') && lower.includes('description')) ||
             (lower.includes('date') && lower.includes('amount')) ||
             (lower.includes('transaction') && lower.includes('date'));
    });
    
    if (headerLine) {
      // Extract headers from found line
      const headers = headerLine.split(/\s{2,}/).filter(h => h.trim()); // Split on 2+ spaces
      transactions.push(headers);
    } else {
      // Default headers
      transactions.push(['Date', 'Description', 'Amount', 'Balance']);
    }
    
    // Generic transaction pattern: date (various formats) followed by text and numbers
    const genericPattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+(.+?)\s+([\d\s,.-]+)(?:\s+([\d\s,.-]+))?$/;
    
    for (const line of lines) {
      const match = genericPattern.exec(line.trim());
      
      if (match) {
        const [, date, description, amount1, amount2] = match;
        
        if (amount2) {
          // Two amounts - likely amount and balance
          transactions.push([date, description.trim(), this.cleanPDFAmount(amount1), this.cleanPDFAmount(amount2)]);
        } else {
          // Single amount
          transactions.push([date, description.trim(), this.cleanPDFAmount(amount1), '']);
        }
      }
    }
    
    return transactions;
  }

  /**
   * Clean and normalize amount from PDF text
   */
  private cleanPDFAmount(amount: string): string {
    if (!amount) return '';
    
    // Remove extra spaces and clean up formatting
    return amount
      .replace(/\s+/g, '') // Remove all spaces
      .replace(/,/g, '') // Remove commas
      .replace(/[^\d.-]/g, '') // Keep only digits, dots, and minus signs
      .trim();
  }

  /**
   * Determine if an amount represents a debit (negative transaction)
   */
  private isDebitAmount(amount: string): boolean {
    if (!amount) return false;
    
    // Check for negative indicators
    return amount.includes('-') || 
           amount.includes('(') || 
           amount.includes('DR') || 
           amount.includes('db');
  }

  /**
   * Generic parsing fallback
   */
  private parseGenericStatement(data: any[][], errors: string[]): BankStatementParseResult {
    const transactions: StandardizedTransaction[] = [];
    
    // Try to find date, description, and amount columns
    const headers = data[0] || [];
    const dateCol = this.findColumn(headers, ['date', 'transaction date', 'posting date']);
    const descCol = this.findColumn(headers, ['description', 'narrative', 'details', 'transaction details']);
    const amountCol = this.findColumn(headers, ['amount', 'transaction amount']);
    const debitCol = this.findColumn(headers, ['debit', 'debit amount']);
    const creditCol = this.findColumn(headers, ['credit', 'credit amount']);
    const balanceCol = this.findColumn(headers, ['balance', 'running balance']);

    if (dateCol === -1 || descCol === -1 || (amountCol === -1 && debitCol === -1 && creditCol === -1)) {
      errors.push('Could not identify required columns (date, description, amount)');
      return {
        bankName: 'Generic',
        transactions: [],
        metadata: { totalTransactions: 0, totalCredits: 0, totalDebits: 0 },
        errors
      };
    }

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      const date = row[dateCol];
      const description = row[descCol];
      
      let amount = 0;
      let type: 'credit' | 'debit' = 'debit';

      if (amountCol !== -1) {
        amount = this.parseGenericAmount(row[amountCol]);
        type = amount >= 0 ? 'credit' : 'debit';
      } else {
        const debit = debitCol !== -1 ? this.parseGenericAmount(row[debitCol]) : 0;
        const credit = creditCol !== -1 ? this.parseGenericAmount(row[creditCol]) : 0;
        
        if (credit > 0) {
          amount = credit;
          type = 'credit';
        } else if (debit > 0) {
          amount = debit;
          type = 'debit';
        }
      }

      if (!date || !description || amount === 0) continue;

      transactions.push({
        date: this.parseGenericDate(date),
        description: String(description).trim(),
        amount: Math.abs(amount),
        type,
        balance: balanceCol !== -1 ? this.parseGenericAmount(row[balanceCol]) : undefined,
        originalData: row
      });
    }

    const metadata = this.calculateMetadata(transactions);

    return {
      bankName: 'Generic',
      transactions,
      metadata,
      errors
    };
  }

  private findColumn(headers: string[], candidates: string[]): number {
    const headerLower = headers.map(h => String(h).toLowerCase());
    
    for (const candidate of candidates) {
      const index = headerLower.findIndex(h => h.includes(candidate.toLowerCase()));
      if (index !== -1) return index;
    }
    
    return -1;
  }

  private parseGenericAmount(value: any): number {
    if (!value || value === '') return 0;
    const str = String(value);
    const isNegative = str.includes('(') && str.includes(')') || str.includes('-');
    const cleaned = str.replace(/[^\d.]/g, '');
    const amount = parseFloat(cleaned) || 0;
    return isNegative ? -amount : amount;
  }

  private parseGenericDate(dateStr: string): string {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    const parts = dateStr.split(/[\/\-]/);
    if (parts.length === 3) {
      const [p1, p2, p3] = parts;
      if (p1.length === 4) {
        return `${p1}-${p2.padStart(2, '0')}-${p3.padStart(2, '0')}`;
      }
      return `${p3}-${p2.padStart(2, '0')}-${p1.padStart(2, '0')}`;
    }
    
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Calculate statement metadata
   */
  private calculateMetadata(transactions: StandardizedTransaction[]): BankStatementParseResult['metadata'] {
    const credits = transactions.filter(t => t.type === 'credit');
    const debits = transactions.filter(t => t.type === 'debit');
    
    const totalCredits = credits.reduce((sum, t) => sum + t.amount, 0);
    const totalDebits = debits.reduce((sum, t) => sum + t.amount, 0);

    const firstBalance = transactions.find(t => t.balance !== undefined)?.balance;
    const lastBalance = transactions.reverse().find(t => t.balance !== undefined)?.balance;
    transactions.reverse(); // Restore original order

    return {
      totalTransactions: transactions.length,
      totalCredits,
      totalDebits,
      openingBalance: firstBalance,
      closingBalance: lastBalance
    };
  }

  /**
   * Get supported bank formats
   */
  getSupportedBanks(): SouthAfricanBanks[] {
    return this.parsers.map(p => p.bankName);
  }

  /**
   * Validate statement file
   */
  async validateStatementFile(fileBuffer: Buffer, filename: string): Promise<{
    isValid: boolean;
    errors: string[];
    bankDetected?: string;
    transactionCount?: number;
  }> {
    try {
      const result = await this.parseStatement(fileBuffer, filename);
      
      return {
        isValid: result.errors.length === 0 && result.transactions.length > 0,
        errors: result.errors,
        bankDetected: result.bankName,
        transactionCount: result.transactions.length
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Unknown validation error']
      };
    }
  }
}

// Export singleton instance
export const bankStatementParser = new BankStatementParserService();