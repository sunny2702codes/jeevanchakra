import { useState } from 'react';
import { BookOpen, Search, Info } from 'lucide-react';
import { useApp } from '../App';

// ── Types ─────────────────────────────────────────────────────────────────────

interface LibraryProps {
  navigate?: (s: string) => void;
}

type KingdomFilter  = 'All' | 'Plant' | 'Animal' | 'Mineral';
type ThermalFilter  = 'All' | 'Chilly' | 'Warm';
type MiasmFilter    = 'All' | 'Psora' | 'Sycosis' | 'Syphilis' | 'Tubercular';

// ── Filter chip ───────────────────────────────────────────────────────────────

interface ChipProps<T extends string> {
  options: T[];
  value: T;
  onChange: (v: T) => void;
}

function FilterChips<T extends string>({ options, value, onChange }: ChipProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={[
            'px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer',
            value === opt
              ? 'bg-jc-purple-700 text-white border-jc-purple-700'
              : 'bg-white text-slate-600 border-slate-200 hover:border-jc-purple-300 hover:text-jc-purple-700',
          ].join(' ')}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="jc-card animate-pulse space-y-3">
      <div className="h-4 bg-slate-100 rounded w-3/5" />
      <div className="h-3 bg-slate-100 rounded w-4/5" />
      <div className="h-3 bg-slate-100 rounded w-2/5" />
      <div className="flex gap-2 pt-1">
        <div className="h-5 w-14 bg-slate-100 rounded-full" />
        <div className="h-5 w-14 bg-slate-100 rounded-full" />
      </div>
    </div>
  );
}

// ── Library screen ────────────────────────────────────────────────────────────

export default function LibraryScreen({ navigate: navProp }: LibraryProps) {
  const ctx = useApp();
  const _navigate = navProp ?? ctx.navigate;

  void _navigate; // reserved for future remedy detail navigation

  const [query,   setQuery]   = useState('');
  const [kingdom, setKingdom] = useState<KingdomFilter>('All');
  const [thermal, setThermal] = useState<ThermalFilter>('All');
  const [miasm,   setMiasm]   = useState<MiasmFilter>('All');

  const KINGDOM_OPTIONS:  KingdomFilter[]  = ['All', 'Plant', 'Animal', 'Mineral'];
  const THERMAL_OPTIONS:  ThermalFilter[]  = ['All', 'Chilly', 'Warm'];
  const MIASM_OPTIONS:    MiasmFilter[]    = ['All', 'Psora', 'Sycosis', 'Syphilis', 'Tubercular'];

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Section banner */}
      <div className="jc-section-banner flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-jc-purple-100 flex items-center justify-center shrink-0">
          <BookOpen size={20} className="text-jc-purple-700" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Homeopathy Library
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Browse all 700 Boericke remedies
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          type="text"
          className="jc-input pl-9"
          placeholder="Search remedies by name, abbreviation, or symptom..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="space-y-3">

        {/* Kingdom */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider w-16 shrink-0">
            Kingdom
          </span>
          <FilterChips
            options={KINGDOM_OPTIONS}
            value={kingdom}
            onChange={setKingdom}
          />
        </div>

        {/* Thermal */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider w-16 shrink-0">
            Thermal
          </span>
          <FilterChips
            options={THERMAL_OPTIONS}
            value={thermal}
            onChange={setThermal}
          />
        </div>

        {/* Miasm */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider w-16 shrink-0">
            Miasm
          </span>
          <FilterChips
            options={MIASM_OPTIONS}
            value={miasm}
            onChange={setMiasm}
          />
        </div>
      </div>

      {/* Info note card */}
      <div className="jc-card flex items-start gap-3 border-jc-purple-100 bg-jc-purple-50">
        <Info size={18} className="text-jc-purple-500 shrink-0 mt-0.5" />
        <p className="text-sm text-jc-purple-800 leading-relaxed">
          Remedy data loading... (700 remedies will be available once data module is ported)
        </p>
      </div>

      {/* Skeleton grid */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

    </div>
  );
}
