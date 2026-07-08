import { useState, useMemo } from 'react';
import { MessageSquare, ChevronLeft, ChevronRight, Check, Zap, TrendingUp } from 'lucide-react';
import { useApp } from '../App';
import { INTAKE_POOLS } from '../data/intake.js';
import { REMEDIES } from '../data/remedies.js';
import { KEYNOTE_PROBES } from '../data/keynote_probes.js';
import { rank, hasMinimumSet } from '../engines/scoring';
import type { ClinicalSession, Miasm, ConstitutionType, Remedy } from '../types';

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
  return probes;
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
  const { clinicalSession, setClinicalSession, setClinicalResults } = useApp();

  const mainQuestions = useMemo(
    () => getQuestionsForSession(clinicalSession?.branch ?? null),
    [clinicalSession?.branch],
  );

  // Index of first constitutional question — gate for optional profile section
  const constitutionalStart = useMemo(
    () => mainQuestions.findIndex(q => CONSTITUTIONAL_FIELDS.has(q.session_field)),
    [mainQuestions],
  );

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [keynoteQuestions, setKeynoteQuestions] = useState<IntakeQuestion[]>([]);
  const [showConstitutionalPrompt, setShowConstitutionalPrompt] = useState(false);
  const [session, setSession] = useState<ClinicalSession>(
    clinicalSession ?? {
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
    },
  );

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

  function finishIntake(updatedSession: ClinicalSession) {
    const probes = generateKeynoteProbes(updatedSession);
    if (probes.length > 0) {
      setKeynoteQuestions(probes);
      setStep(mainQuestions.length);
    } else {
      setClinicalSession(updatedSession);
      setClinicalResults(null);
      navigate('results');
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
      setClinicalSession(updated);
      setClinicalResults(null);
      navigate('results');
    } else {
      setStep(s => s + 1);
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
    if (showConstitutionalPrompt) {
      setClinicalSession(session);
      setClinicalResults(null);
      navigate('results');
      return;
    }
    if (step === mainQuestions.length - 1 && keynoteQuestions.length === 0) {
      setClinicalSession(session);
      setClinicalResults(null);
      navigate('results');
    } else if (isLast) {
      setClinicalSession(session);
      setClinicalResults(null);
      navigate('results');
    } else {
      setStep(s => s + 1);
    }
  }

  function handleEarlyResults() {
    setClinicalSession(session);
    setClinicalResults(null);
    navigate('results');
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
            {clinicalSession?.complaint ? ` — ${clinicalSession.complaint}` : ''}
          </p>
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
              }}
            >
              Continue (8 questions)
            </button>
            <button
              className="jc-btn-secondary flex-1"
              onClick={() => {
                setClinicalSession(session);
                setClinicalResults(null);
                navigate('results');
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
