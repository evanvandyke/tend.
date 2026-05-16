import { pgTable, serial, text, integer, timestamp, boolean, jsonb, pgEnum, primaryKey } from 'drizzle-orm/pg-core';

// === ENUMS ===
export const taskKindEnum = pgEnum('task_kind', [
  'recurring',
  'seasonal',
  'project',
  'quick',
  'longcycle',
]);

export const taskStatusEnum = pgEnum('task_status', [
  'active',
  'pending',
  'done',
  'archived',
]);

// === AUTH TABLES ===
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  locationZip: text('location_zip').default('84003'),
  emailNotificationsEnabled: boolean('email_notifications_enabled').default(true),
  pushNotificationsEnabled: boolean('push_notifications_enabled').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
});

// === USER TASKS ===
export const userTasks = pgTable('user_tasks', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  kind: taskKindEnum('kind').notNull(),
  status: taskStatusEnum('status').notNull().default('active'),
  title: text('title').notNull(),
  content: text('content'),
  cadenceDays: integer('cadence_days'),
  cadenceYears: integer('cadence_years'),
  lastCompletedAt: timestamp('last_completed_at'),
  nextDueAt: timestamp('next_due_at'),
  windowStartMonth: integer('window_start_month'),
  windowStartDay: integer('window_start_day'),
  windowEndMonth: integer('window_end_month'),
  windowEndDay: integer('window_end_day'),
  projectData: jsonb('project_data'),
  dueAt: timestamp('due_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// === MODULE SYSTEM ===
export const userModules = pgTable('user_modules', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  moduleSlug: text('module_slug').notNull(),
  enabled: boolean('enabled').notNull().default(true),
  enabledAt: timestamp('enabled_at').defaultNow().notNull(),
  customizations: jsonb('customizations'),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.moduleSlug] }),
}));

export const userModuleCompletions = pgTable('user_module_completions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  moduleSlug: text('module_slug').notNull(),
  taskSlug: text('task_slug').notNull(),
  year: integer('year').notNull(),
  status: text('status').notNull().default('completed'), // 'completed' | 'skipped'
  completedAt: timestamp('completed_at').defaultNow().notNull(),
});

// === GARDEN-SPECIFIC ===
export const gardenPlants = pgTable('garden_plants', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  plantSlug: text('plant_slug').notNull(),
  customName: text('custom_name'),
  count: integer('count').notNull().default(1),
  startedIndoorsAt: timestamp('started_indoors_at'),
  transplantedAt: timestamp('transplanted_at'),
  estimatedHarvestAt: timestamp('estimated_harvest_at'),
  archived: boolean('archived').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// === LUNAR EVENTS ===
export const lunarEvents = pgTable('lunar_events', {
  id: serial('id').primaryKey(),
  eventDate: timestamp('event_date').notNull(),
  eventType: text('event_type').notNull(),
  name: text('name').notNull(),
  description: text('description'),
});

// === PUSH SUBSCRIPTIONS ===
export const pushSubscriptions = pgTable('push_subscriptions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  endpoint: text('endpoint').notNull().unique(),
  keys: jsonb('keys').notNull(),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// === NOTIFICATION LOG ===
export const notificationLog = pgTable('notification_log', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  channel: text('channel').notNull(),
  topic: text('topic').notNull(),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
});
