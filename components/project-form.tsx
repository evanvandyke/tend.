'use client';

import React, { useState } from 'react';
import { TextInput } from '@/components/ui/text-input';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';

interface Subtask {
  title: string;
  done: boolean;
}

interface Material {
  name: string;
  quantity?: string;
  acquired?: boolean;
}

interface ProjectFormData {
  title: string;
  content: string;
  targetCompletion: string;
  subtasks: Subtask[];
  materials: Material[];
}

interface ProjectFormProps {
  initialData?: ProjectFormData;
  taskId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProjectForm({ initialData, taskId, onSuccess, onCancel }: ProjectFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [content, setContent] = useState(initialData?.content ?? '');
  const [targetCompletion, setTargetCompletion] = useState(initialData?.targetCompletion ?? '');
  const [subtasks, setSubtasks] = useState<Subtask[]>(initialData?.subtasks ?? []);
  const [materials, setMaterials] = useState<Material[]>(initialData?.materials ?? []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subtask management
  const [newSubtask, setNewSubtask] = useState('');
  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks([...subtasks, { title: newSubtask.trim(), done: false }]);
    setNewSubtask('');
  };
  const removeSubtask = (i: number) => {
    setSubtasks(subtasks.filter((_, idx) => idx !== i));
  };

  // Material management
  const [newMaterialName, setNewMaterialName] = useState('');
  const [newMaterialQty, setNewMaterialQty] = useState('');
  const addMaterial = () => {
    if (!newMaterialName.trim()) return;
    setMaterials([
      ...materials,
      { name: newMaterialName.trim(), quantity: newMaterialQty.trim() || undefined, acquired: false },
    ]);
    setNewMaterialName('');
    setNewMaterialQty('');
  };
  const removeMaterial = (i: number) => {
    setMaterials(materials.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError(null);

    const projectData = {
      subtasks,
      materials,
      targetCompletion: targetCompletion || undefined,
    };

    try {
      const isEdit = !!taskId;
      const url = isEdit ? `/api/tasks/${taskId}` : '/api/tasks';
      const method = isEdit ? 'PATCH' : 'POST';
      const body = isEdit
        ? { title: title.trim(), content: content.trim() || null, projectData }
        : { title: title.trim(), kind: 'project', content: content.trim() || undefined, projectData };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to save project');
        setSubmitting(false);
        return;
      }

      onSuccess?.();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <TextInput
        label="Project title"
        placeholder="What are you working on?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div className="flex flex-col gap-[var(--space-xs)]">
        <label className="font-[family-name:var(--font-display)] text-[14px] font-semibold text-[var(--iron-gall)]">
          Description
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Notes, context, goals..."
          rows={3}
          className={[
            'bg-[var(--vellum)] border border-[var(--hairline)] rounded-[var(--radius-md)]',
            'font-[family-name:var(--font-body)] text-[16px] text-[var(--iron-gall)]',
            'px-[14px] py-[12px] resize-none',
            'placeholder:text-[var(--text-tertiary)] placeholder:italic',
            'focus:border-[2px] focus:border-[var(--forest)] focus:px-[13px] focus:py-[11px] focus:outline-none',
            'transition-all duration-[150ms] ease-out',
          ].join(' ')}
        />
      </div>

      <TextInput
        label="Target completion"
        type="date"
        value={targetCompletion}
        onChange={(e) => setTargetCompletion(e.target.value)}
      />

      {/* Subtasks */}
      <div className="flex flex-col gap-2">
        <span className="font-[family-name:var(--font-display)] text-[14px] font-semibold text-[var(--iron-gall)]">
          Subtasks
        </span>
        {subtasks.map((st, i) => (
          <div key={i} className="flex items-center gap-2 pl-2">
            <span className="flex-1 font-[family-name:var(--font-body)] text-[15px] text-[var(--iron-gall)]">
              {st.title}
            </span>
            <button
              type="button"
              onClick={() => removeSubtask(i)}
              className="p-1 text-[var(--text-tertiary)] hover:text-[var(--bordeaux)] cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <input
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSubtask();
              }
            }}
            placeholder="Add a subtask..."
            className={[
              'flex-1 bg-[var(--vellum)] border border-[var(--hairline)] rounded-[var(--radius-md)]',
              'font-[family-name:var(--font-body)] text-[15px] text-[var(--iron-gall)]',
              'px-[12px] py-[10px] min-h-[40px]',
              'placeholder:text-[var(--text-tertiary)] placeholder:italic',
              'focus:border-[var(--forest)] focus:outline-none',
            ].join(' ')}
          />
          <button
            type="button"
            onClick={addSubtask}
            className="p-2 text-[var(--forest)] hover:bg-[var(--aged-paper)] rounded-full cursor-pointer"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Materials */}
      <div className="flex flex-col gap-2">
        <span className="font-[family-name:var(--font-display)] text-[14px] font-semibold text-[var(--iron-gall)]">
          Materials
        </span>
        {materials.map((m, i) => (
          <div key={i} className="flex items-center gap-2 pl-2">
            <span className="flex-1 font-[family-name:var(--font-body)] text-[15px] text-[var(--iron-gall)]">
              {m.name}
              {m.quantity && (
                <span className="ml-2 text-[13px] text-[var(--sepia)]">({m.quantity})</span>
              )}
            </span>
            <button
              type="button"
              onClick={() => removeMaterial(i)}
              className="p-1 text-[var(--text-tertiary)] hover:text-[var(--bordeaux)] cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <input
            value={newMaterialName}
            onChange={(e) => setNewMaterialName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addMaterial();
              }
            }}
            placeholder="Material name..."
            className={[
              'flex-1 bg-[var(--vellum)] border border-[var(--hairline)] rounded-[var(--radius-md)]',
              'font-[family-name:var(--font-body)] text-[15px] text-[var(--iron-gall)]',
              'px-[12px] py-[10px] min-h-[40px]',
              'placeholder:text-[var(--text-tertiary)] placeholder:italic',
              'focus:border-[var(--forest)] focus:outline-none',
            ].join(' ')}
          />
          <input
            value={newMaterialQty}
            onChange={(e) => setNewMaterialQty(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addMaterial();
              }
            }}
            placeholder="Qty"
            className={[
              'w-[70px] bg-[var(--vellum)] border border-[var(--hairline)] rounded-[var(--radius-md)]',
              'font-[family-name:var(--font-body)] text-[14px] text-[var(--iron-gall)]',
              'px-[10px] py-[10px] min-h-[40px]',
              'placeholder:text-[var(--text-tertiary)] placeholder:italic',
              'focus:border-[var(--forest)] focus:outline-none',
            ].join(' ')}
          />
          <button
            type="button"
            onClick={addMaterial}
            className="p-2 text-[var(--forest)] hover:bg-[var(--aged-paper)] rounded-full cursor-pointer"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {error && (
        <p className="font-[family-name:var(--font-body)] text-[13px] text-[var(--bordeaux)]">
          {error}
        </p>
      )}

      <div className="flex gap-3 mt-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={!title.trim() || submitting}>
          {submitting ? 'Saving...' : taskId ? 'Save Changes' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
}
