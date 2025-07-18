# Replit.md - Invoice Management System

## Overview

This is a full-stack invoice management system built with React (client) and Express.js (server). The application successfully replicates core Think Mybiz Accounting features as a proof-of-concept for Laravel to JavaScript migration. The system uses modern web technologies including TypeScript, Tailwind CSS, Shadcn/UI components, and in-memory storage for rapid development and testing.

## Recent Changes

**July 18, 2025**: Successfully completed initial proof-of-concept implementation
- ✓ Fixed all TypeScript compilation errors and CSS conflicts
- ✓ Implemented complete dashboard with revenue statistics and activity tracking
- ✓ Built full invoice management system with status tracking
- ✓ Created customer database with comprehensive contact management
- ✓ Added estimates functionality for client quotes
- ✓ Established professional UI matching Think Mybiz branding
- ✓ Verified all API endpoints functioning correctly
- ✓ Application running smoothly with no errors

**July 18, 2025**: Enhanced Invoice Management Features Implemented
- ✓ PDF invoice generation with professional branding and layout
- ✓ Email invoice functionality with customizable templates
- ✓ Recurring invoice setup for subscription-based clients
- ✓ Payment tracking with partial payment support (already implemented)
- ✓ Interactive revenue chart with hover tooltips
- ✓ Professional invoice templates with Think Mybiz branding
- ✓ Enhanced invoice detail page with all management features

**Status**: Enhanced invoice management features implemented, ready for deployment

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Shadcn/UI component library built on Radix UI
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API**: RESTful API with JSON responses
- **Build**: esbuild for server-side bundling

## Key Components

### Database Schema
The application manages four main entities:
- **Customers**: Client information including contact details and VAT numbers
- **Invoices**: Invoice records with status tracking, amounts, and dates
- **Invoice Items**: Line items for each invoice with quantity, pricing, and VAT
- **Estimates**: Quote system with similar structure to invoices

### API Endpoints
- `/api/dashboard/stats` - Dashboard statistics
- `/api/customers` - Customer CRUD operations
- `/api/invoices` - Invoice management with status updates
- `/api/estimates` - Estimate/quote management

### Frontend Pages
- **Dashboard**: Overview with statistics and recent activity
- **Invoices**: List, create, and manage invoices
- **Customers**: Customer management
- **Estimates**: Quote management
- **Reports**: Business analytics and reporting

## Data Flow

1. **Client Requests**: React components make API calls using TanStack Query
2. **API Processing**: Express server handles requests and validates data with Zod schemas
3. **Database Operations**: Drizzle ORM executes SQL queries against PostgreSQL
4. **Response**: JSON data returned to client and cached by TanStack Query
5. **UI Updates**: React components re-render with fresh data

## External Dependencies

### Core Technologies
- **Database**: PostgreSQL via Neon Database serverless platform
- **ORM**: Drizzle ORM for type-safe database operations
- **UI Library**: Radix UI primitives via Shadcn/UI
- **Validation**: Zod for schema validation
- **Icons**: Lucide React for consistent iconography

### Development Tools
- **Vite**: Development server and build tool
- **TypeScript**: Type checking and enhanced development experience
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for server code

## Deployment Strategy

### Development
- **Client**: Vite dev server with hot module replacement
- **Server**: tsx for TypeScript execution in development
- **Database**: Connected to remote PostgreSQL instance

### Production
- **Build Process**: 
  - Client: Vite builds optimized static assets
  - Server: ESBuild bundles server code for Node.js
- **Deployment**: Single application serving both API and static files
- **Database**: Production PostgreSQL database via environment variables

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Environment setting (development/production)
- Database migrations managed via Drizzle Kit

The application follows a monorepo structure with shared TypeScript types and schemas, enabling type safety across the full stack while maintaining clear separation between client and server code.