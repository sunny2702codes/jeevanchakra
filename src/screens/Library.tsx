import { useState, useMemo, useCallback } from 'react';
import { BookOpen, Search, ChevronRight, X, Star, Zap, TrendingDown, TrendingUp, Clock, GitCompare, PenLine } from 'lucide-react';
import { useApp } from '../App';
import { searchRemedies } from '../engines/remedy_compare';
import Modal from '../components/Modal';
import { humanize } from '../utils/humanize';
import { remedyNotes } from '../data/remedyNotes';
import type { Remedy } from '../types';

interface LibraryProps {
  navigate?: (s: string) => void;
}

type KingdomFilter = 'All' | 'Plant' | 'Animal' | 'Mineral';
type ThermalFilter = 'All' | 'Chilly' | 'Warm' | 'Variable';
type MiasmFilter   = 'All' | 'Psora' | 'Sycosis' | 'Syphilis' | 'Tubercular';

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

function kingdomColor(kingdom: string): string {
  switch (kingdom.toLowerCase()) {
    case 'plant':   return 'bg-green-100 text-green-700';
    case 'animal':  return 'bg-amber-100 text-amber-700';
    case 'mineral': return 'bg-slate-100 text-slate-600';
    default:        return 'bg-jc-purple-100 text-jc-purple-700';
  }
}

function kingdomGradient(kingdom: string): string {
  switch (kingdom.toLowerCase()) {
    case 'plant':   return 'from-emerald-700 via-emerald-800 to-emerald-900';
    case 'animal':  return 'from-amber-700 via-amber-800 to-amber-900';
    case 'mineral': return 'from-slate-600 via-slate-700 to-slate-800';
    default:        return 'from-jc-purple-700 via-jc-purple-800 to-jc-purple-900';
  }
}

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <span className="text-jc-purple-400 shrink-0">{icon}</span>
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

function RemedyDetailContent({ remedy, onClose, userPhone }: { remedy: Remedy; onClose: () => void; userPhone?: string }) {
  const [note, setNote] = useState(() => userPhone ? remedyNotes.get(userPhone, remedy.id) : '');
  const [editingNote, setEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const gradient = kingdomGradient(remedy.kingdom ?? '');

  return (
    <div className="text-sm text-slate-700">
      {/* Full-bleed gradient header */}
      <div className={`-mx-6 -mt-6 mb-5 bg-gradient-to-br ${gradient} px-6 pt-6 pb-5 relative rounded-t-2xl`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={16} />
        </button>
        <div className="pr-8">
          <div className="flex items-baseline gap-2.5 flex-wrap mb-1">
            <h2 className="font-bold text-white text-xl leading-tight">{remedy.latin_name}</h2>
            <span className="text-xs bg-white/20 text-white/90 font-mono px-2 py-0.5 rounded-full border border-white/20 shrink-0">{remedy.abbreviation}</span>
          </div>
          {remedy.common_name && (
            <div className="text-sm text-white/65 italic mb-3">{remedy.common_name}</div>
          )}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {remedy.kingdom && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/15 text-white border border-white/20">{remedy.kingdom}</span>
            )}
            {remedy.thermal_state && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-400/25 text-sky-100 border border-sky-300/25 capitalize">{remedy.thermal_state}</span>
            )}
            {remedy.laterality && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white/75 border border-white/15">{remedy.laterality}</span>
            )}
            {(remedy.miasm ?? []).map((m: string) => (
              <span key={m} className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-100 border border-amber-300/25 capitalize">{m}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* Description */}
        {remedy.description && (
          <p className="leading-relaxed text-slate-600 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 text-sm">
            {remedy.description}
          </p>
        )}

        {/* Keynotes */}
        {(remedy.keynotes ?? []).length > 0 && (
          <div>
            <SectionHeader icon={<Star size={12} />} label="Keynotes" />
            <div className="space-y-1.5">
              {(remedy.keynotes ?? []).map((k: { symptom: string; grade: number }, i: number) => (
                <div key={i} className={[
                  'flex gap-2.5 items-start px-3 py-2 rounded-lg border-l-[3px]',
                  k.grade === 3 ? 'border-jc-purple-600 bg-jc-purple-50' :
                  k.grade === 2 ? 'border-jc-purple-300 bg-jc-purple-50/50' :
                  'border-slate-200 bg-slate-50/50',
                ].join(' ')}>
                  <div className="flex gap-0.5 mt-1.5 shrink-0">
                    {Array.from({ length: k.grade }).map((_, j) => (
                      <div key={j} className={[
                        'w-1.5 h-1.5 rounded-full',
                        k.grade === 3 ? 'bg-jc-purple-600' : k.grade === 2 ? 'bg-jc-purple-400' : 'bg-slate-300',
                      ].join(' ')} />
                    ))}
                  </div>
                  <span className="text-sm text-slate-700 leading-snug">{humanize(k.symptom)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Causation */}
        {(remedy.causation ?? []).length > 0 && (
          <div>
            <SectionHeader icon={<Zap size={12} />} label="Causation (Ailments From)" />
            <div className="flex flex-wrap gap-1.5">
              {(remedy.causation ?? []).map((c: { trigger: string; grade: number }) => (
                <span key={c.trigger} className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
                  {humanize(c.trigger)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Modalities */}
        {((remedy.worse_from ?? []).length > 0 || (remedy.better_from ?? []).length > 0) && (
          <div>
            <SectionHeader icon={<TrendingDown size={12} />} label="Modalities" />
            <div className="grid grid-cols-2 gap-3">
              {(remedy.worse_from ?? []).length > 0 && (
                <div className="bg-red-50 rounded-xl border border-red-100 overflow-hidden">
                  <div className="px-3 py-2 border-b border-red-100 flex items-center gap-1.5">
                    <TrendingDown size={11} className="text-red-500 shrink-0" />
                    <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Worse</span>
                  </div>
                  <ul className="px-3 py-2.5 space-y-1.5">
                    {(remedy.worse_from ?? []).map((v: string) => (
                      <li key={v} className="text-xs text-slate-600 flex gap-2 items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-300 shrink-0 mt-1" />
                        {humanize(v)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {(remedy.better_from ?? []).length > 0 && (
                <div className="bg-emerald-50 rounded-xl border border-emerald-100 overflow-hidden">
                  <div className="px-3 py-2 border-b border-emerald-100 flex items-center gap-1.5">
                    <TrendingUp size={11} className="text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Better</span>
                  </div>
                  <ul className="px-3 py-2.5 space-y-1.5">
                    {(remedy.better_from ?? []).map((v: string) => (
                      <li key={v} className="text-xs text-slate-600 flex gap-2 items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1" />
                        {humanize(v)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Time modality */}
        {(remedy.time_modality ?? []).length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 shrink-0">
              <Clock size={12} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Time</span>
            </div>
            {(remedy.time_modality ?? []).map((t: string) => (
              <span key={t} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-full">{humanize(t)}</span>
            ))}
          </div>
        )}

        {/* Relations */}
        {((remedy.complementary_remedies ?? []).length > 0 || (remedy.antidotes ?? []).length > 0) && (
          <div>
            <SectionHeader icon={<GitCompare size={12} />} label="Relations" />
            <div className="grid grid-cols-2 gap-3">
              {(remedy.complementary_remedies ?? []).length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-1.5">Complements</div>
                  <div className="flex flex-wrap gap-1">
                    {(remedy.complementary_remedies ?? []).map((r: string) => (
                      <span key={r} className="text-xs bg-jc-purple-50 text-jc-purple-700 border border-jc-purple-100 px-2 py-0.5 rounded-full">{r}</span>
                    ))}
                  </div>
                </div>
              )}
              {(remedy.antidotes ?? []).length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-1.5">Antidotes</div>
                  <div className="flex flex-wrap gap-1">
                    {(remedy.antidotes ?? []).map((r: string) => (
                      <span key={r} className="text-xs bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded-full">{r}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Boericke reference */}
        {remedy.boericke_page && (
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
            <BookOpen size={12} className="text-slate-300 shrink-0" />
            <span className="text-xs text-slate-400">Boericke Materia Medica, 8th Ed. p.{remedy.boericke_page}</span>
          </div>
        )}

        {/* Personal notes - Feature 8 */}
        {userPhone && (
          <div className="border-t border-slate-100 pt-4">
            <SectionHeader icon={<PenLine size={12} />} label="My Notes" />
            {!editingNote ? (
              <div className="space-y-2">
                {note ? (
                  <p className="text-sm text-slate-600 leading-relaxed bg-jc-purple-50 rounded-lg px-3 py-2.5 border border-jc-purple-100">{note}</p>
                ) : (
                  <p className="text-xs text-slate-400 italic">No personal notes added yet.</p>
                )}
                <button
                  className="text-xs font-semibold text-jc-purple-600 hover:underline cursor-pointer"
                  onClick={() => { setNoteDraft(note); setEditingNote(true); }}
                >
                  {note ? 'Edit notes' : 'Add personal notes'}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  className="jc-input resize-none h-20 text-sm w-full"
                  placeholder="Personal clinical observations, pearls, cases where this worked..."
                  value={noteDraft}
                  onChange={e => setNoteDraft(e.target.value)}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    className="jc-btn-primary text-xs py-1.5 px-3"
                    onClick={() => {
                      if (userPhone) remedyNotes.set(userPhone, remedy.id, noteDraft);
                      setNote(noteDraft);
                      setEditingNote(false);
                    }}
                  >
                    Save
                  </button>
                  <button
                    className="jc-btn-ghost text-xs py-1.5 px-3"
                    onClick={() => setEditingNote(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

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
            <div className="text-xs text-slate-500 mt-0.5 truncate italic">{remedy.common_name}</div>
          )}
        </div>
        <ChevronRight size={14} className="text-slate-300 group-hover:text-jc-purple-500 transition-colors shrink-0 mt-0.5" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {remedy.kingdom && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${kc}`}>{remedy.kingdom}</span>
        )}
        {remedy.thermal_state && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium capitalize">{remedy.thermal_state}</span>
        )}
        {(remedy.miasm ?? []).slice(0, 2).map((m: string) => (
          <span key={m} className="text-xs px-2 py-0.5 rounded-full bg-jc-purple-50 text-jc-purple-600 capitalize">{m}</span>
        ))}
      </div>
      {remedy.description && (
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{remedy.description}</p>
      )}
      {remedy.boericke_page && (
        <div className="text-xs text-slate-300 font-mono">Boericke p.{remedy.boericke_page}</div>
      )}
      <div className="pt-1 flex justify-end">
        <span className="text-xs text-jc-purple-500 font-medium group-hover:underline">View details</span>
      </div>
    </div>
  );
}

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
      <div className="jc-section-banner flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <BookOpen size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Homeopathy Library</h1>
          <p className="text-sm text-white/70 mt-0.5">{filtered.length} of 700 Boericke remedies</p>
        </div>
      </div>

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

      {filtered.length === 0 ? (
        <div className="jc-card text-center py-12 text-slate-400 text-sm">No remedies match your search.</div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            {visible.map(r => (
              <RemedyCard key={r.id} remedy={r} onClick={() => setSelectedRemedy(r)} />
            ))}
          </div>
          {shown < filtered.length && (
            <div className="text-center pt-2">
              <button className="jc-btn-secondary" onClick={() => setShown(s => s + PAGE_SIZE)}>
                Load more ({filtered.length - shown} remaining)
              </button>
            </div>
          )}
        </>
      )}

      <Modal open={!!selectedRemedy} onClose={() => setSelectedRemedy(null)} maxWidth="max-w-2xl" hideInternalClose>
        {selectedRemedy && (
          <RemedyDetailContent
            remedy={selectedRemedy}
            onClose={() => setSelectedRemedy(null)}
            userPhone={ctx.session?.phone}
          />
        )}
      </Modal>
    </div>
  );
}
