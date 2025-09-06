# Overview

This is a comprehensive cloud-based accounting and business management platform designed for South African accountants, tax practitioners, and business owners. The system provides multi-company support with complete accounting functionality, VAT compliance, and business management tools. Built with modern web technologies, it features a React frontend with TypeScript, Express.js backend, and SQLite database with Drizzle ORM for data management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18** with TypeScript for type safety and modern component development
- **Vite** as the build tool for fast development and optimized production builds
- **Tailwind CSS** with shadcn/ui components for consistent, modern UI design
- **TanStack Query** for server state management and API data fetching
- **React Hook Form** with Zod validation for form handling and data validation
- **React Router (wouter)** for client-side navigation
- **Responsive Design** with mobile-first approach and PWA capabilities

## Backend Architecture
- **Express.js** server with TypeScript for API endpoints and business logic
- **SQLite database** with Drizzle ORM for type-safe database operations
- **JWT-based authentication** with bcrypt for password hashing
- **RESTful API design** with proper error handling and validation
- **File upload support** with Google Cloud Storage integration
- **Email services** via SendGrid for notifications and communications

## Database Design
- **Multi-tenant architecture** with company-based data isolation
- **Chart of Accounts** system with South African accounting standards compliance
- **Double-entry bookkeeping** with automated journal entries
- **VAT management** with SARS-compliant VAT codes and reporting
- **Audit trails** for all financial transactions and system changes

## Key Business Modules
- **Multi-Company Management** with role-based access control
- **Sales Module** (invoices, estimates, customers, payments)
- **Purchase Module** (suppliers, bills, expense tracking)
- **Inventory Management** with real-time stock tracking
- **Banking** with statement imports and reconciliation
- **Point of Sale (POS)** for retail operations
- **Financial Reporting** (P&L, Balance Sheet, Cash Flow, Trial Balance)
- **VAT Returns** with automated VAT201 form generation
- **Bulk Capture** for efficient data entry

## Authentication & Authorization
- **Role-based permissions** system with granular access control
- **Multi-company user assignments** with different roles per company
- **Session management** with secure token handling
- **2FA support** ready for enterprise features

## Integration Capabilities
- **Stripe integration** for subscription payments
- **Bank feed integration** (Stitch API ready)
- **PDF generation** for invoices, reports, and compliance documents
- **Email automation** for invoices, reminders, and notifications
- **Document management** with secure file storage

# External Dependencies

## Payment Processing
- **Stripe** for subscription billing and payment processing
- **PayFast** planned for South African market-specific payments

## Cloud Services
- **Google Cloud Storage** for document and file management
- **SendGrid** for transactional email delivery
- **Neon Database** as alternative PostgreSQL provider (configured but using SQLite)

## AI & Automation
- **Anthropic Claude** integration for AI-powered accounting assistance
- **Automated workflow** capabilities for compliance reminders

## Banking & Financial
- **Stitch API** integration ready for South African bank feeds
- **SARS eFiling** integration planned for tax submissions
- **Multiple payment gateway** support for diverse business needs

## Development & Deployment
- **Replit** as development and hosting platform
- **Vite** for modern frontend tooling
- **TypeScript** throughout the stack for type safety
- **ESBuild** for server-side bundling and optimization