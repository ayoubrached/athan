"use client";

import type { MadhabKey } from '@/lib/prayer';

type Props = {
  value: MadhabKey;
  onChange(value: MadhabKey): void;
};

export function MadhabSelect({ value, onChange }: Props) {
  return (
    <div className="card" style={{ display: 'grid', gap: 8 }}>
      <div className="label" style={{ color: 'var(--muted)' }}>Asr madhab</div>
      <div className="row">
        <button
          className={value === 'Shafi' ? '' : 'secondary'}
          onClick={() => onChange('Shafi')}
        >
          Shafi (shadow = 1)
        </button>
        <button
          className={value === 'Hanafi' ? '' : 'secondary'}
          onClick={() => onChange('Hanafi')}
        >
          Hanafi (shadow = 2)
        </button>
      </div>
    </div>
  );
}

