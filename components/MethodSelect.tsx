"use client";

import { useId } from 'react';
import type { MethodKey } from '@/lib/prayer';

type Props = {
  value: MethodKey;
  onChange(value: MethodKey): void;
};

const LABEL: Record<MethodKey, string> = {
  MWL: 'Muslim World League',
  ISNA: 'ISNA (North America)',
  UmmAlQura: 'Umm al-Qura',
  Egyptian: 'Egyptian',
  Karachi: 'Karachi',
  Moonsighting: 'Moonsighting Committee',
  Dubai: 'Dubai',
  Kuwait: 'Kuwait',
  Qatar: 'Qatar',
  Singapore: 'Singapore',
  Tehran: 'Tehran',
  Turkey: 'Turkey',
};

export function MethodSelect({ value, onChange }: Props) {
  const id = useId();
  return (
    <div className="card" style={{ display: 'grid', gap: 8 }}>
      <label htmlFor={id} className="label" style={{ color: 'var(--muted)' }}>
        Calculation method
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as MethodKey)}
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.08)',
          background: '#0e1420',
          color: 'var(--text)',
        }}
      >
        {(Object.keys(LABEL) as MethodKey[]).map((k) => (
          <option key={k} value={k}>
            {LABEL[k]}
          </option>
        ))}
      </select>
    </div>
  );
}

