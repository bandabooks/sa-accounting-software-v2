# Taxnify Business Management Platform

## Overview

Taxnify is a comprehensive business management platform designed for South African companies, offering unified accounting, compliance, and business operations. It provides complete accounting, compliance management, and business operations functionalities, including invoice management, customer relationship management, financial reporting, purchase order management, and multi-company support. The platform aims to be a world-class solution comparable to industry leaders like QuickBooks, Zoho, and Xero, with a focus on South African VAT compliance and SARS integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Shadcn/UI component library built on Radix UI
- **Styling**: Tailwind CSS with custom CSS variables for theming, with a professional UI and split-screen layouts.
- **Build Tool**: Vite for fast development and optimized production builds
- **Design Principles**: Professional, modern SaaS aesthetics with dynamic gradients, clear call-to-actions, and mobile-optimized responsive design. Emphasizes industry-standard layouts and workflows (e.g., QuickBooks/Zoho/Xero).

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM, with a multi-company architecture ensuring data isolation through `companyId` on all relevant tables and row-level security.
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API**: RESTful API with JSON responses, utilizing Zod for schema validation.
- **Build**: esbuild for server-side bundling
- **Core Functionality**:
    - **Authentication & Authorization**: Comprehensive system with bcrypt hashing, JWT/session-based authentication, role-based access control (RBAC) with 15 distinct business roles, and audit logging. Supports both username and email login.
    - **Financial Management**: Full Chart of Accounts (IFRS-compliant for South Africa), Journal Entries, Fixed Assets Management (with depreciation), Budgeting, Cash Flow Forecasting, and Bank Reconciliation.
    - **Reporting**: Comprehensive financial reports including Balance Sheet, Profit & Loss, Cash Flow Statement, Trial Balance, Aged Receivables/Payables, and General Ledger. All reports are IFRS-compliant with PDF export.
    - **VAT Management**: South African VAT system (Standard, Zero-rated, Exempt), VAT201 returns management, SARS eFiling integration, and intelligent VAT compliance guidance. Supports company-level VAT registration and inclusive/exclusive pricing.
    - **Business Operations**: Invoice, Estimate, Purchase Order, and Customer management systems with full CRUD operations. Professional auto-numbering for documents.
    - **Inventory Management**: Stock tracking, lot/batch management, serial number tracking, warranty management, and multi-warehouse support.
    - **System Management**: Enterprise settings, multi-currency support, automated email reminders, and a comprehensive audit trail system for all user actions.
    - **Point of Sale (POS)**: Designed with FrontAccounting methodology, featuring keyboard shortcuts, barcode scanning, suspend/resume sales, multi-payment methods, real-time stock integration, and professional cash handling.

## External Dependencies

### Core Technologies
- **Database**: PostgreSQL via Neon Database serverless platform
- **ORM**: Drizzle ORM for type-safe database operations
- **UI Library**: Radix UI primitives via Shadcn/UI
- **Validation**: Zod for schema validation
- **Icons**: Lucide React for consistent iconography
- **Email Service**: SendGrid for production email delivery (transactional, notifications)
- **AI Integration**: Anthropic AI for intelligent VAT guidance and compliance tips.

### Development Tools
- **Vite**: Development server and build tool
- **TypeScript**: Type checking and enhanced development experience
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for server code