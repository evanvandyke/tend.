import { Module, ModuleTaskTemplate } from './types';
import { lawnUtahModule } from './lawn-utah';

export type { Module, ModuleTaskTemplate };
export { isInWindow } from './utils';

const gardenModule: Module = {
  slug: 'garden',
  name: 'Garden',
  description:
    'Track your vegetable garden from seed to harvest. Get personalized task reminders based on your frost dates and the plants you\'re growing.',
  tasks: [], // Garden tasks are plant-dependent, computed dynamically via computeGardenTasks
};

const modules: Record<string, Module> = {
  'lawn-utah': lawnUtahModule,
  garden: gardenModule,
};

export function getModule(slug: string): Module | null {
  return modules[slug] ?? null;
}

export function getAllModules(): Module[] {
  return Object.values(modules);
}
