import { REMEDIES } from '../data/remedies.js';
import type { ClinicalSession, ScoringResult, Remedy } from '../types';

export interface TreatmentStep {
  step: number;
  remedy_id: string;
  latin_name: string;
  role: 'primary' | 'intercurrent' | 'complement';
  rationale: string;
  timing: string;
}

export interface TreatmentPlan {
  steps: TreatmentStep[];
  intercurrent?: string;
  notes: string;
}

function getRemedy(id: string): Remedy | undefined {
  return (REMEDIES as unknown as Remedy[]).find(r => r.id === id);
}

export function build(
  topResult: ScoringResult,
  session: ClinicalSession,
  allResults: ScoringResult[],
): TreatmentPlan {
  const primary = getRemedy(topResult.remedy_id);
  const steps: TreatmentStep[] = [];

  steps.push({
    step: 1,
    remedy_id: topResult.remedy_id,
    latin_name: primary?.latin_name ?? topResult.remedy_id,
    role: 'primary',
    rationale: `Highest repertorization score (${topResult.normalised_score}%). Best overall match to the symptom picture.`,
    timing: session.duration === 'acute' ? 'Give now. Repeat every 4 hours as needed.' : 'Single dose. Observe for 2-4 weeks.',
  });

  if (primary?.complementary_remedies && primary.complementary_remedies.length > 0) {
    const compId = primary.complementary_remedies[0];
    const compRemedy = getRemedy(compId);
    steps.push({
      step: 2,
      remedy_id: compId,
      latin_name: compRemedy?.latin_name ?? compId,
      role: 'complement',
      rationale: `Classic complement to ${primary.abbreviation ?? topResult.remedy_id}. Follows well if the primary shows a positive but incomplete response.`,
      timing: 'If primary plateaus after 3-4 weeks, give this remedy and wait another 3-4 weeks.',
    });
  }

  const miasm = session.miasm_hint;
  let intercurrent: string | undefined;
  if (miasm === 'psora') intercurrent = 'sulf';
  else if (miasm === 'sycosis') intercurrent = 'med';
  else if (miasm === 'syphilis') intercurrent = 'syph';
  else if (miasm === 'tubercular') intercurrent = 'tub';

  if (intercurrent) {
    const nosode = getRemedy(intercurrent);
    if (nosode) {
      steps.push({
        step: steps.length + 1,
        remedy_id: intercurrent,
        latin_name: nosode.latin_name,
        role: 'intercurrent',
        rationale: `Intercurrent nosode for ${miasm} miasm. Clears the miasmatic block when the indicated remedy acts only partially.`,
        timing: 'After 1-2 months of treatment if progress plateaus. Single dose 200C or 1M.',
      });
    }
  }

  const secondCandidate = allResults[1];
  const notes = secondCandidate
    ? `If ${primary?.abbreviation ?? topResult.remedy_id} shows no response within the expected timeframe, reconsider ${secondCandidate.remedy_id} (${secondCandidate.normalised_score}%) from the differential.`
    : 'Monitor response and repeat the full case-taking before changing the remedy.';

  return { steps, intercurrent, notes };
}
