import { ModuleTaskTemplate } from './types';

export function isInWindow(
  today: Date,
  task: ModuleTaskTemplate,
  frostDates?: { lastSpringFrost: Date; firstFallFrost: Date }
): boolean {
  if (!task.windowStart || !task.windowEnd) return true; // always active

  const year = today.getFullYear();
  const start = new Date(year, task.windowStart.month - 1, task.windowStart.day);
  const end = new Date(year, task.windowEnd.month - 1, task.windowEnd.day);

  // Handle windows that span year boundary (e.g., Dec 1 - Feb 28)
  if (start > end) {
    return today >= start || today <= end;
  }

  return today >= start && today <= end;
}
