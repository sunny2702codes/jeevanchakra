import { useState, useMemo } from 'react';
import { GitCompare, Search, X } from 'lucide-react';
// @ts-ignore
import { REMEDIES as _R } from '../data/remedies.js';
import { compare, searchRemedies } from '../engines/remedy_compare';
import type { Remedy } from '../types';

const ALL = _R as Remedy[];

interface CompareProps { navigate: (s: string) => void; }

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
            className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
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

function FieldRow({ field, values1, values2 }: { field: string; values1: string[]; values2: string[] }) {
  const set1 = new Set(values1);
  const set2 = new Set(values2);
  const shared = values1.filter(v => set2.has(v));
  const only1  = values1.filter(v => !set2.has(v));
  const only2  = values2.filter(v => !set1.has(v));
  if (!shared.length && !only1.length && !only2.length) return null;
  return (
    <div className="grid grid-cols-3 gap-4 py-3 border-b border-slate-50 last:border-0">
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wide self-start pt-0.5">{field}</div>
      <div className="text-xs text-slate-700 space-y-1">
        {only1.map(v => <span key={v} className="block text-jc-purple-700 font-medium">{v}</span>)}
        {shared.map(v => <span key={v} className="block text-emerald-700">{v}</span>)}
      </div>
      <div className="text-xs text-slate-700 space-y-1">
        {only2.map(v => <span key={v} className="block text-jc-purple-700 font-medium">{v}</span>)}
        {shared.map(v => <span key={v} className="block text-emerald-700">{v}</span>)}
      </div>
    </div>
  );
}

export default function CompareRemedies({ navigate: _nav }: CompareProps) {
  const [r1, setR1] = useState<Remedy | null>(null);
  const [r2, setR2] = useState<Remedy | null>(null);

  const result = useMemo(() => {
    if (!r1 || !r2) return null;
    return compare(r1.id, r2.id);
  }, [r1, r2]);

  const canCompare = r1 && r2;
  const totalRemedies = ALL.length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="jc-section-banner flex items-start gap-4">
        <div className="p-3 bg-white/20 rounded-xl">
          <GitCompare size={24} className="text-white" />
        </div>
        <div>
          <div className="text-xs font-bold text-jc-gold-300 uppercase tracking-widest mb-1">Reference Tool</div>
          <h1 className="text-xl font-bold text-white">Compare Remedies</h1>
          <p className="text-white/70 text-sm mt-1">
            Side-by-side comparison of {totalRemedies} Boericke remedies
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <RemedyPicker label="Remedy A" value={r1} onSelect={setR1} onClear={() => setR1(null)} />
        <RemedyPicker label="Remedy B" value={r2} onSelect={setR2} onClear={() => setR2(null)} />
      </div>

      {!canCompare && (
        <div className="jc-card text-center py-12 text-slate-400">
          <GitCompare size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Select two remedies to compare</p>
          <p className="text-sm mt-1">Search by latin name, common name, or abbreviation</p>
        </div>
      )}

      {result && (
        <div className="jc-card space-y-0">
          <div className="grid grid-cols-3 gap-4 pb-3 border-b border-slate-100 mb-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Attribute</div>
            <div className="font-bold text-jc-purple-700 text-sm">{result.remedy1.abbreviation}</div>
            <div className="font-bold text-jc-purple-700 text-sm">{result.remedy2.abbreviation}</div>
          </div>

          <div className="grid grid-cols-3 gap-4 py-3 border-b border-slate-50">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide self-center">Thermal</div>
            <div className="text-xs text-slate-700 capitalize">{result.remedy1.thermal_state ?? 'Not specified'}</div>
            <div className="text-xs text-slate-700 capitalize">{result.remedy2.thermal_state ?? 'Not specified'}</div>
          </div>
          <div className="grid grid-cols-3 gap-4 py-3 border-b border-slate-50">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide self-center">Laterality</div>
            <div className="text-xs text-slate-700">{result.remedy1.laterality ?? 'Not specified'}</div>
            <div className="text-xs text-slate-700">{result.remedy2.laterality ?? 'Not specified'}</div>
          </div>
          <div className="grid grid-cols-3 gap-4 py-3 border-b border-slate-50">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide self-center">Miasm</div>
            <div className="text-xs text-slate-700 capitalize">
              {(result.remedy1.miasm ?? []).join(', ') || 'Not specified'}
            </div>
            <div className="text-xs text-slate-700 capitalize">
              {(result.remedy2.miasm ?? []).join(', ') || 'Not specified'}
            </div>
          </div>

          <FieldRow
            field="Keynotes"
            values1={(result.remedy1.keynotes ?? []).map((k: { symptom: string }) => k.symptom)}
            values2={(result.remedy2.keynotes ?? []).map((k: { symptom: string }) => k.symptom)}
          />
          <FieldRow field="Worse from" values1={result.remedy1.worse_from ?? []} values2={result.remedy2.worse_from ?? []} />
          <FieldRow field="Better from" values1={result.remedy1.better_from ?? []} values2={result.remedy2.better_from ?? []} />
          <FieldRow
            field="Complements"
            values1={result.remedy1.complementary_remedies ?? []}
            values2={result.remedy2.complementary_remedies ?? []}
          />

          <div className="pt-3 text-xs text-slate-400 flex gap-4">
            <span className="text-emerald-600 font-semibold">Green</span> = shared attribute
            <span className="text-jc-purple-700 font-semibold">Purple</span> = unique to that remedy
          </div>
        </div>
      )}
    </div>
  );
}
