import { useState, useMemo, useCallback } from 'react';
import { BookOpen, Search, ExternalLink, ChevronRight } from 'lucide-react';
import { useApp } from '../App';
import { searchRemedies } from '../engines/remedy_compare';
import Modal from '../components/Modal';
import { humanize } from '../utils/humanize';
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

// ── Kingdom badge color ────────────────────────────────────────────────────────

function kingdomColor(kingdom: string): string {
  switch (kingdom.toLowerCase()) {
    case 'plant':   return 'bg-green-100 text-green-700';
    case 'animal':  return 'bg-amber-100 text-amber-700';
    case 'mineral': return 'bg-slate-100 text-slate-600';
    default:        return 'bg-jc-purple-100 text-jc-purple-700';
  }
}

// ── Remedy Detail Content (used in modal) ─────────────────────────────────────

function RemedyDetailContent({ remedy }: { remedy: Remedy }) {
  const kc = kingdomColor(remedy.kingdom ?? '');

  return (
    <div className="space-y-5 text-sm text-slate-700">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-bold text-slate-800 text-base">{remedy.latin_name}</span>
          <span className="text-xs text-slate-400 font-mono">{remedy.abbreviation}</span>
        </div>
        {remedy.common_name && (
          <div className="text-sm text-slate-500 italic">{remedy.common_name}</div>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {remedy.kingdom && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${kc}`}>{remedy.kingdom}</span>
        )}
        {remedy.thermal_state && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium capitalize">
            {remedy.thermal_state}
          </span>
        )}
        {remedy.laterality && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">{remedy.laterality}</span>
        )}
        {(remedy.miasm ?? []).map((m: string) => (
          <span key={m} className="text-xs px-2.5 py-1 rounded-full bg-jc-purple-50 text-jc-purple-600 capitalize">{m}</span>
        ))}
      </div>

      {/* Description */}
      {remedy.description && (
        <p className="leading-relaxed text-slate-600 border-l-2 border-jc-purple-200 pl-3">{remedy.description}</p>
      )}

      {/* Keynotes */}
      {(remedy.keynotes ?? []).length > 0 && (
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Keynotes</div>
          <ul className="space-y-1.5">
            {(remedy.keynotes ?? []).map((k: { symptom: string; grade: number }, i: number) => (
              <li key={i} className="flex gap-2 items-start">
                <span className={[
                  'text-xs font-bold shrink-0 mt-0.5',
                  k.grade === 3 ? 'text-jc-purple-600' : k.grade === 2 ? 'text-jc-purple-400' : 'text-slate-400',
                ].join(' ')}>
                  {'K'.repeat(k.grade)}
                </span>
                <span className="leading-snug">{humanize(k.symptom)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Causation */}
      {(remedy.causation ?? []).length > 0 && (
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Causation (Ailments from)</div>
          <div className="flex flex-wrap gap-1.5">
            {(remedy.causation ?? []).map((c: { trigger: string; grade: number }) => (
              <span key={c.trigger} className="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full">
                {humanize(c.trigger)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Worse / Better */}
      <div className="grid grid-cols-2 gap-4">
        {(remedy.worse_from ?? []).length > 0 && (
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Worse from</div>
            <ul className="space-y-0.5">
              {(remedy.worse_from ?? []).map((v: string) => (
                <li key={v} className="text-xs text-slate-600 flex gap-1.5 items-center">
                  <span className="text-red-400 shrink-0">-</span>{humanize(v)}
                </li>
              ))}
            </ul>
          </div>
        )}
        {(remedy.better_from ?? []).length > 0 && (
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Better from</div>
            <ul className="space-y-0.5">
              {(remedy.better_from ?? []).map((v: string) => (
                <li key={v} className="text-xs text-slate-600 flex gap-1.5 items-center">
                  <span className="text-emerald-500 shrink-0">+</span>{humanize(v)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Time modality */}
      {(remedy.time_modality ?? []).length > 0 && (
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Time modality: </span>
          <span className="text-xs text-slate-600">{(remedy.time_modality ?? []).join(', ')}</span>
        </div>
      )}

      {/* Complements / Antidotes */}
      <div className="grid grid-cols-2 gap-4">
        {(remedy.complementary_remedies ?? []).length > 0 && (
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Complements</div>
            <p className="text-xs text-slate-600">{(remedy.complementary_remedies ?? []).join(', ')}</p>
          </div>
        )}
        {(remedy.antidotes ?? []).length > 0 && (
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Antidotes</div>
            <p className="text-xs text-slate-600">{(remedy.antidotes ?? []).join(', ')}</p>
          </div>
        )}
      </div>

      {/* Boericke reference */}
      {remedy.boericke_page && (
        <div className="flex items-center gap-1.5 text-xs text-slate-400 border-t border-slate-100 pt-3">
          <ExternalLink size={11} />
          <span>Boericke Materia Medica, page {remedy.boericke_page}</span>
        </div>
      )}
    </div>
  );
}

// ── Remedy card (grid item) ───────────────────────────────────────────────────

function RemedyCard({ remedy, onClick }: { remedy: Remedy; onClick: () => void }) {
  const kc = kingdomColor(remedy.kingdom ?? '');

  return (
    <div
      className="jc-card space-y-2 cursor-pointer group"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      aria-label={`View details for ${remedy.latin_name}`}
    >
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
        <ChevronRight size={14} className="text-slate-300 group-hover:text-jc-purple-500 transition-colors shrink-0 mt-0.5" />
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

      {remedy.description && (
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{remedy.description}</p>
      )}

      <div className="pt-1 flex justify-end">
        <span className="text-xs text-jc-purple-500 font-medium group-hover:underline">View details</span>
      </div>
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
  const [selectedRemedy, setSelectedRemedy] = useState<Remedy | null>(null);

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

      {/* Banner */}
      <div className="jc-section-banner flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <BookOpen size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Homeopathy Library</h1>
          <p className="text-sm text-white/70 mt-0.5">
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
            {visible.map(r => (
              <RemedyCard
                key={r.id}
                remedy={r}
                onClick={() => setSelectedRemedy(r)}
              />
            ))}
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

      {/* Remedy Detail Modal */}
      <Modal
        open={!!selectedRemedy}
        onClose={() => setSelectedRemedy(null)}
        title={selectedRemedy?.latin_name ?? ''}
        maxWidth="max-w-xl"
      >
        {selectedRemedy && <RemedyDetailContent remedy={selectedRemedy} />}
      </Modal>

    </div>
  );
}
