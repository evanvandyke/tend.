'use client';

import React from 'react';

type Season = 'spring' | 'summer' | 'autumn' | 'winter';

function getCurrentSeason(): Season {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

const SEASON_CONFIG: Record<Season, { label: string; color: string; icon: React.ReactNode }> = {
  spring: {
    label: 'Spring',
    color: 'var(--color-forest)',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 12V5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        <path d="M7 5C7 3.5 5.5 2 4 2c0 1.5 1.5 3 3 3z" fill="currentColor" opacity="0.6" />
        <path d="M7 7C7 5.5 8.5 4 10 4c0 1.5-1.5 3-3 3z" fill="currentColor" opacity="0.6" />
      </svg>
    ),
  },
  summer: {
    label: 'Summer',
    color: 'var(--color-mustard)',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1" />
        <path d="M7 1v2M7 11v2M1 7h2M11 7h2M3 3l1.5 1.5M9.5 9.5L11 11M11 3l-1.5 1.5M4.5 9.5L3 11" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" />
      </svg>
    ),
  },
  autumn: {
    label: 'Autumn',
    color: 'var(--color-bordeaux)',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 12V7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        <path d="M4 2c0 3 1.5 5 3 5s3-2 3-5c-1.5 1-3 1.5-3 1.5S5.5 3 4 2z" fill="currentColor" opacity="0.6" />
      </svg>
    ),
  },
  winter: {
    label: 'Winter',
    color: 'var(--color-slate)',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 1v12M1 7h12M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" />
        <circle cx="7" cy="7" r="1.5" fill="currentColor" opacity="0.3" />
      </svg>
    ),
  },
};

export function SeasonalIndicator() {
  const season = getCurrentSeason();
  const { label, color, icon } = SEASON_CONFIG[season];

  return (
    <div
      className="flex items-center justify-center gap-1.5"
      style={{ height: '24px', color }}
    >
      {icon}
      <span
        className="font-[family-name:var(--font-display)] italic"
        style={{ fontSize: '13px', color: 'var(--text-secondary)' }}
      >
        {label}
      </span>
    </div>
  );
}
