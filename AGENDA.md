# AGENDA — Tend.

The forward-only agenda: what's next, plus the *why* behind each item. A rising priority column — work enters at the bottom and rises as it earns priority until it gets done, then it's deleted. **Not a log.** Never write "last session we…" here; that's the compression note's job.

Read top to bottom = hottest to coldest. Method lives in the `/agenda` skill.

---

## ACTIVE  *(limit 1)*
*The one thing in the light right now.*

- **Projects don't surface on the Now page.** A project with a due date shows on the Tasks page under Project Tasks but never appears in the Now page's "This Week" / "Coming Up." *Why:* the Now page is the primary interface — if dated work doesn't surface there, users can't trust the app. `getNowFeed` likely buckets projects into a separate "Open Projects" section instead of by `dueAt`. Projects with a `dueAt` should appear in This Week / Coming Up like tasks. Also: project detail view is bare (title + edit/complete only) — should show due date, subtasks, notes.

## UP NEXT  *(limit 3 total — WAITING is one of the 3 when blocked, not extra)*
*The next few, ordered. 2 work slots + 1 WAITING when something's blocked; 3 work slots when nothing is. The bottleneck is deliberate — it keeps blocked work in view.*

1. **Mid-season catch-up during onboarding (priority).** When a new user enables a module mid-season, tasks whose windows recently closed are invisible (e.g. "start up sprinklers," Apr 1–30, never appears for a May 16 signup). *Why:* new users silently miss work the season already opened. Add a setup-wizard step after module selection: for each enabled module, query tasks from the last ~30 days (`isInWindow` lookback) as a checklist; checked items create active user tasks, unchecked are implicitly done. One-shot onboarding step, not ongoing. Touches `app/(onboarding)/setup/page.tsx`, module task queries, likely a new bulk-create endpoint.
2. **Tasks page sorting + sort toggle.** Tasks render in random order; sort by due date ascending within each section. Add a "By Category" vs "By Date" toggle (By Date = flat chronological, all kinds mixed, inline colored dot + kind label); default to By Date. *Why:* random order makes the list untrustworthy and By Date matches how most people think.
3. **Header layout rebalance.** Move date + season (day, month/day, 🌿 Spring) to the LEFT under the "Tend." wordmark; keep weather + lunar on the RIGHT. *Why:* everything is crammed right now, lopsided on mobile — this distributes visual weight.

### WAITING  *(third-party asks only — pinned, never rises)*
*Blocked on someone else. Each carries: who · last **sent** ask (date + ref) · last nudge. Gated work nests under its blocker as `↳ gated:`.*

- *(none — no work is blocked on a third party)*

## FOR SURE  *(committed, not scheduled — unordered)*
*Projects are headers with indented action bullets. Take one slice at a time.*

- **Recurring tasks (no UI yet).** Schema already supports `cadenceDays`/`cadenceYears` on `userTasks` and a `recurring` kind in the enum, but nothing sets recurrence. *Why:* recurrence is a core almanac concept that's silently unreachable.
    - Recurrence picker (daily / weekly / every N days / yearly) in the FAB create flow
    - Same picker in the edit sheet
    - Logic to auto-generate the next occurrence after a recurring task is completed
- **Task/project creation UX.** Add a "Notes" field to task create + edit (FAB quick-add + edit sheet). When "Kind" switches to "project," change the form/sheet title from "Task" to "Project." *Why:* notes are missing and the mislabeled title is confusing mid-create.
- **Weather goes stale without a hard refresh.** Weather is server-rendered in the app layout (runs once on load); client-side tab navigation reuses the layout so it never updates. Refactor weather into a client fetch in TopBar with periodic polling (every 5–10 min via `useEffect` interval) hitting `/api/weather`. *Why:* also fixes new users not seeing weather until a force-refresh after onboarding sets their ZIP.
- **Garden page: can't add new plants.** PlantPicker button/modal exists but the add flow may not complete. *Why:* a visibly broken core action in the Garden module.
- **Notification opt-in: real-device PWA testing.** Push opt-in works in the flow but the permission prompt is untested end-to-end from an installed standalone PWA. *Why:* iOS only allows push from standalone, so the in-browser path proves nothing.
- **Weekend briefing cron: verify in production.** The Friday 5 PM MST briefing cron is untested live (first fire next Friday). *Why:* the whole notification strategy now rides on this single cron.
- **Onboarding doesn't pre-populate ZIP from signup.** User must re-enter ZIP manually in setup. *Why:* avoidable friction in the first-run flow.
- **Harden auth against orphaned sessions.** A persisted JWT can point at a user id that no longer exists in the DB (e.g. after a reseed), yet still passes auth — so every FK-constrained write (task create, etc.) 500s with no clue, looking like an app bug. The auth layer should validate the session user still exists and force re-login if not. *Why:* surfaced during the projects-on-Now work — a stale dev login silently broke all task creation. (Day-to-day fix is just signing out/in; this is the durable guard.)

## IDEAS  *(maybe / someday)*

- **Multi-region content engine (big vision).** Make modules location-aware (USDA zone / climate / ZIP) and database-backed instead of code-defined for Northern Utah. Includes a grass-type module (cool- vs warm-season) and full regional garden calendars extending the existing frost-date-by-ZIP data.
- **AI features (freemium model).** Photo-based plant/lawn health analysis (disease, deficiency, pests → treatment) as the premium upgrade path; natural-language task entry, weekly briefing, "ask Tend." chat.
- **Dashboard / almanac redesign.** Now page becomes "today's almanac page" with weather + at-a-glance summary. Parked — current Now feed works.
- **Garden plot layout / spatial drag-and-drop view.**
- **Chicken module** (waiting on a friend's confirmation).
- **Dark mode** — a "midnight ledger" theme designed from scratch (parchment is the default brand).
- **Task completion celebration** — confetti / animation / dopamine hit.
- **Swipe gestures on task rows** — nice-to-have.
- **Email notifications via Resend** — intentionally skipped in v1; push is primary.
