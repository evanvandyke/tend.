'use client';

import Image from 'next/image';

type Season = 'spring' | 'summer' | 'autumn' | 'winter';

function getCurrentSeason(): Season {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-indexed

  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

const ALT_TEXT: Record<Season, string> = {
  spring: 'Spring almanac illustration',
  summer: 'Summer almanac illustration',
  autumn: 'Autumn almanac illustration',
  winter: 'Winter almanac illustration',
};

export function SeasonalBanner() {
  const season = getCurrentSeason();

  return (
    <div className="mx-4 mt-2 mb-0">
      <div
        className="relative w-full overflow-hidden"
        style={{
          borderRadius: '4px',
          boxShadow: 'var(--shadow-1, 0 1px 3px rgba(0,0,0,0.08))',
          border: '1px solid var(--border-hairline, rgba(0,0,0,0.06))',
        }}
      >
        <Image
          src={`/images/seasons/${season}.png`}
          alt={ALT_TEXT[season]}
          width={1774}
          height={887}
          priority
          className="w-full h-auto block"
        />
      </div>
    </div>
  );
}
