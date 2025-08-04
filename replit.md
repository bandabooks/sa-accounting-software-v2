# Taxnify Business Management Platform

## Overview

Taxnify is a comprehensive business management platform for South African companies, offering unified accounting, compliance, and business operations. It provides complete functionalities including invoice management, CRM, financial reporting, purchase order management, and multi-company support. The platform aims to be a world-class solution with a strong focus on South African VAT compliance and SARS integration, comparable to industry leaders.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Shadcn/UI built on Radix UI
- **Styling**: Tailwind CSS with custom CSS variables, professional UI with dynamic gradients and split-screen layouts.
- **Build Tool**: Vite for fast development and optimized builds.
- **Design Principles**: Professional, modern SaaS aesthetics with dynamic gradients, clear call-to-actions, and mobile-optimized responsive design, emphasizing industry-standard layouts and workflows. Transaction forms (Invoice, Estimate, Sales Order, Purchase Order) use a standardized, enhanced structure with dedicated creation pages and consistent VAT integration.

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
    - **Business Operations**: Invoice, Estimate, Purchase Order, and Customer management with CRUD operations and professional auto-numbering. Suppliers page features a card grid layout with performance scorecards and advanced filtering.
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