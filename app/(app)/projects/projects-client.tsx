'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/top-bar';
import { BottomNav } from '@/components/bottom-nav';
import { SectionHeader } from '@/components/section-header';
import { ProjectCard } from '@/components/project-card';
import { FAB } from '@/components/fab';
import { ProjectFormSheet } from '@/components/project-form-sheet';

interface ProjectData {
  subtasks?: { title: string; done: boolean }[];
  materials?: { name: string; quantity?: string; acquired?: boolean }[];
  targetCompletion?: string;
}

interface Project {
  id: number;
  title: string;
  content: string | null;
  status: string;
  projectData: unknown;
}

export function ProjectsPageClient({
  active,
  completed,
}: {
  active: Project[];
  completed: Project[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--parchment)] pb-20">
      <header
        className="h-[56px] bg-[var(--parchment)] flex items-center justify-between px-4 border-b border-[var(--hairline)]"
        style={{ borderBottomWidth: '0.5px' }}
      >
        <h1 className="font-[family-name:var(--font-display)] text-[28px] font-semibold text-[var(--iron-gall)] leading-none">
          Projects
        </h1>
      </header>

      <main className="px-4">
        {active.length > 0 && (
          <>
            <SectionHeader title="Active" />
            <div className="flex flex-col gap-3">
              {active.map((project) => {
                const pd = project.projectData as ProjectData | null;
                const subtasks = pd?.subtasks ?? [];
                const completedCount = subtasks.filter((s) => s.done).length;

                return (
                  <ProjectCard
                    key={project.id}
                    title={project.title}
                    description={project.content ?? undefined}
                    subtaskCount={subtasks.length > 0 ? subtasks.length : undefined}
                    completedCount={completedCount}
                    onClick={() => router.push(`/projects/${project.id}`)}
                  />
                );
              })}
            </div>
          </>
        )}

        {completed.length > 0 && (
          <>
            <SectionHeader title="Completed" />
            <div className="flex flex-col gap-3">
              {completed.map((project) => {
                const pd = project.projectData as ProjectData | null;
                const subtasks = pd?.subtasks ?? [];

                return (
                  <ProjectCard
                    key={project.id}
                    title={project.title}
                    description={project.content ?? undefined}
                    subtaskCount={subtasks.length > 0 ? subtasks.length : undefined}
                    completedCount={subtasks.length}
                    onClick={() => router.push(`/projects/${project.id}`)}
                  />
                );
              })}
            </div>
          </>
        )}

        {active.length === 0 && completed.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-20 px-6 text-center">
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4 opacity-35">
              <path d="M22 7c0 7.5-5.5 13-13 15 7.5 2 13 7.5 13 15 0-7.5 5.5-13 13-15-7.5-2-13-7.5-13-15z" stroke="var(--text-tertiary)" strokeWidth="0.8" fill="none"/>
            </svg>
            <p className="font-[family-name:var(--font-display)] text-[22px] italic text-[var(--text-secondary)]">
              No projects yet.
            </p>
            <p className="font-[family-name:var(--font-body)] text-[14px] text-[var(--text-tertiary)] mt-3 leading-relaxed max-w-[280px]">
              Start one with the + button — fences to stain, rooms to paint, trees to plant.
            </p>
          </div>
        )}
      </main>

      <FAB onClick={() => setShowForm(true)} />
      <BottomNav />
      <ProjectFormSheet
        open={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={() => {
          setShowForm(false);
          router.refresh();
        }}
      />
    </div>
  );
}
