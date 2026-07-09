import { useState, useMemo, useEffect } from 'react';
import { Pill, ChevronDown, ChevronUp, Save, RotateCcw, Loader2, Activity, Thermometer, Clock, Printer } from 'lucide-react';
import { useApp } from '../App';
import { rank, hasMinimumSet } from '../engines/scoring';
import { preloadKentGrades } from '../engines/kentRubricGrades';
import { buildDifferentials } from '../engines/differential';
import { recommend as dosageRecommend } from '../engines/dosage';
import { authStore } from '../auth/authStore';
// @ts-ignore
import { REMEDIES } from '../data/remedies.js';
// @ts-ignore
import { KEYNOTE_PROBES } from '../data/keynote_probes.js';
import { humanize } from '../utils/humanize';
import type { ScoringResult, SavedCase, Remedy } from '../types';

interface ResultsProps {
  navigate: (s: string) => void;
  session: { phone: string; name: string } | null;
}

const TIER_BADGE: Record<string, string> = {
  Strong:   'jc-badge-strong',
  Probable: 'jc-badge-probable',
  Possible: 'jc-badge-possible',
};

const TIER_BORDER: Record<string, string> = {
  Strong:   'border-l-4 border-l-emerald-500',
  Probable: 'border-l-4 border-l-blue-400',
  Possible: 'border-l-4 border-l-amber-400',
};

const TIER_RANK_BG: Record<string, string> = {
  Strong:   'bg-emerald-600',
  Probable: 'bg-blue-500',
  Possible: 'bg-amber-500',
};

const TIER_BAR: Record<string, string> = {
  Strong:   'bg-emerald-500',
  Probable: 'bg-blue-400',
  Possible: 'bg-amber-400',
};

// ── C-05: Narrow-down types and helpers ────────────────────────────────────

interface NarrowQuestion {
  id: string;
  prompt: string;
  symptomKey: string;
  yesLabel: string;
  noLabel: string;
}

function generateNarrowQuestions(
  r1: ScoringResult,
  r2: ScoringResult,
  remedyList: Remedy[],
  probeBank: Record<string, string>,
): NarrowQuestion[] {
  const rem1 = remedyList.find(r => r.id === r1.remedy_id);
  const rem2 = remedyList.find(r => r.id === r2.remedy_id);
  if (!rem1 || !rem2) return [];

  const rem2Keys = new Set((rem2.keynotes ?? []).map(k => k.symptom));
  const rem1Keys = new Set((rem1.keynotes ?? []).map(k => k.symptom));

  const questions: NarrowQuestion[] = [];

  // Keynotes unique to rem1 (confirming yes would lift rem1 over rem2)
  const unique1 = (rem1.keynotes ?? [])
    .filter(k => (k.grade === 3 || k.grade === 2) && !rem2Keys.has(k.symptom))
    .sort((a, b) => b.grade - a.grade)
    .slice(0, 2);

  for (const k of unique1) {
    const prompt = probeBank[k.symptom];
    if (!prompt) continue;
    questions.push({
      id: `narrow_${k.symptom}`,
      prompt,
      symptomKey: k.symptom,
      yesLabel: 'Yes, this applies',
      noLabel: 'No, this does not apply',
    });
    if (questions.length >= 2) break;
  }

  // Keynotes unique to rem2 (confirming yes would lift rem2 over rem1)
  const unique2 = (rem2.keynotes ?? [])
    .filter(k => (k.grade === 3 || k.grade === 2) && !rem1Keys.has(k.symptom))
    .sort((a, b) => b.grade - a.grade)
    .slice(0, 1);

  for (const k of unique2) {
    if (questions.length >= 3) break;
    const prompt = probeBank[k.symptom];
    if (!prompt) continue;
    questions.push({
      id: `narrow_${k.symptom}`,
      prompt,
      symptomKey: k.symptom,
      yesLabel: 'Yes, this applies',
      noLabel: 'No, this does not apply',
    });
  }

  return questions.slice(0, 3);
}

function chip(label: string, value: string) {
  return (
    <span key={label} className="inline-flex items-center gap-1 text-xs text-white/80 bg-white/10 rounded-full px-2.5 py-1 leading-none">
      <span className="text-jc-gold-300 font-semibold">{label}:</span>
      <span className="capitalize">{value.replace(/_/g, ' ')}</span>
    </span>
  );
}

const FIELD_DISPLAY: Record<string, { label: string; color: string }> = {
  causation:           { label: 'Causation',         color: 'bg-jc-purple-600' },
  keynote:             { label: 'Keynote',            color: 'bg-jc-purple-400' },
  collected_keynote:   { label: 'Confirmed keynote',  color: 'bg-jc-purple-400' },
  collected_keynotes:  { label: 'Confirmed keynote',  color: 'bg-jc-purple-400' },
  modality_worse:      { label: 'Modality (worse)',   color: 'bg-blue-500' },
  modality_better:     { label: 'Modality (better)',  color: 'bg-blue-400' },
  worse_from:          { label: 'Modality (worse)',   color: 'bg-blue-500' },
  better_from:         { label: 'Modality (better)',  color: 'bg-blue-400' },
  time_modality:       { label: 'Time pattern',       color: 'bg-blue-300' },
  mental:              { label: 'Mental',             color: 'bg-amber-500' },
  mental_state:        { label: 'Mental',             color: 'bg-amber-500' },
  general:             { label: 'General',            color: 'bg-amber-400' },
  thermal:             { label: 'Thermal',            color: 'bg-amber-300' },
  laterality:          { label: 'Laterality',         color: 'bg-slate-400' },
};

function getFieldDisplay(field: string): { label: string; color: string } {
  return FIELD_DISPLAY[field] ?? { label: field, color: 'bg-slate-400' };
}

export default function Results({ navigate, session: authSession }: ResultsProps) {
  const { clinicalSession, setClinicalSession, clinicalResults, setClinicalResults, currentPatientId } = useApp();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  // C-05: Narrow-down state (reserved for future implementation)
  const [narrowMode, setNarrowMode] = useState(false);
  const [narrowStep, setNarrowStep] = useState(0);
  const [narrowQuestions, setNarrowQuestions] = useState<NarrowQuestion[]>([]);
  const [narrowAnswers, setNarrowAnswers] = useState<Record<string, string>>({});
  const [narrowRefined, setNarrowRefined] = useState(false);
  const [narrowNoData, setNarrowNoData] = useState(false);
  const [showGrid, setShowGrid] = useState(false);

  useEffect(() => {
    if (clinicalSession?.added_rubric_ids?.length) {
      preloadKentGrades();
    }
  }, [clinicalSession?.added_rubric_ids]);

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

  // C-04: Full remedy profile for top match
  const topRemedyFull = useMemo(() => {
    if (results.length === 0) return null;
    return (REMEDIES as unknown as Remedy[]).find(r => r.id === results[0].remedy_id) ?? null;
  }, [results]);

  // C-03: Unconfirmed grade-3 keynotes for top remedy
  const missingKeynotes = useMemo(() => {
    if (results.length === 0 || !clinicalSession || !topRemedyFull) return [];
    const captured = new Set([
      ...(clinicalSession.collected_keynotes ?? []),
      ...(clinicalSession.worse_from ?? []),
      ...(clinicalSession.better_from ?? []),
    ]);
    return (topRemedyFull.keynotes ?? [])
      .filter(k => k.grade === 3 && !captured.has(k.symptom))
      .slice(0, 4);
  }, [results, clinicalSession, topRemedyFull]);

  // Repertorization grid data
  type GridSymptom = { field: string; value: string; key: string };
  const { gridRemedies, symptomRows } = useMemo(() => {
    const gr = results.slice(0, 8);
    const symMap = new Map<string, GridSymptom>();
    for (const r of gr) {
      for (const m of r.matches) {
        if (m.points <= 0) continue;
        const k = `${m.field}|${m.value}`;
        if (!symMap.has(k)) symMap.set(k, { field: m.field, value: m.value, key: k });
      }
    }
    return { gridRemedies: gr, symptomRows: Array.from(symMap.values()) };
  }, [results]);

  function getGrade(remedyResult: ScoringResult, sym: GridSymptom): number {
    const m = remedyResult.matches.find(x => x.field === sym.field && x.value === sym.value);
    return m && m.points > 0 ? m.kent_grade : 0;
  }

  // C-06: Antidote check against most recent saved case
  const antidoteWarning = useMemo(() => {
    if (!authSession || results.length === 0) return null;
    const savedCases = authStore.getUserCases(authSession.phone);
    if (savedCases.length === 0) return null;
    const lastCase = savedCases[0];
    const lastRemedyId = lastCase.results?.[0]?.remedy_id;
    if (!lastRemedyId) return null;
    const currentTopId = results[0].remedy_id;
    if (currentTopId === lastRemedyId) return null;
    const currentFull = (REMEDIES as unknown as Remedy[]).find(r => r.id === currentTopId);
    if (currentFull?.antidotes?.includes(lastRemedyId)) {
      return {
        current: results[0].latin_name ?? currentTopId,
        last: lastCase.results?.[0]?.latin_name ?? lastRemedyId,
      };
    }
    return null;
  }, [authSession, results]);

  const canScore = clinicalSession ? hasMinimumSet(clinicalSession) : false;
  const noSession = !clinicalSession;
  const insufficient = clinicalSession && !canScore;
  const modCount = (clinicalSession?.worse_from?.length ?? 0) + (clinicalSession?.better_from?.length ?? 0);

  function handleNarrowStart() {
    if (results.length < 2) return;
    const qs = generateNarrowQuestions(
      results[0],
      results[1],
      REMEDIES as unknown as Remedy[],
      KEYNOTE_PROBES as Record<string, string>,
    );
    if (qs.length === 0) {
      setNarrowNoData(true);
      setTimeout(() => setNarrowNoData(false), 3500);
      return;
    }
    setNarrowQuestions(qs);
    setNarrowAnswers({});
    setNarrowStep(0);
    setNarrowMode(true);
  }

  function handleNarrowAnswer(questionId: string, answer: string) {
    const updated = { ...narrowAnswers, [questionId]: answer };
    const nextStep = narrowStep + 1;

    if (nextStep < narrowQuestions.length) {
      setNarrowAnswers(updated);
      setNarrowStep(nextStep);
    } else {
      // All questions answered: collect confirmed keynotes and re-score
      const confirmedKeys = narrowQuestions
        .filter(q => updated[q.id] === 'yes')
        .map(q => q.symptomKey);

      if (confirmedKeys.length > 0 && clinicalSession) {
        const updatedSession = {
          ...clinicalSession,
          collected_keynotes: [
            ...new Set([...(clinicalSession.collected_keynotes ?? []), ...confirmedKeys]),
          ],
        };
        setClinicalSession(updatedSession);
        const newResults = rank(updatedSession);
        setClinicalResults(newResults);
      }

      setNarrowMode(false);
      setNarrowStep(0);
      setNarrowQuestions([]);
      setNarrowAnswers({});
      setNarrowRefined(true);
    }
  }

  function handleNarrowCancel() {
    setNarrowMode(false);
    setNarrowStep(0);
    setNarrowQuestions([]);
    setNarrowAnswers({});
  }

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
      notes: notes.trim() || undefined,
      patientId: currentPatientId ?? undefined,
      patientName: clinicalSession.patientName,
      patientAge: clinicalSession.patientAge,
      patientGender: clinicalSession.patientGender,
      parentCaseId: clinicalSession.parentCaseId ?? undefined,
    };
    authStore.addCase(authSession.phone, c);
    setSaving(false);
    setSaved(true);
  }

  // ── No session ─────────────────────────────────────────────────────────────

  if (noSession) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="jc-card flex flex-col items-center gap-4 py-16 text-center">
          <Pill size={48} className="text-jc-purple-200" />
          <div>
            <p className="font-semibold text-slate-800">No assessment in progress</p>
            <p className="text-sm text-slate-400 mt-1">Complete a symptom interview first to see remedy considerations.</p>
          </div>
          <button className="jc-btn-primary" onClick={() => navigate('safety')}>Start New Assessment</button>
        </div>
      </div>
    );
  }

  // ── Insufficient data ──────────────────────────────────────────────────────

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
            Minimum required: chief complaint, causation, thermal state, and at least 2 modalities (better or worse).
            Return to intake to complete these fields.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="jc-btn-ghost" onClick={() => navigate('intake')}>Back to Intake</button>
          <button className="jc-btn-primary" onClick={() => navigate('safety')}>New Assessment</button>
        </div>
      </div>
    );
  }

  // ── Results ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* Print-only case report header */}
      <div className="hidden print:block mb-6 space-y-4">
        <div className="border-b-2 border-slate-800 pb-3">
          <h1 className="text-2xl font-bold text-slate-900">JeevanChakra - Repertorization Report</h1>
          <p className="text-sm text-slate-500 mt-1">Classical homeopathy symptom analysis - NOT a medical diagnosis</p>
        </div>
        {(clinicalSession?.patientName || clinicalSession?.patientAge) && (
          <div className="flex gap-6 text-sm flex-wrap">
            {clinicalSession.patientName && (
              <div><span className="font-semibold text-slate-700">Patient:</span> {clinicalSession.patientName}</div>
            )}
            {clinicalSession.patientAge && (
              <div><span className="font-semibold text-slate-700">Age:</span> {clinicalSession.patientAge}</div>
            )}
            {clinicalSession.patientGender && (
              <div><span className="font-semibold text-slate-700">Gender:</span> {clinicalSession.patientGender}</div>
            )}
            <div><span className="font-semibold text-slate-700">Date:</span> {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
        )}
        {clinicalSession?.complaint && (
          <div className="text-sm">
            <span className="font-semibold text-slate-700">Chief Complaint:</span> {humanize(clinicalSession.complaint)}
          </div>
        )}
        <div>
          <div className="font-semibold text-slate-700 text-sm mb-2">Symptom Picture</div>
          <div className="flex flex-wrap gap-2 text-xs">
            {clinicalSession?.thermal_state && <span className="border border-slate-300 rounded px-2 py-0.5">Thermal: {clinicalSession.thermal_state}</span>}
            {clinicalSession?.causation?.map(c => <span key={c} className="border border-slate-300 rounded px-2 py-0.5">Cause: {humanize(c)}</span>)}
            {clinicalSession?.worse_from?.map(w => <span key={w} className="border border-slate-300 rounded px-2 py-0.5">Worse: {humanize(w)}</span>)}
            {clinicalSession?.better_from?.map(b => <span key={b} className="border border-slate-300 rounded px-2 py-0.5">Better: {humanize(b)}</span>)}
          </div>
        </div>
        <div>
          <div className="font-semibold text-slate-700 text-sm mb-2">Top Remedy Considerations</div>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-300">
                <th className="text-left py-1 font-semibold text-slate-700">Rank</th>
                <th className="text-left py-1 font-semibold text-slate-700">Remedy</th>
                <th className="text-left py-1 font-semibold text-slate-700">Match</th>
                <th className="text-left py-1 font-semibold text-slate-700">Tier</th>
              </tr>
            </thead>
            <tbody>
              {results.slice(0, 8).map((r, i) => (
                <tr key={r.remedy_id} className="border-b border-slate-100">
                  <td className="py-1 text-slate-500">{i + 1}</td>
                  <td className="py-1 font-medium">{r.latin_name ?? r.remedy_id}</td>
                  <td className="py-1">{r.normalised_score}%</td>
                  <td className="py-1 text-slate-500">{r.tier}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400 border-t border-slate-200 pt-2">
          These results represent symptom pattern matches based on classical homeopathic repertorization. This is a decision support tool only and does not constitute medical advice. Consult a qualified homeopathic practitioner before use.
        </p>
      </div>

      {/* Banner with session context */}
      <div className="jc-section-banner flex items-start gap-4">
        <div className="p-3 bg-white/15 rounded-xl"><Pill size={24} className="text-white" /></div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-jc-gold-300 uppercase tracking-widest mb-1">Step 5 of 5</div>
          <h2 className="text-xl font-bold text-white">Remedy Considerations</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            {clinicalSession?.complaint && chip('Complaint', clinicalSession.complaint)}
            {clinicalSession?.thermal_state && chip('Thermal', clinicalSession.thermal_state)}
            {clinicalSession?.causation?.[0] && chip('Cause', clinicalSession.causation[0])}
            {modCount > 0 && chip('Modalities', `${modCount} selected`)}
          </div>
        </div>
      </div>

      {/* No matches */}
      {results.length === 0 && (
        <div className="jc-card bg-slate-50 border-slate-200 text-center py-10">
          <Activity size={36} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-600 font-medium">No remedy reached the 30% similarity threshold.</p>
          <p className="text-slate-400 text-sm mt-1">Add more symptoms, especially causation, thermal state, and modalities, for meaningful results.</p>
        </div>
      )}

      {/* C-06: Antidote compatibility warning */}
      {antidoteWarning && (
        <div className="jc-card bg-orange-50 border border-orange-200">
          <div className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-1">Compatibility Notice</div>
          <p className="text-sm text-orange-800">
            {antidoteWarning.current} is an antidote to {antidoteWarning.last}, which appeared in your previous assessment.
            Discuss with a qualified homeopathic practitioner before switching remedies.
          </p>
        </div>
      )}

      {/* Potency guidance card */}
      {dosage && results.length > 0 && (
        <div className="jc-card bg-gradient-to-r from-jc-purple-50 to-white border-jc-purple-200">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-jc-purple-100 rounded-xl shrink-0">
              <Pill size={18} className="text-jc-purple-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-jc-purple-400 uppercase tracking-widest mb-1">Potency Guidance</div>
              <div className="font-semibold text-slate-800 text-sm">
                {results[0].latin_name ?? results[0].remedy_id}
                <span className="ml-2 text-jc-purple-600 font-bold">{dosage.potency}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2.5">
                <div>
                  <div className="text-xs text-slate-400 font-semibold mb-0.5 flex items-center gap-1">
                    <Clock size={11} /> Boericke Note
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{dosage.potency_note}</p>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold mb-0.5 flex items-center gap-1">
                    <Thermometer size={11} /> Stop Rule
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{dosage.stop_rule}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2 italic">Discuss with a qualified homeopathic practitioner before use.</p>
            </div>
          </div>
        </div>
      )}

      {/* C-04: Remedy Profile (Boericke description) */}
      {topRemedyFull?.description && results.length > 0 && (
        <div className="jc-card">
          <div className="text-xs font-bold text-jc-purple-400 uppercase tracking-widest mb-2">Remedy Profile</div>
          <div className="text-sm font-semibold text-slate-800 mb-1">{topRemedyFull.latin_name}</div>
          <p className="text-sm text-slate-600 leading-relaxed">{topRemedyFull.description}</p>
          {topRemedyFull.complaints && topRemedyFull.complaints.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {topRemedyFull.complaints.slice(0, 6).map(c => (
                <span key={c} className="text-xs bg-jc-purple-50 text-jc-purple-600 px-2 py-0.5 rounded-full">{humanize(c)}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* C-05: Narrow-down mode card */}
      {narrowMode && narrowQuestions.length > 0 && (
        <div className="jc-card border border-jc-purple-200 bg-gradient-to-br from-jc-purple-50 to-white">
          <div className="text-xs font-bold text-jc-purple-400 uppercase tracking-widest mb-3">
            Narrow Down: Question {narrowStep + 1} of {narrowQuestions.length}
          </div>
          <p className="text-sm font-semibold text-slate-800 leading-relaxed mb-5">
            {narrowQuestions[narrowStep].prompt}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              className="jc-btn-primary flex-1 text-sm"
              onClick={() => handleNarrowAnswer(narrowQuestions[narrowStep].id, 'yes')}
            >
              {narrowQuestions[narrowStep].yesLabel}
            </button>
            <button
              className="jc-btn-ghost flex-1 text-sm"
              onClick={() => handleNarrowAnswer(narrowQuestions[narrowStep].id, 'no')}
            >
              {narrowQuestions[narrowStep].noLabel}
            </button>
          </div>
          <div className="mt-4 text-center">
            <button
              className="text-xs text-slate-400 underline hover:text-slate-600 transition-colors"
              onClick={handleNarrowCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* C-05: Close-match detected banner */}
      {!narrowMode && results.length >= 2 && (results[0].normalised_score - results[1].normalised_score) <= 8 && (
        <div className="jc-card border border-blue-200 bg-blue-50">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Close Match Detected</div>
          <p className="text-sm text-slate-700 mb-1">
            <span className="font-semibold">{results[0].latin_name ?? results[0].remedy_id}</span>
            {' '}({results[0].normalised_score}%) vs{' '}
            <span className="font-semibold">{results[1].latin_name ?? results[1].remedy_id}</span>
            {' '}({results[1].normalised_score}%)
          </p>
          <p className="text-xs text-slate-500 mb-3">
            These two remedies score within {results[0].normalised_score - results[1].normalised_score}% of each other.
            Answer a few targeted questions to narrow the match.
          </p>
          {narrowNoData ? (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Insufficient keynote data to narrow further.
            </p>
          ) : (
            <button className="jc-btn-secondary text-sm" onClick={handleNarrowStart}>
              Narrow Down
            </button>
          )}
        </div>
      )}

      {/* Remedy cards */}
      <div className="space-y-3">
        {results.map((r, idx) => {
          const tier = r.tier ?? 'Possible';
          const isOpen = expanded === r.remedy_id;
          const topMatches = r.matches.filter(m => m.points > 0).slice(0, 2);

          return (
            <div
              key={r.remedy_id}
              className={`jc-card cursor-pointer overflow-hidden ${TIER_BORDER[tier] ?? 'border-l-4 border-l-slate-300'}`}
              onClick={() => setExpanded(isOpen ? null : r.remedy_id)}
            >
              {/* Collapsed row */}
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 text-white mt-0.5 ${TIER_RANK_BG[tier] ?? 'bg-slate-400'}`}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-800 text-sm leading-tight">{r.latin_name ?? r.remedy_id}</span>
                    {r.common_name && r.common_name !== r.latin_name && (
                      <span className="text-xs text-slate-400 italic">{r.common_name}</span>
                    )}
                  </div>
                  {topMatches.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {topMatches.map((m, i) => (
                        <span key={i} className="text-xs bg-jc-purple-50 text-jc-purple-600 border border-jc-purple-100 rounded px-1.5 py-0.5 leading-tight">
                          {m.field}: {humanize(m.value)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="flex items-center gap-2">
                    {idx === 0 && narrowRefined && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 rounded-full px-2 py-0.5 leading-none">
                        Refined
                      </span>
                    )}
                    <span className={TIER_BADGE[tier] ?? 'jc-badge-possible'}>{tier}</span>
                    <span className="text-lg font-bold text-jc-purple-700 w-12 text-right tabular-nums">{r.normalised_score}%</span>
                  </div>
                </div>
                {isOpen ? <ChevronUp size={15} className="text-slate-400 shrink-0 mt-1" /> : <ChevronDown size={15} className="text-slate-400 shrink-0 mt-1" />}
              </div>

              {/* Score bar */}
              <div className="mt-3 h-1 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${TIER_BAR[tier] ?? 'bg-slate-300'} rounded-full transition-all duration-500`}
                  style={{ width: `${r.normalised_score}%` }}
                />
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                  {/* Score breakdown by category */}
                  {(() => {
                    const scored = r.matches.filter(m => m.points > 0);
                    const total = scored.reduce((s, m) => s + m.points, 0);
                    if (total === 0 || scored.length === 0) return null;

                    const catMap = new Map<string, { pts: number; color: string }>();
                    for (const m of scored) {
                      const { label, color } = getFieldDisplay(m.field);
                      const existing = catMap.get(label);
                      if (existing) {
                        existing.pts += m.points;
                      } else {
                        catMap.set(label, { pts: m.points, color });
                      }
                    }
                    const sorted = Array.from(catMap.entries()).sort((a, b) => b[1].pts - a[1].pts);

                    return (
                      <div>
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Score Breakdown</div>
                        <div className="space-y-1.5">
                          {sorted.map(([label, { pts, color }]) => {
                            const pct = Math.round((pts / total) * 100);
                            return (
                              <div key={label} className="flex items-center gap-2">
                                <div className="w-28 text-xs text-slate-500 shrink-0 truncate">{label}</div>
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${color}`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <div className="text-xs text-slate-400 tabular-nums w-10 text-right shrink-0">
                                  {pts.toFixed(1)}p
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">All matched indicators</div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {r.matches.filter(m => m.points > 0).map((m, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className="text-emerald-500 shrink-0">&#x2713;</span>
                          <span className="text-slate-500 font-medium w-28 shrink-0">{m.field}</span>
                          <span className="text-slate-700 capitalize">{humanize(m.value)}</span>
                          <span className="ml-auto text-slate-300 tabular-nums">{m.points.toFixed(1)} pts</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {idx === 0 && differentials.length > 0 && (
                    <div className="pt-3 border-t border-slate-100">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Differentiate from</div>
                      <div className="space-y-2">
                        {differentials.slice(0, 3).map(d => (
                          <div key={d.remedy_id} className="bg-slate-50 rounded-xl p-2.5">
                            <div className="text-xs font-semibold text-slate-700 mb-1">
                              {d.latin_name} ({d.abbreviation}) <span className="font-normal text-slate-400">{Math.round(d.score)}%</span>
                            </div>
                            {d.differentiating_points.slice(0, 2).map((pt, pi) => (
                              <div key={pi} className="text-xs text-slate-500 leading-snug">{pt}</div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* C-03: Missing keynotes hint */}
      {missingKeynotes.length > 0 && (
        <div className="jc-card bg-amber-50 border border-amber-100">
          <div className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-3">
            Unconfirmed keynotes for {results[0]?.latin_name}
          </div>
          <p className="text-xs text-amber-700 mb-3">
            These grade-3 symptoms of the top remedy were not entered. Confirming any of them would raise the match score:
          </p>
          <ul className="space-y-1.5">
            {missingKeynotes.map(k => (
              <li key={k.symptom} className="flex items-center gap-2 text-xs text-amber-800">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                {humanize(k.symptom)}
              </li>
            ))}
          </ul>
          <button
            className="mt-3 text-xs font-semibold text-amber-700 underline cursor-pointer hover:text-amber-900 transition-colors"
            onClick={() => navigate('intake')}
          >
            Return to intake to confirm these
          </button>
        </div>
      )}

      {/* Repertorization Grid */}
      {results.length > 0 && symptomRows.length > 0 && (
        <div className="jc-card print:hidden">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs font-bold text-jc-purple-400 uppercase tracking-widest">Repertorization Grid</div>
              <p className="text-xs text-slate-400 mt-0.5">Symptom-remedy match matrix across top results</p>
            </div>
            <button
              className="text-xs font-semibold text-jc-purple-600 border border-jc-purple-200 rounded-lg px-3 py-1.5 hover:bg-jc-purple-50 transition-colors cursor-pointer"
              onClick={() => setShowGrid(g => !g)}
            >
              {showGrid ? 'Hide Grid' : 'Show Grid'}
            </button>
          </div>
          {showGrid && (
            <div className="overflow-x-auto">
              <table className="text-xs min-w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left text-slate-400 font-medium py-1.5 pr-3 w-44 min-w-44">Symptom</th>
                    {gridRemedies.map(r => (
                      <th key={r.remedy_id} className="text-center font-semibold text-slate-700 py-1.5 px-2 min-w-14">
                        <div>{r.abbreviation ?? r.remedy_id}</div>
                        <div className="text-[10px] font-normal text-slate-400">{r.normalised_score}%</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {symptomRows.map((sym, si) => (
                    <tr key={sym.key} className={si % 2 === 0 ? 'bg-slate-50/60' : ''}>
                      <td className="py-1.5 pr-3 text-slate-600 truncate max-w-44">
                        <span className="text-slate-400">{sym.field}: </span>
                        {humanize(sym.value)}
                      </td>
                      {gridRemedies.map(r => {
                        const g = getGrade(r, sym);
                        return (
                          <td key={r.remedy_id} className="text-center py-1.5 px-2">
                            {g === 3 ? (
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white text-[9px] font-bold">3</span>
                            ) : g === 2 ? (
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-400 text-white text-[9px] font-bold">2</span>
                            ) : g === 1 ? (
                              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-300 text-slate-700 text-[9px] font-bold">1</span>
                            ) : (
                              <span className="text-slate-200">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex gap-4 mt-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-600 text-white text-[8px] font-bold">3</span>
                  Bold (grade 3)
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-400 text-white text-[8px] font-bold">2</span>
                  Italic (grade 2)
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-300 text-slate-700 text-[8px] font-bold">1</span>
                  Plain (grade 1)
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Session notes input (shown before saving) */}
      {results.length > 0 && authSession && !saved && (
        <div className="print:hidden space-y-2">
          <button
            className="text-xs text-jc-purple-600 font-semibold cursor-pointer hover:underline"
            onClick={() => setShowNotes(n => !n)}
          >
            {showNotes ? 'Hide notes' : 'Add session notes (optional)'}
          </button>
          {showNotes && (
            <textarea
              className="jc-input resize-none h-20 text-sm w-full"
              placeholder="Observations, follow-up plan, remedy selected..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          )}
        </div>
      )}

      {/* Action bar */}
      {results.length > 0 && (
        <div className="flex justify-between items-center flex-wrap gap-3 print:hidden">
          <button className="jc-btn-ghost text-sm" onClick={() => navigate('intake')}>
            Back to Intake
          </button>
          <div className="flex gap-3 flex-wrap">
            <button
              className="jc-btn-ghost flex items-center gap-2 text-sm"
              onClick={() => window.print()}
            >
              <Printer size={14} />
              Print Report
            </button>
            {authSession && !saved && (
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
                <span className="w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center text-xs">&#x2713;</span>
                Saved
              </span>
            )}
            <button className="jc-btn-primary flex items-center gap-2" onClick={() => navigate('safety')}>
              <RotateCcw size={14} /> New Assessment
            </button>
          </div>
        </div>
      )}

      {/* Compliance note */}
      {results.length > 0 && (
        <p className="text-xs text-slate-400 text-center leading-relaxed border-t border-slate-100 pt-3">
          These results represent symptom pattern matches based on classical homeopathic repertorization, not medical diagnoses.
          Always discuss any remedy with a qualified homeopathic practitioner before use.
        </p>
      )}

    </div>
  );
}
