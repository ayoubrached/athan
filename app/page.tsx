"use client";

import { useEffect, useMemo, useState } from 'react';
import { Clock } from '@/components/Clock';
import { LocationPicker } from '@/components/LocationPicker';
import { PrayerTable } from '@/components/PrayerTable';
import { computePrayerTimes, type PrayerSet, type MethodKey, type MadhabKey, suggestMethodForCountry } from '@/lib/prayer';
import { MethodSelect } from '@/components/MethodSelect';
import { MadhabSelect } from '@/components/MadhabSelect';

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
  const [methodUserSet, setMethodUserSet] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const times: PrayerSet | null = useMemo(() => {
    if (!location) return null;
    const date = new Date(selectedDate);
    return computePrayerTimes(date, location.latitude, location.longitude, method, madhab);
  }, [location, selectedDate, method, madhab]);

  // Persist settings in localStorage
  useEffect(() => {
    try {
      const payload = {
        location,
        method,
        madhab,
        selectedDate: selectedDate.toISOString(),
      };
      localStorage.setItem('athan.settings', JSON.stringify(payload));
    } catch {}
  }, [location, method, madhab, selectedDate]);

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('athan.settings');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.location) setLocation(parsed.location);
      if (parsed.method) setMethod(parsed.method);
      if (parsed.madhab) setMadhab(parsed.madhab);
      if (parsed.selectedDate) setSelectedDate(new Date(parsed.selectedDate));
    } catch {}
  }, []);

  return (
    <main>
      <div className="card" style={{ display: 'grid', gap: 8 }}>
        <div className="row">
          <h1 style={{ margin: 0 }}>Athan</h1>
          <div style={{ display: 'grid', textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontVariantNumeric: 'tabular-nums' }}>
              <Clock />
            </div>
            <div className="label" style={{ color: 'var(--muted)', fontSize: 13 }}>
              {new Intl.DateTimeFormat(undefined, { dateStyle: 'full' }).format(selectedDate)}
            </div>
          </div>
        </div>
        <div className="row">
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
          if (!methodUserSet) {
            const suggested = suggestMethodForCountry(loc.country);
            setMethod(suggested);
          }
        }}
      />

      <MethodSelect value={method} onChange={(m) => { setMethod(m); setMethodUserSet(true); }} />
      <MadhabSelect value={madhab} onChange={setMadhab} />
      <PrayerTable times={times} now={now} locationName={location?.displayName} timezone={location?.timezone} />
    </main>
  );
}

