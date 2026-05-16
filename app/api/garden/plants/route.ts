import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { gardenPlants, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { addDays } from 'date-fns';
import { getFrostDates } from '@/lib/frost';
import { getPlantBySlug, PLANT_CATALOG } from '@/lib/modules/garden';

// GET — List user's garden plants with catalog info merged
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const plants = await db
    .select()
    .from(gardenPlants)
    .where(
      and(eq(gardenPlants.userId, session.user.id), eq(gardenPlants.archived, false))
    );

  const enriched = plants.map((plant) => {
    const catalog = getPlantBySlug(plant.plantSlug);
    return {
      ...plant,
      catalog: catalog
        ? {
            name: catalog.name,
            category: catalog.category,
            daysToHarvest: catalog.daysToHarvest,
            waterFrequencyDays: catalog.waterFrequencyDays,
            spacing: catalog.spacing,
          }
        : null,
    };
  });

  return NextResponse.json(enriched);
}

const addPlantSchema = z.object({
  plantSlug: z.string().min(1),
  customName: z.string().optional(),
  count: z.number().int().positive().default(1),
});

// POST — Add a plant to the user's garden
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = addPlantSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { plantSlug, customName, count } = parsed.data;

  // Validate plant slug exists in catalog
  const catalog = getPlantBySlug(plantSlug);
  if (!catalog) {
    const available = PLANT_CATALOG.map((p) => p.slug).join(', ');
    return NextResponse.json(
      { error: `Unknown plant slug. Available: ${available}` },
      { status: 400 }
    );
  }

  // Get frost dates for estimated harvest calculation
  const [user] = await db
    .select({ locationZip: users.locationZip })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const zip = user?.locationZip ?? '84003';
  const { lastSpringFrost } = getFrostDates(zip);

  // Compute estimated harvest date
  // Harvest = transplant/sow date + daysToHarvest
  const sowOrTransplantDay =
    catalog.directSowAfterLastFrostDays ?? catalog.transplantAfterLastFrostDays;
  const sowDate = addDays(lastSpringFrost, sowOrTransplantDay);
  const estimatedHarvestAt = addDays(sowDate, catalog.daysToHarvest);

  const [plant] = await db
    .insert(gardenPlants)
    .values({
      userId: session.user.id,
      plantSlug,
      customName: customName ?? null,
      count,
      estimatedHarvestAt,
    })
    .returning();

  return NextResponse.json({ ...plant, catalog: { name: catalog.name, category: catalog.category } }, { status: 201 });
}

const archiveSchema = z.object({
  id: z.number().int().positive(),
});

// PATCH — Archive a plant
export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = archiveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(gardenPlants)
    .set({ archived: true })
    .where(
      and(eq(gardenPlants.id, parsed.data.id), eq(gardenPlants.userId, session.user.id))
    )
    .returning();

  if (!updated) {
    return NextResponse.json({ error: 'Plant not found' }, { status: 404 });
  }

  return NextResponse.json(updated);
}
