import { useState, useMemo } from 'react';
import { Pill, ChevronDown, ChevronUp, Save, RotateCcw, Loader2 } from 'lucide-react';
import { useApp } from '../App';
import { rank, hasMinimumSet } from '../engines/scoring';
import { buildDifferentials } from '../engines/differential';
import { recommend as dosageRecommend } from '../engines/dosage';
import { authStore } from '../auth/authStore';
import type { ScoringResult, SavedCase } from '../types';

interface ResultsProps {
  navigate: (s: string) => void;
  session: { phone: string; name: string } | null;
}

const TIER_BADGE: Record<string, string> = {
  Strong: 'jc-badge-strong',
  Probable: 'jc-badge-probable',
  Possible: 'jc-badge-possible',
};

export default function Results({ navigate, session: authSession }: ResultsProps) {
  const { clinicalSession, clinicalResults, setClinicalResults } = useApp();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const results: ScoringResult[] = useMemo(() => {
    if (clinicalResults) return clinicalResults;
    if (!clinicalSession) return [];
    const r = rank(clinicalSession);
    setClinicalResults(r);
    return r;
  }, [clinicalSession, clinicalResults, setClinicalResults]);

  const differentials = useMemo(() => buildDifferentials(results), [results]);

  const dosage = useMemo(() => {
    if (!clinicalSession || results.length === 0) return null;
    return dosageRecommend(results[0].remedy_id, clinicalSession);
  }, [clinicalSession, results]);

  const canScore = clinicalSession ? hasMinimumSet(clinicalSession) : false;
  const noSession = !clinicalSession;
  const insufficient = clinicalSession && !canScore;

  function handleSave() {
    if (!authSession || !clinicalSession || results.length === 0) return;
    setSaving(true);
    const c: SavedCase = {
      id: `case_${Date.now()}`,
      date: new Date().toISOString(),
      complaint: clinicalSession.complaint ?? '',
      session: clinicalSession,
      results,
      topRemedy: results[0]?.remedy_id,
    };
    authStore.addCase(authSession.phone, c);
    setSaving(false);
    setSaved(true);
  }

  // ── No session at all ─────────────────────────────────────────────────────

  if (noSession) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="jc-card flex flex-col items-center gap-4 py-16 text-center">
          <Pill size={48} className="text-jc-purple-200" />
          <div>
            <p className="font-semibold text-slate-800">No assessment in progress</p>
            <p className="text-sm text-slate-400 mt-1">Complete a symptom interview first to see remedy results.</p>
          </div>
          <button className="jc-btn-primary" onClick={() => navigate('safety')}>Start New Assessment</button>
        </div>
      </div>
    );
  }

  // ── Insufficient data ─────────────────────────────────────────────────────

  if (insufficient) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="jc-section-banner flex items-start gap-4">
          <div className="p-3 bg-white/15 rounded-xl"><Pill size={24} className="text-white" /></div>
          <div>
            <div className="text-xs font-semibold text-jc-gold-300 uppercase tracking-widest mb-1">Step 5 of 5</div>
            <h2 className="text-xl font-bold text-white">Remedy Considerations</h2>
          </div>
        </div>
        <div className="jc-card bg-amber-50 border-amber-200">
          <p className="font-semibold text-amber-800 text-sm">Insufficient symptom data</p>
          <p className="text-amber-700 text-sm mt-1">
            Minimum required: chief complaint + causation + thermal state + at least 2 modalities (better or worse).
            Please complete the intake to get reliable results.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="jc-btn-ghost" onClick={() => navigate('intake')}>Back to Intake</button>
          <button className="jc-btn-primary" onClick={() => navigate('safety')}>New Assessment</button>
        </div>
      </div>
    );
  }

  // ── Results ───────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      <div className="jc-section-banner flex items-start gap-4">
        <div className="p-3 bg-white/15 rounded-xl"><Pill size={24} className="text-white" /></div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-jc-gold-300 uppercase tracking-widest mb-1">Step 5 of 5</div>
          <h2 className="text-xl font-bold text-white">Remedy Considerations</h2>
          <p className="text-slate-500 text-sm mt-1">
            {results.length > 0
              ? 'Symptom patterns identified for consideration. Please discuss with a qualified homeopathic practitioner before taking any remedy.'
              : 'No symptom pattern matches were found above the minimum threshold.'}
          </p>
        </div>
      </div>

      {/* Dosage note */}
      {dosage && results.length > 0 && (
        <div className="jc-card border-jc-purple-100 bg-jc-purple-50 text-sm space-y-1">
          <p className="font-semibold text-jc-purple-800">
            Consider discussing {results[0].latin_name ?? results[0].remedy_id} with a qualified homeopathic practitioner. A potency of {dosage.potency} may be relevant to this symptom picture.
          </p>
          <p className="text-jc-purple-700 text-xs leading-relaxed">{dosage.potency_note}</p>
          <p className="text-xs text-slate-500 mt-1">
            General stop guidance: {dosage.stop_rule}
          </p>
        </div>
      )}

      {/* Compliance disclaimer */}
      {results.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 leading-relaxed">
          <span className="font-bold">Important:</span>{' '}
          These are symptom pattern considerations based on classical homeopathic repertorization, not medical diagnoses. The remedies shown resemble symptom pictures commonly evaluated in homeopathic practice. Please discuss any remedy with a qualified homeopathic practitioner before use.
        </div>
      )}

      {/* No results */}
      {results.length === 0 && (
        <div className="jc-card bg-slate-50 border-slate-200 text-center py-10">
          <p className="text-slate-500 text-sm">No remedy reached the 30% similarity threshold. Try adding more symptoms, especially causation, thermal state, and modalities.</p>
        </div>
      )}

      {/* Result cards */}
      <div className="space-y-3">
        {results.map((r, idx) => (
          <div
            key={r.remedy_id}
            className="jc-card cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setExpanded(expanded === r.remedy_id ? null : r.remedy_id)}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-jc-purple-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-800 text-sm">{r.latin_name ?? r.remedy_id}</div>
                <div className="text-xs text-slate-400">{r.matches.length} symptom indicators</div>
              </div>
              <span className={TIER_BADGE[r.tier] ?? 'jc-badge-possible'}>{r.tier}</span>
              <span className="text-xl font-bold text-jc-purple-700 w-14 text-right">{r.normalised_score}%</span>
              {expanded === r.remedy_id ? <ChevronUp size={15} className="text-slate-400 shrink-0" /> : <ChevronDown size={15} className="text-slate-400 shrink-0" />}
            </div>

            {expanded === r.remedy_id && (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Matched indicators</div>
                <ul className="space-y-1.5">
                  {r.matches.filter(m => m.points > 0).slice(0, 8).map((m, i) => (
                    <li key={i} className="text-xs text-slate-700 flex gap-2 items-start">
                      <span className="text-jc-purple-500 mt-0.5 shrink-0">&#x2713;</span>
                      <span>
                        <span className="font-medium text-slate-500">{m.field}:</span> {m.value}
                        <span className="ml-1 text-slate-300">({m.points.toFixed(1)} pts)</span>
                      </span>
                    </li>
                  ))}
                </ul>

                {idx === 0 && differentials.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Differentiate from</div>
                    {differentials.slice(0, 3).map(d => (
                      <div key={d.remedy_id} className="mb-2">
                        <div className="text-xs font-semibold text-slate-600">{d.latin_name} ({d.abbreviation}) - {Math.round(d.score)}%</div>
                        {d.differentiating_points.slice(0, 2).map((pt, pi) => (
                          <div key={pi} className="text-xs text-slate-500 ml-2">{pt}</div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <button className="jc-btn-ghost" onClick={() => navigate('intake')}>Back to Intake</button>
        <div className="flex gap-3">
          {results.length > 0 && authSession && !saved && (
            <button
              className="jc-btn-secondary flex items-center gap-2"
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Case
            </button>
          )}
          {saved && (
            <span className="text-sm text-emerald-600 font-semibold flex items-center gap-1.5">
              <span className="w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center">&#x2713;</span>
              Saved
            </span>
          )}
          <button className="jc-btn-primary flex items-center gap-2" onClick={() => navigate('safety')}>
            <RotateCcw size={14} /> New Assessment
          </button>
        </div>
      </div>

    </div>
  );
}
