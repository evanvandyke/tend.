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
    <div
      className="absolute top-0 left-0 right-0 h-[300px] overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      <Image
        src={`/images/seasons/${season}.png`}
        alt={ALT_TEXT[season]}
        width={1774}
        height={887}
        priority
        className="w-full h-full object-cover"
        style={{
          filter: 'grayscale(60%) opacity(0.12) blur(1px)',
        }}
      />
    </div>
  );
}
