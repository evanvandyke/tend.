'use client';

import React from 'react';
import { format } from 'date-fns';

type Season = 'spring' | 'summer' | 'autumn' | 'winter';

function getCurrentSeason(): Season {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

const SEASON_EMOJI: Record<Season, string> = {
  spring: '🌿',
  summer: '☀️',
  autumn: '🍂',
  winter: '❄️',
};

export interface LunarEventInfo {
  name: string;
  date: string;
}

interface TopBarProps {
  showSeason?: boolean;
  lunarEvent?: LunarEventInfo | null;
}

function TopBar({ showSeason = false, lunarEvent }: TopBarProps) {
  const now = new Date();
  const dayOfWeek = format(now, 'EEEE');
  const dayMonth = format(now, 'd MMMM');
  const season = getCurrentSeason();

  return (
    <header className="sticky top-0 z-30 bg-[var(--parchment)] border-b border-[var(--hairline)]" style={{ borderBottomWidth: '0.5px' }}>
      <div className="h-[56px] flex items-center justify-between px-4">
        {/* Wordmark */}
        <h1 className="font-[family-name:var(--font-display)] text-[28px] font-semibold text-[var(--iron-gall)] leading-none">
          Tend<span className="text-[var(--bordeaux)]">.</span>
        </h1>

        {/* Date + Season */}
        <div className="text-right font-[family-name:var(--font-body)] text-[13px] text-[var(--sepia)] leading-tight">
          <div>{dayOfWeek}</div>
          <div>
            {dayMonth}
            {showSeason && (
              <span className="font-[family-name:var(--font-display)] italic">
                {' · '}{SEASON_EMOJI[season]} {season.charAt(0).toUpperCase() + season.slice(1)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Lunar event callout */}
      {lunarEvent && (
        <div className="px-4 pb-2 -mt-1">
          <p className="font-[family-name:var(--font-body)] text-[12px] text-[var(--text-tertiary)] italic text-right">
            🌙 {lunarEvent.name} · {lunarEvent.date}
          </p>
        </div>
      )}
    </header>
  );
}

export { TopBar };
