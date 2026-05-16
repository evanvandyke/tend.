import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { hash } from 'bcryptjs';
import * as schema from '../lib/db/schema';

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql, { schema });

  const email = 'evan.vandyke@gmail.com';
  const password = 'tendtend1';
  const name = 'Evan';
  const locationZip = '84003';

  // === 1. Create or find user ===
  console.log('Checking for existing user...');
  const existing = await db.select().from(schema.users).where(eq(schema.users.email, email));

  let userId: string;

  if (existing.length > 0) {
    userId = existing[0].id;
    console.log(`User already exists (${userId}), updating...`);
    await db.update(schema.users).set({ name, locationZip }).where(eq(schema.users.id, userId));
  } else {
    console.log('Creating user...');
    const passwordHash = await hash(password, 12);
    const inserted = await db.insert(schema.users).values({
      email,
      passwordHash,
      name,
      locationZip,
    }).returning({ id: schema.users.id });
    userId = inserted[0].id;
    console.log(`Created user: ${userId}`);
  }

  // === 2. Enable modules ===
  console.log('Enabling modules...');

  // Lawn Utah
  await db.insert(schema.userModules).values({
    userId,
    moduleSlug: 'lawn-utah',
    enabled: true,
  }).onConflictDoUpdate({
    target: [schema.userModules.userId, schema.userModules.moduleSlug],
    set: { enabled: true },
  });

  // Garden
  await db.insert(schema.userModules).values({
    userId,
    moduleSlug: 'garden',
    enabled: true,
  }).onConflictDoUpdate({
    target: [schema.userModules.userId, schema.userModules.moduleSlug],
    set: { enabled: true },
  });

  console.log('Modules enabled: lawn-utah, garden');

  // === 3. Add garden plants ===
  console.log('Adding garden plants...');

  const plants = [
    { slug: 'tomato', count: 8 },
    { slug: 'onion', count: 4 },
    { slug: 'green-onion', count: 9 },
    { slug: 'bell-pepper', count: 2 },
    { slug: 'serrano-pepper', count: 1 },
    { slug: 'cilantro', count: 4 },
    { slug: 'romaine', count: 6 },
    { slug: 'beets', count: 9 },
    { slug: 'potato', count: 4 },
    { slug: 'peas', count: 18 },
    { slug: 'carrot', count: 32 },
    { slug: 'cucumber', count: 8 },
    { slug: 'spinach', count: 36 },
  ];

  // Clear existing plants for this user to avoid duplicates on re-run
  await db.delete(schema.gardenPlants).where(eq(schema.gardenPlants.userId, userId));

  for (const plant of plants) {
    await db.insert(schema.gardenPlants).values({
      userId,
      plantSlug: plant.slug,
      count: plant.count,
    });
  }
  console.log(`Added ${plants.length} garden plants.`);

  // === 4. Create user tasks ===
  console.log('Creating user tasks...');

  // Clear existing tasks for idempotency
  await db.delete(schema.userTasks).where(eq(schema.userTasks.userId, userId));

  // Projects
  await db.insert(schema.userTasks).values({
    userId,
    kind: 'project',
    status: 'active',
    title: 'Stain back fence',
    projectData: {
      subtasks: [
        { title: 'Buy stain', done: false },
        { title: 'Sand', done: false },
        { title: 'Apply stain', done: false },
        { title: 'Second coat', done: false },
      ],
    },
  });

  await db.insert(schema.userTasks).values({
    userId,
    kind: 'project',
    status: 'active',
    title: 'Touch up paint in bonus room',
    projectData: { subtasks: [] },
  });

  await db.insert(schema.userTasks).values({
    userId,
    kind: 'project',
    status: 'active',
    title: 'Plant trees and bushes in front',
    projectData: { subtasks: [] },
  });

  await db.insert(schema.userTasks).values({
    userId,
    kind: 'project',
    status: 'active',
    title: 'Downstairs floor trim threshold',
    projectData: { subtasks: [] },
  });

  // Quick tasks
  await db.insert(schema.userTasks).values({
    userId,
    kind: 'quick',
    status: 'done',
    title: "Fix Lincoln's bathroom door handle",
    completedAt: new Date(),
  });

  await db.insert(schema.userTasks).values({
    userId,
    kind: 'quick',
    status: 'active',
    title: 'Shed molding',
  });

  await db.insert(schema.userTasks).values({
    userId,
    kind: 'quick',
    status: 'active',
    title: "Addyson's bathroom lights",
  });

  await db.insert(schema.userTasks).values({
    userId,
    kind: 'quick',
    status: 'active',
    title: 'Weed/spray driveway',
  });

  await db.insert(schema.userTasks).values({
    userId,
    kind: 'quick',
    status: 'active',
    title: 'Fix lawn at bottom of deck stairs',
  });

  // Recurring task
  const now = new Date();
  const nextDue = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days from now

  await db.insert(schema.userTasks).values({
    userId,
    kind: 'recurring',
    status: 'active',
    title: 'Cat litter',
    cadenceDays: 5,
    nextDueAt: nextDue,
  });

  console.log('Created all user tasks.');
  console.log('\nSeed complete! Demo user ready.');
  console.log(`  Email: ${email}`);
  console.log(`  Password: ${password}`);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
