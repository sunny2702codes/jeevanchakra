import { useState, useMemo, useCallback } from 'react';
import { BookOpen, Search, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { useApp } from '../App';
import { searchRemedies } from '../engines/remedy_compare';
import type { Remedy } from '../types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface LibraryProps {
  navigate?: (s: string) => void;
}

type KingdomFilter = 'All' | 'Plant' | 'Animal' | 'Mineral';
type ThermalFilter = 'All' | 'Chilly' | 'Warm' | 'Variable';
type MiasmFilter   = 'All' | 'Psora' | 'Sycosis' | 'Syphilis' | 'Tubercular';

// ── Filter chip ───────────────────────────────────────────────────────────────

interface ChipProps<T extends string> {
  options: T[];
  value: T;
  onChange: (v: T) => void;
}

function FilterChips<T extends string>({ options, value, onChange }: ChipProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
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

// ── Remedy card ───────────────────────────────────────────────────────────────

function RemedyCard({ remedy }: { remedy: Remedy }) {
  const [open, setOpen] = useState(false);

  const kingdomColor: Record<string, string> = {
    plant:   'bg-green-100 text-green-700',
    animal:  'bg-amber-100 text-amber-700',
    mineral: 'bg-slate-100 text-slate-600',
  };
  const kc = kingdomColor[(remedy.kingdom ?? '').toLowerCase()] ?? 'bg-jc-purple-100 text-jc-purple-700';

  return (
    <div className="jc-card space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-slate-800 truncate">{remedy.latin_name}</span>
            <span className="text-xs text-slate-400 font-mono shrink-0">{remedy.abbreviation}</span>
          </div>
          {remedy.common_name && (
            <div className="text-xs text-slate-500 mt-0.5 truncate">{remedy.common_name}</div>
          )}
        </div>
        <button
          onClick={() => setOpen(o => !o)}
          className="shrink-0 text-slate-400 hover:text-jc-purple-700 transition-colors cursor-pointer"
          aria-label={open ? 'Collapse' : 'Expand'}
        >
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {remedy.kingdom && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${kc}`}>
            {remedy.kingdom}
          </span>
        )}
        {remedy.thermal_state && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium capitalize">
            {remedy.thermal_state}
          </span>
        )}
        {(remedy.miasm ?? []).slice(0, 2).map((m: string) => (
          <span key={m} className="text-xs px-2 py-0.5 rounded-full bg-jc-purple-50 text-jc-purple-600 capitalize">
            {m}
          </span>
        ))}
      </div>

      {open && (
        <div className="pt-3 border-t border-slate-100 space-y-3 text-xs text-slate-600">
          {remedy.description && (
            <p className="leading-relaxed">{remedy.description}</p>
          )}

          {(remedy.keynotes ?? []).length > 0 && (
            <div>
              <div className="text-slate-400 font-semibold uppercase tracking-wide text-xs mb-1">Keynotes</div>
              <ul className="space-y-0.5">
                {(remedy.keynotes ?? []).slice(0, 4).map((k: { symptom: string; grade: number }, i: number) => (
                  <li key={i} className="flex gap-2">
                    <span className={k.grade === 3 ? 'text-jc-purple-600 font-bold' : k.grade === 2 ? 'text-jc-purple-500 font-medium' : 'text-slate-400'}>
                      {'K'.repeat(k.grade)}
                    </span>
                    {k.symptom}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(remedy.worse_from ?? []).length > 0 && (
            <div>
              <span className="text-slate-400 font-semibold">Worse from: </span>
              {(remedy.worse_from ?? []).slice(0, 5).join(', ')}
            </div>
          )}

          {(remedy.better_from ?? []).length > 0 && (
            <div>
              <span className="text-slate-400 font-semibold">Better from: </span>
              {(remedy.better_from ?? []).slice(0, 5).join(', ')}
            </div>
          )}

          {(remedy.complementary_remedies ?? []).length > 0 && (
            <div>
              <span className="text-slate-400 font-semibold">Complements: </span>
              {(remedy.complementary_remedies ?? []).slice(0, 3).join(', ')}
            </div>
          )}

          {remedy.boericke_page && (
            <div className="flex items-center gap-1 text-slate-400 text-xs">
              <ExternalLink size={10} />
              Boericke p.{remedy.boericke_page}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Library screen ────────────────────────────────────────────────────────────

const PAGE_SIZE = 24;

export default function LibraryScreen({ navigate: navProp }: LibraryProps) {
  const ctx = useApp();
  const _navigate = navProp ?? ctx.navigate;
  void _navigate;

  const [query,   setQuery]   = useState('');
  const [kingdom, setKingdom] = useState<KingdomFilter>('All');
  const [thermal, setThermal] = useState<ThermalFilter>('All');
  const [miasm,   setMiasm]   = useState<MiasmFilter>('All');
  const [shown,   setShown]   = useState(PAGE_SIZE);

  const KINGDOM_OPTIONS: KingdomFilter[] = ['All', 'Plant', 'Animal', 'Mineral'];
  const THERMAL_OPTIONS: ThermalFilter[] = ['All', 'Chilly', 'Warm', 'Variable'];
  const MIASM_OPTIONS:   MiasmFilter[]   = ['All', 'Psora', 'Sycosis', 'Syphilis', 'Tubercular'];

  const filtered: Remedy[] = useMemo(
    () => searchRemedies(query, { kingdom: kingdom !== 'All' ? kingdom : undefined, thermal: thermal !== 'All' ? thermal : undefined, miasm: miasm !== 'All' ? miasm : undefined }),
    [query, kingdom, thermal, miasm],
  );

  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setShown(PAGE_SIZE);
  }, []);

  const visible = filtered.slice(0, shown);

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      <div className="jc-section-banner flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-jc-purple-100 flex items-center justify-center shrink-0">
          <BookOpen size={20} className="text-jc-purple-700" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Homeopathy Library</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {filtered.length} of 700 Boericke remedies
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          className="jc-input pl-9"
          placeholder="Search by name, abbreviation, or symptom..."
          value={query}
          onChange={handleQueryChange}
        />
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider w-16 shrink-0">Kingdom</span>
          <FilterChips options={KINGDOM_OPTIONS} value={kingdom} onChange={v => { setKingdom(v); setShown(PAGE_SIZE); }} />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider w-16 shrink-0">Thermal</span>
          <FilterChips options={THERMAL_OPTIONS} value={thermal} onChange={v => { setThermal(v); setShown(PAGE_SIZE); }} />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider w-16 shrink-0">Miasm</span>
          <FilterChips options={MIASM_OPTIONS} value={miasm} onChange={v => { setMiasm(v); setShown(PAGE_SIZE); }} />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="jc-card text-center py-12 text-slate-400 text-sm">
          No remedies match your search.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            {visible.map(r => <RemedyCard key={r.id} remedy={r} />)}
          </div>

          {shown < filtered.length && (
            <div className="text-center pt-2">
              <button
                className="jc-btn-secondary"
                onClick={() => setShown(s => s + PAGE_SIZE)}
              >
                Load more ({filtered.length - shown} remaining)
              </button>
            </div>
          )}
        </>
      )}

    </div>
  );
}
