# What's Next
*The one file to check. Updated at the end of every session.*
*Last updated: 2026-05-16 (Session 3)*

## Session 3 — Onboarding + Notifications + Favicon (2026-05-16)

Third session, run in parallel with Session 2's tail end. Focused on new-user experience and notification strategy.

**What got done:**
- Install page rework — warm copy replacing dev jargon, platform-specific steps (iOS Safari vs iOS Chrome vs other), "I'll do this later" skip
- Platform detection fix — CriOS/FxiOS/OPiOS/EdgiOS now correctly identified as non-Safari on iOS
- Onboarding setup wizard (`/setup`) — 4-step flow: ZIP code → module toggles → notification opt-in → app concept overview
- Onboarding gate — `onboardingComplete` column on users table, new users redirected to /setup until complete
- Smart notification step — only shows when running as installed PWA (skipped in browser since iOS requires standalone for push)
- Friday weekend briefing — replaced daily multi-notification cron with single Friday 5 PM MST summary (tasks, Saturday weather, lunar events)
- Settings notification label updated to "Weekend Briefing"
- Route restructuring — moved install page from `(auth)` to `(onboarding)` route group to fix authenticated-user redirect bug
- New favicon — botanical T monogram (serif T with leaf sprig), moved from app/ to public/ for proper Vercel serving
- PWA manifest `short_name` fixed to include period ("Tend.")

**Known issues for next session:**
- **Mid-season catch-up during onboarding (priority):** When a new user enables a module mid-season, tasks whose windows recently closed are invisible. E.g., "start up sprinklers" (Apr 1–30) doesn't appear for a user who signs up May 16. **Solution:** Add a new step to the setup wizard AFTER module selection (step 2). For each enabled module, show tasks from the last 30 days whose windows have closed or are currently open. Present as a checklist — user checks which tasks they still need to do, those get added to their active tasks. Unchecked ones are implicitly "already done" or "not needed." This is a one-shot onboarding step, not an ongoing feature. Implementation: query each enabled module's tasks via `isInWindow` with a 30-day lookback, display as a multi-select list in the wizard, checked items create user task entries. Touches setup wizard (`app/(onboarding)/setup/page.tsx`), module task queries, and may need a new API endpoint to bulk-create catch-up tasks.
- **Task/project creation UX:** Add a "Notes" field to task creation and edit forms (FAB quick-add + edit sheet). Also, when "Kind" is switched to "project" in the creation form, the form title should change from "Task" to "Project" to match context. Same applies to the edit sheet.
- **Recurring tasks:** No UI to create or configure recurring tasks. The schema supports `cadenceDays`/`cadenceYears` on `userTasks`, and the `recurring` kind exists in the enum, but there's no way to set recurrence from the FAB or edit sheet. Need: recurrence picker (daily, weekly, every N days, yearly) in both create and edit flows, and logic to auto-generate the next occurrence after completion.
- Garden page: still can't add new plants
- Notification opt-in needs real-device PWA testing (works in flow, but push permission prompt untested end-to-end from standalone)
- Weekend briefing cron untested in production (first fire: next Friday)
- Onboarding doesn't pre-populate default ZIP from signup (user must enter manually)

---

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
