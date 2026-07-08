import { useState, useMemo } from 'react';
import { User, ChevronDown, ChevronUp } from 'lucide-react';
import { scoreConstitution } from '../engines/constitutional';
import type { ClinicalSession } from '../types';

interface ConstitutionalProps {
  navigate: (s: string) => void;
  session: ClinicalSession | null;
}

const TYPE_COLORS: Record<string, string> = {
  Sulphur:       'from-orange-500 to-amber-600',
  Calcarea:      'from-slate-400 to-slate-600',
  Lycopodium:    'from-emerald-500 to-teal-700',
  Phosphorus:    'from-blue-400 to-blue-600',
  'Natrum-mur':  'from-sky-500 to-cyan-700',
  Pulsatilla:    'from-pink-400 to-rose-500',
  'Nux-vomica':  'from-red-500 to-red-700',
  Sepia:         'from-amber-600 to-yellow-700',
  Arsenicum:     'from-purple-500 to-purple-800',
  Silica:        'from-slate-300 to-slate-500',
  Ignatia:       'from-violet-500 to-purple-700',
  Lachesis:      'from-red-700 to-rose-900',
  Tuberculinum:  'from-cyan-500 to-sky-700',
  Medorrhinum:   'from-teal-500 to-emerald-700',
  Graphites:     'from-gray-400 to-gray-600',
  Causticum:     'from-indigo-500 to-indigo-700',
};

const QUESTIONS = [
  {
    id: 'thermal',
    q: 'How do you generally respond to temperature?',
    options: [
      { value: 'Chilly', label: 'I feel cold easily, prefer warmth' },
      { value: 'Warm',   label: 'I feel warm, dislike heat' },
      { value: 'Variable', label: 'It varies, no clear preference' },
    ],
  },
  {
    id: 'thirst',
    q: 'How is your thirst generally?',
    options: [
      { value: 'Thirstless',        label: 'Thirstless, rarely drink water' },
      { value: 'Thirsty_small_sips', label: 'Thirsty but prefer small sips' },
      { value: 'Thirsty',           label: 'Very thirsty, drink large amounts' },
      { value: 'great_thirst_cold', label: 'Crave cold drinks specifically' },
    ],
  },
  {
    id: 'consolation',
    q: 'When you are unwell or upset, does company and consolation:',
    options: [
      { value: 'better',  label: 'Help - I feel better with company and sympathy' },
      { value: 'worse',   label: 'Aggravate - I prefer to be left alone' },
      { value: 'neutral', label: 'Make no difference either way' },
    ],
  },
  {
    id: 'laterality',
    q: 'When you experience one-sided complaints, which side is more commonly affected?',
    options: [
      { value: 'Right',     label: 'Right side predominantly' },
      { value: 'Left',      label: 'Left side predominantly' },
      { value: 'Bilateral', label: 'Both sides or no clear pattern' },
    ],
  },
  {
    id: 'emotional_type',
    q: 'Which best describes your emotional nature?',
    options: [
      { value: 'anxious',       label: 'Anxious, fearful, restless, worry-prone' },
      { value: 'irritable',     label: 'Irritable, impatient, easily angered' },
      { value: 'mild_yielding', label: 'Mild, yielding, sympathetic, weeps easily' },
      { value: 'indifferent',   label: 'Indifferent, withdrawn, does not care' },
      { value: 'philosophical', label: 'Intellectual, philosophical, fastidious' },
      { value: 'intense',       label: 'Intense, hurried, talkative, passionate' },
      { value: 'grief_stricken', label: 'Grief-prone, silent suffering, sighing' },
    ],
  },
];

function buildSession(answers: Record<string, string>): ClinicalSession {
  return {
    id: 'constitutional_quiz',
    started: new Date().toISOString(),
    complaint: null,
    branch: null,
    safety_flags: [],
    duration: null,
    causation: [],
    thermal_state: (answers['thermal'] as ClinicalSession['thermal_state']) ?? null,
    thirst: answers['thirst'] ?? null,
    worse_from: [],
    better_from: [],
    time_modality: [],
    mental_state: answers['emotional_type'] ? [answers['emotional_type']] : [],
    consolation_response: answers['consolation'] ?? null,
    laterality: answers['laterality'] ?? null,
    food_desires: [],
    food_aversions: [],
    concomitants_general: [],
    branch_answers: {},
    collected_keynotes: [],
  };
}

export default function ConstitutionalType({ navigate: _nav, session: clinicalSession }: ConstitutionalProps) {
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    if (clinicalSession) {
      const init: Record<string, string> = {};
      if (clinicalSession.thermal_state)       init['thermal']        = clinicalSession.thermal_state;
      if (clinicalSession.thirst)              init['thirst']         = clinicalSession.thirst;
      if (clinicalSession.consolation_response) init['consolation']   = clinicalSession.consolation_response;
      if (clinicalSession.laterality)          init['laterality']     = clinicalSession.laterality;
      if (clinicalSession.mental_state?.[0])   init['emotional_type'] = clinicalSession.mental_state[0];
      return init;
    }
    return {};
  });
  const [expanded, setExpanded] = useState<string | null>(null);

  const answered = Object.keys(answers).filter(k => answers[k]).length;
  const synthSession = useMemo(() => buildSession(answers), [answers]);
  const scores = useMemo(
    () => answered >= 2 ? scoreConstitution(synthSession) : [],
    [synthSession, answered],
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="jc-section-banner flex items-start gap-4">
        <div className="p-3 bg-white/20 rounded-xl">
          <User size={24} className="text-white" />
        </div>
        <div>
          <div className="text-xs font-bold text-jc-gold-300 uppercase tracking-widest mb-1">Reference</div>
          <h1 className="text-xl font-bold text-white">Constitutional Type</h1>
          <p className="text-white/70 text-sm mt-1">
            Answer the questions below to see which constitutional type patterns your responses most closely resemble.
          </p>
        </div>
      </div>

      <div className="jc-card bg-amber-50 border-amber-200 text-xs text-amber-800 leading-relaxed">
        <span className="font-bold">Note:</span>{' '}
        Constitutional type identification is a clinical art requiring full case-taking by a qualified homeopathic practitioner. These results indicate a general tendency only and are not a prescription.
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          {QUESTIONS.map(q => (
            <div key={q.id} className="jc-card space-y-3 p-4">
              <p className="text-sm font-semibold text-slate-800 leading-snug">{q.q}</p>
              <div className="space-y-2">
                {q.options.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.value }))}
                    className={[
                      'w-full text-left px-3 py-2 rounded-xl border text-xs transition-all cursor-pointer',
                      answers[q.id] === opt.value
                        ? 'border-jc-purple-700 bg-jc-purple-50 text-jc-purple-800 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:border-jc-purple-200 hover:bg-jc-purple-50/30',
                    ].join(' ')}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {answered < 2 && (
            <div className="jc-card text-center py-16 text-slate-400">
              <User size={36} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium text-sm">Answer at least 2 questions</p>
              <p className="text-xs mt-1">Results appear as you answer</p>
            </div>
          )}
          {scores.slice(0, 6).map((s, i) => {
            const colorClass = TYPE_COLORS[s.type] ?? 'from-jc-purple-500 to-jc-purple-700';
            const isExpanded = expanded === s.type;
            return (
              <div key={s.type} className="jc-card p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 text-sm">{s.type}</div>
                    <div className="text-xs text-slate-400">{s.percentage}% match</div>
                  </div>
                  <button
                    className="text-slate-400 hover:text-jc-purple-700 cursor-pointer transition-colors"
                    onClick={() => setExpanded(isExpanded ? null : s.type)}
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>

                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${colorClass} rounded-full transition-all duration-500`}
                    style={{ width: `${s.percentage}%` }}
                  />
                </div>

                {isExpanded && (
                  <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                    <p className="text-slate-600 leading-relaxed">{s.description}</p>
                    {s.matched_traits.length > 0 && (
                      <div>
                        <p className="font-semibold text-slate-500 mb-1">Matching traits:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {s.matched_traits.map(t => (
                            <span key={t} className="bg-jc-purple-50 text-jc-purple-700 px-2 py-0.5 rounded-full text-xs">
                              {t.replace(/_/g, ' ')}
                            </span>
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
      </div>
    </div>
  );
}
