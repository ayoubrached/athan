"use client";

import type { MethodKey, MadhabKey } from '@/lib/prayer';

type Props = {
  open: boolean;
  onClose(): void;
  method: MethodKey;
  onMethodChange(value: MethodKey): void;
  madhab: MadhabKey;
  onMadhabChange(value: MadhabKey): void;
  autoMethod: boolean;
  onAutoMethodChange(value: boolean): void;
};

const METHOD_LABELS: Record<MethodKey, string> = {
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

export function Settings({ open, onClose, method, onMethodChange, madhab, onMadhabChange, autoMethod, onAutoMethodChange }: Props) {
  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="card" style={{ width: 'min(420px, 92vw)', padding: 16 }} onClick={(e) => e.stopPropagation()}>
        <div className="row" style={{ alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Settings</h2>
          <div style={{ flex: 1 }} />
          <button className="secondary" onClick={onClose}>Close</button>
        </div>

        <div style={{ height: 12 }} />

        <div className="col" style={{ gap: 16 }}>
          <div className="col" style={{ gap: 8 }}>
            <div className="label" style={{ color: 'var(--muted)' }}>Calculation method</div>
            <select
              value={method}
              onChange={(e) => { onMethodChange(e.target.value as MethodKey); onAutoMethodChange(false); }}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.08)',
                background: '#0e1420',
                color: 'var(--text)'
              }}
            >
              {(Object.keys(METHOD_LABELS) as MethodKey[]).map((k) => (
                <option key={k} value={k}>{METHOD_LABELS[k]}</option>
              ))}
            </select>
          </div>

          <div className="col" style={{ gap: 8 }}>
            <div className="label" style={{ color: 'var(--muted)' }}>Asr madhab</div>
            <div className="row">
              <button className={madhab === 'Shafi' ? '' : 'secondary'} onClick={() => onMadhabChange('Shafi')}>Shafi</button>
              <button className={madhab === 'Hanafi' ? '' : 'secondary'} onClick={() => onMadhabChange('Hanafi')}>Hanafi</button>
            </div>
          </div>

          <div className="row" style={{ alignItems: 'center', gap: 12 }}>
            <div className="col" style={{ gap: 2 }}>
              <div style={{ fontWeight: 600 }}>Auto-select by region</div>
              <div className="label" style={{ color: 'var(--muted)', fontSize: 12 }}>Pick a recommended method when you choose a location</div>
            </div>
            <label className="switch" aria-label="Auto-select method">
              <input id="auto-method" type="checkbox" checked={autoMethod} onChange={(e) => onAutoMethodChange(e.target.checked)} />
              <span className="slider" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
