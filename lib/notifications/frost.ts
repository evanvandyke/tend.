import { getFrostDates } from '@/lib/frost';
import { getForecastLows } from '@/lib/weather';

interface FrostWarningResult {
  shouldWarn: boolean;
  date?: string;
  low?: number;
}

export async function checkFrostWarning(zip: string): Promise<FrostWarningResult> {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-indexed

  // Only check during shoulder seasons: March-May and September-November
  const isShoulderSeason =
    (month >= 3 && month <= 5) || (month >= 9 && month <= 11);

  if (!isShoulderSeason) {
    return { shouldWarn: false };
  }

  // Verify we're actually near frost dates for this location
  const { lastSpringFrost, firstFallFrost } = getFrostDates(zip);
  const today = new Date();

  // Allow a buffer of 30 days beyond frost dates for unexpected cold
  const springCutoff = new Date(lastSpringFrost);
  springCutoff.setDate(springCutoff.getDate() + 30);

  const fallStart = new Date(firstFallFrost);
  fallStart.setDate(fallStart.getDate() - 30);

  const inSpringWindow = month >= 3 && month <= 5 && today <= springCutoff;
  const inFallWindow = month >= 9 && month <= 11 && today >= fallStart;

  if (!inSpringWindow && !inFallWindow) {
    return { shouldWarn: false };
  }

  // Get forecast lows for next 48 hours (2 days)
  const lows = await getForecastLows(zip, 2);

  // Check if any low is ≤ 36°F
  for (const day of lows) {
    if (day.low <= 36) {
      return { shouldWarn: true, date: day.date, low: day.low };
    }
  }

  return { shouldWarn: false };
}
