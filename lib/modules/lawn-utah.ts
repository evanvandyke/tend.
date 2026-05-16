import { Module } from './types';

export const lawnUtahModule: Module = {
  slug: 'lawn-utah',
  name: 'Lawn Care',
  description: 'Complete cool-season lawn care schedule for Northern Utah (zones 5b–6b). Covers fertilization, mowing, watering, aeration, overseeding, and winterization.',
  region: 'Northern Utah',
  tasks: [
    // === MARCH ===
    {
      slug: 'spring-cleanup-rake',
      kind: 'seasonal',
      title: 'Spring cleanup rake',
      content: 'Gently rake to remove winter debris once ground firms up as snow melts.',
      windowStart: { month: 3, day: 1 },
      windowEnd: { month: 3, day: 31 },
    },
    {
      slug: 'mower-prep',
      kind: 'seasonal',
      title: 'Mower preparation',
      content: 'Sharpen blades, tune-up, check oil and spark plug before first mow of the season.',
      windowStart: { month: 3, day: 1 },
      windowEnd: { month: 3, day: 31 },
    },

    // === APRIL ===
    {
      slug: 'sprinkler-startup',
      kind: 'seasonal',
      title: 'Start up sprinkler system',
      content: 'Check for leaks, breaks, and clogs. Adjust heads and coverage. Wait until freeze risk passes.',
      windowStart: { month: 4, day: 1 },
      windowEnd: { month: 4, day: 30 },
    },
    {
      slug: 'begin-mowing',
      kind: 'seasonal',
      title: 'Begin regular mowing',
      content: 'Start when grass reaches 3.5-4 inches and is dry. Mow at 3-4 inch height. Follow the 1/3 rule. Mulch clippings.',
      windowStart: { month: 4, day: 1 },
      windowEnd: { month: 4, day: 30 },
    },
    {
      slug: 'fertilizer-1-early-spring',
      kind: 'seasonal',
      title: 'Apply early-spring fertilizer',
      content: 'When soil temps reach 50-55°F. Balanced fertilizer (e.g., 16-4-8). Rate: ~0.75 lbs N per 1,000 sq ft. Add crabgrass preventer ONLY if not seeding. Skip pre-emergent if overseeding.',
      windowStart: { month: 4, day: 1 },
      windowEnd: { month: 4, day: 30 },
      conditions: { minSoilTemp: 50 },
    },
    {
      slug: 'begin-watering',
      kind: 'seasonal',
      title: 'Begin watering schedule',
      content: 'Deep and infrequent. 2-3 times per week max. Early morning (4-8 AM). Target ~1 inch/week in mild temps, 1.5-2 inches at peak summer.',
      windowStart: { month: 4, day: 1 },
      windowEnd: { month: 4, day: 30 },
    },
    {
      slug: 'spot-treat-weeds',
      kind: 'seasonal',
      title: 'Spot treat early weeds',
      content: 'Manual pulling or selective herbicide. Pre-emergent for crabgrass ONLY if not seeding this season.',
      windowStart: { month: 4, day: 1 },
      windowEnd: { month: 5, day: 31 },
    },
    {
      slug: 'begin-edging',
      kind: 'seasonal',
      title: 'Begin edging and trimming',
      content: 'Edge every 1-3 mows along hard surfaces — driveways, sidewalks, garden beds.',
      windowStart: { month: 4, day: 1 },
      windowEnd: { month: 4, day: 30 },
    },

    // === MAY ===
    {
      slug: 'fertilizer-2-late-spring',
      kind: 'seasonal',
      title: 'Apply late-spring fertilizer',
      content: '6-8 weeks after early spring feed. Higher nitrogen, slow-release (e.g., 24-2-8). Rate: ~0.75-1 lb N per 1,000 sq ft.',
      windowStart: { month: 5, day: 1 },
      windowEnd: { month: 5, day: 31 },
    },

    // === JUNE ===
    {
      slug: 'fertilizer-2-catchup',
      kind: 'seasonal',
      title: 'Late spring fertilizer (if not done in May)',
      content: 'Apply late spring feed if not completed in May. Same formula as May application.',
      windowStart: { month: 6, day: 1 },
      windowEnd: { month: 6, day: 30 },
    },
    {
      slug: 'adjust-watering-heat',
      kind: 'seasonal',
      title: 'Adjust watering for heat',
      content: 'Increase to 1.5-2 inches per week as temperatures rise. Maintain early morning schedule.',
      windowStart: { month: 6, day: 1 },
      windowEnd: { month: 6, day: 30 },
    },
    {
      slug: 'monitor-grubs',
      kind: 'seasonal',
      title: 'Monitor for grubs and insects',
      content: 'Look for brown patches unresponsive to water. Pull back turf to check — treat only if >5-10 grubs per square foot.',
      windowStart: { month: 6, day: 1 },
      windowEnd: { month: 8, day: 31 },
    },

    // === JULY / AUGUST ===
    {
      slug: 'summer-watering',
      kind: 'seasonal',
      title: 'Summer watering priority',
      content: 'Follow local watering guides. Peak water needs. Deep and infrequent is still the rule.',
      windowStart: { month: 7, day: 1 },
      windowEnd: { month: 8, day: 31 },
    },
    {
      slug: 'summer-mowing',
      kind: 'seasonal',
      title: 'Mow high, mow less',
      content: 'Keep at 3.5-4 inch height. Mow less frequently. Avoid midday heat — mow morning or evening.',
      windowStart: { month: 7, day: 1 },
      windowEnd: { month: 8, day: 31 },
    },
    {
      slug: 'fertilizer-3-optional',
      kind: 'seasonal',
      title: 'Optional: light summer feed or iron',
      content: 'ONLY if lawn is NOT heat-stressed or dormant. Options: Milorganite, light rate 0.25-0.5 lbs N/1,000 sq ft slow-release, or iron supplement for yellowing.',
      windowStart: { month: 7, day: 1 },
      windowEnd: { month: 8, day: 31 },
    },

    // === SEPTEMBER ===
    {
      slug: 'core-aerate',
      kind: 'seasonal',
      title: 'Core aerate lawn',
      content: 'Relieves compaction. Rent an aerator or hire a service. Leave plugs on the lawn to break down naturally.',
      windowStart: { month: 9, day: 1 },
      windowEnd: { month: 9, day: 30 },
    },
    {
      slug: 'overseed',
      kind: 'seasonal',
      title: 'Overseed bare areas',
      content: 'Best time for cool-season grass seed. Do AFTER aeration. Prep soil, apply seed, use starter fertilizer on seeded areas. Water frequently until established.',
      windowStart: { month: 9, day: 1 },
      windowEnd: { month: 9, day: 30 },
    },
    {
      slug: 'fertilizer-4-early-fall',
      kind: 'seasonal',
      title: 'Apply early-fall fertilizer (MOST IMPORTANT)',
      content: 'Apply after aeration and overseeding. High nitrogen, adequate potassium (e.g., 24-2-12). Rate: 1 lb N per 1,000 sq ft. This is the single most impactful feeding of the year.',
      windowStart: { month: 9, day: 1 },
      windowEnd: { month: 9, day: 30 },
    },
    {
      slug: 'fall-weed-control',
      kind: 'seasonal',
      title: 'Fall weed control',
      content: 'Most effective time for perennial broadleaf weeds. Apply selective herbicide or pull by hand.',
      windowStart: { month: 9, day: 1 },
      windowEnd: { month: 10, day: 31 },
    },
    {
      slug: 'reduce-watering',
      kind: 'seasonal',
      title: 'Reduce watering',
      content: 'Dial back as temperatures cool. Keep new seed moist if overseeding.',
      windowStart: { month: 9, day: 1 },
      windowEnd: { month: 9, day: 30 },
    },

    // === OCTOBER ===
    {
      slug: 'leaf-cleanup',
      kind: 'seasonal',
      title: 'Leaf cleanup',
      content: "Rake or mulch mow frequently. Don't let leaves mat and smother the grass.",
      windowStart: { month: 10, day: 1 },
      windowEnd: { month: 11, day: 15 },
    },
    {
      slug: 'sprinkler-blowout',
      kind: 'seasonal',
      title: 'Winterize sprinkler system (blowout!)',
      content: 'CRITICAL. Use an air compressor or hire a professional. Must complete BEFORE first hard freeze. Blown irrigation lines are expensive to repair.',
      windowStart: { month: 10, day: 1 },
      windowEnd: { month: 10, day: 31 },
      conditions: { beforeFirstFrost: true },
    },
    {
      slug: 'fertilizer-5-winterizer',
      kind: 'seasonal',
      title: 'Apply winterizer fertilizer',
      content: "After top growth stops but before ground freezes. 'Winterizer' formula (e.g., 22-0-10). Rate: 1 lb N per 1,000 sq ft. Helps root storage for spring green-up.",
      windowStart: { month: 10, day: 15 },
      windowEnd: { month: 11, day: 15 },
    },
    {
      slug: 'final-mow',
      kind: 'seasonal',
      title: 'Final mow of the season',
      content: 'Lower cutting height to 2.5-3 inches for the last mow. Mow when dry. This prevents snow mold.',
      windowStart: { month: 10, day: 15 },
      windowEnd: { month: 11, day: 15 },
    },

    // === NOVEMBER ===
    {
      slug: 'clean-store-tools',
      kind: 'seasonal',
      title: 'Clean and store lawn tools',
      content: 'Clean all equipment. Stabilize or drain fuel from mower. Store in a dry place.',
      windowStart: { month: 11, day: 1 },
      windowEnd: { month: 11, day: 30 },
    },

    // === DECEMBER / JANUARY / FEBRUARY ===
    {
      slug: 'minimize-traffic',
      kind: 'seasonal',
      title: 'Minimize lawn traffic',
      content: 'Avoid walking on frozen grass. Frozen blades break and damage the crown.',
      windowStart: { month: 12, day: 1 },
      windowEnd: { month: 2, day: 28 },
    },
    {
      slug: 'avoid-salt',
      kind: 'seasonal',
      title: 'Avoid salt damage near lawn',
      content: 'Minimize de-icing salt near lawn edges. Salt burns grass and damages soil.',
      windowStart: { month: 12, day: 1 },
      windowEnd: { month: 2, day: 28 },
    },
    {
      slug: 'plan-next-season',
      kind: 'seasonal',
      title: 'Plan for next season',
      content: 'Review this year\'s results. Research any issues. Check supplies and order early.',
      windowStart: { month: 1, day: 1 },
      windowEnd: { month: 2, day: 28 },
    },
  ],
};
