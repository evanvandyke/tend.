import { unstable_cache } from 'next/cache';

const API_KEY = process.env.OPENWEATHERMAP_API_KEY;

// === Current Weather ===

export interface WeatherForecastTomorrow {
  high: number;
  condition: string;
  icon: string;
}

export interface CurrentWeather {
  temp: number;
  condition: string;
  icon: string;
  tomorrow?: WeatherForecastTomorrow;
}

const CONDITION_EMOJI: Record<string, string> = {
  Clear: '☀️',
  Clouds: '☁️',
  Rain: '🌧️',
  Drizzle: '🌧️',
  Thunderstorm: '⛈️',
  Snow: '❄️',
  Mist: '🌫️',
  Fog: '🌫️',
  Haze: '🌫️',
};

async function fetchTomorrowForecast(zip: string): Promise<WeatherForecastTomorrow | null> {
  if (!API_KEY) return null;

  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?zip=${zip},US&units=imperial&appid=${API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 300 } });

    if (!res.ok) return null;

    const data = await res.json();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Filter entries for tomorrow's date
    const tomorrowEntries = (data.list ?? []).filter((entry: { dt_txt: string }) =>
      entry.dt_txt.startsWith(tomorrowStr)
    );

    if (tomorrowEntries.length === 0) return null;

    // Find max temp
    const high = Math.round(
      Math.max(...tomorrowEntries.map((e: { main: { temp_max: number } }) => e.main.temp_max))
    );

    // Find most common condition
    const conditionCounts: Record<string, number> = {};
    for (const entry of tomorrowEntries) {
      const cond = entry.weather?.[0]?.main ?? 'Clear';
      conditionCounts[cond] = (conditionCounts[cond] ?? 0) + 1;
    }
    const dominantCondition = Object.entries(conditionCounts).sort((a, b) => b[1] - a[1])[0][0];

    return {
      high,
      condition: dominantCondition,
      icon: CONDITION_EMOJI[dominantCondition] ?? '🌤️',
    };
  } catch {
    return null;
  }
}

async function fetchCurrentWeather(zip: string): Promise<CurrentWeather | null> {
  if (!API_KEY) return null;

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?zip=${zip},US&units=imperial&appid=${API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 300 } }); // 5-min cache

    if (!res.ok) return null;

    const data = await res.json();
    const mainCondition = data.weather?.[0]?.main ?? 'Clear';

    // Fetch tomorrow's forecast in parallel
    const tomorrow = await fetchTomorrowForecast(zip);

    return {
      temp: Math.round(data.main.temp),
      condition: mainCondition,
      icon: CONDITION_EMOJI[mainCondition] ?? '🌤️',
      tomorrow: tomorrow ?? undefined,
    };
  } catch {
    return null;
  }
}

export const getCurrentWeather = unstable_cache(
  fetchCurrentWeather,
  ['current-weather'],
  { revalidate: 300 } // 5 minutes
);

// === Forecast Lows ===

interface DayLow {
  date: string;
  low: number;
}

export async function getForecastLows(zip: string, days: number = 2): Promise<DayLow[]> {
  if (!API_KEY) {
    throw new Error('OPENWEATHERMAP_API_KEY not configured');
  }

  const url = `https://api.openweathermap.org/data/2.5/forecast?zip=${zip},us&units=imperial&appid=${API_KEY}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Weather API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  // Group forecast entries by date and find min temp for each day
  const dailyMins: Record<string, number> = {};

  for (const entry of data.list) {
    const date = entry.dt_txt.split(' ')[0]; // YYYY-MM-DD
    const temp = entry.main.temp_min as number;

    if (!(date in dailyMins) || temp < dailyMins[date]) {
      dailyMins[date] = temp;
    }
  }

  // Return only the requested number of days (skip today if partial)
  const today = new Date().toISOString().split('T')[0];
  const dates = Object.keys(dailyMins)
    .filter((d) => d >= today)
    .sort()
    .slice(0, days);

  return dates.map((date) => ({
    date,
    low: Math.round(dailyMins[date] * 10) / 10,
  }));
}
