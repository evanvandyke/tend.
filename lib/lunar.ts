import { addDays, startOfDay } from 'date-fns';

export interface LunarEvent {
  eventDate: Date;
  eventType: string;
  name: string;
  description: string | null;
}

// Synodic period of the moon in days
const SYNODIC_PERIOD = 29.53059;

// Known new moon: January 6, 2000 at 18:14 UTC
const KNOWN_NEW_MOON = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));

// Full moon offset from new moon is half the synodic period
const FULL_MOON_OFFSET = SYNODIC_PERIOD / 2;

const FULL_MOON_NAMES: Record<number, string> = {
  1: 'Wolf Moon',
  2: 'Snow Moon',
  3: 'Worm Moon',
  4: 'Pink Moon',
  5: 'Flower Moon',
  6: 'Strawberry Moon',
  7: 'Buck Moon',
  8: 'Sturgeon Moon',
  9: 'Corn Moon', // default; overridden to Harvest Moon if closest to equinox
  10: 'Hunter\'s Moon',
  11: 'Beaver Moon',
  12: 'Cold Moon',
};

// Known supermoon dates for 2026-2030 (within ~361,000 km)
const SUPERMOON_DATES: string[] = [
  // 2026
  '2026-05-31', '2026-06-30', '2026-07-29', '2026-08-28',
  // 2027
  '2027-06-19', '2027-07-18', '2027-08-17', '2027-09-15',
  // 2028
  '2028-05-07', '2028-06-06', '2028-07-05', '2028-08-03',
  // 2029
  '2029-04-28', '2029-05-27', '2029-06-25', '2029-07-25',
  // 2030
  '2030-03-17', '2030-04-16', '2030-05-15', '2030-06-14',
];

// Known eclipses 2026-2030
const ECLIPSES: { date: string; type: string; name: string; description: string }[] = [
  // 2026
  { date: '2026-02-17', type: 'solar_eclipse', name: 'Partial Solar Eclipse', description: 'Partial solar eclipse visible from parts of the Southern Hemisphere' },
  { date: '2026-03-03', type: 'lunar_eclipse', name: 'Total Lunar Eclipse', description: 'Total lunar eclipse' },
  { date: '2026-08-12', type: 'solar_eclipse', name: 'Annular Solar Eclipse', description: 'Annular solar eclipse' },
  { date: '2026-08-28', type: 'lunar_eclipse', name: 'Total Lunar Eclipse', description: 'Total lunar eclipse' },
  // 2027
  { date: '2027-02-20', type: 'lunar_eclipse', name: 'Total Lunar Eclipse', description: 'Total lunar eclipse' },
  { date: '2027-08-02', type: 'solar_eclipse', name: 'Total Solar Eclipse', description: 'Total solar eclipse' },
  { date: '2027-08-17', type: 'lunar_eclipse', name: 'Partial Lunar Eclipse', description: 'Partial lunar eclipse' },
  // 2028
  { date: '2028-01-12', type: 'lunar_eclipse', name: 'Total Lunar Eclipse', description: 'Total lunar eclipse' },
  { date: '2028-01-26', type: 'solar_eclipse', name: 'Annular Solar Eclipse', description: 'Annular solar eclipse' },
  { date: '2028-07-06', type: 'lunar_eclipse', name: 'Total Lunar Eclipse', description: 'Total lunar eclipse' },
  { date: '2028-07-22', type: 'solar_eclipse', name: 'Total Solar Eclipse', description: 'Total solar eclipse' },
  // 2029
  { date: '2029-01-14', type: 'solar_eclipse', name: 'Partial Solar Eclipse', description: 'Partial solar eclipse' },
  { date: '2029-06-26', type: 'lunar_eclipse', name: 'Total Lunar Eclipse', description: 'Total lunar eclipse' },
  { date: '2029-12-20', type: 'lunar_eclipse', name: 'Total Lunar Eclipse', description: 'Total lunar eclipse' },
  // 2030
  { date: '2030-06-01', type: 'solar_eclipse', name: 'Annular Solar Eclipse', description: 'Annular solar eclipse' },
  { date: '2030-06-15', type: 'lunar_eclipse', name: 'Total Lunar Eclipse', description: 'Total lunar eclipse' },
  { date: '2030-12-09', type: 'lunar_eclipse', name: 'Total Lunar Eclipse', description: 'Total lunar eclipse' },
];

function getAutumnEquinox(year: number): Date {
  // Approximate autumn equinox dates (September 22-23 typically)
  return new Date(Date.UTC(year, 8, 22)); // Sept 22
}

function computeFullMoons(startYear: number, endYear: number): Date[] {
  const startDate = new Date(Date.UTC(startYear, 0, 1));
  const endDate = new Date(Date.UTC(endYear, 11, 31, 23, 59, 59));

  // Find number of cycles from known new moon to start date
  const msFromEpoch = startDate.getTime() - KNOWN_NEW_MOON.getTime();
  const daysFromEpoch = msFromEpoch / (1000 * 60 * 60 * 24);
  const cyclesFromEpoch = Math.floor(daysFromEpoch / SYNODIC_PERIOD);

  const fullMoons: Date[] = [];

  // Start a few cycles before to be safe
  for (let cycle = cyclesFromEpoch - 1; ; cycle++) {
    const newMoonDays = cycle * SYNODIC_PERIOD;
    const fullMoonMs = KNOWN_NEW_MOON.getTime() + (newMoonDays + FULL_MOON_OFFSET) * 24 * 60 * 60 * 1000;
    const fullMoonDate = new Date(fullMoonMs);

    if (fullMoonDate > endDate) break;
    if (fullMoonDate >= startDate) {
      fullMoons.push(fullMoonDate);
    }
  }

  return fullMoons;
}

function formatDateKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function computeLunarEvents(startYear: number, endYear: number): LunarEvent[] {
  const events: LunarEvent[] = [];
  const fullMoons = computeFullMoons(startYear, endYear);

  const supermoonSet = new Set(SUPERMOON_DATES);

  // Track full moons per month for blue moon detection
  const moonsByMonth: Map<string, Date[]> = new Map();
  for (const fm of fullMoons) {
    const key = `${fm.getUTCFullYear()}-${fm.getUTCMonth()}`;
    if (!moonsByMonth.has(key)) moonsByMonth.set(key, []);
    moonsByMonth.get(key)!.push(fm);
  }

  // Determine Harvest Moon for each year (closest full moon to autumn equinox)
  const harvestMoonDates = new Set<string>();
  for (let year = startYear; year <= endYear; year++) {
    const equinox = getAutumnEquinox(year);
    let closest: Date | null = null;
    let closestDiff = Infinity;
    for (const fm of fullMoons) {
      if (fm.getUTCFullYear() !== year) continue;
      const diff = Math.abs(fm.getTime() - equinox.getTime());
      if (diff < closestDiff) {
        closestDiff = diff;
        closest = fm;
      }
    }
    if (closest) {
      harvestMoonDates.add(formatDateKey(closest));
    }
  }

  for (const fm of fullMoons) {
    const month = fm.getUTCMonth() + 1;
    const dateKey = formatDateKey(fm);
    const monthKey = `${fm.getUTCFullYear()}-${fm.getUTCMonth()}`;
    const moonsThisMonth = moonsByMonth.get(monthKey)!;

    // Determine name
    let name: string;
    if (harvestMoonDates.has(dateKey)) {
      name = 'Harvest Moon';
    } else {
      name = FULL_MOON_NAMES[month];
    }

    // Check blue moon (second full moon in a calendar month)
    const isBlue = moonsThisMonth.length > 1 && moonsThisMonth.indexOf(fm) === 1;
    if (isBlue) {
      name = `Blue Moon (${name})`;
    }

    // Check supermoon
    const isSupermoon = supermoonSet.has(dateKey);

    // Build description parts
    const descParts: string[] = [];
    if (isSupermoon) descParts.push('Supermoon');
    if (isBlue) descParts.push('Blue Moon');

    const eventType = isSupermoon ? 'supermoon' : 'full_moon';
    const description = descParts.length > 0 ? descParts.join(', ') : null;

    events.push({
      eventDate: fm,
      eventType,
      name,
      description,
    });
  }

  // Add eclipses
  for (const eclipse of ECLIPSES) {
    const [y, m, d] = eclipse.date.split('-').map(Number);
    if (y >= startYear && y <= endYear) {
      events.push({
        eventDate: new Date(Date.UTC(y, m - 1, d)),
        eventType: eclipse.type,
        name: eclipse.name,
        description: eclipse.description,
      });
    }
  }

  // Sort by date
  events.sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());

  return events;
}
