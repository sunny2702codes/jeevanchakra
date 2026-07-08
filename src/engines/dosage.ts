import type { ClinicalSession } from '../types';

export interface DosageSchedulePhase {
  phase: string;
  instruction: string;
}

export interface DosageRecommendation {
  potency: string;
  potency_note: string;
  condition_type: 'acute' | 'subacute' | 'chronic';
  schedule: DosageSchedulePhase[];
  stop_rule: string;
  reassessment: string;
  urgent_note: string | null;
}

function detectConditionType(session: ClinicalSession): 'acute' | 'subacute' | 'chronic' {
  const dur = (session.duration ?? '').toLowerCase();
  if (dur === 'acute') return 'acute';
  if (dur === 'subacute') return 'subacute';
  const causes = (session.causation ?? []).join(' ').toLowerCase();
  if (['injury', 'fright', 'cold_wind', 'accident', 'trauma', 'shock'].some(k => causes.includes(k))) return 'acute';
  return 'chronic';
}

function isSensitivePatient(session: ClinicalSession & { build?: string }): boolean {
  return (session.build ?? '').includes('soft_flabby');
}

export function recommend(remedyId: string, session: ClinicalSession): DosageRecommendation | null {
  if (!remedyId || !session) return null;

  const conditionType = detectConditionType(session);
  const sensitive = isSensitivePatient(session as ClinicalSession & { build?: string });

  const urgentNote = (session.safety_flags ?? []).some(f => f.includes('emergency'))
    ? 'Safety screening flagged an emergency pattern. Refer for immediate medical evaluation before any homeopathic prescribing.'
    : null;

  let potency: string;
  let potencyNote: string;
  let schedule: DosageSchedulePhase[];
  let reassessment: string;

  if (conditionType === 'acute') {
    potency = '30C';
    potencyNote = 'Acute condition: 30C is the standard starting potency. Acts quickly, safe to repeat frequently for a short period.';
    schedule = [
      { phase: 'Initial (Day 1-3)', instruction: '3 pellets every 4 hours. Stop as soon as clear improvement begins. Do not repeat while improving.' },
      { phase: 'On improvement', instruction: 'Reduce to 3 pellets twice daily. Stop completely once improvement is sustained across 2 consecutive days.' },
      { phase: 'If no change at 48 hours', instruction: 'Reassess: review whether the remedy picture truly matches. Consult the differential candidates before continuing.' },
      { phase: 'If aggravation occurs', instruction: 'Stop dosing immediately. A brief aggravation followed by relief is a positive sign. Resume only if improvement then plateaus.' },
    ];
    reassessment = '48 hours (acute). Reassess immediately if no change.';
  } else if (conditionType === 'subacute') {
    potency = '30C';
    potencyNote = 'Subacute condition: begin at 30C. If no response by Day 5, stepping up to 200C is appropriate before changing the remedy.';
    schedule = [
      { phase: 'Initial (Week 1)', instruction: '3 pellets twice daily. Stop on first sign of clear improvement.' },
      { phase: 'On improvement', instruction: 'Do not repeat the remedy. Observe for 5-7 days. The remedy continues to act after the last dose.' },
      { phase: 'If plateau at Day 5 with no response', instruction: 'Consider stepping up to 200C, or review the second differential candidate.' },
      { phase: 'Reassessment', instruction: 'Schedule a full case review at 10 days from the first dose.' },
    ];
    reassessment = '10 days. If partial response, continue observing. If none, review the differential.';
  } else {
    potency = sensitive ? '30C' : '200C';
    potencyNote = sensitive
      ? 'Chronic condition in a sensitive patient: 30C is safer than higher potencies, which may cause a strong initial aggravation.'
      : 'Chronic condition with adequate vitality: 200C produces a deeper and more sustained action.';
    schedule = [
      { phase: 'Initial dose', instruction: `Single dose of ${potency}, 3 pellets, taken once. Then wait and watch. Do not repeat immediately.` },
      { phase: 'First 2 weeks', instruction: 'Do not repeat the remedy. Monitor carefully for any direction of change.' },
      { phase: 'If improvement begins', instruction: 'Continue waiting. Repeat the dose only when improvement clearly and definitely plateaus.' },
      { phase: 'If no change at 3 weeks', instruction: 'Repeat the dose once at the same potency. If still no response after 6 weeks, review the case.' },
      { phase: 'Follow-up interval', instruction: 'Schedule a formal case review at 4-6 weeks from the initial dose.' },
    ];
    reassessment = '4-6 weeks. Chronic cases require time to show a direction of change.';
  }

  return {
    potency,
    potency_note: potencyNote,
    condition_type: conditionType,
    schedule,
    stop_rule: 'Stop dosing immediately when clear improvement begins. Never repeat the remedy while the patient is actively improving.',
    reassessment,
    urgent_note: urgentNote,
  };
}
