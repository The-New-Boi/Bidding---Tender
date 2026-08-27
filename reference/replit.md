# Bid Compliance Copilot

An AI-assisted CPCL procurement workspace for verifying bidder compliance, surfacing risk, and preserving audit-ready evidence.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/bid-compliance run dev` — run the React dashboard
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- The managed artifact workflows provide `PORT` and `BASE_PATH`; direct Vite builds need both values.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- Demo data: deterministic in-memory repository with a clear route/data boundary for a later SQLite or PostgreSQL adapter
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for dashboard, bidder, verification, activity, and export contracts
- `artifacts/api-server/src/routes/compliance-data.ts` — deterministic 200-record demo register and check model
- `artifacts/api-server/src/routes/compliance.ts` — compliance API routes and response validation
- `artifacts/bid-compliance/src/App.tsx` — dashboard, bidder register, bidder evidence, and audit activity screens
- `artifacts/bid-compliance/src/index.css` — CPCL/refinery command-center theme

## Architecture decisions

- Demo-mode compliance checks are deterministic so a hackathon presentation is repeatable; the API response labels the AI provider as demo mode rather than claiming a live government connection.
- The OpenAPI contract is generated into both the React Query client and server-side Zod schemas; update the spec before changing endpoint shapes.
- PAN and GSTIN values are masked in list/detail summaries while the evidence response retains the source value for the compliance review surface.

## Product

Procurement officers can review 200 synthetic bidders, filter by risk and status, open evidence-level checks, inspect AI gap explanations and recommendations, run a verification batch, review source health and audit activity, and export a CSV report.

## User preferences

No additional standing preferences recorded.

## Gotchas

- After changing `lib/api-spec/openapi.yaml`, run `pnpm --filter @workspace/api-spec run codegen` before typechecking the API or frontend.
- Use the managed artifact workflow rather than starting Vite without `PORT` and `BASE_PATH`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
