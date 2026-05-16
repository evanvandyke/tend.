# What's Next
*The one file to check. Updated at the end of every session.*
*Last updated: 2026-05-16 (Session 2)*

## Session 2 — Core UX Polish + Feature Buildout (2026-05-16)

Second session. Built on the v1 foundation from Session 1 (full PWA deployed to Vercel in 1.5 hours). This session focused on making the app actually usable day-to-day.

**What got done:**
- Task completion overhaul — fixed broken API calls, added optimistic completion with 3.5s inline undo, strikethrough animation, "Done Today" section
- "Skip This Year" for routine tasks — schema migration, action sheet (Mark Done / Skip / View Routine)
- Renamed "Modules" → "Routines" throughout (nav, pages, settings)
- Renamed "Browse" → "Tasks" with proper /tasks route — filterable task list (All/Active/Completed), dynamic source sub-filters from enabled modules, collapsible sections
- Task edit sheet — tap any user task to edit title, due date, kind, or delete
- Garden module redesign — card-based plant management with next-action badges, inline expandable task timeline with completion checkboxes
- Persistent header — TopBar moved to app layout, sticky, consistent across all pages
- Weather integration — current temp + tomorrow's forecast in header via OpenWeatherMap (5-min cache, ZIP-specific)
- Lunar event — always shows next upcoming event with date in header
- Settings — editable name and ZIP code (affects frost date calculations)
- Desktop polish — 720px max-width, constrained sheets/nav/FAB
- Mobile polish — bottom nav padding for iPhone rounded corners + home indicator
- Favicon — T. mark (Forest green T, Bordeaux period, Parchment background)
- Push notifications — confirmed working on mobile (iOS)
- Various fixes: Bordeaux → Forest on push button, garden overdue semantics, project card subtask counts, inline undo (was floating toast covered by FAB)

**Deliberately parked:**
- Dashboard/almanac redesign — the big vision piece where Now becomes "today's almanac page" with weather, at-a-glance summary. Not urgent, the current Now feed works.
- Push notification debugging on mobile — desktop Chrome can't do push without PWA install. Needs mobile testing.
- Swipe gestures on task rows — nice-to-have, not blocking usability
- Email notifications via Resend — intentionally skipped in v1, push is primary

**Known issues for next session:**
- Garden page: can't add new plants (PlantPicker button/modal exists but add flow may not complete properly)
- Routine tasks on Tasks page: dates show but need verification of accuracy
- Another session is building an onboarding sequence — may see new commits from that work
- Push notification content/timing needs real-world verification (cron runs 7am MST daily)

---

## Architecture (reference)

- **Stack:** Next.js 16.2.6, App Router, TypeScript, Tailwind v4, Neon Postgres, Drizzle ORM, Auth.js v5
- **Deploy:** Vercel (auto-deploys from main), live at https://tend-nu-coral.vercel.app/
- **Auth:** Credentials provider, JWT sessions, layout-based auth checks (not middleware — Next.js 16 deprecated it)
- **Service worker:** Hand-written `public/sw.js` (Serwist wrapper removed due to Edge Runtime `__dirname` errors)
- **Frost dates:** `data/frost-dates.json` keyed by ZIP → `lib/frost.ts` → garden task date computation
- **Module system:** Code-defined task templates (`lib/modules/lawn-utah.ts`, `lib/modules/garden.ts`), user state in DB (`user_modules`, `user_module_completions`)
- **Brand:** All serif (EB Garamond + Lora), parchment aesthetic, three signature details (tinted FAB shadow, Bordeaux period, full serif on mobile)

---

## Recurring Schedule

**End of every session:**
- Update NOW.md with what was completed and what's next
- Commit and push
- Run `/wrap` if available

---

## Future Ideas (backlog)

- AI features: natural language task entry, weekly briefing, "ask Tend." chat
- Garden plot layout / spatial drag-and-drop view
- Chicken module (waiting for friend confirmation)
- Dark mode ("midnight ledger" theme, designed from scratch)
- Multi-region frost dates / soil temperature data
- Task completion celebration — confetti, animation, dopamine hit
