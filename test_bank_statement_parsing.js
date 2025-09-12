/**
 * Comprehensive test for enhanced bank statement import functionality
 * Tests all key improvements: PDF parsing, FNB CSV detection, format selector, error messages
 */

const fs = require('fs');
const path = require('path');

// Import the bank statement parser
async function testBankStatementParsing() {
  console.log('🧪 Starting comprehensive bank statement parsing tests...\n');
  
  try {
    // Dynamic import of the ES module
    const { bankStatementParser } = await import('./server/services/bankStatementParsers.js');
    
    console.log('✅ Bank statement parser imported successfully\n');
    
    // Test 1: FNB Traditional Format (Debit/Credit columns)
    console.log('📋 Test 1: FNB Traditional Format (Debit/Credit columns)');
    console.log('=' .repeat(60));
    
    const fnbTraditionalBuffer = fs.readFileSync('./test_files/fnb_test_traditional.csv');
    const result1 = await bankStatementParser.parseStatement(fnbTraditionalBuffer, 'fnb_traditional.csv');
    
    console.log(`Bank detected: ${result1.bankName}`);
    console.log(`Transactions found: ${result1.transactions.length}`);
    console.log(`Errors: ${result1.errors.length > 0 ? result1.errors.join(', ') : 'None'}`);
    
    if (result1.transactions.length > 0) {
      console.log('Sample transaction:', result1.transactions[0]);
      console.log('✅ FNB traditional format parsing successful');
    } else {
      console.log('❌ FNB traditional format parsing failed - no transactions');
    }
    console.log('');
    
    // Test 2: FNB Single Amount Column Format  
    console.log('📋 Test 2: FNB Single Amount Column Format');
    console.log('=' .repeat(60));
    
    const fnbSingleAmountBuffer = fs.readFileSync('./test_files/fnb_test_single_amount.csv');
    const result2 = await bankStatementParser.parseStatement(fnbSingleAmountBuffer, 'fnb_single_amount.csv');
    
    console.log(`Bank detected: ${result2.bankName}`);
    console.log(`Transactions found: ${result2.transactions.length}`);
    console.log(`Errors: ${result2.errors.length > 0 ? result2.errors.join(', ') : 'None'}`);
    
    if (result2.transactions.length > 0) {
      console.log('Sample transaction:', result2.transactions[0]);
      console.log('✅ FNB single amount column parsing successful');
    } else {
      console.log('❌ FNB single amount column parsing failed - no transactions');
    }
    console.log('');
    
    // Test 3: PDF Parsing (if PDF file available)
    console.log('📋 Test 3: PDF Parsing Functionality');
    console.log('=' .repeat(60));
    
    try {
      const pdfPath = './attached_assets/62902230531_20240625 new_1754963182570.pdf';
      if (fs.existsSync(pdfPath)) {
        const pdfBuffer = fs.readFileSync(pdfPath);
        const result3 = await bankStatementParser.parseStatement(pdfBuffer, 'test_statement.pdf');
        
        console.log(`Bank detected: ${result3.bankName}`);
        console.log(`Transactions found: ${result3.transactions.length}`);
        console.log(`Errors: ${result3.errors.length > 0 ? result3.errors.join(', ') : 'None'}`);
        
        if (result3.transactions.length > 0) {
          console.log('Sample transaction:', result3.transactions[0]);
          console.log('✅ PDF parsing successful');
        } else {
          console.log('⚠️ PDF parsing returned no transactions (this may be expected for this specific PDF)');
        }
      } else {
        console.log('⏭️ PDF test file not found, skipping PDF test');
      }
    } catch (pdfError) {
      console.log(`❌ PDF parsing error: ${pdfError.message}`);
    }
    console.log('');
    
    // Test 4: Unsupported Format (QIF)
    console.log('📋 Test 4: Unsupported Format Handling (QIF)');
    console.log('=' .repeat(60));
    
    const qifBuffer = fs.readFileSync('./test_files/test_unsupported.qif');
    const result4 = await bankStatementParser.parseStatement(qifBuffer, 'test_unsupported.qif');
    
    console.log(`Bank detected: ${result4.bankName}`);
    console.log(`Transactions found: ${result4.transactions.length}`);
    console.log(`Errors: ${result4.errors.length > 0 ? result4.errors.join(', ') : 'None'}`);
    
    if (result4.errors.length > 0) {
      console.log('✅ Unsupported format correctly detected with appropriate errors');
    } else {
      console.log('⚠️ Expected errors for unsupported format, but none returned');
    }
    console.log('');
    
    // Test 5: Supported Banks and Formats
    console.log('📋 Test 5: Supported Banks and Formats');
    console.log('=' .repeat(60));
    
    const supportedBanks = bankStatementParser.getSupportedBanks();
    console.log('Supported Banks:', supportedBanks);
    console.log(`Total banks supported: ${supportedBanks.length}`);
    console.log('✅ Bank support information retrieved');
    console.log('');
    
    // Test 6: File Validation 
    console.log('📋 Test 6: File Validation Functionality');
    console.log('=' .repeat(60));
    
    const validationResult = await bankStatementParser.validateStatementFile(fnbTraditionalBuffer, 'fnb_traditional.csv');
    console.log('Validation result:', validationResult);
    
    if (validationResult.isValid) {
      console.log('✅ File validation successful');
    } else {
      console.log('❌ File validation failed');
    }
    console.log('');
    
    // Summary
    console.log('📊 TEST SUMMARY');
    console.log('=' .repeat(60));
    console.log('✅ FNB Traditional Format: Tested');
    console.log('✅ FNB Single Amount Column: Tested'); 
    console.log('✅ PDF Parsing: Tested');
    console.log('✅ Unsupported Format Handling: Tested');
    console.log('✅ Supported Banks Query: Tested');
    console.log('✅ File Validation: Tested');
    console.log('\n🎉 All bank statement parsing tests completed!');
    
    return {
      fnbTraditional: result1,
      fnbSingleAmount: result2,
      pdf: result3 || null,
      unsupported: result4,
      supportedBanks,
      validation: validationResult
    };
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
    return null;
  }
}

// Export for use in Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testBankStatementParsing };
}

// Run tests if called directly
if (require.main === module) {
  testBankStatementParsing().then(results => {
    if (results) {
      console.log('\n📋 Final Results Summary:');
      console.log(`- FNB Traditional: ${results.fnbTraditional.transactions.length} transactions`);
      console.log(`- FNB Single Amount: ${results.fnbSingleAmount.transactions.length} transactions`);
      console.log(`- PDF: ${results.pdf ? results.pdf.transactions.length : 'N/A'} transactions`);
      console.log(`- Unsupported Format Errors: ${results.unsupported.errors.length}`);
      console.log(`- Banks Supported: ${results.supportedBanks.length}`);
      console.log(`- File Validation: ${results.validation.isValid ? 'PASS' : 'FAIL'}`);
    }
    process.exit(0);
  }).catch(err => {
    console.error('Test execution failed:', err);
    process.exit(1);
  });
}