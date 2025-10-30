"use client";

import { useEffect, useMemo, useState } from 'react';
import { Clock } from '@/components/Clock';
import { LocationPicker } from '@/components/LocationPicker';
import { PrayerTable } from '@/components/PrayerTable';
import { computePrayerTimes, type PrayerSet, type MethodKey, type MadhabKey, suggestMethodForCountry } from '@/lib/prayer';
import { Settings } from '@/components/Settings';

type Location = {
  latitude: number;
  longitude: number;
  timezone?: string;
  displayName?: string;
  country?: string;
};

export default function HomePage() {
  const [now, setNow] = useState(new Date());
  const [location, setLocation] = useState<Location | null>(null);
  const [method, setMethod] = useState<MethodKey>('MWL');
  const [madhab, setMadhab] = useState<MadhabKey>('Shafi');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [autoMethod, setAutoMethod] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [dateInitialized, setDateInitialized] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const times: PrayerSet | null = useMemo(() => {
    if (!location) return null;
    const date = new Date(selectedDate);
    return computePrayerTimes(date, location.latitude, location.longitude, method, madhab);
  }, [location, selectedDate, method, madhab]);

  // Persist settings in localStorage (skip until hydration complete)
  useEffect(() => {
    if (!hydrated) return;
    try {
      const payload = {
        location,
        method,
        madhab,
        autoMethod,
      };
      localStorage.setItem('athan.settings', JSON.stringify(payload));
    } catch {}
  }, [hydrated, location, method, madhab, autoMethod]);

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('athan.settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.location) setLocation(parsed.location);
        if (parsed.method) setMethod(parsed.method);
        if (parsed.madhab) setMadhab(parsed.madhab);
        // Always start on today's date when loading the app
        if (typeof parsed.autoMethod === 'boolean') setAutoMethod(parsed.autoMethod);
      }
    } catch {}
    finally {
      setHydrated(true);
    }
  }, []);

  // On first load only: choose initial day using Fajr boundary.
  // If it's before today's Fajr, start on yesterday; otherwise, today.
  useEffect(() => {
    if (!hydrated || dateInitialized || !location) return;
    try {
      const nowLocal = new Date();
      const todayTimes = computePrayerTimes(nowLocal, location.latitude, location.longitude, method, madhab);
      const beforeFajr = nowLocal.getTime() < todayTimes.fajr.getTime();
      const base = new Date(nowLocal.getFullYear(), nowLocal.getMonth(), nowLocal.getDate());
      setSelectedDate(beforeFajr ? new Date(base.getFullYear(), base.getMonth(), base.getDate() - 1) : base);
    } finally {
      setDateInitialized(true);
    }
  }, [hydrated, dateInitialized, location, method, madhab]);

  return (
    <main>
      <div className="card" style={{ position: 'relative', display: 'grid', gap: 8, textAlign: 'center' }}>
        <button
          aria-label="Settings"
          className="icon-button"
          onClick={() => setSettingsOpen(true)}
          style={{ position: 'absolute', right: 8, top: 8 }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 1 1 3.59 17.6l.06-.06a1.65 1.65 0 0 0 .33-1.82A1.65 1.65 0 0 0 2.5 14H2a2 2 0 1 1 0-4h.09c.66 0 1.26-.38 1.54-.97a1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 6.07 3.59l.06.06c.39.39.98.51 1.51.33.59-.28.97-.88.97-1.54V2a2 2 0 1 1 4 0v.09c0 .66.38 1.26.97 1.54.53.18 1.12.06 1.51-.33l.06-.06A2 2 0 1 1 20.41 6.07l-.06.06c-.39.39-.51.98-.33 1.51.28.59.88.97 1.54.97H22a2 2 0 1 1 0 4h-.09c-.66 0-1.26.38-1.54.97z" />
          </svg>
        </button>
        <div style={{ display: 'grid', placeItems: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            <Clock />
          </div>
          <div className="label" style={{ color: 'var(--muted)', fontSize: 16 }}>
            {new Intl.DateTimeFormat(undefined, { dateStyle: 'full' }).format(selectedDate)}
          </div>
        </div>
        <div className="row" style={{ justifyContent: 'center' }}>
          <div className="row" style={{ gap: 8 }}>
            <button className="secondary" onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 1))}>‹ Prev day</button>
            <button className="secondary" onClick={() => setSelectedDate(new Date())}>Today</button>
            <button className="secondary" onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1))}>Next day ›</button>
          </div>
        </div>
      </div>

      <LocationPicker
        onChoose={(loc) => {
          setLocation({
            latitude: loc.latitude,
            longitude: loc.longitude,
            timezone: loc.timezone,
            displayName: loc.displayName,
            country: loc.country,
          });
          if (autoMethod) setMethod(suggestMethodForCountry(loc.country));
        }}
      />

      <Settings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        method={method}
        onMethodChange={setMethod}
        madhab={madhab}
        onMadhabChange={setMadhab}
        autoMethod={autoMethod}
        onAutoMethodChange={setAutoMethod}
      />
      <PrayerTable times={times} now={now} locationName={location?.displayName} timezone={location?.timezone} />
    </main>
  );
}

