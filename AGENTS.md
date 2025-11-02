# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Package Manager
- This project uses **pnpm** (v9.15.4)
- Always use `pnpm` instead of `npm` or `yarn`

### Core Commands
```bash
# Development
pnpm dev                 # Start React Router dev server (HMR enabled)
pnpm start              # Start Wrangler dev server for Cloudflare Workers

# Type Generation & Checking
pnpm typegen            # Generate all types (React Router + Cloudflare)
pnpm typecheck          # Run TypeScript compiler with noEmit

# Code Quality
pnpm lint               # Run ESLint
pnpm format             # Format code with Prettier

# Build & Deploy
pnpm build              # Build for production
pnpm deploy             # Build and deploy to Cloudflare Workers
```

### Deployment (Wrangler)
```bash
npx wrangler versions upload   # Deploy preview URL
npx wrangler versions deploy   # Promote to production
```

## Architecture Overview

### Hybrid React Router + Cloudflare Workers Architecture

This project uses **React Router v7** running on **Cloudflare Workers** via **Hono**. The architecture bridges React Router's SSR with Cloudflare's edge runtime.

#### Entry Points
- **Client**: `app/` - React Router application
- **Server**: `workers/app.ts` - Hono server that handles both API routes and React Router SSR

#### Request Flow
1. All requests hit Hono server (`workers/app.ts`)
2. API routes (`/api/*`) are handled by Hono (`workers/api/`)
3. All other routes are passed to React Router's SSR handler

#### Context System
The project uses a custom context accessor pattern (`app/context.ts`) to pass Cloudflare-specific data to React Router:
- `cloudflareContext` - Cloudflare bindings (D1, KV, etc.)
- `apiClientContext` - Type-safe Hono RPC client
- `executionContextContext` - Cloudflare execution context

**Critical**: Contexts are created in `app/context.ts` (React Router runtime), not in `workers/app.ts`

#### API Integration
- Backend API defined in `workers/api/`
- Frontend gets a type-safe Hono RPC client via `apiClientContext`
- API routes are automatically typed using `APIRoutes` type export

### Key Architectural Patterns

#### File-based Routing
- Routes defined in `app/routes/`
- Uses `@react-router/fs-routes` with flat routes pattern
- Route files can export: `meta`, `links`, `headers`, `loader`, `action`

#### Component Organization
- `app/hooks/` - Reusable React hooks
- `app/features/` - Feature-scoped components and logic
- `app/lib/` - Utility functions
- `app/utils/` - Type definitions and helpers

#### Cloudflare Integration
- D1 database binding: `UI_LAB_DB`
- Database migrations: `drizzle/migrations`
- Wrangler configuration: `wrangler.jsonc`
- Type generation: `pnpm typegen:cloudflare` generates `worker-configuration.d.ts`

### Build System

#### Vite Configuration
- Uses **Rolldown** (experimental Vite alternative): `vite: "npm:rolldown-vite@latest"`
- SSR build uses `workers/app.ts` as input (not React Router default)
- Plugins: Cloudflare, TailwindCSS v4, unplugin-icons, React Router

#### TypeScript Setup
- Project references with composite builds
- `tsconfig.app.json` - App code (includes `app/`, `workers/`, auto-generated types)
- `tsconfig.node.json` - Build tools
- Generated types in `.react-router/types/`

#### Special Features
- **React Compiler** enabled (experimental, babel plugin)
- **Iconify** via `unplugin-icons` - Import icons as React components
- **TailwindCSS v4** with DaisyUI

### Code Quality Tools
- ESLint config from `@virtual-live-lab/eslint-config`
- React Compiler ESLint rules enforced
- Custom override for React Router exports (`meta`, `links`, `loader`, etc.)

### Important Notes
- Run `pnpm typegen` after modifying Wrangler config or React Router structure
- TypeScript errors about virtual modules are expected (see `workers/app.ts:3-5`)
- The project uses experimental React builds (`0.0.0-experimental-*`)
