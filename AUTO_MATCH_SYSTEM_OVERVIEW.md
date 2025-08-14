# Auto-Match System Overview

## Two Auto-Match Systems Available

### 1. Script Auto-Match (Primary - Green Button)
**Rule-based South African business patterns**

#### Expense Categories & VAT Treatment:
- **Employee Costs** (0% VAT - Exempt)
  - Patterns: salary, salaries, wages, payroll, employee, staff, remuneration
  
- **Office Supplies** (15% VAT - Standard Rate)
  - Patterns: office supplies, stationery, printing, paper, pens, takealot, office depot
  
- **Rent Expense** (15% VAT - Standard Rate)
  - Patterns: rent, rental, lease, property, premises, office rent, shop rent
  
- **Utilities** (15% VAT - Standard Rate)
  - Patterns: electricity, water, gas, utilities, eskom, municipal, city power
  
- **Telephone & Internet** (15% VAT - Standard Rate)
  - Patterns: telephone, internet, cell phone, mobile, telkom, mtn, vodacom, cell c
  
- **Transport & Travel** (15% VAT - Standard Rate)
  - Patterns: fuel, petrol, diesel, transport, travel, uber, taxi, bolt, engen, shell, bp
  
- **Bank Charges** (15% VAT - Standard Rate)
  - Patterns: bank charges, bank fees, transaction fee, service fee, fnb, absa, standard bank, nedbank
  
- **Insurance** (15% VAT - Standard Rate)
  - Patterns: insurance, premium, santam, outsurance, hollard, short term insurance
  
- **Professional Fees** (15% VAT - Standard Rate)
  - Patterns: consulting, professional fees, legal, accounting, audit, attorney, lawyer
  
- **Marketing & Advertising** (15% VAT - Standard Rate)
  - Patterns: advertising, marketing, promotion, facebook, google ads, social media
  
- **Equipment & Furniture** (15% VAT - Standard Rate)
  - Patterns: equipment, computer, laptop, furniture, machinery, tools
  
- **General Expenses** (15% VAT - Standard Rate)
  - Patterns: expense, cost, payment, purchase (fallback)

#### Income Categories & VAT Treatment:
- **Sales Revenue** (15% VAT - Standard Rate)
  - Patterns: sales, revenue, income, deposit, payment received, customer payment, invoice
  
- **Service Income** (15% VAT - Standard Rate)
  - Patterns: service, consulting, professional, fees, commission
  
- **Interest Income** (0% VAT - Exempt)
  - Patterns: interest, bank interest, investment
  
- **Other Income** (15% VAT - Standard Rate)
  - Patterns: income, receipt, received (fallback)

### 2. AI Auto-Match (Secondary - Purple Button)
**AI-powered intelligent matching using Anthropic Claude**

#### What AI Auto-Match Does:
- Analyzes transaction descriptions with contextual understanding
- Considers South African business context and VAT regulations
- Makes intelligent decisions based on:
  - Transaction context and patterns
  - Business logic and accounting principles
  - VAT compliance requirements
  - Chart of accounts structure
- Provides detailed reasoning for each categorization
- Handles complex or ambiguous transactions better than script patterns

## How Auto-Matching Works

### Process Flow:
1. **Load Transactions**: System identifies unmatched transactions
2. **Pattern Analysis**: Checks description against patterns/AI analysis
3. **Account Mapping**: Matches to existing Chart of Accounts
4. **VAT Detection**: Automatically applies correct VAT rate (15% or 0%)
5. **Confidence Scoring**: Provides confidence level for each match
6. **Bulk Update**: Updates all matched transactions in one operation

### Expected Results:
- **Script Auto-Match**: Fast, reliable categorization for common SA business transactions
- **AI Auto-Match**: More nuanced understanding, better for complex/unusual transactions
- **Both Systems**: Automatic VAT rate detection and Chart of Accounts mapping

### VAT Logic:
- **15% Standard Rate**: Most goods and services
- **0% Exempt**: Employee costs, interest income, some financial services
- **Automatic Detection**: Based on transaction type and South African VAT regulations

## Testing Recommendations

1. **Test with Common Transactions**: Try typical SA business expenses like "FNB Bank Charges", "Eskom Electricity", "Salary Payment"
2. **Test VAT Detection**: Verify 15% VAT applied to most expenses, 0% to salaries/interest
3. **Compare Systems**: Test same transactions with both Script and AI matching
4. **Check Confidence**: Review confidence scores and reasoning provided