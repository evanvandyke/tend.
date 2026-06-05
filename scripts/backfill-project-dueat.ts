/**
 * One-off backfill: unify project dates onto the `dueAt` column.
 *
 * Historically, projects created via the Projects-page form stored their date in
 * `projectData.targetCompletion` and left the `dueAt` column null. We've since made
 * `dueAt` the single source of truth. This script copies the legacy
 * `projectData->>'targetCompletion'` value into `dueAt` for any project that still
 * has a null `dueAt`.
 *
 * Idempotent: only touches rows where dueAt IS NULL, so re-running is safe.
 *
 * Run with: tsx scripts/backfill-project-dueat.ts   (NOT run automatically)
 */
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { and, eq, isNull, isNotNull, sql } from 'drizzle-orm';
import * as schema from '../lib/db/schema';
import { userTasks } from '../lib/db/schema';

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const client = neon(process.env.DATABASE_URL);
  const db = drizzle(client, { schema });

  // Find projects with no dueAt but a legacy targetCompletion to migrate.
  const candidates = await db
    .select({
      id: userTasks.id,
      title: userTasks.title,
      targetCompletion: sql<string>`${userTasks.projectData}->>'targetCompletion'`,
    })
    .from(userTasks)
    .where(
      and(
        eq(userTasks.kind, 'project'),
        isNull(userTasks.dueAt),
        isNotNull(sql`${userTasks.projectData}->>'targetCompletion'`)
      )
    );

  console.log(`Found ${candidates.length} project(s) needing a dueAt backfill.`);

  let updated = 0;
  for (const row of candidates) {
    const parsed = new Date(row.targetCompletion);
    if (isNaN(parsed.getTime())) {
      console.warn(
        `  ! Skipping project ${row.id} ("${row.title}") — unparseable targetCompletion: ${row.targetCompletion}`
      );
      continue;
    }

    await db
      .update(userTasks)
      .set({ dueAt: parsed, updatedAt: new Date() })
      // Re-assert the null guard so the update stays idempotent even under concurrency.
      .where(and(eq(userTasks.id, row.id), isNull(userTasks.dueAt)));

    updated += 1;
    console.log(
      `  ✓ Project ${row.id} ("${row.title}") → dueAt = ${parsed.toISOString()} (from ${row.targetCompletion})`
    );
  }

  console.log(`\nDone. Updated ${updated} of ${candidates.length} candidate project(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
