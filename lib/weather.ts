const API_KEY = process.env.OPENWEATHERMAP_API_KEY;

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
