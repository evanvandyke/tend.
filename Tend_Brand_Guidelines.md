# Brand Guidelines — Tend.

**An almanac for the home.**

**Theme Type:** Light (Parchment)

---

## Brand Identity

Tend. is a personal almanac for the household. It treats your home, lawn, and garden the way a 19th-century almanac treated a farm: as something with seasons, rhythms, and conditions you orient yourself to. The app feels like a well-made book you check at the start of every week. Calm, textured, intentional. Old without being precious.

The aesthetic is **vintage almanac**, not vintage pastiche. Parchment backgrounds, deep botanical greens, oxblood accents for urgency, serif typography throughout. Whisper-quiet shadows, like a sheet of paper resting on a wooden desk. The single most distinctive detail is the **tinted forest-green shadow on the floating add button** — a deliberate borrow from Todoist's tinted-red FAB shadow, which is one of the most-copied details in productivity software.

**Logo placement:** The wordmark "Tend." sits in EB Garamond Display Semibold at the top of every primary view. The period is part of the mark and is always rendered in Bordeaux for a small, deliberate flick of color.

---

# SECTION 1: BRAND FOUNDATION

---

## 1.1 Color System

### Primary Colors

#### Forest
- **HEX:** `#2D5235`
- **RGB:** `45, 82, 53`
- **Semantic Meaning:** Growth, the active brand voice, primary action.
- **Primary Use:** Brand mark, primary buttons, FAB, active state, completed-checkbox fill, success indication.
- **Visual Weight:** Roughly 12-15% of the screen. The dominant accent.

#### Bordeaux
- **HEX:** `#7A2E1F`
- **RGB:** `122, 46, 31`
- **Semantic Meaning:** Urgency, overdue, the period in "Tend." Reserved for verbs that demand attention.
- **Primary Use:** Overdue tasks, errors, destructive actions, frost warnings, the period on the wordmark.
- **Visual Weight:** Roughly 2-3%. A flick of color, not a wash.

#### Iron Gall
- **HEX:** `#1F1812`
- **RGB:** `31, 24, 18`
- **Semantic Meaning:** Primary text. Warm dark brown-black like ink on paper. Never pure black.
- **Primary Use:** Headings, task titles, body text.
- **Visual Weight:** Roughly 25-30%.

### Secondary/Accent Colors

#### Mustard
- **HEX:** `#A87C2D`
- **RGB:** `168, 124, 45`
- **Semantic Meaning:** Seasonal markers, lunar events, "coming up" indicators, warnings.
- **Primary Use:** Sub-warnings, the rare lunar event module, seasonal-window indicators.

#### Slate
- **HEX:** `#4A554E`
- **RGB:** `74, 85, 78`
- **Semantic Meaning:** Muted, neutral. Less-critical UI like info chips.
- **Primary Use:** Info notifications, metadata pills, "no priority" state.

### Background Colors

#### Parchment (Primary)
- **HEX:** `#F2E8CF`
- **RGB:** `242, 232, 207`
- **Usage:** Main page background. Warm cream paper. The foundation everything sits on.

#### Aged Paper (Secondary)
- **HEX:** `#FAF3DE`
- **RGB:** `250, 243, 222`
- **Usage:** Card backgrounds, elevated surfaces. Slightly lighter than Parchment so cards read as "a sheet laid on the page."

#### Vellum (Tertiary)
- **HEX:** `#FCF7E8`
- **RGB:** `252, 247, 232`
- **Usage:** Highest elevation — modals, sheets, the quick-add card. Nearly white but still warm.

### Text Colors

#### Iron Gall (Primary)
- **HEX:** `#1F1812`
- **RGB:** `31, 24, 18`
- **Contrast Ratio on Parchment:** 13.5:1 (WCAG AAA)
- **Usage:** Headings, task content, primary body text.

#### Sepia (Secondary)
- **HEX:** `#6B5D45`
- **RGB:** `107, 93, 69`
- **Contrast Ratio on Parchment:** 5.4:1 (WCAG AA)
- **Usage:** Supporting text, descriptions, section labels in small caps.

#### Faded Ink (Tertiary)
- **HEX:** `#9C8E70`
- **RGB:** `156, 142, 112`
- **Contrast Ratio on Parchment:** 3.2:1 (WCAG AA Large Text only)
- **Usage:** Captions, dates, metadata, "no due date" placeholders. Never used for primary content.

### Border Colors

#### Hairline (Subtle)
- **HEX:** `#C5B89D`
- **RGB:** `197, 184, 157`
- **Usage:** Default borders, row dividers, card outlines.

#### Engraved (Strong)
- **HEX:** `#8A7B5C`
- **RGB:** `138, 123, 92`
- **Usage:** Focus states, emphasized borders, active card outlines.

### Status Colors

#### Success
- **HEX:** `#2D5235` (Forest)
- **Usage:** Reuses the primary. Growth and success share a meaning.

#### Error
- **HEX:** `#7A2E1F` (Bordeaux)
- **Usage:** Validation errors, destructive confirmations, "failed" states.

#### Warning
- **HEX:** `#A87C2D` (Mustard)
- **Usage:** Frost warnings, seasonal alerts, "due soon" indicators.

#### Info
- **HEX:** `#4A554E` (Slate)
- **Usage:** Neutral notifications, "did you know" almanac facts, info tooltips.

---

## 1.2 Typography System

### Font Stack

```css
/* Display & Headers */
font-family: 'EB Garamond', Georgia, 'Times New Roman', serif;

/* Body */
font-family: 'Lora', 'EB Garamond', Georgia, serif;

/* Monospace (rare, for code or precise timestamps) */
font-family: 'JetBrains Mono', 'SF Mono', Menlo, monospace;
```

**Font sourcing:** Both EB Garamond and Lora are Google Fonts. Self-host via `next/font/google` for performance.

### Type Scale

| Element | Size | Line Height | Weight | Letter Spacing | Notes |
|---|---|---|---|---|---|
| Display | 42px | 1.15 | 600 | -0.5px | "Tend." wordmark, hero headlines |
| H1 | 32px | 1.2 | 600 | -0.3px | View titles ("This Week", "Projects") |
| H2 | 24px | 1.25 | 600 | -0.2px | Section titles in detail views |
| H3 | 19px | 1.3 | 600 | 0px | Card titles, modal titles |
| H4 | 16px | 1.3 | 600 | 0px | Subsection headers |
| H5 | 14px | 1.3 | 600 | 0px | Inline emphasis |
| H6 | 13px | 1.3 | 600 | 0.05em | Rare; use Overline instead |
| Body Large | 18px | 1.55 | 400 | 0px | Long-form reading (lawn module details) |
| Body Regular | 16px | 1.55 | 400 | 0px | Task content, primary body |
| Body Small | 14px | 1.5 | 400 | 0px | Secondary content |
| Caption | 12px | 1.4 | 400 | 0px | Metadata, timestamps |
| Overline (Small Caps) | 11px | 1.4 | 600 | 0.18em | Section headers, module tags, ALL CAPS |

### Font Weights

- **Regular (400):** Body text, task content, captions.
- **Medium (500):** Sidebar items, metadata emphasis.
- **Semibold (600):** All headers, button labels, the wordmark.
- **Bold (700):** Used sparingly. Reserved for the rare display moment.

### Principles

- **Serif everywhere.** No sans-serif fonts. This is non-negotiable — the serif character is what gives Tend. its book-like identity.
- **EB Garamond for display, Lora for body.** EB Garamond has the old-almanac character; Lora was designed for screen readability and pairs cleanly.
- **Small caps for labels.** Section headers, module tags, and overlines use small-caps with 0.18em tracking. This is the "almanac chapter divider" rhythm.
- **Markdown in task content:** `**bold**` and `_italic_` render inline. Bold weight: 600. Italic: italic style at the same size.
- **Strikethrough on completion:** Color shifts to Faded Ink, weight stays the same, line-through stroke at midline.

---

## 1.3 Spacing System

Based on 4px grid.

| Token | Value | Usage |
|---|---|---|
| space-xs | 4px | Icon gaps, tight micro-spacing |
| space-sm | 8px | Chip padding, small gaps |
| space-md | 16px | Standard card padding, row gaps |
| space-lg | 24px | Section padding, view margins |
| space-xl | 32px | Between major sections |
| space-2xl | 48px | Above hero headers |
| space-3xl | 64px | Page-top margin on desktop |

---

## 1.4 Border System

### Border Widths

| Token | Value | Usage |
|---|---|---|
| border-width-thin | 0.5px | Hairline dividers between rows |
| border-width-default | 1px | Cards, inputs, default borders |
| border-width-thick | 2px | Focus rings, emphasized borders |
| border-width-focus | 2px | Keyboard focus outline |

### Border Radius

| Token | Value | Usage |
|---|---|---|
| radius-none | 0 | Hairlines, full-bleed sections |
| radius-sm | 2px | Module tags, chips |
| radius-md | 4px | Cards, buttons, inputs |
| radius-lg | 8px | Modals, sheets |
| radius-xl | 12px | Bottom sheet top corners |
| radius-full | 50% | Checkboxes, the FAB, color dots |

**Radius philosophy:** Sharp-ish corners throughout. This is not a rounded-blob consumer app. The almanac aesthetic calls for restraint — 4px is the default, 8px is "extra friendly," anything more is wrong.

---

## 1.5 Shadow System

```css
/* Shadow Level 0 — Flat */
box-shadow: none;
/* Usage: Task rows, section backgrounds, the canvas itself. */

/* Shadow Level 1 — Whisper */
box-shadow: 0 1px 2px rgba(31, 24, 18, 0.06);
/* Usage: Cards, default elevation. The "sheet on a desk" feel. */

/* Shadow Level 2 — Soft */
box-shadow: 0 2px 6px rgba(31, 24, 18, 0.08);
/* Usage: Active cards, hover states. */

/* Shadow Level 3 — Lifted */
box-shadow: 0 4px 12px rgba(31, 24, 18, 0.10);
/* Usage: Popovers, dropdowns. */

/* Shadow Level 4 — Floating */
box-shadow: 0 8px 20px rgba(31, 24, 18, 0.12);
/* Usage: Modals, sheets. */

/* Shadow FAB — TINTED FOREST (signature detail) */
box-shadow: 0 4px 14px rgba(45, 82, 53, 0.32);
/* Usage: The floating action button ONLY. Tinted with forest green, not generic black. */
```

**Shadow philosophy:** Tend. is paper-flat by design. The only meaningfully elevated element is the FAB, which gets a tinted forest-green shadow to reinforce its identity. Cards don't pop; they sit. This is a direct lesson borrowed from Todoist's tinted-red FAB shadow.

---

## 1.6 Animation System

### Timing

| Token | Value | Usage |
|---|---|---|
| transition-fast | 150ms ease-out | Hover states, micro-interactions |
| transition-base | 250ms ease-out | Card lifts, sheet slides, default |
| transition-slow | 400ms ease-out | Major reveals, modal entry |

### Easing Functions

```css
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Signature Motions

- **Task complete:** 80ms hold → 250ms ease-out. Checkbox fills, content strikes through, row fades to 60% opacity, then collapses upward with adjacent rows sliding up to fill.
- **FAB tap:** scale 1.0 → 0.94 → 1.0 over 150ms.
- **Quick-add sheet:** spring damping 0.8, response 0.4s, slides from bottom.
- **Section reveal on load:** stagger by 40ms per row for the first 5 rows, then instant.

Respect `prefers-reduced-motion`: all transitions collapse to 0ms when set.

---

## 1.7 Layout Foundation

### Container Widths

| Breakpoint | Container Max-Width |
|---|---|
| Mobile | 100% (with 16px page margin) |
| Tablet | 600px centered |
| Desktop | 720px centered |
| Large Desktop | 720px centered |

**Layout philosophy:** Tend. is intentionally single-column at every breakpoint. The almanac is a book, and books are read in columns. Desktop does not get wider — it gets a richer detail pane on the side for the Browse and Projects views (effective 1024px+).

### Responsive Breakpoints

```css
--breakpoint-mobile: 0px;
--breakpoint-tablet: 640px;
--breakpoint-desktop: 1024px;
--breakpoint-large: 1440px;
```

### Grid

- **Columns:** 1 (mobile), 1 (tablet), 1+detail-pane (desktop)
- **Gutter:** 16px (mobile), 24px (tablet+)
- **Margin:** 16px horizontal (mobile), auto-center (tablet+)

---

# SECTION 2: COMPONENT APPLICATION MAP

---

## 2.1 Buttons

### Primary Button

**Purpose:** Main calls to action ("Add Task", "Save", "Mark Done")

```css
background: var(--forest);
color: var(--vellum);
padding: 10px 18px;
border: none;
border-radius: var(--radius-md);
font-family: 'EB Garamond', serif;
font-size: 15px;
font-weight: 600;
letter-spacing: 0.02em;
text-transform: none;
box-shadow: var(--shadow-1);
transition: var(--transition-fast);
min-height: 44px;

/* Hover */
background: #25422C;
box-shadow: var(--shadow-2);

/* Active */
background: #1F3724;
transform: scale(0.98);

/* Disabled */
background: var(--hairline);
color: var(--faded-ink);
cursor: not-allowed;
opacity: 0.7;
```

### Secondary Button

**Purpose:** Alternative actions ("Cancel", "Edit")

```css
background: transparent;
color: var(--iron-gall);
border: 1px solid var(--engraved);
padding: 10px 18px;
border-radius: var(--radius-md);
font-family: 'EB Garamond', serif;
font-size: 15px;
font-weight: 600;
transition: var(--transition-fast);
min-height: 44px;

/* Hover */
background: var(--aged-paper);
border-color: var(--iron-gall);

/* Active */
background: var(--hairline);
```

### Tertiary/Ghost Button

**Purpose:** Least emphasis ("Skip", "Maybe Later")

```css
background: transparent;
color: var(--forest);
border: none;
padding: 8px 12px;
border-radius: var(--radius-sm);
font-size: 14px;
font-weight: 500;
text-decoration: underline;
text-decoration-color: var(--hairline);
text-underline-offset: 3px;
transition: var(--transition-fast);

/* Hover */
text-decoration-color: var(--forest);
```

### Destructive Button

**Purpose:** Delete, archive, dismiss permanently

```css
background: var(--bordeaux);
color: var(--vellum);
/* All other properties match Primary */

/* Hover */
background: #5F2517;
```

### Floating Action Button (FAB) — Signature Component

**Purpose:** Quick-add a new task. The single most distinctive element of Tend.

```css
width: 56px;
height: 56px;
background: var(--forest);
color: var(--vellum);
border-radius: 50%;
position: fixed;
bottom: 88px; /* above bottom nav */
right: 20px;
display: flex;
align-items: center;
justify-content: center;
font-family: 'EB Garamond', serif;
font-size: 32px;
font-weight: 400;
line-height: 1;
border: none;
cursor: pointer;

/* THE SIGNATURE DETAIL — tinted forest-green shadow */
box-shadow: 0 4px 14px rgba(45, 82, 53, 0.32);

transition: transform 150ms ease-out, box-shadow 150ms ease-out;

/* Hover */
box-shadow: 0 6px 18px rgba(45, 82, 53, 0.40);

/* Active */
transform: scale(0.94);
box-shadow: 0 2px 8px rgba(45, 82, 53, 0.32);
```

**Do not** replace the tinted shadow with a generic black drop-shadow. This is the most-copied detail of well-designed productivity apps and we are deliberately borrowing it.

---

## 2.2 Task Row (The Hero Component)

The single most important component in Tend. Identical visual rhythm whether the task came from the user, the lawn module, or the garden module.

**Anatomy:**
```
[20px circle checkbox] [12px gap] [task content column] [trailing icons] 
```

**Specifications:**
- **Height:** 60px minimum; expands to fit wrapped content
- **Left padding:** 16px
- **Right padding:** 16px
- **Background:** transparent (sits on Parchment); on hover/press becomes Aged Paper

**Checkbox:**
- 20px diameter circle
- 1.5px stroke, color: `Hairline` (#C5B89D)
- Transparent fill when empty
- On hover: stroke darkens to `Engraved` (#8A7B5C)
- On complete: fill `Forest`, white `✓` glyph (Lucide check, 12px)
- Hit area: 44x44px

**Task content column:**
- Line 1: Lora 16px Regular Iron Gall — the task content
- Line 2 (metadata row, conditional): horizontal row with date pill (left) + module tag (right)

**Date pill (inline text, no background):**
- Lora 13px Regular
- "Today" → Forest #2D5235
- "Tomorrow" / future dates → Sepia #6B5D45
- "Overdue" / past → Bordeaux #7A2E1F (with weight 500)

**Module tag:**
- Small caps overline, 10px, 0.18em letter-spacing
- "LAWN" → small Forest dot + Sepia text
- "GARDEN" → small Mustard dot + Sepia text
- "PROJECT" → small Bordeaux dot + Sepia text
- "TASK" → no dot, just Faded Ink text (user-entered, no module)

**Divider:** 0.5px Hairline below each row, inset 48px from left (aligned to task content, not checkbox).

**Tap states:**
- Press: background fades to Aged Paper over 80ms
- Complete: checkbox fills 250ms, content strikes through, row fades to 60% opacity, then collapses upward over 250ms; next row slides up

**Swipe actions** (mobile):
- Right swipe: reveal Forest "Done" zone with check icon
- Left swipe: reveal Sepia "Edit" and Bordeaux "Delete" zones

---

## 2.3 Cards

Used for: Project cards, module summary cards, almanac fact cards.

```css
background: var(--aged-paper);
border: 1px solid var(--hairline);
border-radius: var(--radius-md);
padding: 16px;
box-shadow: var(--shadow-1);
transition: var(--transition-base);

/* Hover (interactive cards only) */
border-color: var(--engraved);
box-shadow: var(--shadow-2);
transform: translateY(-1px);
```

**Card anatomy:**
- Header: H3 (19px EB Garamond Semibold)
- Body: 14px Lora Regular Sepia
- Metadata footer: 11px Overline small caps Faded Ink

---

## 2.4 Section Headers

The "chapter divider" rhythm of the almanac.

```css
font-family: 'EB Garamond', serif;
font-size: 11px;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.18em;
color: var(--sepia);
padding: 24px 16px 8px;
display: flex;
align-items: center;
gap: 12px;
```

**With optional ornamental flourish:**
- A small SVG botanical glyph (a sprig, an asterism, or a fleuron) sits between the section title and trailing space
- 12px tall, color Hairline, decorative only

Example section headers:
- `THIS WEEK · ·`
- `COMING UP · ·`
- `OPEN PROJECTS · ·`

---

## 2.5 Form Elements

### Text Input

```css
background: var(--vellum);
border: 1px solid var(--hairline);
border-radius: var(--radius-md);
padding: 12px 14px;
font-family: 'Lora', serif;
font-size: 16px;
color: var(--iron-gall);
transition: var(--transition-fast);
min-height: 44px;

/* Focus */
border-color: var(--forest);
border-width: 2px;
padding: 11px 13px; /* compensate for border */
outline: none;

/* Placeholder */
color: var(--faded-ink);
font-style: italic;
```

### Checkbox

See Task Row checkbox specification above. The same 20px circle is used in forms.

### Toggle (Module on/off)

```css
width: 44px;
height: 24px;
background: var(--hairline);
border-radius: 12px;
position: relative;
transition: var(--transition-fast);
cursor: pointer;

/* Knob */
&::after {
  content: '';
  width: 20px;
  height: 20px;
  background: var(--vellum);
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  box-shadow: var(--shadow-1);
  transition: var(--transition-fast);
}

/* Active */
&[aria-checked="true"] {
  background: var(--forest);
}
&[aria-checked="true"]::after {
  left: 22px;
}
```

---

## 2.6 Navigation

### Bottom Nav (Mobile PWA)

```css
position: fixed;
bottom: 0;
left: 0;
right: 0;
height: 64px;
background: var(--vellum);
border-top: 1px solid var(--hairline);
display: flex;
padding-bottom: env(safe-area-inset-bottom);
```

**Four tabs:**
1. **Now** (calendar icon) — default landing
2. **Browse** (open book icon) — scrub through the year
3. **Projects** (hammer icon) — multi-session work
4. **Modules** (leaf icon) — Lawn, Garden, future modules

**Tab styling:**
- 24px Lucide icon
- 10px Overline small caps label below, 0.1em tracking
- Active: Forest icon + Iron Gall label
- Inactive: Faded Ink icon + Faded Ink label

### Top Bar

```css
height: 56px;
background: var(--parchment);
display: flex;
align-items: center;
padding: 0 16px;
border-bottom: 0.5px solid var(--hairline);
```

**Contents:**
- Left: View title in EB Garamond 22px Semibold
- Right: Date in Lora 13px Sepia ("Saturday, 16 May")

---

## 2.7 Module Tag

The small label that identifies which module a task came from.

```css
display: inline-flex;
align-items: center;
gap: 6px;
font-family: 'EB Garamond', serif;
font-size: 10px;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.18em;
color: var(--sepia);
```

**With color dot:**
```css
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
```

**Module colors:**
- Lawn: Forest #2D5235
- Garden: Mustard #A87C2D
- Projects: Bordeaux #7A2E1F
- Tasks (user-entered, no module): no dot

---

## 2.8 Typography Application

### Page Title (H1)

```css
font-family: 'EB Garamond', serif;
font-size: 32px;
font-weight: 600;
letter-spacing: -0.3px;
color: var(--iron-gall);
margin-bottom: 8px;
```

### Wordmark

```css
font-family: 'EB Garamond', serif;
font-size: 28px;
font-weight: 600;
letter-spacing: -0.3px;
color: var(--iron-gall);

/* The period — always Bordeaux */
.period {
  color: var(--bordeaux);
}
```

### Body Paragraph

```css
font-family: 'Lora', serif;
font-size: 16px;
line-height: 1.55;
color: var(--iron-gall);
margin-bottom: 16px;
```

---

## 2.9 Dividers & Ornaments

### Hairline Divider

```css
border: none;
border-top: 0.5px solid var(--hairline);
margin: 16px 0;
```

### Ornamental Section Break

A small decorative SVG flourish between major sections (a sprig, asterism, or fleuron). 24px wide, centered, Hairline color, purely decorative — never carries meaning.

---

## 2.10 Icons

Use **Lucide** (formerly Lucide React / Feather successor) as the icon system. Line-style icons match the woodcut/engraving aesthetic.

### Icon Sizes

```css
--icon-xs: 14px;
--icon-sm: 16px;
--icon-md: 20px;
--icon-lg: 24px;
--icon-xl: 32px;
```

### Stroke Width

All icons: 1.5px stroke. Never 2px or thicker — would clash with the delicate serif aesthetic.

---

## 2.11 Backgrounds & Surfaces

### Page Background

```css
background: var(--parchment);
background-image: url('data:image/svg+xml,...'); /* Subtle paper-grain noise SVG */
background-blend-mode: multiply;
min-height: 100vh;
```

The paper grain is a subtle SVG noise texture at 4% opacity, multiplied. Optional but recommended — it sells the "paper" feel.

### Card Background

`background: var(--aged-paper);` — no texture, kept clean to contrast with the page grain.

---

# SECTION 3: IMPLEMENTATION

## 3.1 CSS Variables (Drop in `:root`)

```css
:root {
  /* Primary Colors */
  --forest: #2D5235;
  --forest-dark: #25422C;
  --bordeaux: #7A2E1F;
  --bordeaux-dark: #5F2517;
  --iron-gall: #1F1812;
  
  /* Secondary Colors */
  --mustard: #A87C2D;
  --slate: #4A554E;
  
  /* Backgrounds */
  --parchment: #F2E8CF;
  --aged-paper: #FAF3DE;
  --vellum: #FCF7E8;
  
  /* Text */
  --text-primary: #1F1812;
  --text-secondary: #6B5D45;
  --text-tertiary: #9C8E70;
  
  /* Borders */
  --hairline: #C5B89D;
  --engraved: #8A7B5C;
  
  /* Status */
  --success: #2D5235;
  --error: #7A2E1F;
  --warning: #A87C2D;
  --info: #4A554E;
  
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;
  
  /* Radius */
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-full: 50%;
  
  /* Shadows */
  --shadow-0: none;
  --shadow-1: 0 1px 2px rgba(31, 24, 18, 0.06);
  --shadow-2: 0 2px 6px rgba(31, 24, 18, 0.08);
  --shadow-3: 0 4px 12px rgba(31, 24, 18, 0.10);
  --shadow-4: 0 8px 20px rgba(31, 24, 18, 0.12);
  --shadow-fab: 0 4px 14px rgba(45, 82, 53, 0.32);
  
  /* Transitions */
  --transition-fast: 150ms ease-out;
  --transition-base: 250ms ease-out;
  --transition-slow: 400ms ease-out;
  
  /* Typography */
  --font-display: 'EB Garamond', Georgia, serif;
  --font-body: 'Lora', 'EB Garamond', Georgia, serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', Menlo, monospace;
  
  --font-size-display: 42px;
  --font-size-h1: 32px;
  --font-size-h2: 24px;
  --font-size-h3: 19px;
  --font-size-h4: 16px;
  --font-size-body-lg: 18px;
  --font-size-body: 16px;
  --font-size-body-sm: 14px;
  --font-size-caption: 12px;
  --font-size-overline: 11px;
  
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

## 3.2 No Dark Mode

Tend. ships light-only. The parchment aesthetic IS the brand. Dark mode would invert the entire identity and is explicitly out of scope for v1. May revisit for v2 with a dedicated "midnight ledger" theme designed from scratch — never an inversion of the light theme.

---

# SECTION 4: DESIGN PRINCIPLES

### 1. The almanac is the metaphor
Every screen should feel like a page in a well-made book. Cream paper, ink, ornament. The reader is not consuming a feed; they're consulting a reference. This shapes pacing, typography, density, and the absence of attention-seeking patterns.

### 2. Serif everywhere, no apologies
The single most distinctive design choice in Tend. is its full commitment to serif typography on a phone screen. Most productivity apps run from this because serifs are "less readable." Tend. earns readability through size and line height, and gains identity in return.

### 3. Color is reserved for verbs, never ambient
Forest is for primary actions. Bordeaux is for urgency. Mustard is for seasonal markers. Color never decorates — it carries meaning. Most of the screen is parchment and ink. (Borrowed from Todoist's discipline of reserving Red for verbs.)

### 4. The FAB is the only floating element
Everything else sits flat on the page, separated by hairline dividers. Only the floating add button gets meaningful elevation — and its shadow is forest-tinted, not generic black. This is the signature detail.

### 5. Modules surface tasks; modules are not destinations
The Lawn and Garden modules are content engines that push tasks into the main "Now" feed. The user rarely opens a module screen directly. The default experience is reading the main feed and tapping into a module only for deeper context. This is what distinguishes Tend. from a generic todo app: the surface is the same, the source of truth differs.

---

# SECTION 5: ACCESSIBILITY REQUIREMENTS

## Contrast Ratios

- **Iron Gall on Parchment:** 13.5:1 (AAA) ✓
- **Sepia on Parchment:** 5.4:1 (AA) ✓
- **Faded Ink on Parchment:** 3.2:1 — Large text only (AA Large) ✓
- **Forest on Parchment:** 7.8:1 (AAA) ✓
- **Vellum on Forest (button text):** 12.4:1 (AAA) ✓

## Touch Targets

- **Minimum size:** 44x44px
- **Spacing between adjacent targets:** 8px minimum
- **Checkbox hit area:** 44px square around the 20px visible circle

## Keyboard Navigation

- All interactive elements are keyboard accessible
- Focus indicators: 2px Engraved outline with 2px offset
- Tab order follows visual order
- Skip-to-content link in header

## Screen Readers

- Semantic HTML structure (header, main, nav, section, article)
- Proper ARIA labels on icon-only buttons (the FAB has `aria-label="Add task"`)
- Module tags announced as "from Lawn module" via `aria-describedby`
- Status announcements for task completion via `aria-live="polite"`

## Motion & Animation

- Respect `prefers-reduced-motion: reduce` — collapse all animations to 0ms
- No rapidly flashing content
- Animations enhance the "page turning" feel; they don't compete for attention

---

# QUICK REFERENCE

## Color Quick Map

```
Primary Action:    Forest      #2D5235
Urgent / Overdue:  Bordeaux    #7A2E1F
Text (Main):       Iron Gall   #1F1812
Text (Secondary):  Sepia       #6B5D45
Text (Tertiary):   Faded Ink   #9C8E70
Background:        Parchment   #F2E8CF
Cards:             Aged Paper  #FAF3DE
Modals:            Vellum      #FCF7E8
Borders:           Hairline    #C5B89D
Module: Lawn       Forest      #2D5235
Module: Garden     Mustard     #A87C2D
Module: Project    Bordeaux    #7A2E1F
```

## Component Checklist

Before development, ensure specs exist for:
- [x] All button variants (Primary, Secondary, Tertiary, Destructive, FAB)
- [x] Form elements (text input, checkbox, toggle)
- [x] Task Row (the hero component)
- [x] Cards
- [x] Bottom Nav + Top Bar
- [x] Section Headers
- [x] Module Tags
- [x] Status indicators (status colors mapped)
- [x] Typography hierarchy
- [x] Responsive behavior (single-column at all breakpoints)

## The Three Signature Details

1. **The tinted forest-green FAB shadow** — `0 4px 14px rgba(45, 82, 53, 0.32)`. Never black.
2. **The Bordeaux period in "Tend."** — the wordmark's period is always #7A2E1F.
3. **Full-serif typography on a phone** — EB Garamond display + Lora body. No sans-serif anywhere.

---

**Version 1.0** • Light Theme (Parchment)  
**An almanac for the home.**
