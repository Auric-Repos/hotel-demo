# Auric Hotel Demo: Agent Rules

Bilingual (Arabic RTL / English) hotel website plus staff dashboard. Multi-tenant by design.
These rules apply to every task. Follow them strictly.

## Stack (do not change without asking)
- Next.js App Router, TypeScript strict, Tailwind v4, shadcn/ui
- Clerk (@clerk/nextjs) for auth, next-intl for i18n, react-hook-form + zod for forms
- Neon Postgres + Drizzle ORM (@neondatabase/serverless). No separate backend: server
  actions and route handlers only. (.NET was dropped.)
- lucide-react icons, date-fns for dates

## Safety
1. Never open, print, edit or commit .env* files. To check that a variable exists, print
   true/false only, never the value.
2. Never upgrade or remove dependencies. Adding one needs a one-line reason first.
3. Read a file before editing it. Make minimal edits. Do not overwrite working files from
   earlier phases unless the task says so.
4. Middleware file: proxy.ts (Next 16+) or middleware.ts (Next 15 and below). Never both.
5. For Clerk, next-intl, Drizzle and Neon, follow the current official docs, not memory.
   If unsure of an API, say so.
6. Never run destructive DB commands (drop, truncate, reset), except the seed script, and
   only against the demo tenant.
7. Work one phase at a time. Finish, report, then STOP and wait for "go".
8.Never run cloud-provisioning CLIs (neon, vercel) or change global tool config (~/.gemini, MCP) without asking me.

## Speed rules
- After each step run `npx tsc --noEmit` and lint on changed files.
  Run `npm run build` only ONCE, at the end of a phase.
- No browser or screenshot testing unless asked. No exploratory refactors. No extra docs.
- If a step fails twice, stop and report instead of trying a third approach.
- Keep reports under 25 lines.

## Architecture rules
- DB access is server-only. The db client lives in src/server/db/ and imports "server-only".
  Pages and components never import db directly. They call functions in src/server/queries/
  and src/server/actions/.
- Multi-tenancy: every table has tenant_id. Every query function takes tenantId as a
  required argument and filters on it. Never query without a tenant filter (except the
  tenants lookup itself).
- The tenant comes from getCurrentTenant() in src/lib/tenant.ts, never from client input.
- Staff actions call requireStaff() first. Public actions validate with zod and never trust
  client-sent prices, status, or tenant.
- Prices are computed server-side. Money is integer USD cents. Dates are Postgres `date`.
  "Today" is computed in Africa/Cairo.
- Entity types come from Drizzle (InferSelectModel). No duplicate hand-written entity types.

## Code standards
- No `any`. Server Components by default; add "use client" only when needed.
- Zod schemas for every external input, in src/lib/schemas/.
- No hardcoded UI text. Strings go in messages/en.json and messages/ar.json (always both).
- RTL-safe logical utilities only (ms-*, me-*, ps-*, pe-*, text-start, text-end, start-*,
  end-*). Never ml-*, mr-*, pl-*, pr-*, text-left, text-right, left-*, right-*.
- Use Link/redirect from src/i18n/navigation for locale-aware navigation.
- Accessible: semantic HTML, alt text, labels, visible focus states.

## Brand
Premium, calm, minimal. charcoal #23211f, ink #161513, gold #b8975a, soft gold #f1e8d6,
sand #fbf8f2. Serif headings, clean sans body, generous white space.
No gradients, emoji, or hype-style copy.

## Report format after each phase
Files created/edited, commands run and results, anything skipped or uncertain,
and how I can test it manually.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
