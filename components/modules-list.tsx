'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Leaf, Sprout } from 'lucide-react';

interface ModuleData {
  slug: string;
  name: string;
  description: string;
  region?: string;
  taskCount: number;
  enabled: boolean;
}

const moduleIcons: Record<string, React.ElementType> = {
  'lawn-utah': Leaf,
  garden: Sprout,
};

const moduleDots: Record<string, string> = {
  'lawn-utah': 'bg-[var(--forest)]',
  garden: 'bg-[var(--mustard)]',
};

const moduleHrefs: Record<string, string> = {
  'lawn-utah': '/modules/lawn',
  garden: '/modules/garden',
};

function ModulesList() {
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/modules')
      .then((r) => r.json())
      .then((data) => {
        setModules(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function toggleModule(slug: string, enabled: boolean) {
    // Optimistic update
    setModules((prev) =>
      prev.map((m) => (m.slug === slug ? { ...m, enabled } : m))
    );

    await fetch('/api/modules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleSlug: slug, enabled }),
    });
  }

  if (loading) {
    return (
      <div className="px-4 py-8 text-center">
        <span className="font-[family-name:var(--font-body)] text-[14px] text-[var(--sepia)]">
          Loading modules...
        </span>
      </div>
    );
  }

  return (
    <div className="px-4 pt-2 flex flex-col gap-3">
      {modules.map((mod) => {
        const Icon = moduleIcons[mod.slug] || Leaf;
        const dotClass = moduleDots[mod.slug] || 'bg-[var(--forest)]';
        const href = moduleHrefs[mod.slug] || `/modules/${mod.slug}`;

        return (
          <div
            key={mod.slug}
            className="bg-[var(--vellum)] border border-[var(--hairline)] rounded-[var(--radius-md)] p-4 shadow-[var(--shadow-1)] transition-all duration-150 hover:border-[var(--engraved)] hover:shadow-[var(--shadow-2)] hover:-translate-y-[1px]"
          >
            <div className="flex items-start justify-between">
              <Link href={href} className="flex items-start gap-3 flex-1 min-w-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--aged-paper)]">
                  <Icon size={20} strokeWidth={1.5} className="text-[var(--iron-gall)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-[7px] h-[7px] rounded-full ${dotClass}`} />
                    <h3 className="font-[family-name:var(--font-display)] text-[16px] font-semibold text-[var(--iron-gall)]">
                      {mod.name}
                    </h3>
                    {mod.region && (
                      <span className="font-[family-name:var(--font-body)] text-[12px] text-[var(--sepia)]">
                        · {mod.region}
                      </span>
                    )}
                  </div>
                  <p className="font-[family-name:var(--font-body)] text-[13px] text-[var(--sepia)] mt-1 line-clamp-2">
                    {mod.description}
                  </p>
                  {mod.taskCount > 0 && (
                    <span className="font-[family-name:var(--font-display)] text-[11px] uppercase tracking-[0.12em] text-[var(--text-tertiary)] mt-2 inline-block">
                      {mod.taskCount} tasks
                    </span>
                  )}
                </div>
              </Link>

              {/* Toggle */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleModule(mod.slug, !mod.enabled);
                }}
                className="ml-3 mt-1 relative w-[44px] h-[24px] rounded-full transition-colors duration-200 cursor-pointer"
                style={{
                  backgroundColor: mod.enabled
                    ? 'var(--forest)'
                    : 'var(--hairline)',
                }}
                aria-label={`${mod.enabled ? 'Disable' : 'Enable'} ${mod.name}`}
              >
                <span
                  className="absolute top-[2px] left-0 w-[20px] h-[20px] rounded-full bg-white shadow-sm transition-transform duration-200"
                  style={{
                    transform: mod.enabled
                      ? 'translateX(22px)'
                      : 'translateX(2px)',
                  }}
                />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { ModulesList };
