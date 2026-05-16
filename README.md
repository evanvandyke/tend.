# Tend.

**An almanac for the home.**

Tend. is a personal almanac for the household. It treats your home, lawn, and garden the way a 19th-century almanac treated a farm — as something with seasons, rhythms, and conditions you orient yourself to.

The app feels like a well-made book you check at the start of every week. Calm, textured, intentional.

## What It Does

- **Now** — your weekly feed of tasks, pulled from modules and manual entries
- **Browse** — scrub through the calendar year
- **Projects** — multi-session work with time estimates
- **Modules** — pluggable content engines (Lawn, Garden, and more to come)

Modules surface tasks into the main feed. The user rarely opens a module directly — the default experience is reading the feed and tapping in for deeper context when needed.

## Design

Tend. is built on a vintage almanac aesthetic: parchment backgrounds, deep botanical greens, oxblood accents, and serif typography throughout. No sans-serif anywhere. No dark mode (the parchment *is* the brand).

Three signature details:
1. **Tinted forest-green FAB shadow** — `box-shadow: 0 4px 14px rgba(45, 82, 53, 0.32)`
2. **The Bordeaux period** — the "." in "Tend." is always rendered in `#7A2E1F`
3. **Full-serif on mobile** — EB Garamond for display, Lora for body

## Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS + CSS custom properties
- **Typography:** EB Garamond + Lora (Google Fonts via `next/font`)
- **Icons:** Lucide React (1.5px stroke)
- **Backend:** Supabase (auth, database, real-time)
- **Deployment:** Vercel

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## License

MIT
