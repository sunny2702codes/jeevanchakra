import { useState, useMemo } from 'react';
import { MessageSquare, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useApp } from '../App';
import { INTAKE_POOLS } from '../data/intake.js';
import type { ClinicalSession } from '../types';

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

// ── Helpers ───────────────────────────────────────────────────────────────────

function getUniversalQuestions(branch: string | null): IntakeQuestion[] {
  const raw = (INTAKE_POOLS as { universal: IntakeQuestion[] }).universal as IntakeQuestion[];
  return raw.filter(q => {
    if (!q.condition) return true;
    if (q.condition.field === 'complaint' && q.condition.not_in && branch) {
      return !q.condition.not_in.includes(branch);
    }
    return true;
  });
}

function applyAnswer(
  session: ClinicalSession,
  question: IntakeQuestion,
  values: string[],
): ClinicalSession {
  const field = question.session_field as keyof ClinicalSession;

  if (question.type === 'single') {
    const val = values[0] ?? null;
    if (field === 'thermal_state') return { ...session, thermal_state: val as ClinicalSession['thermal_state'] };
    if (field === 'thirst') return { ...session, thirst: val };
    if (field === 'consolation_response') return { ...session, consolation_response: val };
    if (field === 'laterality') return { ...session, laterality: val };
    if (field === 'duration') return { ...session, duration: val };
    // build, perspiration etc go to branch_answers
    return { ...session, branch_answers: { ...session.branch_answers, [question.id]: [val ?? ''] } };
  }

  // multi
  if (field === 'causation')    return { ...session, causation: values };
  if (field === 'worse_from')   return { ...session, worse_from: [...new Set([...(session.worse_from ?? []), ...values])] };
  if (field === 'better_from')  return { ...session, better_from: [...new Set([...(session.better_from ?? []), ...values])] };
  if (field === 'time_modality') return { ...session, time_modality: values };
  if (field === 'mental_state') return { ...session, mental_state: [...new Set([...(session.mental_state ?? []), ...values])] };
  if (field === 'food_desires') return { ...session, food_desires: values };
  if (field === 'food_aversions') return { ...session, food_aversions: values };
  if (field === 'concomitants_general' || field === 'branch_answers') {
    return { ...session, branch_answers: { ...session.branch_answers, [question.id]: values } };
  }
  return session;
}

const STEPS = ['Safety', 'Complaint', 'Intake', 'Analysis', 'Results'];

// ── Screen ────────────────────────────────────────────────────────────────────

export default function Intake({ navigate }: IntakeProps) {
  const { clinicalSession, setClinicalSession, setClinicalResults } = useApp();

  const questions = useMemo(
    () => getUniversalQuestions(clinicalSession?.branch ?? null),
    [clinicalSession?.branch],
  );

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
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

  const question = questions[step];
  if (!question) return null;

  const current = answers[question.id] ?? [];
  const isLast = step === questions.length - 1;

  function toggleOption(val: string) {
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

  function handleNext() {
    const vals = answers[question.id] ?? [];
    const updated = applyAnswer(session, question, vals);
    setSession(updated);

    if (isLast) {
      setClinicalSession(updated);
      setClinicalResults(null);
      navigate('results');
    } else {
      setStep(s => s + 1);
    }
  }

  function handleBack() {
    if (step === 0) { navigate('complaint'); return; }
    setStep(s => s - 1);
  }

  function handleSkip() {
    if (isLast) {
      setClinicalSession(session);
      setClinicalResults(null);
      navigate('results');
    } else {
      setStep(s => s + 1);
    }
  }

  const progress = Math.round(((step + 1) / questions.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Banner */}
      <div className="jc-section-banner flex items-start gap-4">
        <div className="p-3 bg-jc-purple-100 rounded-xl">
          <MessageSquare size={24} className="text-jc-purple-700" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-jc-purple-500 uppercase tracking-widest mb-1">Step 3 of 5</div>
          <h2 className="text-xl font-bold text-slate-800">Symptom Interview</h2>
          <p className="text-slate-500 text-sm mt-1">
            Question {step + 1} of {questions.length}
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

      {/* Question card */}
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

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button className="jc-btn-ghost flex items-center gap-1" onClick={handleBack}>
          <ChevronLeft size={16} /> Back
        </button>
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
      </div>

    </div>
  );
}
