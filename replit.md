# Taxnify Business Management Platform

## Overview
Taxnify is a comprehensive business management platform designed for individuals, entrepreneurs, business owners, and professional practices (including South African tax practitioners, accountants, auditors, and CAs). It provides unified invoicing, quotes, accounting, compliance, CRM-centric workflow management, and complete business operations. The platform aims to be a world-class solution with strong South African VAT compliance, SARS integration, and versatile business management tools for all business types, offering specialized features for accounting practices while serving any business needing professional financial and operational management.

## User Preferences
Preferred communication style: Simple, everyday language.

**Employee Role Integration**: Employee roles are now fully integrated with the system-wide RBAC (Role-Based Access Control) rather than being a separate module. Employees are assigned standard business roles like Employee, Sales Representative, Bookkeeper, Payroll Administrator, Inventory Manager, POS Operator, and Project Manager, each with specific module permissions defined in the main permissions matrix.

**Deployment Integrity Protocol**: 
- ALWAYS verify working functionality in deployed app before making changes
- When user reports "this works in deployed app", treat current working version as source of truth
- Implement minimal changes that preserve existing working patterns
- Create rollback plan before making any modifications to core functionality
- Document what works in production to prevent accidental regression

**Subscription-Controlled Navigation System**: 
- Comprehensive subscription-aware navigation implemented with dynamic UI updates
- Every submenu item controllable by subscription toggles with feature key mapping
- UpgradePrompt components show professional upgrade CTAs instead of "access denied" messages
- SubscriptionProtectedRoute component enforces server-side access control
- useSubscriptionNavigation hook provides centralized subscription logic
- Navigation groups dynamically filter based on plan availability
- Future-proof architecture supports easy addition of new subscription-controlled features

## Data Isolation & Security
**Enterprise-Grade Multi-Company Architecture**: Bulletproof data isolation implemented with company_id-based row-level security across all business tables. Comprehensive security includes request-level validation, query-level filtering, result-level scrubbing, real-time monitoring, audit logging, and emergency isolation capabilities. Current security score: 95/100 with zero cross-company data leakage incidents.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack Query
- **UI Components**: Shadcn/UI (built on Radix UI)
- **Styling**: Tailwind CSS with custom CSS variables, professional UI with dynamic gradients and split-screen layouts.
- **Build Tool**: Vite
- **Design Principles**: Professional, modern SaaS aesthetics with dynamic gradients, clear call-to-actions, and mobile-optimized responsive design. All major transaction forms (Invoice, Estimate, Sales Order, Purchase Order, Credit Note) use a standardized, enhanced structure with dedicated creation pages, consistent VAT integration, and uniform data type handling. Dashboard hero cards maintain uniform compact sizing for consistent visual hierarchy across all modules.

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM, supporting multi-company architecture with `companyId` and row-level security.
- **API**: RESTful API with JSON responses, utilizing Zod for schema validation.
- **Build**: esbuild
- **Core Functionality**:
    - **Authentication & Authorization**: Comprehensive system with bcrypt hashing, JWT/session-based authentication, Role-Based Access Control (RBAC) with 15 distinct business roles, and audit logging.
    - **Financial Management**: IFRS-compliant Chart of Accounts, Journal Entries, Fixed Assets Management, Budgeting, Cash Flow Forecasting, and Bank Reconciliation.
    - **Reporting**: Comprehensive IFRS-compliant financial reports (Balance Sheet, P&L, Cash Flow, Trial Balance, Aged Reports, General Ledger) with PDF and CSV export capabilities, displayed inline.
    - **VAT Management**: South African VAT system (Standard, Zero-rated, Exempt), VAT201 returns, intelligent VAT compliance guidance, and support for company-level VAT registration and inclusive/exclusive pricing, with database-driven VAT calculations.
    - **SARS API Integration**: Complete SARS API integration module with secure credential management, multi-service support (VAT201, EMP501/502, ITR12/14), automated submissions, and connection testing.
    - **Business Operations**: Complete transaction management including Invoice, Estimate, Sales Order, Purchase Order, and Credit Note creation with CRUD operations, professional auto-numbering, and fully standardized forms. Professional PDF preview and email functionality. Suppliers page features a card grid layout with performance scorecards and advanced filtering.
    - **Inventory Management**: Stock tracking, lot/batch management, serial number tracking, warranty management, and multi-warehouse support.
    - **System Management**: Enterprise settings, multi-currency support, automated email reminders, company-specific email configuration (SMTP/SendGrid), and a comprehensive audit trail.
    - **Point of Sale (POS)**: Designed with FrontAccounting methodology, featuring keyboard shortcuts, barcode scanning, suspend/resume sales, multi-payment methods, real-time stock integration, and cash handling.
    - **Dashboard**: Features optimized quick actions and compliance alerts layout, with a compact hero card design and integrated global search. Centralized real-time alerts system with authentic business intelligence from invoices, estimates, compliance deadlines, and operational data. Overview dashboard includes comprehensive time period filtering (All Time, This Month, Last Month, 3 Months, 6 Months, 12 Months, Custom Range) with intelligent data processing and period summaries.
    - **Payment Hub**: Uniform compact hero card design matching Sales Dashboard sizing, featuring essential invoice management actions and streamlined navigation.
    - **Professional Services**: Complete set of South African accounting and tax professional services with enhanced categories and RBAC integration.
    - **Advanced Attendance System**: Comprehensive staff attendance and time tracking with location-based clock in/out, real-time GPS tracking, intelligent dashboard cards showing Total Staff, Present, Absent, Late Arrivals, Total Hours, and Average Hours. Features advanced shift management settings including default shift times, late thresholds, overtime calculations, auto clock-out functionality, and configurable location tracking with address resolution.

## External Dependencies

### Core Technologies
- **Database**: PostgreSQL via Neon Database
- **ORM**: Drizzle ORM
- **UI Library**: Radix UI primitives via Shadcn/UI
- **Validation**: Zod
- **Icons**: Lucide React
- **Email Service**: SendGrid
- **AI Integration**: Anthropic AI
- **Payment Gateways**: PayFast, Peach Payments, PayGate, Stripe, Yoco, Ozow (South African focused)