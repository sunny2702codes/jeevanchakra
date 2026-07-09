import { useState, useMemo } from 'react';
import { MessageSquare, ChevronLeft, ChevronRight, Check, Zap, TrendingUp, Search, X } from 'lucide-react';
import { useApp } from '../App';
import { INTAKE_POOLS } from '../data/intake.js';
import { REMEDIES } from '../data/remedies.js';
import { KEYNOTE_PROBES } from '../data/keynote_probes.js';
import { rank, hasMinimumSet } from '../engines/scoring';
import type { ClinicalSession, Miasm, ConstitutionType, Remedy } from '../types';
import { draftStore } from '../data/draftStore';

// ── Types ─────────────────────────────────────────────────────────────────────

interface IntakeOption {
  value: string;
  label: string;
}

interface IntakeQuestion {
  id: string;
  prompt: string;
  type: 'single' | 'multi';
  session_field: string;
  options: IntakeOption[];
  condition?: { field: string; not_in: string[] } | null;
}

interface IntakeProps {
  navigate: (s: string) => void;
}

// Constitutional question session_field identifiers
const CONSTITUTIONAL_FIELDS = new Set([
  'build', 'perspiration', 'sleep_position', 'appetite',
  'skin_tendency', 'grief_response', 'miasm_hint',
  'constitution_type', 'constitution_hint',
]);

// ── Helpers ───────────────────────────────────────────────────────────────────

function mergeSessionFields(questions: IntakeQuestion[]): IntakeQuestion[] {
  const result: IntakeQuestion[] = [];
  const mergeTargets = new Set(['worse_from', 'better_from']);
  const firstSeen: Record<string, IntakeQuestion> = {};

  for (const q of questions) {
    const mergeKey = q.type === 'multi' && mergeTargets.has(q.session_field) ? q.session_field : null;
    if (mergeKey) {
      if (!firstSeen[mergeKey]) {
        firstSeen[mergeKey] = { ...q, options: [...q.options] };
        result.push(firstSeen[mergeKey]);
      } else {
        const existing = firstSeen[mergeKey];
        const existingVals = new Set(existing.options.map(o => o.value));
        for (const opt of q.options) {
          if (!existingVals.has(opt.value)) {
            existing.options.push(opt);
            existingVals.add(opt.value);
          }
        }
      }
    } else {
      result.push(q);
    }
  }
  return result;
}

function getQuestionsForSession(branch: string | null): IntakeQuestion[] {
  const pools = INTAKE_POOLS as { universal: IntakeQuestion[]; pools?: Record<string, IntakeQuestion[]> };
  const universal = (pools.universal as IntakeQuestion[]).filter(q => {
    if (!q.condition) return true;
    if (q.condition.field === 'complaint' && q.condition.not_in && branch) {
      return !q.condition.not_in.includes(branch);
    }
    return true;
  });
  const branchPool: IntakeQuestion[] = (branch && pools.pools?.[branch]) ? (pools.pools[branch] as IntakeQuestion[]) : [];
  return mergeSessionFields([...universal, ...branchPool]);
}

function generateKeynoteProbes(session: ClinicalSession): IntakeQuestion[] {
  const top = rank(session).slice(0, 5);
  const probes: IntakeQuestion[] = [];
  const seen = new Set<string>();
  const probeBank = KEYNOTE_PROBES as Record<string, string>;
  const allRemedies = REMEDIES as unknown as Remedy[];
  const alreadyCaptured = new Set([...(session.worse_from ?? []), ...(session.better_from ?? [])]);

  for (const res of top) {
    const rm = allRemedies.find(r => r.id === res.remedy_id);
    if (!rm) continue;
    const keynotes = (rm.keynotes ?? []) as Array<{ symptom: string; grade: number }>;
    for (const k of keynotes.filter(k => k.grade >= 3)) {
      if (seen.has(k.symptom)) continue;
      if (alreadyCaptured.has(k.symptom)) continue;
      const prompt = probeBank[k.symptom];
      if (!prompt) continue;
      seen.add(k.symptom);
      probes.push({
        id: `probe_${k.symptom}`,
        prompt,
        type: 'single',
        session_field: 'collected_keynotes',
        options: [
          { value: k.symptom, label: 'Yes, this applies' },
          { value: '_no', label: 'No, this does not apply' },
        ],
      });
      if (probes.length >= 6) break;
    }
    if (probes.length >= 6) break;
  }

  // C-08: Add grade-2 keynotes unique to top remedy when top-2 are within 5 points
  const top2 = top.slice(0, 2);
  if (top2.length === 2 && (top2[0].normalised_score - top2[1].normalised_score) <= 5) {
    const rm1 = allRemedies.find(r => r.id === top2[0].remedy_id);
    const rm2 = allRemedies.find(r => r.id === top2[1].remedy_id);
    if (rm1 && rm2) {
      const rm2Keywords = new Set((rm2.keynotes ?? []).map((k: { symptom: string; grade: number }) => k.symptom));
      const grade2Unique = (rm1.keynotes ?? []).filter(
        (k: { symptom: string; grade: number }) =>
          k.grade === 2 &&
          !rm2Keywords.has(k.symptom) &&
          !seen.has(k.symptom) &&
          !alreadyCaptured.has(k.symptom),
      );
      for (const k of grade2Unique.slice(0, 3)) {
        const prompt = probeBank[k.symptom];
        if (!prompt) continue;
        if (probes.length >= 9) break;
        seen.add(k.symptom);
        probes.push({
          id: `probe_${k.symptom}`,
          prompt,
          type: 'single',
          session_field: 'collected_keynotes',
          options: [
            { value: k.symptom, label: 'Yes, this applies' },
            { value: '_no', label: 'No, this does not apply' },
          ],
        });
      }
    }
  }

  return probes;
}

// C-01: Search across remedy vocabulary (worse_from, better_from, keynote symptoms)
function searchSymptomVocab(query: string): string[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase().replace(/\s+/g, '_');
  const found = new Set<string>();
  const allRem = REMEDIES as unknown as Remedy[];
  for (const rem of allRem) {
    for (const v of rem.worse_from ?? []) {
      if (v.includes(q) || v.replace(/_/g, ' ').includes(query.toLowerCase())) found.add(v);
    }
    for (const v of rem.better_from ?? []) {
      if (v.includes(q) || v.replace(/_/g, ' ').includes(query.toLowerCase())) found.add(v);
    }
    for (const k of (rem.keynotes ?? []) as Array<{ symptom: string; grade: number }>) {
      if (k.symptom.includes(q) || k.symptom.replace(/_/g, ' ').includes(query.toLowerCase())) found.add(k.symptom);
    }
    if (found.size >= 50) break;
  }
  return Array.from(found).slice(0, 8);
}

function applyAnswer(
  session: ClinicalSession,
  question: IntakeQuestion,
  values: string[],
): ClinicalSession {
  const field = question.session_field as string;

  if (field === 'collected_keynotes') {
    const confirmed = values.filter(v => v && v !== '_no');
    if (confirmed.length === 0) return session;
    return { ...session, collected_keynotes: [...new Set([...(session.collected_keynotes ?? []), ...confirmed])] };
  }

  if (question.type === 'single') {
    const val = values[0] ?? null;
    if (field === 'thermal_state') return { ...session, thermal_state: val as ClinicalSession['thermal_state'] };
    if (field === 'thirst') return { ...session, thirst: val };
    if (field === 'consolation_response') return { ...session, consolation_response: val };
    if (field === 'laterality') return { ...session, laterality: val };
    if (field === 'duration') return { ...session, duration: val };
    if (field === 'miasm_hint') return (!val || val === 'skip') ? session : { ...session, miasm_hint: val as Miasm };
    if (field === 'constitution_type') return (!val || val === 'skip') ? session : { ...session, constitution_hint: val as ConstitutionType };
    return { ...session, branch_answers: { ...session.branch_answers, [question.id]: [val ?? ''] } };
  }

  if (field === 'causation')      return { ...session, causation: values };
  if (field === 'worse_from')     return { ...session, worse_from: [...new Set([...(session.worse_from ?? []), ...values])] };
  if (field === 'better_from')    return { ...session, better_from: [...new Set([...(session.better_from ?? []), ...values])] };
  if (field === 'time_modality')  return { ...session, time_modality: values };
  if (field === 'mental_state')   return { ...session, mental_state: [...new Set([...(session.mental_state ?? []), ...values])] };
  if (field === 'food_desires')   return { ...session, food_desires: values };
  if (field === 'food_aversions') return { ...session, food_aversions: values };
  return { ...session, branch_answers: { ...session.branch_answers, [question.id]: values } };
}

const STEPS = ['Safety', 'Complaint', 'Intake', 'Analysis', 'Results'];

// ── Screen ────────────────────────────────────────────────────────────────────

export default function Intake({ navigate }: IntakeProps) {
  const { clinicalSession, setClinicalSession, setClinicalResults, addedRubricIds, session: authSession } = useApp();

  const mainQuestions = useMemo(
    () => getQuestionsForSession(clinicalSession?.branch ?? null),
    [clinicalSession?.branch],
  );

  // Index of first constitutional question — gate for optional profile section
  const constitutionalStart = useMemo(
    () => mainQuestions.findIndex(q => CONSTITUTIONAL_FIELDS.has(q.session_field)),
    [mainQuestions],
  );

  const [step, setStep] = useState<number>(() => {
    if (!authSession?.phone || !clinicalSession) return 0;
    const draft = draftStore.load(authSession.phone);
    if (draft?.session.id === clinicalSession.id && draft.step > 0) return draft.step;
    return 0;
  });
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [keynoteQuestions, setKeynoteQuestions] = useState<IntakeQuestion[]>([]);
  const [showConstitutionalPrompt, setShowConstitutionalPrompt] = useState(false);
  const [session, setSession] = useState<ClinicalSession>(() => {
    if (authSession?.phone && clinicalSession) {
      const draft = draftStore.load(authSession.phone);
      if (draft?.session.id === clinicalSession.id && draft.step > 0) return draft.session;
    }
    return clinicalSession ?? {
      id: `sess_${Date.now()}`,
      started: new Date().toISOString(),
      complaint: null,
      branch: null,
      safety_flags: [],
      duration: null,
      causation: [],
      thermal_state: null,
      thirst: null,
      worse_from: [],
      better_from: [],
      time_modality: [],
      mental_state: [],
      consolation_response: null,
      laterality: null,
      food_desires: [],
      food_aversions: [],
      concomitants_general: [],
      branch_answers: {},
      collected_keynotes: [],
    };
  });

  // C-01: Symptom search widget state
  const [showSymptomSearch, setShowSymptomSearch] = useState(false);
  const [symptomSearch, setSymptomSearch] = useState('');
  const [symptomResults, setSymptomResults] = useState<string[]>([]);
  const [addedSymptoms, setAddedSymptoms] = useState<string[]>([]);

  const allQuestions = useMemo(() => [...mainQuestions, ...keynoteQuestions], [mainQuestions, keynoteQuestions]);
  const question = allQuestions[step];

  const current = question ? (answers[question.id] ?? []) : [];
  const isLast = step === allQuestions.length - 1;
  const inKeynotePhase = step >= mainQuestions.length;

  const liveRank = useMemo(() => {
    if (!hasMinimumSet(session)) return [];
    return rank(session).slice(0, 3);
  }, [session]);

  const topScore = liveRank[0]?.normalised_score ?? 0;
  const hasLiveRank = liveRank.length > 0;
  const isConfident = topScore >= 50;

  // Progress: when showing constitutional prompt, treat as if at constitutionalStart
  const effectiveStep = showConstitutionalPrompt ? constitutionalStart : step;
  const progress = Math.round(((effectiveStep + 1) / Math.max(allQuestions.length, 1)) * 100);

  if (!question && !showConstitutionalPrompt) return null;

  function toggleOption(val: string) {
    if (!question) return;
    if (question.type === 'single') {
      setAnswers(prev => ({ ...prev, [question.id]: [val] }));
    } else {
      setAnswers(prev => {
        const existing = prev[question.id] ?? [];
        if (existing.includes(val)) return { ...prev, [question.id]: existing.filter(v => v !== val) };
        return { ...prev, [question.id]: [...existing, val] };
      });
    }
  }

  function clearAndGoResults(s: ClinicalSession) {
    if (authSession?.phone) draftStore.clear(authSession.phone);
    setClinicalSession(s);
    setClinicalResults(null);
    navigate('results');
  }

  function finishIntake(updatedSession: ClinicalSession) {
    const probes = generateKeynoteProbes(updatedSession);
    if (probes.length > 0) {
      setKeynoteQuestions(probes);
      setStep(mainQuestions.length);
    } else {
      clearAndGoResults({ ...updatedSession, added_rubric_ids: addedRubricIds.length > 0 ? addedRubricIds : undefined });
    }
  }

  function handleNext() {
    if (!question) return;
    const vals = answers[question.id] ?? [];
    const updated = applyAnswer(session, question, vals);
    setSession(updated);

    // Gate: show constitutional profile prompt before entering Q17+
    if (
      !inKeynotePhase &&
      constitutionalStart > 0 &&
      step === constitutionalStart - 1 &&
      !showConstitutionalPrompt &&
      keynoteQuestions.length === 0
    ) {
      setShowConstitutionalPrompt(true);
      return;
    }

    if (step === mainQuestions.length - 1 && keynoteQuestions.length === 0) {
      finishIntake(updated);
    } else if (isLast) {
      clearAndGoResults({ ...updated, added_rubric_ids: addedRubricIds.length > 0 ? addedRubricIds : undefined });
    } else {
      setStep(s => s + 1);
      if (authSession?.phone) draftStore.save(authSession.phone, updated, step + 1);
    }
  }

  function handleBack() {
    if (showConstitutionalPrompt) {
      setShowConstitutionalPrompt(false);
      return;
    }
    if (step === 0) { navigate('complaint'); return; }
    if (step === mainQuestions.length && keynoteQuestions.length > 0) {
      setKeynoteQuestions([]);
      setSession(s => ({ ...s, collected_keynotes: [] }));
    }
    setStep(s => s - 1);
  }

  function handleSkip() {
    const withRubrics = { ...session, added_rubric_ids: addedRubricIds.length > 0 ? addedRubricIds : undefined };
    if (showConstitutionalPrompt) {
      clearAndGoResults(withRubrics);
      return;
    }
    if (step === mainQuestions.length - 1 && keynoteQuestions.length === 0) {
      clearAndGoResults(withRubrics);
    } else if (isLast) {
      clearAndGoResults(withRubrics);
    } else {
      setStep(s => s + 1);
    }
  }

  function handleEarlyResults() {
    clearAndGoResults({ ...session, added_rubric_ids: addedRubricIds.length > 0 ? addedRubricIds : undefined });
  }

  // C-01: Symptom search handlers
  function handleSymptomSearchChange(value: string) {
    setSymptomSearch(value);
    setSymptomResults(searchSymptomVocab(value));
  }

  function addSymptom(sym: string) {
    if (addedSymptoms.includes(sym)) return;
    setAddedSymptoms(prev => [...prev, sym]);
    setSession(s => ({
      ...s,
      collected_keynotes: [...new Set([...(s.collected_keynotes ?? []), sym])],
    }));
    setSymptomSearch('');
    setSymptomResults([]);
  }

  function removeSymptom(sym: string) {
    setAddedSymptoms(prev => prev.filter(s => s !== sym));
    setSession(s => ({
      ...s,
      collected_keynotes: (s.collected_keynotes ?? []).filter(k => k !== sym),
    }));
  }

  const qLabel = inKeynotePhase
    ? `Keynote check ${step - mainQuestions.length + 1} of ${keynoteQuestions.length}`
    : `Question ${step + 1} of ${mainQuestions.length}`;

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Banner */}
      <div className="jc-section-banner flex items-start gap-4">
        <div className="p-3 bg-white/15 rounded-xl">
          <MessageSquare size={24} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-jc-gold-300 uppercase tracking-widest mb-1">Step 3 of 5</div>
          <h2 className="text-xl font-bold text-white">
            {inKeynotePhase ? 'Keynote Verification' : 'Symptom Interview'}
          </h2>
          <p className="text-white/70 text-sm mt-1">
            {showConstitutionalPrompt ? 'Optional constitutional profile' : qLabel}
            {clinicalSession?.complaint ? ` - ${clinicalSession.complaint}` : ''}
          </p>
          {addedRubricIds.length > 0 && (
            <p className="text-jc-gold-300 text-xs mt-0.5 font-medium">
              {addedRubricIds.length} rubric{addedRubricIds.length !== 1 ? 's' : ''} added via sidebar
            </p>
          )}
        </div>
      </div>

      {/* Stage chips */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              i === 2 ? 'bg-jc-purple-700 text-white' : i < 2 ? 'bg-jc-purple-200 text-jc-purple-700' : 'bg-slate-100 text-slate-400'
            }`}>{i + 1}</div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 min-w-4 ${i < 2 ? 'bg-jc-purple-300' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-jc-purple-700 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Live ranking banners */}
      {hasLiveRank && !inKeynotePhase && !showConstitutionalPrompt && (
        isConfident ? (
          <div className="flex items-start gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <Zap size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-emerald-800">
                Strong match: {liveRank[0].latin_name ?? liveRank[0].remedy_id} ({liveRank[0].normalised_score}%)
              </p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Continue to refine, or proceed to results now.
              </p>
            </div>
            <button
              className="text-xs font-semibold text-emerald-700 border border-emerald-300 rounded-lg px-3 py-1.5 hover:bg-emerald-100 transition-colors shrink-0 cursor-pointer whitespace-nowrap"
              onClick={handleEarlyResults}
            >
              See Results
            </button>
          </div>
        ) : (
          <div className="flex items-start gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
            <TrendingUp size={16} className="text-jc-purple-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1.5">Preliminary matches</p>
              <div className="flex flex-wrap gap-2">
                {liveRank.map(r => (
                  <span key={r.remedy_id} className="text-xs text-slate-700 bg-white border border-slate-200 rounded-full px-2.5 py-1">
                    {r.latin_name ?? r.remedy_id}
                    <span className="text-jc-purple-500 font-semibold ml-1">{r.normalised_score}%</span>
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-1.5">More answers will sharpen the ranking.</p>
            </div>
          </div>
        )
      )}

      {/* Keynote phase context banner */}
      {inKeynotePhase && (
        <div className="flex items-start gap-3 px-4 py-3 bg-jc-purple-50 border border-jc-purple-200 rounded-xl">
          <Zap size={16} className="text-jc-purple-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-jc-purple-800">Keynote verification</p>
            <p className="text-xs text-jc-purple-700 mt-0.5">
              These targeted questions confirm the most characteristic symptoms of the top-ranked remedies and sharpen the final score.
            </p>
          </div>
        </div>
      )}

      {/* Constitutional profile prompt (C-02) */}
      {showConstitutionalPrompt && (
        <div className="jc-card space-y-4">
          <div>
            <h3 className="font-semibold text-slate-800 text-base">Constitutional Profile</h3>
            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
              The next 8 questions assess your constitutional type: body build, perspiration patterns, sleep position, appetite, skin tendency, and emotional response to grief. This optional section provides deeper personalisation and improves long-term accuracy.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              className="jc-btn-primary flex-1"
              onClick={() => {
                setShowConstitutionalPrompt(false);
                setStep(constitutionalStart);
                if (authSession?.phone) draftStore.save(authSession.phone, session, constitutionalStart);
              }}
            >
              Continue (8 questions)
            </button>
            <button
              className="jc-btn-secondary flex-1"
              onClick={() => {
                clearAndGoResults({ ...session, added_rubric_ids: addedRubricIds.length > 0 ? addedRubricIds : undefined });
              }}
            >
              Skip to Results
            </button>
          </div>
        </div>
      )}

      {/* Question card */}
      {!showConstitutionalPrompt && question && (
        <div className="jc-card space-y-5">
          <h3 className="text-base font-semibold text-slate-800 leading-snug">
            {question.prompt}
          </h3>
          {question.type === 'multi' && (
            <p className="text-xs text-slate-400">Select all that apply</p>
          )}
          <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto pr-1">
            {question.options.map((opt: IntakeOption) => {
              const selected = current.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => toggleOption(opt.value)}
                  className={[
                    'flex items-center gap-3 px-4 py-3 rounded-lg border text-left text-sm transition-all duration-100 cursor-pointer',
                    selected
                      ? 'border-jc-purple-700 bg-jc-purple-50 text-jc-purple-800 font-medium'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-jc-purple-200 hover:bg-jc-purple-50/30',
                  ].join(' ')}
                >
                  <span className={[
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                    selected ? 'border-jc-purple-700 bg-jc-purple-700' : 'border-slate-300',
                  ].join(' ')}>
                    {selected && <Check size={11} className="text-white" strokeWidth={3} />}
                  </span>
                  <span className="leading-snug">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* C-01: Symptom search widget — hidden during keynote phase and constitutional prompt */}
      {!inKeynotePhase && !showConstitutionalPrompt && question && (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-medium text-slate-600 cursor-pointer"
            onClick={() => setShowSymptomSearch(v => !v)}
          >
            <span className="flex items-center gap-2">
              <Search size={14} className="text-slate-400" />
              Search additional symptoms
            </span>
            <span className="text-xs text-slate-400">{showSymptomSearch ? 'Hide' : 'Show'}</span>
          </button>

          {showSymptomSearch && (
            <div className="px-4 pb-4 pt-3 bg-white space-y-3">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={symptomSearch}
                  onChange={e => handleSymptomSearchChange(e.target.value)}
                  placeholder="Type a symptom (e.g. motion, cold, grief)..."
                  className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-jc-purple-400 focus:ring-1 focus:ring-jc-purple-200 bg-slate-50"
                />
              </div>

              {symptomResults.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 font-medium">Tap to add:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {symptomResults.map(sym => (
                      <button
                        key={sym}
                        onClick={() => addSymptom(sym)}
                        disabled={addedSymptoms.includes(sym)}
                        className={[
                          'px-2.5 py-1 rounded-full text-xs border transition-colors cursor-pointer',
                          addedSymptoms.includes(sym)
                            ? 'bg-jc-purple-100 border-jc-purple-300 text-jc-purple-600 opacity-50 cursor-default'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-jc-purple-400 hover:bg-jc-purple-50',
                        ].join(' ')}
                      >
                        {sym.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {addedSymptoms.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 font-medium">Added:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {addedSymptoms.map(sym => (
                      <span
                        key={sym}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-jc-purple-50 border border-jc-purple-200 text-jc-purple-700"
                      >
                        {sym.replace(/_/g, ' ')}
                        <button
                          onClick={() => removeSymptom(sym)}
                          className="ml-0.5 text-jc-purple-400 hover:text-jc-purple-700 cursor-pointer"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button className="jc-btn-ghost flex items-center gap-1" onClick={handleBack}>
          <ChevronLeft size={16} /> Back
        </button>
        {!showConstitutionalPrompt && (
          <div className="flex items-center gap-3">
            <button className="jc-btn-ghost text-slate-400 text-xs" onClick={handleSkip}>
              Skip
            </button>
            <button
              className="jc-btn-primary flex items-center gap-1"
              onClick={handleNext}
            >
              {isLast ? 'See Results' : 'Next'}
              {!isLast && <ChevronRight size={16} />}
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
