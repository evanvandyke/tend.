'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Archive, Sprout } from 'lucide-react';
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

interface UserPlant {
  id: number;
  plantSlug: string;
  customName: string | null;
  count: number;
  archived: boolean;
  createdAt: string;
  catalog: {
    name: string;
    category: string;
    daysToHarvest: number;
    waterFrequencyDays: number;
    spacing: string;
  } | null;
}

interface GardenDetailProps {
  catalog: CatalogPlant[];
}

function GardenDetail({ catalog }: GardenDetailProps) {
  const [plants, setPlants] = useState<UserPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);

  const fetchPlants = useCallback(() => {
    fetch('/api/garden/plants')
      .then((r) => r.json())
      .then((data) => {
        setPlants(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPlants();
  }, [fetchPlants]);

  async function archivePlant(id: number) {
    await fetch('/api/garden/plants', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setPlants((prev) => prev.filter((p) => p.id !== id));
  }

  async function addPlant(plantSlug: string, count: number, customName?: string) {
    const res = await fetch('/api/garden/plants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plantSlug, count, customName: customName || undefined }),
    });
    if (res.ok) {
      fetchPlants();
    }
    setShowPicker(false);
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
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-[22px] font-semibold text-[var(--iron-gall)]">
            Garden
          </h2>
          <p className="font-[family-name:var(--font-body)] text-[13px] text-[var(--sepia)]">
            Your vegetable &amp; herb garden
          </p>
        </div>
      </div>

      {/* My Plants Section */}
      <SectionHeader title="My Plants" />

      {loading ? (
        <div className="px-4 py-6 text-center">
          <span className="font-[family-name:var(--font-body)] text-[14px] text-[var(--sepia)]">
            Loading...
          </span>
        </div>
      ) : plants.length === 0 ? (
        <div className="px-4 py-10 text-center flex flex-col items-center">
          <Sprout size={36} strokeWidth={1.2} className="text-[var(--mustard)] mb-4 opacity-60" />
          <p className="font-[family-name:var(--font-display)] text-[20px] italic text-[var(--text-secondary)]">
            Your garden is empty.
          </p>
          <p className="font-[family-name:var(--font-body)] text-[14px] text-[var(--text-tertiary)] mt-2 leading-relaxed max-w-[280px]">
            Add plants to get started — we&apos;ll tell you when to sow, transplant, and harvest.
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          {plants.map((plant) => (
            <div key={plant.id} className="relative flex items-center min-h-[56px] px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="w-[7px] h-[7px] rounded-full bg-[var(--mustard)]" />
                  <span className="font-[family-name:var(--font-body)] text-[16px] text-[var(--iron-gall)]">
                    {plant.customName || plant.catalog?.name || plant.plantSlug}
                  </span>
                  {plant.count > 1 && (
                    <span className="font-[family-name:var(--font-display)] text-[11px] text-[var(--text-tertiary)] uppercase tracking-[0.1em]">
                      ×{plant.count}
                    </span>
                  )}
                </div>
                {plant.catalog && (
                  <div className="flex items-center gap-2 mt-0.5 ml-[15px]">
                    <span className="font-[family-name:var(--font-body)] text-[12px] text-[var(--text-tertiary)]">
                      {plant.catalog.category} &middot; {plant.catalog.daysToHarvest}d to harvest &middot; {plant.catalog.spacing}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => archivePlant(plant.id)}
                className="flex items-center justify-center w-[44px] h-[44px] cursor-pointer"
                aria-label={`Archive ${plant.customName || plant.catalog?.name}`}
              >
                <Archive size={16} strokeWidth={1.5} className="text-[var(--text-tertiary)] hover:text-[var(--bordeaux)]" />
              </button>
              <div className="absolute bottom-0 right-0 left-[16px] h-[0.5px] bg-[var(--hairline)]" />
            </div>
          ))}
        </div>
      )}

      {/* Add Plant Button */}
      <div className="px-4 pt-4">
        <Button onClick={() => setShowPicker(true)} variant="secondary">
          <Plus size={16} strokeWidth={1.5} className="mr-2" />
          Add Plant
        </Button>
      </div>

      {/* Plant Catalog Section */}
      <SectionHeader title="Plant Catalog" />
      <div className="px-4 pb-4">
        <div className="grid grid-cols-1 gap-2">
          {catalog.map((plant) => (
            <div
              key={plant.slug}
              className="flex items-center justify-between py-2.5 px-3 bg-[var(--vellum)] border border-[var(--hairline)] rounded-[var(--radius-md)]"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-[family-name:var(--font-body)] text-[15px] text-[var(--iron-gall)]">
                    {plant.name}
                  </span>
                  <span className="font-[family-name:var(--font-display)] text-[10px] uppercase tracking-[0.12em] text-[var(--text-tertiary)] bg-[var(--aged-paper)] px-1.5 py-0.5 rounded">
                    {plant.category}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="font-[family-name:var(--font-body)] text-[12px] text-[var(--text-tertiary)]">
                    {plant.daysToHarvest}d harvest
                  </span>
                  <span className="font-[family-name:var(--font-body)] text-[12px] text-[var(--text-tertiary)]">
                    {plant.spacing}
                  </span>
                  {plant.startIndoorsWeeksBeforeFrost && (
                    <span className="font-[family-name:var(--font-body)] text-[12px] text-[var(--text-tertiary)]">
                      Start {plant.startIndoorsWeeksBeforeFrost}w early
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

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
