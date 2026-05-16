'use client';

import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface MonthSelectorProps {
  selectedMonth: number; // 1-12
  currentMonth: number; // 1-12
  onSelect: (month: number) => void;
}

function MonthSelector({ selectedMonth, currentMonth, onSelect }: MonthSelectorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Scroll the selected month into view on mount / change
    if (selectedRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el = selectedRef.current;
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const offset = elRect.left - containerRect.left - containerRect.width / 2 + elRect.width / 2;
      container.scrollBy({ left: offset, behavior: 'smooth' });
    }
  }, [selectedMonth]);

  const handlePrev = () => {
    onSelect(selectedMonth === 1 ? 12 : selectedMonth - 1);
  };

  const handleNext = () => {
    onSelect(selectedMonth === 12 ? 1 : selectedMonth + 1);
  };

  return (
    <div className="flex items-center gap-1 px-3 py-3">
      <button
        onClick={handlePrev}
        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full active:bg-[var(--aged-paper)]"
        aria-label="Previous month"
      >
        <ChevronLeft size={18} className="text-[var(--text-secondary)]" />
      </button>

      <div
        ref={scrollRef}
        className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-hide"
      >
        {MONTHS.map((label, i) => {
          const month = i + 1;
          const isSelected = month === selectedMonth;
          const isCurrent = month === currentMonth;

          return (
            <button
              key={month}
              ref={isSelected ? selectedRef : undefined}
              onClick={() => onSelect(month)}
              className={[
                'shrink-0 px-3 py-1.5 rounded-full font-[family-name:var(--font-display)] text-[14px] font-semibold transition-colors',
                isSelected
                  ? 'text-[var(--parchment)] bg-[var(--forest)]'
                  : isCurrent
                    ? 'text-[var(--forest)] bg-[var(--aged-paper)]'
                    : 'text-[var(--text-tertiary)]',
              ].join(' ')}
            >
              {label}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleNext}
        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full active:bg-[var(--aged-paper)]"
        aria-label="Next month"
      >
        <ChevronRight size={18} className="text-[var(--text-secondary)]" />
      </button>
    </div>
  );
}

export { MonthSelector };
