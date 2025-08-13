# Taxnify Business Management Platform

## Overview

Taxnify is evolving into a comprehensive professional practice management platform targeting South African tax practitioners, accountants, auditors, and CAs. The platform provides unified accounting, compliance, CRM-centric workflow management, and business operations. The CRM serves as the central hub for customer communication and practice management, with integrated document request workflows, engagement letter automation, and contract management. The platform aims to be a world-class solution with strong South African VAT compliance, SARS integration, and professional workflow automation comparable to industry leaders like Karbon.

## User Preferences

Preferred communication style: Simple, everyday language.

## Current Project Status

**Major Achievement**: Successfully completed comprehensive sales module enhancement with 5 world-class components:
- ✅ Pipeline Management with drag-and-drop kanban interface
- ✅ Advanced Lead Management with scoring system
- ✅ AI-powered Sales Forecasting with analytics
- ✅ Interactive Quote System with digital signatures
- ✅ Dynamic Pricing Rules with customer tier management

**Critical Issues Resolved**: 
- ✅ Fixed Pipeline icon import error that caused application failure
- ✅ Resolved authentication middleware inconsistencies
- ✅ Implemented comprehensive API endpoints for all new sales features
- ✅ Application now loads successfully with enhanced tabbed sales interface

**Critical Issues Resolved**: 
- ✅ Fixed final SelectItem white screen errors in Customer Insights 
- ✅ **Enhanced Expense Module Completion**: Successfully implemented all standardized transaction form features including supplier integration with quick-add functionality, mandatory bank account selection for paid expenses, complete VAT logic with automatic calculations, file upload capabilities, mobile-friendly responsive design, and removed multi-company dropdown as company context is established at login.
- ✅ **Journal Entry Module Enhancement**: Fixed critical date formatting issues for backend compatibility, implemented professional confirmation modals for all critical actions (create, post, reverse), replaced confusing icons with clear text buttons ("Post to Journal", "Reverse Entry"), ensuring world-class user experience for this essential accounting function.
- ✅ **Invoice VAT Calculation Consistency Fix (Aug 2025)**: Resolved critical VAT calculation discrepancies between UI and PDF generation. Fixed quantity field increment behavior (whole numbers vs decimals), removed duplicate VAT types from dropdown, and synchronized invoice detail view calculations with PDF generator logic to ensure consistent VAT-inclusive calculations across all interfaces. Line VAT and totals now display identically in both invoice view (R1,304.35 VAT, R10,000.00 total) and PDF output.
- ✅ **Invoice Editing Database Persistence Fix (Aug 2025)**: Completely resolved critical issue where invoice item modifications (quantity, price, descriptions) were only updating UI calculations but not persisting to database. Enhanced backend API to handle both invoice header and items updates, implemented smart product matching for edit mode, and ensured all item changes now properly save to database. Invoice editing now maintains full data integrity across sessions.
- ✅ **Expense Metrics Display Fix (Aug 2025)**: Resolved critical issue where expense metrics cards were showing R 0.00 instead of actual financial data. Identified and fixed dual expense page architecture (expenses.tsx vs expenses-standalone.tsx) where routing was using ExpensesStandalone component. Updated correct component to display proper values: Total Expenses (R 12,000.00), This Month (R 1,200.00), Unpaid Expenses (R 0.00), and Average Expense (R 4,000.00).

**Current Status**: ✅ **Production Deployment Fix Complete (Aug 13, 2025)** - Successfully resolved production deployment issues:
- ✅ Fixed "Cannot GET /" error in production deployment by properly configuring static file serving
- ✅ Updated Express app to serve built React files from dist/public directory in production mode
- ✅ Implemented proper fallback routing for client-side navigation while preserving API routes
- ✅ Email system fully integrated with SendGrid for both test notifications and invoice emails
- ✅ Test email functionality accepts custom recipient addresses from UI
- ✅ Invoice emails now use actual SendGrid service with professional HTML templates
- ✅ Anthropic AI integration with health monitoring system fully operational
- ✅ All AI features operational: basic chat, document analysis, image analysis, code generation
- ✅ System status: Healthy (1363ms response time, 100% success rate)

**Next Phase**: CRM Professional Practice Management Transformation (Priority #1) - Transform CRM into central hub for customer communication and practice management targeting South African tax practitioners, accountants, auditors, and CAs. Implement document request workflows, engagement letter automation, contract module integration, and professional workflow simplification similar to Karbonhq.com platform standards.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Shadcn/UI built on Radix UI
- **Styling**: Tailwind CSS with custom CSS variables, professional UI with dynamic gradients and split-screen layouts.
- **Build Tool**: Vite for fast development and optimized builds.
- **Design Principles**: Professional, modern SaaS aesthetics with dynamic gradients, clear call-to-actions, and mobile-optimized responsive design, emphasizing industry-standard layouts and workflows. All major transaction forms (Invoice, Estimate, Sales Order, Purchase Order, Credit Note) use a completely standardized, enhanced structure with dedicated creation pages, consistent VAT integration, and uniform data type handling for world-class user experience.

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM, supporting a multi-company architecture with `companyId` and row-level security for data isolation.
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API**: RESTful API with JSON responses, utilizing Zod for schema validation.
- **Build**: esbuild for server-side bundling.
- **Core Functionality**:
    - **Authentication & Authorization**: Comprehensive system with bcrypt hashing, JWT/session-based authentication, Role-Based Access Control (RBAC) with 15 distinct business roles, and audit logging.
    - **Financial Management**: Full IFRS-compliant Chart of Accounts, Journal Entries, Fixed Assets Management (with depreciation), Budgeting, Cash Flow Forecasting, and Bank Reconciliation.
    - **Reporting**: Comprehensive IFRS-compliant financial reports (Balance Sheet, P&L, Cash Flow, Trial Balance, Aged Reports, General Ledger) with PDF and CSV export capabilities. Reports are displayed inline within the same page using a compact card design.
    - **VAT Management**: South African VAT system (Standard, Zero-rated, Exempt), VAT201 returns, intelligent VAT compliance guidance, and support for company-level VAT registration and inclusive/exclusive pricing. All VAT calculations are database-driven via a centralized VAT service.
    - **SARS API Integration**: Complete SARS API integration module with secure credential management, multi-service support (VAT201, EMP501/502, ITR12/14), automated submissions, and connection testing.
    - **Business Operations**: Complete transaction management including Invoice, Estimate, Sales Order, Purchase Order, and Credit Note creation with CRUD operations, professional auto-numbering, and fully standardized forms ensuring uniform logic and UX across all transaction types. All major transaction forms (Invoice, Estimate, Sales Order, Purchase Order, Credit Note) now use completely standardized, enhanced structure with dedicated creation pages, consistent VAT integration, uniform data type handling, and professional auto-generated document numbering for world-class user experience. Professional PDF preview and email functionality implemented with data URI approach for reliable cross-browser compatibility. Suppliers page features a card grid layout with performance scorecards and advanced filtering.
    - **Inventory Management**: Stock tracking, lot/batch management, serial number tracking, warranty management, and multi-warehouse support.
    - **System Management**: Enterprise settings, multi-currency support, automated email reminders, and a comprehensive audit trail.
    - **Point of Sale (POS)**: Designed with FrontAccounting methodology, featuring keyboard shortcuts, barcode scanning, suspend/resume sales, multi-payment methods, real-time stock integration, and cash handling.
    - **Dashboard**: Features optimized quick actions and compliance alerts layout, with a compact hero card design and integrated global search across all modules.
    - **Professional Services**: Implemented a complete set of South African accounting and tax professional services with enhanced categories and RBAC integration.

## External Dependencies

### Core Technologies
- **Database**: PostgreSQL via Neon Database serverless platform
- **ORM**: Drizzle ORM
- **UI Library**: Radix UI primitives via Shadcn/UI
- **Validation**: Zod
- **Icons**: Lucide React
- **Email Service**: SendGrid
- **AI Integration**: Anthropic AI (for intelligent VAT guidance)
- **Payment Gateways**: PayFast, Peach Payments, PayGate, Stripe, Yoco, Ozow (with a focus on South African payment methods)