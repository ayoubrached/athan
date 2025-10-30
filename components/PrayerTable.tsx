"use client";

import type { LabeledEvent, PrayerSet } from '@/lib/prayer';
import { findNextIndex, formatTime, toEventList } from '@/lib/prayer';

type Props = {
  times: PrayerSet | null;
  now: Date;
  locationName?: string;
  timezone?: string;
};

export function PrayerTable({ times, now, locationName, timezone }: Props) {
  if (!times) return null;
  const events: LabeledEvent[] = toEventList(times);
  const nextIdx = findNextIndex(now, events);

  return (
    <div className="card" style={{ display: 'grid', gap: 8 }}>
      <div className="row">
        <div className="col">
          <div className="label">Location</div>
          <div style={{ fontWeight: 600 }}>{locationName ?? '—'}</div>
        </div>
      </div>
      <table className="times">
        <tbody>
          {events.map((e, i) => (
            <tr key={e.label}>
              <td className="label">{e.label}</td>
              <td className={i === nextIdx ? 'next' : undefined} style={{ textAlign: 'right' }}>
                {formatTime(e.time, timezone)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

