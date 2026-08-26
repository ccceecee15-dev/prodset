# Retail Planning & Analytics Dashboard (MerchX)

## Overview

A full-stack retail planning and analytics dashboard for WHSmith. Provides comprehensive tools for managing sales, margin planning, inventory tracking, and stock allocation. Features a modern glassmorphism UI with a dark blue accent color theme.

## Project Layout

The actual project lives inside `sip5/sip4/`:

```
sip5/sip4/
  client/       # React + Vite frontend
  server/       # Express backend (TypeScript)
  shared/       # Shared Zod schemas/types
  dist/         # Production build output
```

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Radix UI, TanStack Query, Wouter (routing), Recharts
- **Backend**: Express.js, TypeScript, Drizzle ORM (PostgreSQL/Neon), Passport.js
- **Build**: Vite (frontend), esbuild (server), tsx (dev server)
- **Package Manager**: npm

## Running Locally

```bash
cd sip5/sip4
npm install
npm run dev          # Full-stack dev server on port 5000
```

The dev server runs at port 5000 and serves both the API and Vite-powered frontend.

## Deployment

- **Build**: `cd sip5/sip4 && npm run build`
- **Start**: `cd sip5/sip4 && npm run start`
- Deployment target: autoscale

## Key Features

- OTB (Open to Buy) Planning
- Commercial Planning (pricing/promotions)
- Inventory & Sales Analysis (closing stock, availability, metrics)
- SIP Module (Strategic Inventory Planning): Allocation, Vendor View, Rules
- RAP Module (Retail Assortment Planning): Store Grading, Style Exceptions, Facings
- Reports: Sales/Margin reports with filters
