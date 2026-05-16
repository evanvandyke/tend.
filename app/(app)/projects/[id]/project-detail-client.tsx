'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface Subtask {
  title: string;
  done: boolean;
}

interface Material {
  name: string;
  quantity?: string;
  acquired?: boolean;
}

interface ProjectData {
  subtasks?: Subtask[];
  materials?: Material[];
  targetCompletion?: string;
}

interface Project {
  id: number;
  title: string;
  content: string | null;
  status: string;
  projectData: unknown;
}

export function ProjectDetailClient({ project }: { project: Project }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pd = (project.projectData as ProjectData | null) ?? {};
  const [subtasks, setSubtasks] = useState<Subtask[]>(pd.subtasks ?? []);
  const [materials, setMaterials] = useState<Material[]>(pd.materials ?? []);
  const [marking, setMarking] = useState(false);

  const toggleSubtask = async (index: number) => {
    const updated = [...subtasks];
    updated[index] = { ...updated[index], done: !updated[index].done };
    setSubtasks(updated);

    await fetch(`/api/tasks/${project.id}/subtask`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ index, done: updated[index].done }),
    });
  };

  const toggleMaterial = async (index: number) => {
    const updated = [...materials];
    updated[index] = { ...updated[index], acquired: !updated[index].acquired };
    setMaterials(updated);

    await fetch(`/api/tasks/${project.id}/material`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ index, acquired: updated[index].acquired }),
    });
  };

  const markComplete = async () => {
    setMarking(true);
    await fetch(`/api/tasks/${project.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'done' }),
    });
    startTransition(() => {
      router.push('/projects');
      router.refresh();
    });
  };

  return (
    <div className="min-h-screen bg-[var(--parchment)] pb-20">
      {/* Back nav */}
      <header
        className="h-[56px] bg-[var(--parchment)] flex items-center px-4 border-b border-[var(--hairline)]"
        style={{ borderBottomWidth: '0.5px' }}
      >
        <button
          onClick={() => router.push('/projects')}
          className="flex items-center gap-2 text-[var(--forest)] font-[family-name:var(--font-display)] text-[15px] font-medium cursor-pointer"
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
          Projects
        </button>
      </header>

      <main className="px-4 pt-6">
        {/* Title */}
        <h1 className="font-[family-name:var(--font-display)] text-[32px] font-semibold text-[var(--iron-gall)] leading-tight">
          {project.title}
        </h1>

        {/* Description */}
        {project.content && (
          <p className="mt-3 font-[family-name:var(--font-body)] text-[16px] text-[var(--text-secondary)] leading-relaxed">
            {project.content}
          </p>
        )}

        {/* Target completion */}
        {pd.targetCompletion && (
          <div className="mt-4 font-[family-name:var(--font-display)] text-[13px] font-semibold text-[var(--sepia)]">
            Target: {new Date(pd.targetCompletion).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
        )}

        {/* Subtasks */}
        {subtasks.length > 0 && (
          <section className="mt-8">
            <h2 className="font-[family-name:var(--font-display)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)] mb-3">
              Subtasks
            </h2>
            <div className="flex flex-col gap-2">
              {subtasks.map((subtask, i) => (
                <button
                  key={i}
                  onClick={() => toggleSubtask(i)}
                  className="flex items-center gap-3 p-3 bg-[var(--aged-paper)] rounded-[var(--radius-md)] border border-[var(--hairline)] cursor-pointer text-left"
                >
                  <span
                    className={[
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-150',
                      subtask.done
                        ? 'bg-[var(--forest)] border-[var(--forest)]'
                        : 'border-[var(--engraved)]',
                    ].join(' ')}
                  >
                    {subtask.done && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M3 6L5 8L9 4" stroke="var(--vellum)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span
                    className={[
                      'font-[family-name:var(--font-body)] text-[15px]',
                      subtask.done
                        ? 'text-[var(--text-tertiary)] line-through'
                        : 'text-[var(--iron-gall)]',
                    ].join(' ')}
                  >
                    {subtask.title}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Materials */}
        {materials.length > 0 && (
          <section className="mt-8">
            <h2 className="font-[family-name:var(--font-display)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)] mb-3">
              Materials
            </h2>
            <div className="flex flex-col gap-2">
              {materials.map((material, i) => (
                <button
                  key={i}
                  onClick={() => toggleMaterial(i)}
                  className="flex items-center gap-3 p-3 bg-[var(--aged-paper)] rounded-[var(--radius-md)] border border-[var(--hairline)] cursor-pointer text-left"
                >
                  <span
                    className={[
                      'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors duration-150',
                      material.acquired
                        ? 'bg-[var(--forest)] border-[var(--forest)]'
                        : 'border-[var(--engraved)]',
                    ].join(' ')}
                  >
                    {material.acquired && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M3 6L5 8L9 4" stroke="var(--vellum)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span
                    className={[
                      'font-[family-name:var(--font-body)] text-[15px]',
                      material.acquired
                        ? 'text-[var(--text-tertiary)] line-through'
                        : 'text-[var(--iron-gall)]',
                    ].join(' ')}
                  >
                    {material.name}
                    {material.quantity && (
                      <span className="ml-2 text-[13px] text-[var(--sepia)]">
                        ({material.quantity})
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Actions */}
        <div className="mt-10 flex gap-3">
          <Button
            variant="secondary"
            onClick={() => router.push(`/projects/${project.id}/edit`)}
          >
            Edit
          </Button>
          {project.status !== 'done' && (
            <Button
              variant="primary"
              onClick={markComplete}
              disabled={marking}
            >
              {marking ? 'Completing...' : 'Mark Complete'}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
