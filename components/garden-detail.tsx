'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Archive, Sprout, Check } from 'lucide-react';
import { SectionHeader } from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { PlantPicker } from '@/components/plant-picker';

interface CatalogPlant {
  slug: string;
  name: string;
  category: 'vegetable' | 'herb';
  daysToHarvest: number;
  spacing: string;
  waterFrequencyDays: number;
  startIndoorsWeeksBeforeFrost: number | null;
}

type PlantTaskStatus = 'past-due' | 'today' | 'upcoming' | 'distant' | 'all-done';

interface SerializedTask {
  slug: string;
  title: string;
  content: string;
  date: string;
  completed: boolean;
  completionKey: string;
}

interface SerializedNextTask {
  slug: string;
  title: string;
  content: string;
  date: string;
  daysUntil: number;
  status: PlantTaskStatus;
}

interface SerializedPlantAction {
  plantId: number;
  plantSlug: string;
  plantName: string;
  customName: string | null;
  count: number;
  nextTask: SerializedNextTask | null;
  totalTasks: number;
  completedTasks: number;
  allTasks: SerializedTask[];
}

interface FrostInfo {
  lastFrostDate: string;
  zip: string;
}

interface GardenDetailProps {
  catalog: CatalogPlant[];
  plantActions: SerializedPlantAction[];
  frostInfo: FrostInfo;
}

function formatFrostDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

function formatTaskDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getStatusBadge(nextTask: SerializedNextTask | null, completedTasks: number, totalTasks: number) {
  if (!nextTask && completedTasks === totalTasks) {
    return {
      label: 'All done this season',
      color: 'text-[var(--sepia)]',
      bg: 'bg-[var(--vellum)]',
      icon: true,
    };
  }

  if (!nextTask) {
    return {
      label: `${completedTasks}/${totalTasks} tasks done`,
      color: 'text-[var(--sepia)]',
      bg: 'bg-[var(--vellum)]',
      icon: false,
    };
  }

  const { daysUntil, title, status } = nextTask;

  // Short action label from the title (strip plant name prefix)
  const shortTitle = title.replace(/^(Start|Harden off|Transplant|Fertilize|First fertilize|Stake and prune|Direct sow|Thin|Harvest|Set up|Succession sow|Hill up|Stop watering|Plant|Provide trellis)\s*/i, '$1');

  let label: string;
  if (daysUntil < 0) {
    label = `${shortTitle} · ${Math.abs(daysUntil)}d overdue`;
  } else if (daysUntil === 0) {
    label = `${shortTitle} · today`;
  } else if (daysUntil === 1) {
    label = `${shortTitle} · tomorrow`;
  } else {
    label = `${shortTitle} · in ${daysUntil}d`;
  }

  let color: string;
  let bg: string;

  switch (status) {
    case 'past-due':
      color = 'text-[var(--bordeaux)]';
      bg = 'bg-[#7A2E1F0D]';
      break;
    case 'today':
      color = 'text-[var(--mustard)]';
      bg = 'bg-[#A87C2D0D]';
      break;
    case 'upcoming':
      color = 'text-[var(--forest)]';
      bg = 'bg-[#2D52350D]';
      break;
    case 'distant':
      color = 'text-[var(--sepia)]';
      bg = 'bg-[var(--vellum)]';
      break;
    default:
      color = 'text-[var(--sepia)]';
      bg = 'bg-[var(--vellum)]';
  }

  return { label, color, bg, icon: false };
}

function GardenDetail({ catalog, plantActions, frostInfo }: GardenDetailProps) {
  const [plants, setPlants] = useState<SerializedPlantAction[]>(plantActions);
  const [showPicker, setShowPicker] = useState(false);
  const [expandedPlantId, setExpandedPlantId] = useState<number | null>(null);
  const [completingTask, setCompletingTask] = useState<string | null>(null);

  function refreshPlants() {
    window.location.reload();
  }

  async function archivePlant(id: number) {
    await fetch('/api/garden/plants', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setPlants((prev) => prev.filter((p) => p.plantId !== id));
    setExpandedPlantId(null);
  }

  async function addPlant(plantSlug: string, count: number, customName?: string) {
    const res = await fetch('/api/garden/plants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plantSlug, count, customName: customName || undefined }),
    });
    if (res.ok) {
      refreshPlants();
    }
    setShowPicker(false);
  }

  async function completeTask(plantId: number, completionKey: string) {
    setCompletingTask(completionKey);
    const year = new Date().getFullYear();
    const res = await fetch('/api/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        moduleSlug: 'garden',
        taskSlug: completionKey,
        year,
        status: 'completed',
      }),
    });

    if (res.ok) {
      // Update local state to mark task as completed
      setPlants((prev) =>
        prev.map((p) => {
          if (p.plantId !== plantId) return p;
          const updatedTasks = p.allTasks.map((t) =>
            t.completionKey === completionKey ? { ...t, completed: true } : t
          );
          const newCompletedCount = updatedTasks.filter((t) => t.completed).length;

          // Find next uncompleted task
          const nextUncompleted = updatedTasks.find((t) => !t.completed);
          let nextTask: SerializedNextTask | null = null;
          if (nextUncompleted) {
            const taskDate = new Date(nextUncompleted.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const daysUntil = Math.round((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            let status: PlantTaskStatus;
            if (daysUntil < 0) status = 'past-due';
            else if (daysUntil === 0) status = 'today';
            else if (daysUntil <= 7) status = 'upcoming';
            else status = 'distant';

            nextTask = {
              slug: nextUncompleted.slug,
              title: nextUncompleted.title,
              content: nextUncompleted.content,
              date: nextUncompleted.date,
              daysUntil,
              status,
            };
          }

          return {
            ...p,
            allTasks: updatedTasks,
            completedTasks: newCompletedCount,
            nextTask,
          };
        })
      );
    }
    setCompletingTask(null);
  }

  return (
    <div>
      {/* Header with back arrow */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        <Link
          href="/modules"
          className="flex items-center justify-center w-[44px] h-[44px] -ml-2"
          aria-label="Back to modules"
        >
          <ArrowLeft size={20} strokeWidth={1.5} className="text-[var(--iron-gall)]" />
        </Link>
        <div className="flex-1">
          <h2 className="font-[family-name:var(--font-display)] text-[22px] font-semibold text-[var(--iron-gall)]">
            Garden
          </h2>
          <p className="font-[family-name:var(--font-body)] text-[13px] text-[var(--sepia)]">
            Last frost: {formatFrostDate(frostInfo.lastFrostDate)} · ZIP {frostInfo.zip}
          </p>
        </div>
        <button
          onClick={() => setShowPicker(true)}
          className="flex items-center justify-center w-[44px] h-[44px] rounded-full bg-[var(--forest)] text-white cursor-pointer"
          aria-label="Add plant"
        >
          <Plus size={20} strokeWidth={2} />
        </button>
      </div>

      {/* My Plants Section */}
      <SectionHeader title="My Plants" />

      {plants.length === 0 ? (
        <div className="px-4 py-10 text-center flex flex-col items-center">
          <Sprout size={36} strokeWidth={1.2} className="text-[var(--mustard)] mb-4 opacity-60" />
          <p className="font-[family-name:var(--font-display)] text-[20px] italic text-[var(--text-secondary)]">
            Your garden is empty.
          </p>
          <p className="font-[family-name:var(--font-body)] text-[14px] text-[var(--text-tertiary)] mt-2 leading-relaxed max-w-[280px]">
            Add plants to get started — we&apos;ll tell you when to sow, transplant, and harvest.
          </p>
          <div className="mt-6">
            <Button onClick={() => setShowPicker(true)} variant="secondary">
              <Plus size={16} strokeWidth={1.5} className="mr-2" />
              Add Plant
            </Button>
          </div>
        </div>
      ) : (
        <div className="px-4 pt-2">
          {/* Card Grid */}
          <div className="grid grid-cols-2 gap-3">
            {plants.map((plant) => {
              const badge = getStatusBadge(plant.nextTask, plant.completedTasks, plant.totalTasks);
              const isExpanded = expandedPlantId === plant.plantId;

              return (
                <button
                  key={plant.plantId}
                  onClick={() => setExpandedPlantId(isExpanded ? null : plant.plantId)}
                  className={[
                    'bg-[var(--aged-paper)] border border-[var(--hairline)] rounded-[var(--radius-md)] shadow-[var(--shadow-1)]',
                    'p-4 text-left cursor-pointer transition-all duration-150',
                    isExpanded ? 'ring-1 ring-[var(--forest)]' : '',
                  ].join(' ')}
                >
                  {/* Plant name */}
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="font-[family-name:var(--font-display)] text-[19px] font-semibold text-[var(--iron-gall)] leading-tight">
                      {plant.customName || plant.plantName}
                    </span>
                    {plant.count > 1 && (
                      <span className="font-[family-name:var(--font-body)] text-[14px] text-[var(--sepia)]">
                        ×{plant.count}
                      </span>
                    )}
                  </div>

                  {/* Status badge */}
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${badge.bg}`}>
                    {badge.icon && (
                      <Check size={12} strokeWidth={2} className={badge.color} />
                    )}
                    <span className={`font-[family-name:var(--font-body)] text-[13px] ${badge.color} leading-tight`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Progress indicator */}
                  <div className="mt-2 flex items-center gap-1.5">
                    <div className="flex-1 h-[3px] bg-[var(--hairline)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--forest)] rounded-full transition-all duration-300"
                        style={{ width: `${(plant.completedTasks / plant.totalTasks) * 100}%` }}
                      />
                    </div>
                    <span className="font-[family-name:var(--font-body)] text-[11px] text-[var(--text-tertiary)]">
                      {plant.completedTasks}/{plant.totalTasks}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Expanded Detail Panel (below grid) */}
          {expandedPlantId && (() => {
            const plant = plants.find((p) => p.plantId === expandedPlantId);
            if (!plant) return null;

            return (
              <div className="mt-3 bg-[var(--aged-paper)] border border-[var(--hairline)] rounded-[var(--radius-md)] shadow-[var(--shadow-1)] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-[family-name:var(--font-display)] text-[16px] font-semibold text-[var(--iron-gall)]">
                    {plant.customName || plant.plantName} — Tasks
                  </h3>
                  <button
                    onClick={() => archivePlant(plant.plantId)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded text-[var(--text-tertiary)] hover:text-[var(--bordeaux)] hover:bg-[var(--vellum)] transition-colors cursor-pointer"
                    aria-label={`Archive ${plant.customName || plant.plantName}`}
                  >
                    <Archive size={14} strokeWidth={1.5} />
                    <span className="font-[family-name:var(--font-body)] text-[12px]">Archive</span>
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {plant.allTasks.map((task) => (
                    <div
                      key={task.completionKey}
                      className={[
                        'flex items-start gap-3 py-2 px-2 rounded-[var(--radius-md)]',
                        task.completed ? 'opacity-60' : '',
                      ].join(' ')}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => {
                          if (!task.completed) {
                            completeTask(plant.plantId, task.completionKey);
                          }
                        }}
                        disabled={task.completed || completingTask === task.completionKey}
                        className={[
                          'flex-shrink-0 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center mt-0.5 cursor-pointer',
                          task.completed
                            ? 'bg-[var(--forest)] border-[var(--forest)]'
                            : 'border-[var(--hairline)] hover:border-[var(--forest)]',
                          completingTask === task.completionKey ? 'animate-pulse' : '',
                        ].join(' ')}
                        aria-label={task.completed ? 'Completed' : `Complete ${task.title}`}
                      >
                        {task.completed && (
                          <Check size={12} strokeWidth={3} className="text-white" />
                        )}
                      </button>

                      {/* Task info */}
                      <div className="flex-1 min-w-0">
                        <span className={[
                          'font-[family-name:var(--font-body)] text-[14px] text-[var(--iron-gall)]',
                          task.completed ? 'line-through' : '',
                        ].join(' ')}>
                          {task.title}
                        </span>
                        <div>
                          <span className="font-[family-name:var(--font-body)] text-[12px] text-[var(--text-tertiary)]">
                            {formatTaskDate(task.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Plant Picker Modal */}
      {showPicker && (
        <PlantPicker
          catalog={catalog}
          onSelect={addPlant}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}

export { GardenDetail };
