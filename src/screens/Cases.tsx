import { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, Trash2, FileText, RefreshCw } from 'lucide-react';
import { authStore } from '../auth/authStore';
import { useApp } from '../App';
import { humanize } from '../utils/humanize';
import type { SavedCase } from '../types';

interface CasesProps {
  session?: { phone: string; name: string } | null;
  navigate?: (s: string) => void;
}

const USERS_KEY = 'jc_users';

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function deleteCaseFromStore(phone: string, caseId: string): void {
  try {
    const s = localStorage.getItem(USERS_KEY);
    if (!s) return;
    const users = JSON.parse(s) as { phone: string; cases: { id: string }[] }[];
    const idx = users.findIndex(u => u.phone === phone);
    if (idx < 0) return;
    users[idx].cases = (users[idx].cases ?? []).filter(c => c.id !== caseId);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch { /* ignore */ }
}

export default function CasesScreen({ session: propSession, navigate: propNavigate }: CasesProps = {}) {
  const ctx = useApp();
  const session = propSession ?? ctx.session;
  const navigate = propNavigate ?? ctx.navigate;
  const { setClinicalSession, setClinicalResults } = ctx;

  const [cases, setCases] = useState<SavedCase[]>(() =>
    session ? authStore.getUserCases(session.phone) : []
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function toggleExpand(id: string) {
    setExpandedId(prev => (prev === id ? null : id));
  }

  function handleDeleteRequest(id: string) {
    setConfirmDeleteId(id);
  }

  function handleDeleteCancel() {
    setConfirmDeleteId(null);
  }

  function handleDeleteConfirm() {
    if (!confirmDeleteId || !session) return;
    deleteCaseFromStore(session.phone, confirmDeleteId);
    if (expandedId === confirmDeleteId) setExpandedId(null);
    setConfirmDeleteId(null);
    setCases(authStore.getUserCases(session.phone));
  }

  function handleFollowUp(c: SavedCase) {
    setClinicalSession({
      ...c.session,
      id: `sess_${Date.now()}`,
      started: new Date().toISOString(),
    });
    setClinicalResults(null);
    navigate('intake');
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Section banner */}
      <div className="jc-section-banner flex items-center gap-4">
        <div className="p-3 bg-white/20 rounded-xl shrink-0">
          <Calendar className="text-white" size={24} />
        </div>
        <div>
          <div className="text-xs font-bold text-jc-gold-300 uppercase tracking-widest mb-1">Health Records</div>
          <h1 className="text-xl font-bold text-white">My Health Journey</h1>
          <p className="text-white/70 text-sm mt-1">Your complete assessment history</p>
        </div>
      </div>

      {/* Empty state */}
      {cases.length === 0 && (
        <div className="jc-card flex flex-col items-center gap-4 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-jc-purple-100 flex items-center justify-center">
            <Calendar className="text-jc-purple-400" size={32} />
          </div>
          <div>
            <p className="text-slate-800 font-semibold text-lg">No sessions yet</p>
            <p className="text-slate-400 text-sm mt-1 max-w-xs">
              Complete your first symptom assessment to begin tracking your homeopathic health journey.
            </p>
          </div>
          <button className="jc-btn-primary mt-2" onClick={() => navigate('safety')}>
            Start First Assessment
          </button>
        </div>
      )}

      {/* Cases list */}
      {cases.length > 0 && (
        <div className="space-y-3">
          {cases.map(c => {
            const topResult = c.results?.[0];
            const topRemedy = c.topRemedy ?? topResult?.remedy_id ?? 'Unknown';
            const topScore = topResult ? Math.round(topResult.normalised_score) : 0;
            const isExpanded = expandedId === c.id;
            const isConfirming = confirmDeleteId === c.id;

            return (
              <div key={c.id} className="jc-card p-0 overflow-hidden">

                {/* Card header */}
                <div className="flex items-center gap-3 p-4">
                  <FileText className="text-jc-purple-400 shrink-0" size={18} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-400">{formatDate(c.date)}</span>
                      {c.complaint && (
                        <span className="bg-jc-purple-100 text-jc-purple-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                          {humanize(c.complaint)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5 truncate">
                      {topRemedy}
                      {topScore > 0 && (
                        <span className="ml-2 text-xs font-normal text-slate-400">{topScore}%</span>
                      )}
                    </p>
                  </div>

                  <button
                    className="jc-btn-ghost p-1.5"
                    onClick={() => toggleExpand(c.id)}
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>

                {/* Expanded panel */}
                {isExpanded && (
                  <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-4">

                    {/* Session details grid */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                      {c.session.thermal_state && (
                        <div>
                          <span className="text-slate-400 text-xs uppercase tracking-wide">Thermal</span>
                          <p className="text-slate-700 capitalize mt-0.5">{c.session.thermal_state}</p>
                        </div>
                      )}
                      {c.session.causation && c.session.causation.length > 0 && (
                        <div>
                          <span className="text-slate-400 text-xs uppercase tracking-wide">Causation</span>
                          <p className="text-slate-700 mt-0.5">{c.session.causation.map(humanize).join(', ')}</p>
                        </div>
                      )}
                      {c.session.worse_from && c.session.worse_from.length > 0 && (
                        <div>
                          <span className="text-slate-400 text-xs uppercase tracking-wide">Worse from</span>
                          <p className="text-slate-700 mt-0.5">{c.session.worse_from.map(humanize).join(', ')}</p>
                        </div>
                      )}
                      {c.session.better_from && c.session.better_from.length > 0 && (
                        <div>
                          <span className="text-slate-400 text-xs uppercase tracking-wide">Better from</span>
                          <p className="text-slate-700 mt-0.5">{c.session.better_from.map(humanize).join(', ')}</p>
                        </div>
                      )}
                    </div>

                    {/* Top 5 results */}
                    {c.results && c.results.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Top Remedies</p>
                        <ol className="space-y-1.5">
                          {c.results.slice(0, 5).map((r, i) => (
                            <li key={r.remedy_id} className="flex items-center justify-between text-sm">
                              <span className="text-slate-700">
                                <span className="text-slate-400 mr-1.5">{i + 1}.</span>
                                {r.latin_name ?? r.remedy_id}
                              </span>
                              <span
                                className={
                                  r.tier === 'Strong'
                                    ? 'jc-badge-strong'
                                    : r.tier === 'Probable'
                                    ? 'jc-badge-probable'
                                    : 'jc-badge-possible'
                                }
                              >
                                {Math.round(r.normalised_score)}% {r.tier}
                              </span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Follow-up CTA */}
                    <div className="pt-1">
                      <button
                        className="jc-btn-secondary text-sm flex items-center gap-2"
                        onClick={() => handleFollowUp(c)}
                      >
                        <RefreshCw size={14} />
                        Start Follow-up Assessment
                      </button>
                    </div>

                    {/* Delete row */}
                    <div className="pt-1 flex justify-end border-t border-slate-50">
                      {isConfirming ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">Delete this case?</span>
                          <button
                            className="text-xs font-semibold text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                            onClick={handleDeleteConfirm}
                          >
                            Yes, delete
                          </button>
                          <button
                            className="jc-btn-ghost text-xs px-2 py-1"
                            onClick={handleDeleteCancel}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors cursor-pointer px-2 py-1 rounded hover:bg-red-50"
                          onClick={() => handleDeleteRequest(c.id)}
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom CTA */}
      {cases.length > 0 && (
        <div className="flex justify-center pb-4">
          <button className="jc-btn-primary" onClick={() => navigate('safety')}>
            Start New Assessment
          </button>
        </div>
      )}
    </div>
  );
}
