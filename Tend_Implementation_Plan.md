# Tend. — Implementation Plan

**An almanac for the home.**

This document is a complete build brief for Claude Code. Read it top to bottom once, then execute. Companion document: `Tend_Brand_Guidelines.md` (the design system). When in doubt about visual choices, the brand guidelines are authoritative.

---

## 0. The Pitch in One Paragraph

Tend. is a personal-use PWA that organizes household tasks the way a 19th-century almanac organized a farm: by season, weather, and rhythm. A user opens the app to a single "Now" feed showing what to do this week, conditioned by date, location, and weather. Tasks come from three sources: the user types them in, a pre-built **Lawn** module surfaces seasonal lawn care (Northern Utah, cool-season grass), and a **Garden** module surfaces planting and harvesting tasks for plants the user is growing. All three render in the same row format in the same feed — the module tag is the only visual cue to source. Two users (the founder and a friend), email + password auth, deployed on Vercel.

---

## 1. Tech Stack — Locked Choices

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15** (App Router, TypeScript, React 19) | What Evan already uses for PWAs |
| Styling | **Tailwind CSS v4** + CSS variables for the brand tokens | Tokens come from `Tend_Brand_Guidelines.md` Section 3.1 |
| Database | **Neon Postgres** via Vercel Marketplace | One-click install, credentials auto-injected. Postgres is right for the time/condition queries we need. |
| ORM | **Drizzle** | Light, type-safe SQL, plays nice with Neon's serverless driver |
| Auth | **Auth.js v5** (formerly NextAuth) with Credentials provider | Email + password, stores users in our own Neon DB via Drizzle adapter |
| Password hashing | **bcryptjs** | Standard, no native deps |
| Validation | **Zod** | Schema validation on every API route |
| Icons | **lucide-react** | Line-style, 1.5px stroke matches the woodcut aesthetic |
| Fonts | **EB Garamond** + **Lora** via `next/font/google` | Self-hosted, performant |
| PWA tooling | **@serwist/next** (modern next-pwa successor) | Service worker, manifest, install prompts |
| Push notifications | **web-push** library + VAPID keys | Standard Web Push, works on Chrome (all platforms) and Safari (iOS 16.4+ when installed to home screen) |
| Email | **Resend** | Simple API, free tier, React Email templates |
| Hosting | **Vercel** | Built for Next.js, free tier, Neon integration |
| Date math | **date-fns** | Tree-shakeable, immutable. Will be used heavily for season windows. |

**Pinned versions** (use these exact ranges to avoid surprises):
```json
{
  "next": "^15.0.0",
  "react": "^19.0.0",
  "typescript": "^5.7.0",
  "tailwindcss": "^4.0.0",
  "@neondatabase/serverless": "^1.0.0",
  "drizzle-orm": "^0.40.0",
  "drizzle-kit": "^0.30.0",
  "next-auth": "^5.0.0-beta.25",
  "@auth/drizzle-adapter": "^1.7.0",
  "bcryptjs": "^2.4.3",
  "zod": "^3.24.0",
  "lucide-react": "^0.460.0",
  "@serwist/next": "^9.0.0",
  "web-push": "^3.6.7",
  "resend": "^4.0.0",
  "date-fns": "^4.1.0"
}
```

---

## 2. Repository Setup

### Initial Commands

```bash
npx create-next-app@latest tend --typescript --tailwind --app --no-src-dir --turbopack
cd tend
npm install @neondatabase/serverless drizzle-orm next-auth@beta @auth/drizzle-adapter bcryptjs zod lucide-react @serwist/next web-push resend date-fns
npm install -D drizzle-kit @types/bcryptjs @types/web-push tsx
```

### Environment Variables

Create `.env.local`:

```
DATABASE_URL=                     # auto-injected by Vercel Neon integration
AUTH_SECRET=                      # generate via `npx auth secret`
AUTH_URL=http://localhost:3000    # for dev; Vercel auto-sets in prod
VAPID_PUBLIC_KEY=                 # generate via `npx web-push generate-vapid-keys`
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:evan@example.com
RESEND_API_KEY=                   # from resend.com dashboard
RESEND_FROM=Tend <notifications@yourdomain.com>
OPENWEATHERMAP_API_KEY=           # reuse from his lawn HTML
```

In Vercel dashboard, install the **Neon** integration from the Marketplace. It auto-injects `DATABASE_URL`. Set the rest as project env vars.

### Folder Structure

```
tend/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── sign-in/page.tsx
│   │   ├── sign-up/page.tsx
│   │   └── install/page.tsx      # post-signup install instructions
│   ├── (app)/
│   │   ├── now/page.tsx          # default landing — the main feed
│   │   ├── browse/page.tsx       # calendar scrubbing view
│   │   ├── projects/page.tsx
│   │   ├── modules/page.tsx
│   │   ├── modules/lawn/page.tsx
│   │   ├── modules/garden/page.tsx
│   │   └── settings/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── tasks/route.ts        # CRUD for user tasks
│   │   ├── tasks/[id]/route.ts
│   │   ├── modules/route.ts      # list, enable, disable
│   │   ├── completions/route.ts  # mark module tasks complete
│   │   ├── garden/plants/route.ts
│   │   ├── notifications/subscribe/route.ts
│   │   └── cron/notifications/route.ts  # called by Vercel Cron
│   ├── layout.tsx
│   └── manifest.ts               # PWA manifest
├── components/
│   ├── ui/                       # Button, Input, etc.
│   ├── task-row.tsx              # the hero component
│   ├── section-header.tsx
│   ├── fab.tsx
│   ├── bottom-nav.tsx
│   ├── quick-add-sheet.tsx
│   └── install-prompt.tsx
├── lib/
│   ├── db/
│   │   ├── schema.ts
│   │   ├── index.ts
│   │   └── queries.ts            # the Now-view union query etc.
│   ├── auth.ts                   # Auth.js config
│   ├── modules/
│   │   ├── lawn-utah.ts          # lawn task templates
│   │   └── garden.ts             # garden task templates
│   ├── lunar.ts                  # lunar event computation
│   ├── frost.ts                  # frost date lookup
│   ├── notifications/
│   │   ├── push.ts
│   │   └── email.ts
│   └── platform.ts               # iOS/Android/desktop detection
├── data/
│   ├── seed/
│   │   └── lunar-events-2026.json
│   └── frost-dates.json
├── drizzle/                      # migrations (generated)
├── public/
│   ├── icons/                    # PWA icons, ornamental SVGs
│   └── sw.js                     # generated by Serwist
└── styles/
    └── globals.css               # CSS vars from brand guidelines
```

---

## 3. Database Schema

Defined in `lib/db/schema.ts` using Drizzle. The model intentionally uses one `user_tasks` table with a `kind` discriminator and optional fields. Module content is stored centrally in `module_tasks` and references via `user_modules` and `user_module_completions`, so module updates flow to all users automatically.

```typescript
import { pgTable, serial, text, integer, timestamp, boolean, jsonb, pgEnum, primaryKey } from 'drizzle-orm/pg-core';

// === ENUMS ===
export const taskKindEnum = pgEnum('task_kind', [
  'recurring',    // every N days (cat litter)
  'seasonal',     // active in a window (fertilize, plant)
  'project',      // multi-session, has subtasks
  'quick',        // one-off short fix
  'longcycle',    // every N years (stain fence)
]);

export const taskStatusEnum = pgEnum('task_status', [
  'active',
  'pending',
  'done',
  'archived',
]);

// === AUTH TABLES (Auth.js v5 requirements with Drizzle adapter) ===
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  // Profile / preferences
  locationZip: text('location_zip').default('84003'), // Northern Utah default
  emailNotificationsEnabled: boolean('email_notifications_enabled').default(true),
  pushNotificationsEnabled: boolean('push_notifications_enabled').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
});

// === USER TASKS (user-entered, ad hoc) ===
export const userTasks = pgTable('user_tasks', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  kind: taskKindEnum('kind').notNull(),
  status: taskStatusEnum('status').notNull().default('active'),
  title: text('title').notNull(),
  content: text('content'),

  // For recurring + longcycle:
  cadenceDays: integer('cadence_days'),       // every N days
  cadenceYears: integer('cadence_years'),     // every N years (longcycle)
  lastCompletedAt: timestamp('last_completed_at'),
  nextDueAt: timestamp('next_due_at'),

  // For seasonal:
  windowStartMonth: integer('window_start_month'), // 1-12
  windowStartDay: integer('window_start_day'),     // 1-31
  windowEndMonth: integer('window_end_month'),
  windowEndDay: integer('window_end_day'),

  // For project:
  projectData: jsonb('project_data'),  // { subtasks: [], materials: [], targetCompletion: '...' }

  dueAt: timestamp('due_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// === MODULE SYSTEM ===
// Modules themselves are defined in code (lib/modules/*.ts), not in the DB.
// Only user-specific state is stored: which modules a user has enabled, and
// their completion record per (template-task, year).

export const userModules = pgTable('user_modules', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  moduleSlug: text('module_slug').notNull(),  // 'lawn-utah', 'garden', etc.
  enabled: boolean('enabled').notNull().default(true),
  enabledAt: timestamp('enabled_at').defaultNow().notNull(),
  customizations: jsonb('customizations'),  // future: per-user task overrides
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.moduleSlug] }),
}));

export const userModuleCompletions = pgTable('user_module_completions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  moduleSlug: text('module_slug').notNull(),
  taskSlug: text('task_slug').notNull(),       // identifies the template task
  year: integer('year').notNull(),              // since most module tasks recur annually
  completedAt: timestamp('completed_at').defaultNow().notNull(),
});

// === GARDEN-SPECIFIC ===
export const gardenPlants = pgTable('garden_plants', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  plantSlug: text('plant_slug').notNull(),    // 'tomato', 'cucumber', etc. matches lib/modules/garden plant catalog
  customName: text('custom_name'),             // 'Cherokee Purple' if user wants to specify variety
  count: integer('count').notNull().default(1),
  startedIndoorsAt: timestamp('started_indoors_at'),
  transplantedAt: timestamp('transplanted_at'),
  estimatedHarvestAt: timestamp('estimated_harvest_at'),
  archived: boolean('archived').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// === LUNAR EVENTS (precomputed) ===
export const lunarEvents = pgTable('lunar_events', {
  id: serial('id').primaryKey(),
  eventDate: timestamp('event_date').notNull(),
  eventType: text('event_type').notNull(),    // 'full_moon', 'blue_moon', 'blood_moon', 'lunar_eclipse', 'solar_eclipse'
  name: text('name').notNull(),                // 'Flower Moon', 'Strawberry Moon', etc.
  description: text('description'),
});

// === PUSH SUBSCRIPTIONS ===
export const pushSubscriptions = pgTable('push_subscriptions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  endpoint: text('endpoint').notNull().unique(),
  keys: jsonb('keys').notNull(),  // { p256dh, auth }
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// === NOTIFICATION LOG (for dedup) ===
export const notificationLog = pgTable('notification_log', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  channel: text('channel').notNull(),  // 'push', 'email'
  topic: text('topic').notNull(),       // e.g. 'frost-warning-2026-10-12', 'lunar-2026-05-23'
  sentAt: timestamp('sent_at').defaultNow().notNull(),
});
```

### Migrations

```bash
npx drizzle-kit generate    # creates migration files
npx drizzle-kit migrate     # applies them
```

`drizzle.config.ts`:
```typescript
import { defineConfig } from 'drizzle-kit';
export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
});
```

---

## 4. Auth Flow

Email + password using Auth.js v5 with the Credentials provider. The Drizzle adapter handles the user table.

### `lib/auth.ts`

```typescript
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: { strategy: 'jwt' },
  pages: { signIn: '/sign-in' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const user = await db.select().from(users).where(eq(users.email, parsed.data.email)).limit(1);
        if (!user[0]) return null;
        const valid = await bcrypt.compare(parsed.data.password, user[0].passwordHash);
        if (!valid) return null;
        return { id: user[0].id, email: user[0].email, name: user[0].name };
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => { if (user) token.id = user.id; return token; },
    session: ({ session, token }) => { if (session.user) session.user.id = token.id as string; return session; },
  },
});
```

### Sign-up flow

`POST /api/auth/sign-up` accepts `{ email, password, name }`, hashes the password, creates a user row, then redirects to `/install` (the install instructions page) before landing in the app.

### Middleware

`middleware.ts` protects all `(app)` routes. Unauthenticated requests redirect to `/sign-in`. The `(auth)` group is public.

---

## 5. Module System

The defining pattern of the app. Modules push pre-built tasks into the user's main feed without those tasks being copied per-user.

### Module Definition Shape

```typescript
// lib/modules/types.ts
export type ModuleTaskTemplate = {
  slug: string;                  // unique within module
  kind: 'recurring' | 'seasonal' | 'project' | 'quick' | 'longcycle';
  title: string;
  content: string;               // markdown allowed
  // For seasonal:
  windowStart?: { month: number; day: number };
  windowEnd?: { month: number; day: number };
  // For recurring:
  cadenceDays?: number;
  // Optional weather/condition gating:
  conditions?: {
    minSoilTemp?: number;
    maxNighttimeTemp?: number;
    afterLastFrost?: boolean;
    beforeFirstFrost?: boolean;
  };
};

export type Module = {
  slug: string;                  // 'lawn-utah', 'garden'
  name: string;
  description: string;
  region?: string;               // 'northern-utah' or null
  tasks: ModuleTaskTemplate[];
};
```

### Lawn (Northern Utah)

`lib/modules/lawn-utah.ts` contains the full lawn task set, ported from Evan's existing `Lawn_Schedule.html`. Tasks include:

- **March:** Spring cleanup rake, mower prep (sharpen blades, tune-up)
- **April:** Startup sprinklers, begin mowing, **early-spring fertilizer + crabgrass preventer** (seasonal, window 4/1–4/30), watering schedule, spot-treat early weeds, edging
- **May:** **Late-spring fertilizer** (seasonal, window 5/1–5/31), regular mow/water/weed/edge
- **June:** Late-spring fertilizer if not done, adjust watering for heat, monitor grubs/insects
- **July/August:** Focus on water (deep + infrequent), mow high, avoid midday heat
- **September:** **Early-fall fertilizer**, overseed bare patches, aerate if compacted
- **October:** **Winterizer fertilizer**, final mowing slightly shorter, blow out sprinklers before freeze
- **November–February:** Off-season; mower maintenance, plan for spring

Port the HTML content into structured templates. Each gets a slug, kind, window, and content body. The content body keeps the existing detail (rates, timing, "why this matters" notes).

### Garden

`lib/modules/garden.ts` contains a plant catalog (tomato, cucumber, onion, pepper, lettuce, spinach, carrot, beet, cilantro, etc., based on Evan's existing Garden Layout 2020) and task templates parameterized by what the user is actually growing.

Plant catalog shape:
```typescript
{
  slug: 'tomato',
  name: 'Tomato',
  startIndoorsWeeksBeforeFrost: 6,
  transplantAfterLastFrostDays: 14,
  daysToHarvest: 75,
  waterFrequencyDays: 3,
  tasks: [
    { slug: 'start-indoors', daysOffset: -42, title: 'Start tomato seeds indoors', ... },
    { slug: 'harden-off', daysOffset: 7, title: 'Begin hardening off tomatoes', ... },
    { slug: 'transplant', daysOffset: 14, title: 'Transplant tomatoes outside', ... },
    { slug: 'first-fertilize', daysOffset: 30, title: 'First fertilizer feeding', ... },
    // ...
  ],
}
```

When a user adds plants in the Garden module, the system computes concrete dates from their `locationZip` → last-frost date → applies `daysOffset`. Tasks surface in the Now feed at the right time.

### The Now-Feed Query

`lib/db/queries.ts` exposes `getNowFeed(userId, today = new Date())`:

```typescript
// Pseudocode
async function getNowFeed(userId: string, today = new Date()) {
  const user = await getUser(userId);
  const enabledModules = await getEnabledModules(userId);

  // 1. User-entered tasks: active and either no due date or due in next 14 days
  const userTasks = await db.select().from(userTasksTable)
    .where(and(
      eq(userTasksTable.userId, userId),
      eq(userTasksTable.status, 'active'),
      or(isNull(userTasksTable.dueAt), lte(userTasksTable.dueAt, addDays(today, 14))),
    ));

  // 2. Module tasks currently in their window, not completed this year
  const moduleTasks = [];
  for (const moduleSlug of enabledModules) {
    const module = await loadModule(moduleSlug); // from lib/modules/*.ts
    const completedThisYear = await getCompletions(userId, moduleSlug, today.getFullYear());

    for (const task of module.tasks) {
      if (isInWindow(today, task, user) && !completedThisYear.has(task.slug)) {
        moduleTasks.push({ ...task, source: moduleSlug, computedDueAt: ... });
      }
    }
  }

  // 3. Garden tasks computed from user's plants + frost dates
  const gardenTasks = await computeGardenTasks(userId, today);

  // 4. Lunar events in the next 7 days
  const lunar = await db.select().from(lunarEventsTable)
    .where(and(gte(lunarEventsTable.eventDate, today), lte(lunarEventsTable.eventDate, addDays(today, 7))));

  return mergeAndSort([...userTasks, ...moduleTasks, ...gardenTasks, ...lunar]);
}
```

### Section Groupings in the Now View

- **This Week** — anything in-window now or in next 7 days
- **Coming Up** — windows opening in days 8–30
- **Open Projects** — `kind = 'project'` with `status = 'active'`

---

## 6. PWA Setup

### Manifest — `app/manifest.ts`

```typescript
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tend.',
    short_name: 'Tend',
    description: 'An almanac for the home.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F2E8CF',
    theme_color: '#F2E8CF',
    orientation: 'portrait',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
```

### Service Worker via Serwist

Install `@serwist/next`, follow their Next.js App Router guide. The SW handles offline caching of the shell + push event delivery.

### Push Notification Subscription Flow

After the user lands in the app post-signup (or via settings), prompt them to enable push. Only do this on a direct user action (Apple requires it). The flow:

1. Check `Notification.permission`
2. If `'default'`, show a "Get reminders for frost warnings and seasonal tasks" UI with an "Enable" button
3. On click, call `Notification.requestPermission()`
4. If granted, call `navigator.serviceWorker.ready` → `registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: VAPID_PUBLIC_KEY })`
5. POST the subscription to `/api/notifications/subscribe` to persist

### iOS Caveat

On iOS, `pushManager.subscribe()` only works if the PWA was installed via Safari > Share > Add to Home Screen AND the app is currently running in standalone mode. Detect this:

```typescript
const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  || (window.navigator as any).standalone === true;
```

If iOS and not standalone, the push enable UI should redirect to the install instructions instead.

---

## 7. Install Onboarding (Post-Signup)

The `/install` page runs after sign-up. Uses `lib/platform.ts` to detect device:

```typescript
export function detectPlatform(userAgent: string, isStandalone: boolean) {
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
  const isChrome = /Chrome/.test(userAgent);
  return { isIOS, isAndroid, isSafari, isChrome, isStandalone };
}
```

### Four Branches on the Install Page

1. **Android Chrome / Edge / Brave** — Capture the `beforeinstallprompt` event and show a big primary "Install Tend." button that calls `prompt()`.
2. **iOS Safari** — Step-by-step illustrated guide:
   > 1. Tap the Share button (square with arrow) at the bottom of Safari.
   > 2. Scroll down and tap "Add to Home Screen."
   > 3. Tap "Add" in the top right.
   > 4. Open Tend. from your home screen to enable notifications.
   Each step accompanied by a small SVG illustration of the Safari UI.
3. **iOS Chrome/Firefox/etc.** — Friendly nudge: "To install Tend. on iPhone, you'll need to open this page in Safari. Apple only allows installation from Safari." Plus a copy-link button.
4. **Desktop** — If `beforeinstallprompt` fires (Chrome/Edge), show install button. Otherwise, "You can skip this step — Tend. works great in the browser too." with a Continue button.

Already-installed users (already standalone) skip this page entirely.

---

## 8. Notifications

Two parallel channels: web push (where supported) and email (always available as fallback). User can disable either in settings.

### Triggers

Run as a Vercel Cron job at 7am user-local time:

- **Frost warnings:** if forecast low ≤ 36°F in the next 48 hours during shoulder seasons (Apr/May, Sep/Oct)
- **Lunar events:** day-of notification for full moons, blue moons, eclipses
- **Active task reminders:** any module task that's been in-window for 7+ days without completion (configurable)
- **Project nudges:** any project with `status = 'active'` and no update in 30 days

### Cron Endpoint

`app/api/cron/notifications/route.ts` runs daily. Protected with `CRON_SECRET` header check. For each user:

1. Fetch their weather forecast (OpenWeatherMap)
2. Check frost-warning condition → send if true and not dedup'd
3. Check today's lunar events → send if any
4. Check for stale tasks/projects → send digest

Each notification logs a row in `notification_log` with a topic key to prevent double-sending.

### Vercel Cron Config

`vercel.json`:
```json
{ "crons": [{ "path": "/api/cron/notifications", "schedule": "0 14 * * *" }] }
```
(14:00 UTC = 7am MST. Adjust per user later if needed.)

### Email Templates

Use React Email for templates rendered server-side. Same parchment-and-forest aesthetic as the app. Components in `emails/`:
- `FrostWarning.tsx`
- `LunarEvent.tsx`
- `WeeklyDigest.tsx`

---

## 9. UI Implementation

The brand guidelines doc is authoritative for visual specs. Components must match the design preview exactly.

### CSS Variables (in `styles/globals.css`)

Copy the entire `:root` block from `Tend_Brand_Guidelines.md` Section 3.1.

### Fonts (in `app/layout.tsx`)

```typescript
import { EB_Garamond, Lora } from 'next/font/google';
const ebGaramond = EB_Garamond({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-display' });
const lora = Lora({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-body' });
```

Apply both variables to `<body>` and reference them in Tailwind config.

### Core Components

The implementer should build these in order (see Phase 2 below):

1. **`<Button>`** — primary, secondary, tertiary, destructive variants per brand guidelines 2.1
2. **`<TextInput>`** — per brand guidelines 2.5
3. **`<Checkbox>`** — 20px circle, the variant the task row uses
4. **`<TaskRow>`** — the hero component, per brand guidelines 2.2
5. **`<SectionHeader>`** — small caps overline with flourish, per 2.4
6. **`<ModuleTag>`** — colored dot + small caps text, per 2.7
7. **`<FAB>`** — 56px circle, **tinted forest shadow** (signature detail), per 2.1
8. **`<BottomNav>`** — 4 tabs per 2.6
9. **`<ProjectCard>`** — per 2.3
10. **`<QuickAddSheet>`** — bottom sheet for adding tasks, per 2.5 inputs

### The Now View

`app/(app)/now/page.tsx` is a server component that calls `getNowFeed(userId)`, groups results into "This Week" / "Coming Up" / "Open Projects" sections, and renders. Client interactivity (checkbox completion, swipe actions) is handled by client components inside.

---

## 10. Seed Data

### Lunar Events

Precompute full moons, supermoons, blue moons, blood moons, and eclipses for 2026–2030 from astronomical formulas (or pull from a static dataset like USNO's). Store in `data/seed/lunar-events.json` and seed on initial setup.

Sources:
- Full moons: predictable from `new Date(date).getUTCFullYear()` via known lunar synodic period (29.53059 days)
- Eclipses: use NASA's eclipse predictions (publicly available CSV)

Provide a `npm run seed:lunar` script that runs `tsx scripts/seed-lunar.ts`.

### Frost Dates

`data/frost-dates.json` keyed by zip code, with `lastSpringFrost` (mean date) and `firstFallFrost` (mean date). Seed from NOAA / USDA tables. Northern Utah zip 84003 = approximately 5/15 last spring, 10/10 first fall.

### Demo User (optional)

For development, a seed script that creates a demo user with the lawn module enabled, garden module enabled with the plants from Evan's old Garden Layout (Salsa Garden + Veggie Garden), and a sprinkling of user-entered tasks from the Weekend House Chores Todoist screenshot.

---

## 11. Build Phases (Parallelizable)

Sub-agents can fan out at each phase. Items in the same phase under different tracks can run concurrently. Items in the same track are sequential.

### Phase 1 — Foundation (sequential, must complete first)
- Project init (Next.js, deps, Tailwind, fonts)
- Drizzle setup + initial migration
- CSS variable system from brand guidelines
- Auth.js skeleton + middleware
- Vercel + Neon deployment confirmed working

### Phase 2 — Parallel Tracks
- **Track A — Auth UI:** sign-up, sign-in, sign-out flows + the `/install` page with platform detection
- **Track B — Core Component Library:** `<Button>`, `<TextInput>`, `<Checkbox>`, `<TaskRow>`, `<SectionHeader>`, `<ModuleTag>`, `<FAB>`, `<BottomNav>`, `<ProjectCard>`, `<QuickAddSheet>`
- **Track C — PWA Plumbing:** Serwist setup, manifest, service worker, push subscription endpoint

### Phase 3 — Parallel Tracks (depends on Phase 2)
- **Track A — User Tasks CRUD:** API routes (`POST /api/tasks`, `GET`, `PATCH`, `DELETE`), task list UI, quick-add sheet wiring
- **Track B — Module System Core:** module loader, `lib/modules/lawn-utah.ts` populated with full content from `Lawn_Schedule.html`, enable/disable API, completion API
- **Track C — Lunar Events Module:** computation script, seed data, integration into Now feed
- **Track D — Garden Module Stub:** plant catalog (`lib/modules/garden.ts`), garden plants CRUD API, basic Garden page

### Phase 4 — Now View (depends on Phase 3)
- **Track A:** `getNowFeed` query in `lib/db/queries.ts` unioning user tasks + module tasks + garden tasks + lunar events
- **Track B:** Now page server component, section grouping, task completion interactions
- **Track C:** Top bar (date + wordmark) and the section header flourishes

### Phase 5 — Parallel Tracks (depends on Phase 4)
- **Track A — Projects view:** project list, project detail with subtasks, materials JSON UI
- **Track B — Browse view:** scrubbable month-by-month calendar with upcoming tasks per month
- **Track C — Module detail screens:** Lawn detail (the restructured `Lawn_Schedule.html`), Garden detail (plants list + add plant flow)

### Phase 6 — Notifications (depends on Phase 5)
- **Track A — Push:** VAPID keys generated, subscribe endpoint wired, send-push helper, test push delivery
- **Track B — Email:** Resend integration, React Email templates (FrostWarning, LunarEvent, WeeklyDigest), test email delivery
- **Track C — Cron:** daily cron endpoint, weather fetching, frost-warning logic, dedup via notification log

### Phase 7 — Polish
- Empty states for Now / Browse / Projects / Modules
- Settings page (notifications on/off, module enable/disable, account)
- Onboarding tooltips on first load
- 404 / error pages
- Lighthouse pass, accessibility audit

---

## 12. Out of Scope for v1

These are explicitly v1.5 or later:

- **AI features** (natural language task entry, weekly briefing, "ask Tend." chat) — deferred per the planning conversation
- **Garden plot layout / spatial drag-and-drop view** — Google Sheets is good enough for now
- **Chicken module** — wait for friend confirmation
- **Additional regional Lawn modules** — Northern Utah only in v1
- **Dark mode** — light/parchment only. If we ever do dark, design a "midnight ledger" theme from scratch, not an inversion
- **Multi-region frost dates** — single zip per user, expand later
- **Soil temperature data** — out of scope; calendar windows are good enough for v1
- **Team sharing / collaboration** — single-user accounts, no shared lists
- **Mobile native apps** — PWA only. No App Store, no Play Store

---

## 13. The Three Signature Details — Don't Drop These

(Restated from brand guidelines; critical enough to repeat.)

1. **Tinted forest-green FAB shadow** — `box-shadow: 0 4px 14px rgba(45, 82, 53, 0.32)`. Never black.
2. **Bordeaux period in the "Tend." wordmark** — `.period { color: var(--bordeaux); }` everywhere the mark appears.
3. **Full-serif typography on a phone** — EB Garamond + Lora. No sans-serif anywhere in the app UI. (Icons are SVG, so they don't count.)

---

## 14. Initial Demo Data for the Founder

After deploying, run the seed script to create Evan's account with:

- **Lawn module enabled** (Northern Utah)
- **Garden module enabled** with these plants from his 2020 Garden Layout:
  - Tomato (8), Onion (4), Green Onion (9), Bell Pepper (2), Serano Pepper (1), Cilantro (4)
  - Romaine (6), Beets (9), Potato (4), Peas (18), Carrot (32), Cucumber (8), Spinach (36)
- **User-entered tasks** from Weekend House Chores:
  - Project: Stain back fence
  - Project: Touch up paint in bonus room
  - Project: Plant trees and bushes in front
  - Project: Downstairs floor trim threshold
  - Quick: Fix Lincoln's bathroom door handle
  - Quick: Shed molding
  - Quick: Addyson's bathroom lights
  - Quick: Weed/spray driveway
  - Quick: Fix lawn at bottom of deck stairs
  - Recurring: Cat litter (every 5 days)

---

## 15. Definition of Done for v1

Tend. is shippable when:

- [ ] Evan and his friend can each create accounts and sign in
- [ ] Both can install Tend. to their phones (with platform-correct instructions)
- [ ] Both receive push notifications (or email, on browsers that don't support push)
- [ ] The Now view shows lawn tasks at the right times of year for Northern Utah
- [ ] The Now view shows garden tasks based on user's planted crops + frost dates
- [ ] Tasks can be added, completed, edited, and deleted
- [ ] Projects can be created with subtasks and a materials list
- [ ] The Lawn module detail screen replaces the existing `Lawn_Schedule.html`
- [ ] Frost warnings fire correctly when overnight lows ≤ 36°F in shoulder seasons
- [ ] Lunar events appear in the Now view and trigger day-of notifications
- [ ] The app feels like the brand guidelines and design preview promised

---

**Hand this file to Claude Code along with `Tend_Brand_Guidelines.md` and the design preview HTML. The three together are the complete brief.**

**An almanac for the home.**
