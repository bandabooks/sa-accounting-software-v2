// Test script for auto-matching functionality
// This simulates what happens when the bulk-capture page processes transactions

const testTransactions = [
  // Expense transactions
  { id: 0, description: "SALARY PAYMENT - JOHN DOE", amount: 25000, type: "expense" },
  { id: 1, description: "FNB BANK CHARGES MONTHLY", amount: 150, type: "expense" },
  { id: 2, description: "TELKOM INTERNET SERVICES", amount: 899, type: "expense" },
  { id: 3, description: "ESKOM ELECTRICITY PAYMENT", amount: 2500, type: "expense" },
  { id: 4, description: "OFFICE RENT - DECEMBER", amount: 15000, type: "expense" },
  { id: 5, description: "TAKEALOT OFFICE SUPPLIES", amount: 1299, type: "expense" },
  { id: 6, description: "UBER TRANSPORT TO CLIENT", amount: 75, type: "expense" },
  { id: 7, description: "ZOOM SUBSCRIPTION", amount: 250, type: "expense" },
  { id: 8, description: "SASOL FUEL PAYMENT", amount: 1200, type: "expense" },
  { id: 9, description: "INSURANCE PREMIUM - SANTAM", amount: 3500, type: "expense" },
  
  // Income transactions  
  { id: 10, description: "PAYMENT FROM CLIENT ABC", amount: 50000, type: "income" },
  { id: 11, description: "CONSULTING FEE - XYZ CORP", amount: 25000, type: "income" },
  { id: 12, description: "INTEREST RECEIVED - FNB", amount: 125, type: "income" },
  { id: 13, description: "REFUND FROM SUPPLIER", amount: 500, type: "income" },
  { id: 14, description: "INVOICE #1234 PAYMENT", amount: 15000, type: "income" }
];

// Simulate the API request that would be made
async function testScriptMatching() {
  console.log("Testing Script-Based Auto-Matching");
  console.log("====================================\n");
  
  try {
    const response = await fetch('http://localhost:5000/api/script/match-transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add auth headers if needed
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      },
      body: JSON.stringify({
        transactions: testTransactions
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    console.log("Response from server:");
    console.log(JSON.stringify(result, null, 2));
    
    if (result.matches && Array.isArray(result.matches)) {
      console.log("\n\nMatching Results Summary:");
      console.log("=========================");
      console.log(`Total transactions: ${testTransactions.length}`);
      console.log(`Successfully matched: ${result.matches.length}`);
      console.log(`Match rate: ${(result.matches.length / testTransactions.length * 100).toFixed(1)}%`);
      
      console.log("\n\nDetailed Matches:");
      console.log("=================");
      result.matches.forEach(match => {
        console.log(`\n[${match.transactionId}] "${match.description}"`);
        console.log(`  → Account: ${match.suggestedAccount} (ID: ${match.accountId})`);
        console.log(`  → VAT: ${match.vatRate}% (${match.vatType})`);
        console.log(`  → Confidence: ${(match.confidence * 100).toFixed(0)}%`);
        console.log(`  → Reasoning: ${match.reasoning}`);
      });
      
      console.log("\n\nUnmatched Transactions:");
      console.log("=======================");
      const matchedIds = result.matches.map(m => m.transactionId);
      const unmatched = testTransactions.filter(t => !matchedIds.includes(t.id));
      if (unmatched.length > 0) {
        unmatched.forEach(t => {
          console.log(`[${t.id}] "${t.description}" - No match found`);
        });
      } else {
        console.log("All transactions were matched!");
      }
    }
    
  } catch (error) {
    console.error("Error testing script matching:", error);
    console.error("\nNote: Make sure you're logged in and have a valid session.");
    console.error("You may need to update the Authorization header with a valid token.");
  }
}

// Run the test
console.log("Starting Auto-Match Test...\n");
testScriptMatching();