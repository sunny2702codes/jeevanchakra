import { useState, useMemo } from 'react';
import { Search, BookOpen, ChevronRight, Loader2 } from 'lucide-react';
import { getRubricsForRemedy } from '../engines/rubric_search';
import { searchRemedies } from '../engines/remedy_compare';
import { initSemantic, semanticSearch, getSemanticStatus } from '../engines/rubricSemantic';
// @ts-ignore
import { REMEDIES as _R } from '../data/remedies.js';
import Modal from '../components/Modal';
import { humanize } from '../utils/humanize';
import type { Remedy } from '../types';

interface RubricSearchProps { navigate: (s: string) => void; }

const ALL = _R as Remedy[];

function searchBySymptom(q: string): Array<{ remedy: Remedy; matches: string[] }> {
  if (!q || q.length < 2) return [];
  const ql = q.toLowerCase();
  const results: Array<{ remedy: Remedy; matches: string[]; score: number }> = [];
  for (const r of ALL) {
    const matches: string[] = [];
    let score = 0;
    for (const kn of (r.keynotes ?? []) as Array<{ symptom: string; grade: number }>) {
      if (kn.symptom && kn.symptom.toLowerCase().includes(ql)) {
        matches.push(`Keynote: ${humanize(kn.symptom)}`);
        score += kn.grade * 3;
      }
    }
    for (const wf of r.worse_from ?? []) {
      if (wf.toLowerCase().includes(ql)) { matches.push(`Worse from: ${humanize(wf)}`); score += 2; }
    }
    for (const bf of r.better_from ?? []) {
      if (bf.toLowerCase().includes(ql)) { matches.push(`Better from: ${humanize(bf)}`); score += 2; }
    }
    for (const c of (r.causation ?? []) as Array<{ trigger: string }>) {
      if (c.trigger && c.trigger.toLowerCase().includes(ql)) {
        matches.push(`Causation: ${humanize(c.trigger)}`);
        score += 4;
      }
    }
    if (matches.length > 0) results.push({ remedy: r, matches, score });
  }
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map(({ remedy, matches }) => ({ remedy, matches }));
}

// ── Remedy detail panel (used inside modal) ───────────────────────────────────

function RemedyDetailPanel({ remedy }: { remedy: Remedy }) {
  const rubrics = getRubricsForRemedy(remedy.id);
  return (
    <div className="space-y-4 text-sm">
      <div>
        <div className="font-bold text-slate-800 text-base">{remedy.latin_name}</div>
        <div className="text-xs text-slate-400">{remedy.abbreviation} - {remedy.common_name}</div>
        {remedy.description && (
          <p className="text-xs text-slate-500 mt-2 leading-relaxed border-l-2 border-jc-purple-200 pl-3">{remedy.description}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {remedy.thermal_state && (
          <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full capitalize font-medium">
            {remedy.thermal_state}
          </span>
        )}
        {(remedy.miasm ?? []).map((m: string) => (
          <span key={m} className="text-xs bg-jc-purple-50 text-jc-purple-700 px-2.5 py-1 rounded-full capitalize">
            {m}
          </span>
        ))}
      </div>

      {rubrics.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {(['Keynote', 'Causation', 'Worse from', 'Better from'] as const).map(cat => {
            const items = rubrics.filter(r => r.field === cat);
            if (!items.length) return null;
            return (
              <div key={cat}>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">{cat}</p>
                <ul className="space-y-1">
                  {items.map((r, i) => (
                    <li key={i} className="text-xs text-slate-700 flex gap-2">
                      <span className="text-jc-purple-400 shrink-0">+</span>
                      {humanize(r.value)}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-xs text-slate-400 text-center py-6">
          No rubric data available in the current database.
        </div>
      )}
    </div>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function RubricSearch({ navigate: _nav }: RubricSearchProps) {
  const [symptomQuery, setSymptomQuery]   = useState('');
  const [remedyQuery, setRemedyQuery]     = useState('');
  const [selectedRemedy, setSelectedRemedy] = useState<Remedy | null>(null);
  const [modalRemedy, setModalRemedy]     = useState<Remedy | null>(null);
  const [tab, setTab] = useState<'symptom' | 'remedy' | 'semantic'>('symptom');

  // Semantic search state
  const [semQuery, setSemQuery] = useState('');
  const [semResults, setSemResults] = useState<Array<{ id: string; text: string; cat: string; score: number }>>([]);
  const [semLoading, setSemLoading] = useState(false);
  const [semError, setSemError] = useState<string | null>(null);
  const [semInitStatus, setSemInitStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  async function handleSemanticSearch() {
    if (!semQuery.trim() || semQuery.trim().length < 3) return;
    setSemLoading(true);
    setSemError(null);
    try {
      if (getSemanticStatus() !== 'ready') {
        setSemInitStatus('loading');
        await initSemantic();
        setSemInitStatus('ready');
      }
      const results = await semanticSearch(semQuery.trim(), 12);
      setSemResults(results);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Semantic search failed';
      setSemError(msg);
      setSemInitStatus('error');
    } finally {
      setSemLoading(false);
    }
  }

  const symptomResults = useMemo(() => searchBySymptom(symptomQuery), [symptomQuery]);
  const remedySearchResults = useMemo(
    () => remedyQuery.length > 1 ? searchRemedies(remedyQuery).slice(0, 8) : [],
    [remedyQuery],
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Banner */}
      <div className="jc-section-banner flex items-start gap-4">
        <div className="p-3 bg-white/20 rounded-xl">
          <Search size={24} className="text-white" />
        </div>
        <div>
          <div className="text-xs font-bold text-jc-gold-300 uppercase tracking-widest mb-1">Reference Search</div>
          <h1 className="text-xl font-bold text-white">Symptom and Rubric Search</h1>
          <p className="text-white/70 text-sm mt-1">
            Search across 700 remedies by symptom, modality, or causation
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {[
          { key: 'symptom',  label: 'Search by Symptom' },
          { key: 'remedy',   label: 'Lookup by Remedy' },
          { key: 'semantic', label: 'Semantic Search' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as 'symptom' | 'remedy' | 'semantic')}
            className={[
              'px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer',
              tab === t.key
                ? 'bg-jc-purple-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-800',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Symptom search tab */}
      {tab === 'symptom' && (
        <div className="space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              className="jc-input pl-10"
              placeholder="Enter a symptom, modality, or causation (e.g. worse cold, grief, burning)..."
              value={symptomQuery}
              onChange={e => setSymptomQuery(e.target.value)}
            />
          </div>

          {symptomQuery.length > 1 && symptomResults.length === 0 && (
            <div className="jc-card text-center py-10 text-slate-400">
              <p className="font-medium">No remedies found for that symptom.</p>
              <p className="text-sm mt-1">Try broader terms such as "cold", "grief", or "heat".</p>
            </div>
          )}

          {symptomResults.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">{symptomResults.length} remedies found. Click a card to view full details.</p>
              {symptomResults.map(({ remedy, matches }) => (
                <div
                  key={remedy.id}
                  className="jc-card p-4 space-y-2 cursor-pointer group"
                  onClick={() => setModalRemedy(remedy)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && setModalRemedy(remedy)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-800 text-sm">{remedy.latin_name}</div>
                      <div className="text-xs text-slate-400">{remedy.abbreviation}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1 flex-wrap">
                        {remedy.thermal_state && (
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full capitalize">
                            {remedy.thermal_state}
                          </span>
                        )}
                        {(remedy.miasm ?? []).slice(0, 1).map((m: string) => (
                          <span key={m} className="text-xs bg-jc-purple-50 text-jc-purple-700 px-2 py-0.5 rounded-full capitalize">
                            {m}
                          </span>
                        ))}
                      </div>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-jc-purple-500 transition-colors shrink-0" />
                    </div>
                  </div>
                  <ul className="space-y-1">
                    {matches.slice(0, 4).map((m, i) => (
                      <li key={i} className="text-xs text-slate-600 flex gap-2">
                        <span className="text-jc-purple-500 shrink-0 mt-0.5">+</span>
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {!symptomQuery && (
            <div className="jc-card text-center py-14 text-slate-400">
              <Search size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Enter a symptom to search</p>
              <p className="text-sm mt-1">Try: "cold air", "fright", "burning", "pressure", "grief"</p>
            </div>
          )}
        </div>
      )}

      {/* Remedy lookup tab */}
      {tab === 'remedy' && (
        <div className="space-y-4">
          <div className="relative">
            <BookOpen size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              className="jc-input pl-10"
              placeholder="Enter remedy name or abbreviation..."
              value={remedyQuery}
              onChange={e => { setRemedyQuery(e.target.value); setSelectedRemedy(null); }}
            />
          </div>

          {!selectedRemedy && remedySearchResults.length > 0 && (
            <ul className="jc-card p-0 overflow-hidden divide-y divide-slate-50">
              {remedySearchResults.map(r => (
                <li key={r.id}>
                  <button
                    className="w-full text-left px-4 py-3 hover:bg-jc-purple-50 transition-colors cursor-pointer flex items-center justify-between"
                    onClick={() => { setSelectedRemedy(r); setRemedyQuery(r.latin_name); }}
                  >
                    <div>
                      <span className="font-semibold text-slate-800 text-sm">{r.latin_name}</span>
                      <span className="ml-2 text-xs text-slate-400">{r.abbreviation}</span>
                    </div>
                    <span className="text-xs text-slate-400 capitalize">{r.thermal_state ?? ''}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {selectedRemedy && (
            <div
              className="jc-card space-y-4 cursor-pointer group"
              onClick={() => setModalRemedy(selectedRemedy)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">{selectedRemedy.latin_name}</h3>
                  <p className="text-xs text-slate-400">{selectedRemedy.abbreviation} - {selectedRemedy.common_name}</p>
                  {selectedRemedy.description && (
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">{selectedRemedy.description}</p>
                  )}
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-jc-purple-500 transition-colors shrink-0 mt-1" />
              </div>

              <RemedyDetailPanel remedy={selectedRemedy} />
            </div>
          )}

          {!remedyQuery && !selectedRemedy && (
            <div className="jc-card text-center py-14 text-slate-400">
              <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Enter a remedy name to look up its rubrics</p>
            </div>
          )}
        </div>
      )}

      {/* Semantic search tab */}
      {tab === 'semantic' && (
        <div className="space-y-4">
          {/* Info banner */}
          <div className="bg-jc-purple-50 border border-jc-purple-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-jc-purple-800">Semantic Rubric Search</p>
            <p className="text-xs text-jc-purple-700 mt-1 leading-relaxed">
              Searches 63,220 Kent rubrics by meaning, not just keywords. First use downloads the AI model (~20MB). Describe the symptom in plain language.
            </p>
          </div>

          {/* Search input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                className="jc-input pl-9"
                placeholder="e.g. burning stomach worse at night better cold drinks"
                value={semQuery}
                onChange={e => setSemQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSemanticSearch()}
              />
            </div>
            <button
              className="jc-btn-primary flex items-center gap-2 whitespace-nowrap"
              onClick={handleSemanticSearch}
              disabled={semLoading}
            >
              {semLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              {semLoading ? (semInitStatus === 'loading' ? 'Loading model...' : 'Searching...') : 'Search'}
            </button>
          </div>

          {semError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {semError}
            </div>
          )}

          {semResults.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">{semResults.length} matching rubrics</p>
              {semResults.map(r => (
                <div key={r.id} className="jc-card p-3 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-slate-700 leading-snug capitalize">{r.text.replace(/_/g, ' ')}</p>
                    <span className="text-xs font-bold text-jc-purple-600 shrink-0 bg-jc-purple-50 px-2 py-0.5 rounded-full">{r.score}%</span>
                  </div>
                  <p className="text-xs text-slate-400 capitalize">{r.cat}</p>
                </div>
              ))}
            </div>
          )}

          {!semResults.length && !semLoading && !semError && (
            <div className="jc-card text-center py-14 text-slate-400">
              <Search size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Describe a symptom in plain language</p>
              <p className="text-sm mt-1">Try: "burning pains better cold water", "worse from consolation", "craves salt"</p>
            </div>
          )}
        </div>
      )}

      {/* Remedy detail modal */}
      <Modal
        open={!!modalRemedy}
        onClose={() => setModalRemedy(null)}
        title={modalRemedy?.latin_name ?? ''}
        maxWidth="max-w-xl"
      >
        {modalRemedy && <RemedyDetailPanel remedy={modalRemedy} />}
      </Modal>
    </div>
  );
}
