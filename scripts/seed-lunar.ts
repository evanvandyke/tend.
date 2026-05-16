import { computeLunarEvents } from '../lib/lunar';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../lib/db/schema';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql, { schema });

  console.log('Computing lunar events for 2026-2030...');
  const events = computeLunarEvents(2026, 2030);
  console.log(`Computed ${events.length} lunar events.`);

  // Write JSON backup
  const seedDir = path.join(__dirname, '..', 'data', 'seed');
  fs.mkdirSync(seedDir, { recursive: true });
  const jsonPath = path.join(seedDir, 'lunar-events.json');
  fs.writeFileSync(jsonPath, JSON.stringify(events.map(e => ({
    eventDate: e.eventDate.toISOString(),
    eventType: e.eventType,
    name: e.name,
    description: e.description,
  })), null, 2));
  console.log(`Wrote JSON backup to ${jsonPath}`);

  // Truncate and re-insert for idempotency
  console.log('Clearing existing lunar events...');
  await db.delete(schema.lunarEvents);

  console.log('Inserting lunar events...');
  // Insert in batches of 50
  const batchSize = 50;
  for (let i = 0; i < events.length; i += batchSize) {
    const batch = events.slice(i, i + batchSize);
    await db.insert(schema.lunarEvents).values(
      batch.map(e => ({
        eventDate: e.eventDate,
        eventType: e.eventType,
        name: e.name,
        description: e.description,
      }))
    );
  }

  // Verify
  const result = await db.select().from(schema.lunarEvents);
  console.log(`Seed complete. ${result.length} lunar events in database.`);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
