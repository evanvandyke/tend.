export type ModuleTaskTemplate = {
  slug: string;
  kind: 'recurring' | 'seasonal' | 'project' | 'quick' | 'longcycle';
  title: string;
  content: string;
  windowStart?: { month: number; day: number };
  windowEnd?: { month: number; day: number };
  cadenceDays?: number;
  conditions?: {
    minSoilTemp?: number;
    maxNighttimeTemp?: number;
    afterLastFrost?: boolean;
    beforeFirstFrost?: boolean;
  };
};

export type Module = {
  slug: string;
  name: string;
  description: string;
  region?: string;
  tasks: ModuleTaskTemplate[];
};
