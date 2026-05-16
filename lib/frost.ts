import frostDates from '@/data/frost-dates.json';

export function getFrostDates(zip: string) {
  const data = frostDates[zip as keyof typeof frostDates] ?? frostDates['84003'];
  const year = new Date().getFullYear();
  return {
    lastSpringFrost: new Date(`${year}-${data.lastSpringFrost}`),
    firstFallFrost: new Date(`${year}-${data.firstFallFrost}`),
  };
}
