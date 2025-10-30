import {
  PrayerTimes,
  CalculationMethod,
  Coordinates,
  Madhab,
  HighLatitudeRule,
} from 'adhan';

export type PrayerSet = {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
  midnight: Date;
  lastThirdStart: Date;
};

export function addDays(d: Date, days: number): Date {
  const nd = new Date(d.getTime());
  nd.setDate(nd.getDate() + days);
  return nd;
}

export type MethodKey =
  | 'MWL'
  | 'ISNA'
  | 'UmmAlQura'
  | 'Egyptian'
  | 'Karachi'
  | 'Moonsighting'
  | 'Dubai'
  | 'Kuwait'
  | 'Qatar'
  | 'Singapore'
  | 'Tehran'
  | 'Turkey';

export type MadhabKey = 'Shafi' | 'Hanafi';

export function getParams(method: MethodKey = 'MWL') {
  switch (method) {
    case 'MWL':
      return CalculationMethod.MuslimWorldLeague();
    case 'ISNA':
      return CalculationMethod.NorthAmerica();
    case 'UmmAlQura':
      return CalculationMethod.UmmAlQura();
    case 'Egyptian':
      return CalculationMethod.Egyptian();
    case 'Karachi':
      return CalculationMethod.Karachi();
    case 'Moonsighting':
      return CalculationMethod.MoonsightingCommittee();
    case 'Dubai':
      return CalculationMethod.Dubai();
    case 'Kuwait':
      return CalculationMethod.Kuwait();
    case 'Qatar':
      return CalculationMethod.Qatar();
    case 'Singapore':
      return CalculationMethod.Singapore();
    case 'Tehran':
      return CalculationMethod.Tehran();
    case 'Turkey':
      return CalculationMethod.Turkey();
    default:
      return CalculationMethod.MuslimWorldLeague();
  }
}

export function computePrayerTimes(
  date: Date,
  lat: number,
  lon: number,
  method: MethodKey = 'MWL',
  madhabKey: MadhabKey = 'Shafi'
): PrayerSet {
  const params = getParams(method);
  params.madhab = madhabKey === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  params.highLatitudeRule = HighLatitudeRule.MiddleOfTheNight;
  const coords = new Coordinates(lat, lon);

  const today = new PrayerTimes(coords, date, params);
  const tomorrow = new PrayerTimes(coords, addDays(date, 1), params);

  const maghrib = today.maghrib;
  const fajrNext = tomorrow.fajr;
  const nightMs = fajrNext.getTime() - maghrib.getTime();
  const midnight = new Date(maghrib.getTime() + nightMs / 2);
  const lastThirdStart = new Date(fajrNext.getTime() - nightMs / 3);

  return {
    fajr: today.fajr,
    sunrise: today.sunrise,
    dhuhr: today.dhuhr,
    asr: today.asr,
    maghrib: today.maghrib,
    isha: today.isha,
    midnight,
    lastThirdStart,
  };
}

export type LabeledEvent = { label: string; time: Date };

export function toEventList(times: PrayerSet): LabeledEvent[] {
  return [
    { label: 'Fajr', time: times.fajr },
    { label: 'Sunrise', time: times.sunrise },
    { label: 'Dhuhr', time: times.dhuhr },
    { label: 'Asr', time: times.asr },
    { label: 'Maghrib', time: times.maghrib },
    { label: 'Isha', time: times.isha },
    { label: 'Midnight', time: times.midnight },
    { label: 'Last Third of the Night', time: times.lastThirdStart },
  ];
}

export function findNextIndex(now: Date, events: LabeledEvent[]): number {
  const idx = events.findIndex((e) => e.time.getTime() > now.getTime());
  return idx === -1 ? events.length - 1 : idx;
}

export function formatTime(d: Date, tz?: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: undefined,
    hour12: true,
    timeZone: tz,
  }).format(d);
}

export function suggestMethodForCountry(country?: string): MethodKey {
  if (!country) return 'MWL';
  const c = country.toLowerCase();
  if (c.includes('saudi')) return 'UmmAlQura';
  if (c.includes('united arab emirates') || c.includes('uae')) return 'Dubai';
  if (c.includes('qatar')) return 'Qatar';
  if (c.includes('kuwait')) return 'Kuwait';
  if (c.includes('turkey') || c.includes('türkiye')) return 'Turkey';
  if (c.includes('iran')) return 'Tehran';
  if (c.includes('pakistan')) return 'Karachi';
  if (c.includes('india')) return 'Karachi';
  if (c.includes('bangladesh')) return 'Karachi';
  if (c.includes('singapore')) return 'Singapore';
  if (c.includes('egypt')) return 'Egyptian';
  if (c.includes('united states') || c.includes('usa') || c.includes('canada')) return 'ISNA';
  if (c.includes('united kingdom') || c.includes('uk') || c.includes('britain') || c.includes('england')) return 'Moonsighting';
  if (c.includes('indonesia') || c.includes('malaysia')) return 'Moonsighting';
  return 'MWL';
}

