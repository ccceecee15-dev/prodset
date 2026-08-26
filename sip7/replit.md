# MerchX - Retail Planning & Analytics Dashboard

## Overview

This is a retail planning and analytics dashboard application (MerchX), providing comprehensive tools for managing sales, margin planning, inventory tracking, and stock allocation. The actual project code lives in `sip6/sip5/sip4/`.

## Project Structure

```
sip6/sip5/sip4/         # Main project root
  client/               # React frontend (Vite)
    src/
      pages/            # Dashboard, SIP, RAP, OTB, etc.
      components/       # Reusable UI components
      data/             # Mock data files
  server/               # Express.js backend
    index.ts            # Main entry point (dev + prod)
    app.ts              # Express app setup
    routes.ts           # API routes
    storage.ts          # In-memory storage (MemStorage)
    db.ts               # Drizzle ORM + PostgreSQL setup
    vite.ts             # Vite dev server integration
    static.ts           # Static file serving (production)
  shared/               # Shared types/schema
    schema.ts           # Drizzle schema + Zod types
  package.json
  vite.config.ts
  drizzle.config.ts
  tailwind.config.ts
```

## Tech Stack

- **Frontend**: React 19 + TypeScript, Vite, Tailwind CSS v4, shadcn/ui (Radix UI), Wouter (routing)
- **Backend**: Express.js serving both API and frontend on port 5000
- **Database**: Drizzle ORM with PostgreSQL (currently uses in-memory MemStorage)
- **Build**: Vite (frontend) + esbuild (backend)

## Running the App

The workflow `Start application` runs:
```
cd sip6/sip5/sip4 && npm run dev
```

This starts the Express + Vite dev server together on port 5000 via `tsx server/index-dev.ts`.

## Key Configuration

- Server listens on `0.0.0.0:5000`
- Vite config has `allowedHosts: true` and `host: "0.0.0.0"` for Replit proxy compatibility
- Database: PostgreSQL via `DATABASE_URL` env var (optional — falls back to MemStorage)
- Deployment: autoscale, build with `npm run build`, run with `node dist/index.js`

## UI Design

- Glassmorphism design with backdrop blur effects
- Dark blue primary accent color
- Light/dark mode support via next-themes
