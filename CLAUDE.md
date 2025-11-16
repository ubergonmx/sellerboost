# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: Tool Usage
- **For documentation searches:** Always use Context7 MCP first rather than built-in Claude search for the latest documentation
- **For debugging:** Use next-devtool MCP when debugging Next.js issues

## Project Overview

**SellerBoost** - A powerful SaaS application designed to empower businesses to efficiently manage their entire sales and order fulfillment process directly through their Facebook Page Messenger. It acts as a centralized command center, aggregating all customer messages, inquiries, and orders from multiple Facebook pages into one intuitive platform.

### Full Vision
SellerBoost transforms casual Facebook Messenger interactions into a fully managed, revenue-generating pipeline by providing:

1. **Centralize Communication**: Consolidate all customer queries and conversations from various Facebook pages into a single, unified inbox
2. **Streamline Order Processing**: Enable businesses to quickly respond to inquiries and process product orders directly within the chat interface
3. **Facilitate Secure Payments & Invoicing**: Generate and send secure payment links directly within Messenger conversations with automated invoicing
4. **Manage and Track Orders**: Robust order management with tracking statuses, shipping information, and delivery updates
5. **Automate Customer Updates**: Automatic sending of payment links, order confirmations, and delivery updates

### Current MVP Focus
The MVP implementation focuses on:
- **Gathering/Aggregating messages** from multiple Facebook pages into unified inbox
- **Replying to messages** through the platform
- **Creating invoices** for customer orders
- **Generating payment link pages** (with temporary IDs, not final implementation)

**Stack:** Next.js 16 (App Router), TypeScript 5, React 19, PostgreSQL, Drizzle ORM, Better Auth, shadcn/ui

## Commands

```bash
# Development
pnpm dev                # Start development server (http://localhost:3000)

# Database
pnpm db:generate        # Generate Drizzle migrations after schema changes
pnpm db:migrate         # Apply migrations to database
pnpm db:studio          # Open Drizzle Studio GUI for database management

# Build & Production
pnpm build              # Build for production
pnpm start              # Start production server

# Code Quality
pnpm lint               # Run Biome linter
pnpm format             # Format code with Biome

# Docker
docker compose up -d    # Start PostgreSQL database container
docker compose down     # Stop database container
```

## Architecture

### Route Structure
- `(public)` route group: Landing page and authentication pages
  - `/` - Landing page (Hero47 and Features6 are placeholder component names to be renamed)
  - `/login`, `/signup` - Authentication flows
- `(protected)` route group: Authenticated user pages
  - `/dashboard` - Main application dashboard with sidebar navigation (will become the unified inbox for Facebook messages)

### Authentication Flow
1. **Better Auth** configured in `/src/lib/auth/config.ts` with:
   - Email/password with email verification (auto sign-in after verification)
   - OAuth: Facebook (with Pages API scopes) and Google
   - Account linking enabled for social providers
2. **Server Actions** in `/src/features/auth/components/actions.ts` handle login/signup
3. **Protected routes** use route groups and check authentication status
4. **Session management** via Better Auth with token-based authentication

### Database Schema (Drizzle ORM)
- `user` table: Core user data with uid (UUID) as external identifier
- `session` table: Session tokens with IP/userAgent tracking
- `account` table: OAuth account linking and password storage
- `verification` table: Email verification tokens

Schema modifications require running `pnpm db:generate` then `pnpm db:migrate`.

### Component Architecture
- **UI Components**: shadcn/ui components in `/src/components/ui/` built on Radix UI
- **Feature Components**: Domain-specific components in `/src/features/`
- **Form Handling**: react-hook-form with Zod validation schemas in `/src/schemas/`
- **Server Components by default**, explicit `"use client"` for interactive components

## Key Files & Their Purposes

- `/src/lib/auth/config.ts` - Better Auth server configuration with OAuth providers
- `/src/lib/auth/client.ts` - Client-side auth utilities and hooks
- `/src/lib/db/schema.ts` - Drizzle ORM database schema
- `/src/features/auth/components/actions.ts` - Authentication server actions
- `/src/app/api/auth/[...all]/route.ts` - Better Auth API handler
- `/drizzle.config.ts` - Database configuration for migrations

## Environment Variables

Required in `.env.local`:
```env
DATABASE_URL=postgresql://sellerboost_user:local-dev-password@localhost:5432/sellerboost
BETTER_AUTH_SECRET=[32-byte-hex-string]
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
FACEBOOK_CLIENT_ID=[from Facebook App Dashboard]
FACEBOOK_CLIENT_SECRET=[from Facebook App Dashboard]
GOOGLE_CLIENT_ID=[from Google Cloud Console]
GOOGLE_CLIENT_SECRET=[from Google Cloud Console]
```

## Facebook OAuth Configuration

When setting up Facebook OAuth, ensure these scopes are requested:
- email
- pages_messaging
- pages_manage_engagement
- pages_read_engagement
- pages_manage_metadata

## Development Workflow

1. **Adding new database tables/columns:**
   - Modify schema in `/src/lib/db/schema.ts`
   - Run `pnpm db:generate` to create migration
   - Run `pnpm db:migrate` to apply changes
   - Use `pnpm db:studio` to inspect data

2. **Adding new UI components:**
   - Use shadcn/ui components when possible
   - Place in `/src/components/ui/` for reusable components
   - Use CVA (class-variance-authority) for component variants

3. **Adding protected routes:**
   - Place under `/src/app/(protected)/` directory
   - Authentication is automatically checked via layout

4. **Error handling:**
   - Global error boundary at `/src/app/error.tsx`
   - OAuth errors logged to console with detailed information
   - Form validation errors handled via Zod schemas

## MVP Implementation Status

### Currently Implemented
- User authentication (email/password, Facebook OAuth, Google OAuth)
- Basic dashboard structure with sidebar
- Database schema for users, sessions, and accounts
- Landing page structure (with placeholder components)

### MVP Priorities (To Be Implemented)
1. **Facebook Pages Integration**
   - Connect user's Facebook Pages to SellerBoost
   - Store page tokens and permissions
   - Webhook setup for real-time message updates

2. **Message Aggregation**
   - Fetch messages from connected Facebook Pages
   - Store messages in database
   - Display unified inbox in dashboard

3. **Message Reply System**
   - Send replies back to Facebook Messenger
   - Track conversation threads
   - Message status updates (read, replied, etc.)

4. **Invoice Creation**
   - Generate invoices from conversations
   - Store invoice details in database
   - Link invoices to conversations/customers

5. **Payment Link Generation**
   - Create temporary payment link pages with unique IDs
   - Basic payment form (not processing actual payments in MVP)
   - Link payment status to invoices

## Testing Approach

Currently no test suite configured. When adding tests:
- Place unit tests next to components as `*.test.tsx`
- Use React Testing Library for component testing
- Mock Better Auth client for auth-dependent components