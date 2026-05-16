import { addDays, differenceInDays, startOfDay } from 'date-fns';
import { db } from '@/lib/db';
import { gardenPlants, userModuleCompletions, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getFrostDates } from '@/lib/frost';

// === Types ===

export type PlantTaskTemplate = {
  slug: string;
  title: string;
  content: string;
  daysRelativeToFrost: number; // negative = before last frost, positive = after
};

export type PlantDefinition = {
  slug: string;
  name: string;
  category: 'vegetable' | 'herb';
  startIndoorsWeeksBeforeFrost: number | null; // null = direct sow
  transplantAfterLastFrostDays: number; // days after last frost to transplant (negative = before)
  directSowAfterLastFrostDays?: number; // for direct sow plants
  daysToHarvest: number;
  waterFrequencyDays: number;
  spacing: string;
  tasks: PlantTaskTemplate[];
};

export type ComputedGardenTask = {
  source: 'garden';
  plantSlug: string;
  plantName: string;
  customName: string | null;
  taskSlug: string;
  title: string;
  content: string;
  date: Date;
  gardenPlantId: number;
};

// === Plant Catalog ===

export const PLANT_CATALOG: PlantDefinition[] = [
  {
    slug: 'tomato',
    name: 'Tomato',
    category: 'vegetable',
    startIndoorsWeeksBeforeFrost: 6,
    transplantAfterLastFrostDays: 14,
    daysToHarvest: 75,
    waterFrequencyDays: 2,
    spacing: '24-36 inches',
    tasks: [
      { slug: 'start-indoors', title: 'Start tomato seeds indoors', content: 'Plant seeds ¼" deep in seed-starting mix. Keep soil warm (70-80°F). Provide 14-16 hours of light daily.', daysRelativeToFrost: -42 },
      { slug: 'harden-off', title: 'Harden off tomato seedlings', content: 'Gradually expose seedlings to outdoor conditions over 7-10 days. Start with a few hours of filtered sunlight.', daysRelativeToFrost: 7 },
      { slug: 'transplant', title: 'Transplant tomatoes outdoors', content: 'Plant deeply — bury ⅔ of the stem. Space 24-36 inches apart. Water thoroughly after planting.', daysRelativeToFrost: 14 },
      { slug: 'first-fertilize', title: 'First fertilize tomatoes', content: 'Apply balanced fertilizer or compost tea. Avoid high-nitrogen fertilizers once flowering begins.', daysRelativeToFrost: 30 },
      { slug: 'stake-prune', title: 'Stake and prune tomatoes', content: 'Install cages or stakes. Remove suckers below the first flower cluster for indeterminate varieties.', daysRelativeToFrost: 35 },
    ],
  },
  {
    slug: 'bell-pepper',
    name: 'Bell Pepper',
    category: 'vegetable',
    startIndoorsWeeksBeforeFrost: 8,
    transplantAfterLastFrostDays: 14,
    daysToHarvest: 70,
    waterFrequencyDays: 2,
    spacing: '18-24 inches',
    tasks: [
      { slug: 'start-indoors', title: 'Start bell pepper seeds indoors', content: 'Plant seeds ¼" deep. Peppers need warm soil (80-85°F) to germinate. Be patient — they can take 2-3 weeks.', daysRelativeToFrost: -56 },
      { slug: 'harden-off', title: 'Harden off bell pepper seedlings', content: 'Gradually expose to outdoor conditions over 7-10 days. Peppers are sensitive to cold — don\'t rush this.', daysRelativeToFrost: 7 },
      { slug: 'transplant', title: 'Transplant bell peppers outdoors', content: 'Space 18-24 inches apart. Nighttime temps should be consistently above 55°F.', daysRelativeToFrost: 14 },
      { slug: 'fertilize', title: 'Fertilize bell peppers', content: 'Side-dress with compost or balanced fertilizer. Avoid excess nitrogen which promotes leaves over fruit.', daysRelativeToFrost: 30 },
    ],
  },
  {
    slug: 'serrano-pepper',
    name: 'Serrano Pepper',
    category: 'vegetable',
    startIndoorsWeeksBeforeFrost: 8,
    transplantAfterLastFrostDays: 14,
    daysToHarvest: 80,
    waterFrequencyDays: 3,
    spacing: '18-24 inches',
    tasks: [
      { slug: 'start-indoors', title: 'Start serrano pepper seeds indoors', content: 'Plant seeds ¼" deep in warm soil (80-85°F). Hot peppers can be slow to germinate — give them 2-4 weeks.', daysRelativeToFrost: -56 },
      { slug: 'harden-off', title: 'Harden off serrano pepper seedlings', content: 'Gradually expose to outdoor conditions over 7-10 days.', daysRelativeToFrost: 7 },
      { slug: 'transplant', title: 'Transplant serrano peppers outdoors', content: 'Space 18-24 inches apart. Wait until nighttime temps stay above 55°F.', daysRelativeToFrost: 14 },
      { slug: 'fertilize', title: 'Fertilize serrano peppers', content: 'Apply balanced fertilizer or compost. Serranos are heavy feeders once fruiting begins.', daysRelativeToFrost: 30 },
    ],
  },
  {
    slug: 'cucumber',
    name: 'Cucumber',
    category: 'vegetable',
    startIndoorsWeeksBeforeFrost: null,
    transplantAfterLastFrostDays: 14,
    directSowAfterLastFrostDays: 14,
    daysToHarvest: 60,
    waterFrequencyDays: 1,
    spacing: '36-60 inches',
    tasks: [
      { slug: 'direct-sow', title: 'Direct sow cucumber seeds', content: 'Plant seeds 1" deep, 3-4 per hill. Soil temp should be at least 60°F. Water well.', daysRelativeToFrost: 14 },
      { slug: 'thin-seedlings', title: 'Thin cucumber seedlings', content: 'Thin to 2-3 strongest plants per hill or 1 plant per 12 inches in rows.', daysRelativeToFrost: 28 },
      { slug: 'trellis', title: 'Set up cucumber trellis', content: 'Install trellis or supports. Training cucumbers vertically saves space and improves air circulation.', daysRelativeToFrost: 35 },
    ],
  },
  {
    slug: 'onion',
    name: 'Onion',
    category: 'vegetable',
    startIndoorsWeeksBeforeFrost: 10,
    transplantAfterLastFrostDays: -14,
    daysToHarvest: 120,
    waterFrequencyDays: 3,
    spacing: '4-6 inches',
    tasks: [
      { slug: 'transplant-sets', title: 'Transplant onion sets', content: 'Plant sets or transplants 1" deep, 4-6" apart. Onions are cold-hardy and can go out before last frost.', daysRelativeToFrost: -14 },
      { slug: 'fertilize', title: 'Fertilize onions', content: 'Side-dress with nitrogen-rich fertilizer. Onions are heavy feeders during the bulbing phase.', daysRelativeToFrost: 30 },
      { slug: 'stop-watering', title: 'Stop watering onions', content: 'When tops begin to fall over, stop watering to let bulbs cure in the ground.', daysRelativeToFrost: 90 },
      { slug: 'harvest', title: 'Harvest onions', content: 'Pull when tops have fallen and dried. Cure in a warm, dry spot for 2-3 weeks before storing.', daysRelativeToFrost: 120 },
    ],
  },
  {
    slug: 'green-onion',
    name: 'Green Onion',
    category: 'vegetable',
    startIndoorsWeeksBeforeFrost: null,
    transplantAfterLastFrostDays: -14,
    directSowAfterLastFrostDays: -14,
    daysToHarvest: 60,
    waterFrequencyDays: 2,
    spacing: '2-3 inches',
    tasks: [
      { slug: 'direct-sow', title: 'Direct sow green onion seeds', content: 'Sow seeds ¼" deep, ½" apart. Can go out as soon as soil is workable. Cold-hardy.', daysRelativeToFrost: -14 },
      { slug: 'succession-sow', title: 'Succession sow green onions', content: 'Sow another round for continuous harvest. Repeat every 3 weeks through the season.', daysRelativeToFrost: 21 },
    ],
  },
  {
    slug: 'cilantro',
    name: 'Cilantro',
    category: 'herb',
    startIndoorsWeeksBeforeFrost: null,
    transplantAfterLastFrostDays: -14,
    directSowAfterLastFrostDays: -14,
    daysToHarvest: 45,
    waterFrequencyDays: 2,
    spacing: '6-8 inches',
    tasks: [
      { slug: 'first-sow', title: 'First sow cilantro seeds', content: 'Sow seeds ¼" deep. Cilantro prefers cool weather — it bolts quickly in heat. Plant in partial shade if possible.', daysRelativeToFrost: -14 },
      { slug: 'succession-sow-1', title: 'Succession sow cilantro (round 2)', content: 'Sow another batch to extend your harvest. Cilantro bolts fast, so succession sowing is key.', daysRelativeToFrost: 7 },
      { slug: 'succession-sow-2', title: 'Succession sow cilantro (round 3)', content: 'Third sowing. Consider a bolt-resistant variety like "Slow Bolt" or "Calypso."', daysRelativeToFrost: 28 },
    ],
  },
  {
    slug: 'romaine-lettuce',
    name: 'Romaine Lettuce',
    category: 'vegetable',
    startIndoorsWeeksBeforeFrost: null,
    transplantAfterLastFrostDays: -21,
    directSowAfterLastFrostDays: -21,
    daysToHarvest: 65,
    waterFrequencyDays: 1,
    spacing: '8-12 inches',
    tasks: [
      { slug: 'first-sow', title: 'Sow romaine lettuce seeds', content: 'Sow seeds ¼" deep. Lettuce germinates best in cool soil (40-65°F). Barely cover seeds — they need light.', daysRelativeToFrost: -21 },
      { slug: 'thin', title: 'Thin romaine lettuce seedlings', content: 'Thin to 8-12 inches apart. Use thinnings in salads — they\'re edible!', daysRelativeToFrost: -7 },
      { slug: 'harvest-outer-leaves', title: 'Harvest outer romaine leaves', content: 'Pick outer leaves once they reach 6-8 inches. Leave the center to keep producing. This is "cut and come again" harvesting.', daysRelativeToFrost: 24 },
    ],
  },
  {
    slug: 'spinach',
    name: 'Spinach',
    category: 'vegetable',
    startIndoorsWeeksBeforeFrost: null,
    transplantAfterLastFrostDays: -42,
    directSowAfterLastFrostDays: -42,
    daysToHarvest: 40,
    waterFrequencyDays: 2,
    spacing: '4-6 inches',
    tasks: [
      { slug: 'first-sow', title: 'First sow spinach seeds', content: 'Sow seeds ½" deep. Spinach thrives in cool weather and can handle light frost. Soak seeds overnight for faster germination.', daysRelativeToFrost: -42 },
      { slug: 'succession-sow', title: 'Succession sow spinach', content: 'Sow another round for extended harvest before it gets too warm.', daysRelativeToFrost: -21 },
      { slug: 'harvest', title: 'Harvest spinach', content: 'Harvest outer leaves when they reach 3-4 inches, or cut the whole plant. Harvest before bolting in warm weather.', daysRelativeToFrost: -2 },
    ],
  },
  {
    slug: 'beet',
    name: 'Beet',
    category: 'vegetable',
    startIndoorsWeeksBeforeFrost: null,
    transplantAfterLastFrostDays: -28,
    directSowAfterLastFrostDays: -28,
    daysToHarvest: 55,
    waterFrequencyDays: 3,
    spacing: '3-4 inches',
    tasks: [
      { slug: 'direct-sow', title: 'Direct sow beet seeds', content: 'Sow seeds ½" deep, 1" apart. Each beet "seed" is actually a cluster — expect multiple sprouts. Soak seeds overnight.', daysRelativeToFrost: -28 },
      { slug: 'thin-seedlings', title: 'Thin beet seedlings', content: 'Thin to 3-4 inches apart. Use beet greens from thinnings — they\'re delicious sautéed.', daysRelativeToFrost: -14 },
      { slug: 'harvest', title: 'Harvest beets', content: 'Pull when roots are 1.5-3" diameter. Don\'t let them get too big or they\'ll be woody.', daysRelativeToFrost: 27 },
    ],
  },
  {
    slug: 'carrot',
    name: 'Carrot',
    category: 'vegetable',
    startIndoorsWeeksBeforeFrost: null,
    transplantAfterLastFrostDays: -21,
    directSowAfterLastFrostDays: -21,
    daysToHarvest: 70,
    waterFrequencyDays: 2,
    spacing: '2-3 inches',
    tasks: [
      { slug: 'direct-sow', title: 'Direct sow carrot seeds', content: 'Sow seeds ¼" deep. Keep soil moist for 2-3 weeks — carrots are slow to germinate. Mix with radish seeds to mark rows.', daysRelativeToFrost: -21 },
      { slug: 'thin', title: 'Thin carrot seedlings', content: 'Thin to 2-3 inches apart. Be gentle — disturbing roots causes forking. Water after thinning.', daysRelativeToFrost: -7 },
      { slug: 'harvest', title: 'Harvest carrots', content: 'Pull when tops of roots are ½-¾" diameter at soil line. Loosen soil with a fork first — don\'t just yank.', daysRelativeToFrost: 49 },
    ],
  },
  {
    slug: 'potato',
    name: 'Potato',
    category: 'vegetable',
    startIndoorsWeeksBeforeFrost: null,
    transplantAfterLastFrostDays: -14,
    directSowAfterLastFrostDays: -14,
    daysToHarvest: 90,
    waterFrequencyDays: 3,
    spacing: '12-15 inches',
    tasks: [
      { slug: 'plant', title: 'Plant seed potatoes', content: 'Cut seed potatoes into chunks with 2-3 eyes each. Cure cuts for 1-2 days. Plant 4" deep, 12-15" apart.', daysRelativeToFrost: -14 },
      { slug: 'hill-up', title: 'Hill up potatoes (first time)', content: 'When plants are 6-8" tall, mound soil around stems leaving 4" exposed. This encourages more tubers.', daysRelativeToFrost: 7 },
      { slug: 'hill-again', title: 'Hill up potatoes (second time)', content: 'Hill again as plants grow. Keep tubers covered to prevent greening.', daysRelativeToFrost: 28 },
      { slug: 'harvest', title: 'Harvest potatoes', content: 'For new potatoes, harvest when plants flower. For storage potatoes, wait until tops die back. Cure for 1-2 weeks before storing.', daysRelativeToFrost: 76 },
    ],
  },
  {
    slug: 'pea',
    name: 'Pea',
    category: 'vegetable',
    startIndoorsWeeksBeforeFrost: null,
    transplantAfterLastFrostDays: -42,
    directSowAfterLastFrostDays: -42,
    daysToHarvest: 60,
    waterFrequencyDays: 2,
    spacing: '2-4 inches',
    tasks: [
      { slug: 'direct-sow', title: 'Direct sow pea seeds', content: 'Sow seeds 1" deep, 2-4" apart. Peas fix nitrogen — no need for nitrogen fertilizer. Inoculate seeds with rhizobium for best results.', daysRelativeToFrost: -42 },
      { slug: 'provide-trellis', title: 'Set up pea trellis', content: 'Install trellis, netting, or stakes. Even "bush" peas benefit from some support.', daysRelativeToFrost: -35 },
      { slug: 'harvest', title: 'Harvest peas', content: 'Pick when pods are plump but before they get starchy. Harvest frequently to encourage more production.', daysRelativeToFrost: 18 },
    ],
  },
];

// Helper to look up a plant by slug
export function getPlantBySlug(slug: string): PlantDefinition | undefined {
  return PLANT_CATALOG.find((p) => p.slug === slug);
}

// === Compute Garden Tasks ===

export async function computeGardenTasks(
  userId: string,
  today: Date
): Promise<ComputedGardenTask[]> {
  // Fetch user's zip for frost dates
  const [user] = await db
    .select({ locationZip: users.locationZip })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user?.locationZip) return [];

  const { lastSpringFrost } = getFrostDates(user.locationZip);
  const todayStart = startOfDay(today);

  // Fetch user's active garden plants
  const plants = await db
    .select()
    .from(gardenPlants)
    .where(and(eq(gardenPlants.userId, userId), eq(gardenPlants.archived, false)));

  if (plants.length === 0) return [];

  // Fetch completions for this year
  const currentYear = today.getFullYear();
  const completions = await db
    .select()
    .from(userModuleCompletions)
    .where(
      and(
        eq(userModuleCompletions.userId, userId),
        eq(userModuleCompletions.moduleSlug, 'garden'),
        eq(userModuleCompletions.year, currentYear)
      )
    );

  const completedSet = new Set(
    completions.map((c) => `${c.taskSlug}`)
  );

  const tasks: ComputedGardenTask[] = [];

  for (const plant of plants) {
    const definition = getPlantBySlug(plant.plantSlug);
    if (!definition) continue;

    for (const taskTemplate of definition.tasks) {
      // Unique completion key: plantId-taskSlug
      const completionKey = `${plant.id}-${taskTemplate.slug}`;
      if (completedSet.has(completionKey)) continue;

      const taskDate = startOfDay(
        addDays(lastSpringFrost, taskTemplate.daysRelativeToFrost)
      );

      // Show tasks that are overdue or within 14 days
      const daysUntil = differenceInDays(taskDate, todayStart);
      if (daysUntil > 14) continue; // too far out
      // No lower bound — overdue tasks always show

      tasks.push({
        source: 'garden',
        plantSlug: plant.plantSlug,
        plantName: definition.name,
        customName: plant.customName,
        taskSlug: completionKey,
        title: taskTemplate.title,
        content: taskTemplate.content,
        date: taskDate,
        gardenPlantId: plant.id,
      });
    }
  }

  // Sort by date ascending
  tasks.sort((a, b) => a.date.getTime() - b.date.getTime());

  return tasks;
}
