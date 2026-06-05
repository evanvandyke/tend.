# Tend. — Session Instructions

Partnership principles live in `~/.claude/CLAUDE.md` (already loaded every session). This file is project-specific only. It loads every session and stays in context the whole time, so keep it lean: orientation and pointers, never a state log.

## At session start, read in order
1. `AGENDA.md` (project root) — what's next, and why.
2. `MEMORY.md` + `feedback.md` — long-term context and earned rules. **These live in this project's harness memory safe-dir, NOT the project root:** `~/.claude/projects/-Users-evanvandyke-Documents-Code-Projects-tend-/memory/`. (The harness also surfaces project memory in context at session start.)
3. The canonical docs below.

Prove you read them by summarizing their current state in your first response. If you can't summarize it, you didn't read it — go read it before doing anything else.

## Canonical docs (this project's source of truth)
The handful of documents that are authoritative for this project — the ones a fresh session reads to get up to speed, and where durable facts live instead of memory. Architecture, decisions, and specs live in these docs (and the code), not in this file.

- `README.md` — what Tend. is (an almanac for the home) + the design ethos.
- `Tend_Brand_Guidelines.md` — **the** design system: colors, typography, components, spacing, shadows, accessibility. Non-negotiable; any UI work follows it.
- `Tend_Implementation_Plan.md` — the build plan / spec.
- `Docs_Design/` — design assets (icon, favicon). `tend_design_preview.html` — rendered design preview.
- Key source: `app/` (App Router routes incl. `(onboarding)/setup`), `lib/modules/` (code-defined task templates), `lib/frost.ts` + `data/frost-dates.json` (ZIP→frost dates), `lib/`/`drizzle/` (Drizzle schema), `public/sw.js` (hand-written service worker).
- `Docs_Compressions/` — per-session compression notes (session history lives here, not in the agenda).

## Project overview
Tend. is a personal household almanac PWA — lawn care, garden planning, and task management framed as seasons, rhythms, and conditions you orient to weekly. Stack: Next.js 16 (App Router), TypeScript, Tailwind v4, Neon Postgres + Drizzle ORM, Auth.js v5 (credentials + JWT), deployed on Vercel (auto-deploy from `main`). All-serif parchment aesthetic, no dark mode.

## Tend. is not what you'd assume
- **Data layer is Neon Postgres + Drizzle ORM + Auth.js v5, not Supabase.** The README still says Supabase from the original plan; the code (`package.json`, `drizzle.config.ts`, `lib/`) is the truth — `@neondatabase/serverless`, `drizzle-orm`, `@auth/drizzle-adapter`, `next-auth` v5 beta. Trust the code.
- **Auth is layout-based, not middleware.** Next.js 16 deprecated middleware auth, so checks live in layouts.
- **Service worker is hand-written (`public/sw.js`), not Serwist-generated.** The Serwist wrapper was removed due to Edge Runtime `__dirname` errors.

---
Need a section beyond these? The canonical menu of project sections, each with its purpose, is `~/.claude/project-template/CLAUDE-SECTIONS.md`. Add only what fits; keep this file lean.
