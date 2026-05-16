'use client';

import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/text-input';

interface CatalogPlant {
  slug: string;
  name: string;
  category: 'vegetable' | 'herb';
  daysToHarvest: number;
  spacing: string;
  waterFrequencyDays: number;
  startIndoorsWeeksBeforeFrost: number | null;
}

interface PlantPickerProps {
  catalog: CatalogPlant[];
  onSelect: (plantSlug: string, count: number, customName?: string) => void;
  onClose: () => void;
}

function PlantPicker({ catalog, onSelect, onClose }: PlantPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlant, setSelectedPlant] = useState<CatalogPlant | null>(null);
  const [count, setCount] = useState(1);
  const [customName, setCustomName] = useState('');

  const filtered = catalog.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function handleSubmit() {
    if (!selectedPlant) return;
    onSelect(selectedPlant.slug, count, customName || undefined);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full max-w-lg bg-[var(--parchment)] rounded-t-[16px] max-h-[85vh] flex flex-col shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--hairline)]">
          <h3 className="font-[family-name:var(--font-display)] text-[18px] font-semibold text-[var(--iron-gall)]">
            {selectedPlant ? 'Configure Plant' : 'Choose a Plant'}
          </h3>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-[44px] h-[44px] cursor-pointer"
            aria-label="Close"
          >
            <X size={20} strokeWidth={1.5} className="text-[var(--iron-gall)]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {!selectedPlant ? (
            <>
              {/* Search */}
              <div className="relative mb-3">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search plants..."
                  className={[
                    'w-full bg-[var(--vellum)] border border-[var(--hairline)] rounded-[var(--radius-md)]',
                    'font-[family-name:var(--font-body)] text-[16px] text-[var(--iron-gall)]',
                    'pl-9 pr-3 py-[10px] min-h-[44px]',
                    'placeholder:text-[var(--text-tertiary)] placeholder:italic',
                    'focus:border-[2px] focus:border-[var(--forest)] focus:outline-none',
                  ].join(' ')}
                />
              </div>

              {/* Plant list */}
              <div className="flex flex-col gap-1">
                {filtered.map((plant) => (
                  <button
                    key={plant.slug}
                    onClick={() => setSelectedPlant(plant)}
                    className={[
                      'flex items-center justify-between py-3 px-3 rounded-[var(--radius-md)] text-left cursor-pointer',
                      'hover:bg-[var(--aged-paper)] transition-colors duration-100',
                    ].join(' ')}
                  >
                    <div>
                      <span className="font-[family-name:var(--font-body)] text-[15px] text-[var(--iron-gall)]">
                        {plant.name}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-[family-name:var(--font-display)] text-[10px] uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
                          {plant.category}
                        </span>
                        <span className="font-[family-name:var(--font-body)] text-[12px] text-[var(--text-tertiary)]">
                          {plant.daysToHarvest}d &middot; {plant.spacing}
                        </span>
                      </div>
                    </div>
                    <span className="text-[var(--text-tertiary)] text-[14px]">→</span>
                  </button>
                ))}

                {filtered.length === 0 && (
                  <p className="text-center py-6 font-[family-name:var(--font-body)] text-[14px] text-[var(--text-tertiary)] italic">
                    No plants match your search.
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Configure selected plant */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-[7px] h-[7px] rounded-full bg-[var(--mustard)]" />
                  <span className="font-[family-name:var(--font-display)] text-[16px] font-semibold text-[var(--iron-gall)]">
                    {selectedPlant.name}
                  </span>
                </div>
                <p className="font-[family-name:var(--font-body)] text-[13px] text-[var(--sepia)] ml-[15px]">
                  {selectedPlant.category} &middot; {selectedPlant.daysToHarvest} days to harvest &middot; {selectedPlant.spacing}
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <TextInput
                  label="How many?"
                  type="number"
                  min={1}
                  max={100}
                  value={count}
                  onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                />

                <TextInput
                  label="Custom name (optional)"
                  placeholder={`e.g., "Patio tomatoes"`}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSelectedPlant(null);
                    setCount(1);
                    setCustomName('');
                  }}
                >
                  Back
                </Button>
                <Button onClick={handleSubmit}>
                  Add to Garden
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export { PlantPicker };
