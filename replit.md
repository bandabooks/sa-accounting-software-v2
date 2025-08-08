# Taxnify Business Management Platform

## Overview

Taxnify is a comprehensive business management platform for South African companies, offering unified accounting, compliance, and business operations. It provides complete functionalities including invoice management, CRM, financial reporting, purchase order management, and multi-company support. The platform aims to be a world-class solution with a strong focus on South African VAT compliance and SARS integration, comparable to industry leaders.

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
- ✅ **Estimate Editing Product Selection Fix (Aug 2025)**: Successfully implemented product matching for estimate editing to match invoice functionality. Since estimate items don't store productId in database (only descriptions), added intelligent product matching logic that compares item descriptions with existing products. Product/Service dropdown now properly displays matched products when editing estimates, providing consistent user experience across all transaction types.

**Next Phase**: Purchase Module Enhancement (Priority #2) - Implement missing procurement cycle components including Goods Receipts, Purchase Requisitions, Purchase Approval Workflows, Supplier Performance Management, Purchase Analytics, Contract Management, and Electronic Integration to establish complete enterprise purchasing workflow.

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