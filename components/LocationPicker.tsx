"use client";

import { useState } from 'react';
import type { GeoLocation } from '@/lib/geocoding';
import { reverseGeocode, searchCity } from '@/lib/geocoding';

type Props = {
  onChoose(location: Required<Pick<GeoLocation, 'latitude' | 'longitude'>> & {
    timezone?: string;
    displayName?: string;
    country?: string;
  }): void;
};

export function LocationPicker({ onChoose }: Props) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function useMyLocation() {
    setError(null);
    setLoading(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        })
      );
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const info = await reverseGeocode(lat, lon);
      const fallbackName = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      const tz = info?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
      onChoose({
        latitude: lat,
        longitude: lon,
        timezone: tz,
        displayName: info?.displayName ?? fallbackName,
        country: info?.country,
      });
    } catch (e: unknown) {
      setError('Unable to get your location. Please enter city manually.');
    } finally {
      setLoading(false);
    }
  }

  async function search() {
    if (!query.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const result = await searchCity(query);
      if (!result) {
        setError('City not found. Try again.');
        return;
      }
      onChoose({
        latitude: result.latitude,
        longitude: result.longitude,
        timezone: result.timezone,
        displayName: result.displayName,
        country: result.country,
      });
    } catch {
      setError('Search failed. Check your connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ display: 'grid', gap: 12 }}>
      <div className="row">
        <button onClick={useMyLocation} disabled={loading}>
          {loading ? 'Locating…' : 'Use my location'}
        </button>
        <span className="label" style={{ color: 'var(--muted)', fontSize: 13 }}>
          or
        </span>
        <div style={{ flex: 1 }}>
          <div className="row">
            <input
              type="text"
              value={query}
              placeholder="Enter city (e.g., London)"
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') search();
              }}
            />
            <button className="secondary" onClick={search} disabled={loading}>
              {loading ? 'Searching…' : 'Search'}
            </button>
          </div>
        </div>
      </div>
      {error && (
        <div style={{ color: '#fca5a5', fontSize: 14 }}>
          {error}
        </div>
      )}
    </div>
  );
}

