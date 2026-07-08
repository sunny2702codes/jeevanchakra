import { POTENCY_NOTES } from '../data/potency_notes.js';
import type { ClinicalSession } from '../types';

export function getNote(remedyId: string): string | null {
  const notes = POTENCY_NOTES as Record<string, string>;
  return notes[remedyId] ?? null;
}

export function recommend(remedyId: string, session: ClinicalSession): { potency: string; note: string } {
  const boerickeNote = getNote(remedyId);
  const dur = (session.duration ?? '').toLowerCase();
  const isAcute = dur === 'acute' || (session.causation ?? []).some(c =>
    ['injury_trauma_mechanical', 'burns_scalds', 'puncture_wounds', 'fright'].includes(c)
  );
  const isChronic = dur === 'chronic' || (!isAcute && dur !== 'subacute');

  let potency = '30C';
  let rationale = 'Standard starting potency for most presentations.';

  if (isAcute) {
    potency = '30C';
    rationale = 'Acute condition: 30C acts quickly and is safe to repeat at short intervals.';
  } else if (isChronic) {
    potency = '200C';
    rationale = 'Chronic condition: 200C gives deeper, more sustained action. Single dose, then wait.';
  }

  const note = boerickeNote
    ? `${rationale} Boericke note: ${boerickeNote}`
    : rationale;

  return { potency, note };
}
