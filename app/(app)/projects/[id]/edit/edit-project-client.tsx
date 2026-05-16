'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ProjectForm } from '@/components/project-form';
import { ArrowLeft } from 'lucide-react';

interface ProjectData {
  subtasks?: { title: string; done: boolean }[];
  materials?: { name: string; quantity?: string; acquired?: boolean }[];
  targetCompletion?: string;
}

interface Project {
  id: number;
  title: string;
  content: string | null;
  projectData: unknown;
}

export function EditProjectClient({ project }: { project: Project }) {
  const router = useRouter();
  const pd = (project.projectData as ProjectData | null) ?? {};

  return (
    <div className="pb-20">
      <div className="h-[44px] flex items-center px-4">
        <button
          onClick={() => router.push(`/projects/${project.id}`)}
          className="flex items-center gap-2 text-[var(--forest)] font-[family-name:var(--font-display)] text-[15px] font-medium cursor-pointer"
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
          Back
        </button>
      </div>

      <main className="px-4 pt-6">
        <h1 className="font-[family-name:var(--font-display)] text-[24px] font-semibold text-[var(--iron-gall)] mb-6">
          Edit Project
        </h1>
        <ProjectForm
          taskId={project.id}
          initialData={{
            title: project.title,
            content: project.content ?? '',
            targetCompletion: pd.targetCompletion ?? '',
            subtasks: pd.subtasks ?? [],
            materials: pd.materials ?? [],
          }}
          onSuccess={() => {
            router.push(`/projects/${project.id}`);
            router.refresh();
          }}
          onCancel={() => router.push(`/projects/${project.id}`)}
        />
      </main>
    </div>
  );
}
