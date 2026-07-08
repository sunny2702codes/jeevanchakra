import { useState, useMemo } from 'react';
import { GitCompare, Search, X, Plus } from 'lucide-react';
// @ts-ignore
import { REMEDIES as _R } from '../data/remedies.js';
import { searchRemedies } from '../engines/remedy_compare';
import { humanize } from '../utils/humanize';
import type { Remedy } from '../types';

const ALL = _R as Remedy[];
const MAX_SLOTS = 5;

interface CompareProps { navigate: (s: string) => void; }

// ── Remedy Picker ─────────────────────────────────────────────────────────────

function RemedyPicker({
  label, value, onSelect, onClear,
}: {
  label: string;
  value: Remedy | null;
  onSelect: (r: Remedy) => void;
  onClear: () => void;
}) {
  const [q, setQ] = useState('');
  const results = useMemo(() => q.length > 1 ? searchRemedies(q).slice(0, 8) : [], [q]);

  if (value) {
    return (
      <div className="jc-card border-2 border-jc-purple-200 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-xs font-bold text-jc-purple-600 uppercase tracking-wide mb-1">{label}</div>
            <div className="font-bold text-slate-800">{value.latin_name}</div>
            <div className="text-xs text-slate-400">{value.abbreviation} - {value.common_name}</div>
          </div>
          <button
            onClick={onClear}
            className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer shrink-0"
            aria-label="Remove remedy"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {value.thermal_state && (
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium capitalize">
              {value.thermal_state}
            </span>
          )}
          {(value.miasm ?? []).slice(0, 2).map((m: string) => (
            <span key={m} className="text-xs bg-jc-purple-50 text-jc-purple-700 px-2 py-0.5 rounded-full capitalize">
              {m}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="jc-card border-2 border-dashed border-slate-200 space-y-3">
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</div>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          className="jc-input pl-8 text-xs"
          placeholder="Search by name or abbreviation..."
          value={q}
          onChange={e => setQ(e.target.value)}
        />
      </div>
      {results.length > 0 && (
        <ul className="max-h-52 overflow-y-auto space-y-1">
          {results.map(r => (
            <li key={r.id}>
              <button
                onClick={() => { onSelect(r); setQ(''); }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-jc-purple-50 text-sm cursor-pointer transition-colors"
              >
                <span className="font-semibold text-slate-800">{r.latin_name}</span>
                <span className="ml-2 text-xs text-slate-400">{r.abbreviation}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {q.length > 1 && results.length === 0 && (
        <p className="text-xs text-slate-400 text-center py-3">No remedies found for that search.</p>
      )}
    </div>
  );
}

// ── Field Row: N columns ──────────────────────────────────────────────────────

function FieldRow({ field, columns }: { field: string; columns: string[][] }) {
  // Flatten all values to determine sharing
  const countMap = new Map<string, number>();
  for (const col of columns) {
    for (const v of col) {
      countMap.set(v, (countMap.get(v) ?? 0) + 1);
    }
  }
  const totalCols = columns.length;
  const hasAny = columns.some(c => c.length > 0);
  if (!hasAny) return null;

  return (
    <div
      className="py-3 border-b border-slate-50 last:border-0"
      style={{ display: 'grid', gridTemplateColumns: `120px repeat(${totalCols}, 1fr)`, gap: '1rem' }}
    >
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wide self-start pt-0.5">{field}</div>
      {columns.map((col, ci) => (
        <div key={ci} className="text-xs text-slate-700 space-y-1">
          {col.map(v => {
            const count = countMap.get(v) ?? 1;
            const isShared = count >= 2;
            return (
              <span
                key={v}
                className={[
                  'block font-medium',
                  isShared ? 'text-emerald-700' : 'text-jc-purple-700',
                ].join(' ')}
              >
                {humanize(v)}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function CompareRemedies({ navigate: _nav }: CompareProps) {
  const [remedies, setRemedies] = useState<(Remedy | null)[]>([null, null]);

  const filledRemedies = remedies.filter(Boolean) as Remedy[];
  const canCompare = filledRemedies.length >= 2;
  const canAddSlot = remedies.length < MAX_SLOTS;

  function updateSlot(idx: number, remedy: Remedy | null) {
    setRemedies(prev => {
      const next = [...prev];
      next[idx] = remedy;
      return next;
    });
  }

  function addSlot() {
    if (canAddSlot) setRemedies(prev => [...prev, null]);
  }

  function removeSlot(idx: number) {
    setRemedies(prev => {
      if (prev.length <= 2) {
        const next = [...prev];
        next[idx] = null;
        return next;
      }
      return prev.filter((_, i) => i !== idx);
    });
  }

  // Build comparison columns from filled remedies
  const columns = useMemo(() => {
    if (!canCompare) return null;
    return filledRemedies;
  }, [filledRemedies, canCompare]);

  const totalRemedies = ALL.length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Banner */}
      <div className="jc-section-banner flex items-start gap-4">
        <div className="p-3 bg-white/20 rounded-xl">
          <GitCompare size={24} className="text-white" />
        </div>
        <div>
          <div className="text-xs font-bold text-jc-gold-300 uppercase tracking-widest mb-1">Reference Tool</div>
          <h1 className="text-xl font-bold text-white">Compare Remedies</h1>
          <p className="text-white/70 text-sm mt-1">
            Side-by-side comparison of {totalRemedies} Boericke remedies (up to {MAX_SLOTS} at once)
          </p>
        </div>
      </div>

      {/* Pickers */}
      <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${remedies.length}, 1fr)` }}>
        {remedies.map((r, i) => (
          <div key={i} className="relative">
            <RemedyPicker
              label={`Remedy ${String.fromCharCode(65 + i)}`}
              value={r}
              onSelect={rem => updateSlot(i, rem)}
              onClear={() => removeSlot(i)}
            />
          </div>
        ))}
      </div>

      {/* Add slot button */}
      {canAddSlot && (
        <div className="flex justify-start">
          <button
            onClick={addSlot}
            className="flex items-center gap-2 text-sm text-jc-purple-600 font-semibold border border-jc-purple-200 px-4 py-2 rounded-xl hover:bg-jc-purple-50 transition-colors cursor-pointer"
          >
            <Plus size={15} />
            Add another remedy
          </button>
        </div>
      )}

      {!canCompare && (
        <div className="jc-card text-center py-12 text-slate-400">
          <GitCompare size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Select at least two remedies to compare</p>
          <p className="text-sm mt-1">Search by latin name, common name, or abbreviation</p>
        </div>
      )}

      {columns && (
        <div className="jc-card space-y-0 overflow-x-auto">
          {/* Header */}
          <div
            className="pb-3 border-b border-slate-100 mb-1"
            style={{ display: 'grid', gridTemplateColumns: `120px repeat(${columns.length}, 1fr)`, gap: '1rem' }}
          >
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Attribute</div>
            {columns.map(r => (
              <div key={r.id} className="font-bold text-jc-purple-700 text-sm">
                {r.abbreviation}
                <div className="text-xs font-normal text-slate-400 truncate">{r.latin_name}</div>
              </div>
            ))}
          </div>

          {/* Thermal */}
          <div
            className="py-3 border-b border-slate-50"
            style={{ display: 'grid', gridTemplateColumns: `120px repeat(${columns.length}, 1fr)`, gap: '1rem' }}
          >
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide self-center">Thermal</div>
            {columns.map(r => (
              <div key={r.id} className="text-xs text-slate-700 capitalize">{r.thermal_state ?? 'Not specified'}</div>
            ))}
          </div>

          {/* Laterality */}
          <div
            className="py-3 border-b border-slate-50"
            style={{ display: 'grid', gridTemplateColumns: `120px repeat(${columns.length}, 1fr)`, gap: '1rem' }}
          >
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide self-center">Laterality</div>
            {columns.map(r => (
              <div key={r.id} className="text-xs text-slate-700">{r.laterality ?? 'Not specified'}</div>
            ))}
          </div>

          {/* Miasm */}
          <div
            className="py-3 border-b border-slate-50"
            style={{ display: 'grid', gridTemplateColumns: `120px repeat(${columns.length}, 1fr)`, gap: '1rem' }}
          >
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide self-center">Miasm</div>
            {columns.map(r => (
              <div key={r.id} className="text-xs text-slate-700 capitalize">
                {(r.miasm ?? []).join(', ') || 'Not specified'}
              </div>
            ))}
          </div>

          {/* Keynotes */}
          <FieldRow
            field="Keynotes"
            columns={columns.map(r => (r.keynotes ?? []).map((k: { symptom: string }) => k.symptom))}
          />

          {/* Worse from */}
          <FieldRow
            field="Worse from"
            columns={columns.map(r => r.worse_from ?? [])}
          />

          {/* Better from */}
          <FieldRow
            field="Better from"
            columns={columns.map(r => r.better_from ?? [])}
          />

          {/* Complements */}
          <FieldRow
            field="Complements"
            columns={columns.map(r => r.complementary_remedies ?? [])}
          />

          {/* Legend */}
          <div className="pt-3 text-xs text-slate-400 flex gap-6">
            <span className="text-emerald-600 font-semibold">Green</span> = shared between remedies
            <span className="text-jc-purple-700 font-semibold">Purple</span> = unique to that remedy
          </div>
        </div>
      )}
    </div>
  );
}
