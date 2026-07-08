import type { ClinicalSession, ScoringResult, Remedy } from '../types';

export type ResponseType = 'improvement' | 'aggravation' | 'no_change' | 'partial';

export interface FollowupReport {
  response_type: ResponseType;
  assessment: string;
  action: string;
  complement?: string;
  antidote?: string;
}

export function compare(
  previousSession: ClinicalSession,
  currentSession: ClinicalSession,
  previousResults: ScoringResult[],
  currentResults: ScoringResult[],
): { change: string; direction: ResponseType } {
  const prevTop = previousResults[0];
  const currTop = currentResults[0];

  if (!prevTop || !currTop) return { change: 'Insufficient data', direction: 'no_change' };

  const scoreDiff = currTop.normalised_score - prevTop.normalised_score;

  if (Math.abs(scoreDiff) < 5) {
    return { change: `Score unchanged (${prevTop.normalised_score}% -> ${currTop.normalised_score}%)`, direction: 'no_change' };
  }

  const prevWorse = previousSession.worse_from.length;
  const currWorse = currentSession.worse_from.length;

  if (currTop.remedy_id === prevTop.remedy_id && scoreDiff > 0) {
    return { change: `${prevTop.remedy_id} score improved by ${Math.round(scoreDiff)}%`, direction: 'improvement' };
  }
  if (currWorse > prevWorse + 2) {
    return { change: 'New aggravation symptoms detected', direction: 'aggravation' };
  }
  if (scoreDiff < -5) {
    return { change: `Top remedy shifted from ${prevTop.remedy_id} to ${currTop.remedy_id}`, direction: 'partial' };
  }
  return { change: `Mild improvement (${prevTop.normalised_score}% -> ${currTop.normalised_score}%)`, direction: 'improvement' };
}

export function suggestFollowUp(
  topResult: ScoringResult,
  allRemedies: Remedy[],
): FollowupReport {
  const remedy = allRemedies.find(r => r.id === topResult.remedy_id);
  if (!remedy) {
    return {
      response_type: 'no_change',
      assessment: 'Remedy not found in database.',
      action: 'Review the case and reconsider differential candidates.',
    };
  }

  const complements = remedy.complementary_remedies ?? [];
  const antidotes = remedy.antidotes ?? [];

  if (topResult.normalised_score >= 70) {
    return {
      response_type: 'improvement',
      assessment: `Strong match confirmed for ${remedy.latin_name}. Continue observing without repeating prematurely.`,
      action: 'Do not repeat the remedy while improvement is active. Schedule review in 4-6 weeks.',
      complement: complements[0],
    };
  }

  if (topResult.normalised_score >= 50) {
    return {
      response_type: 'partial',
      assessment: `Probable match for ${remedy.latin_name}. Monitor response carefully.`,
      action: 'If improvement begins, wait. If no change at 3 weeks, step up potency or consider the first differential.',
      complement: complements[0],
    };
  }

  return {
    response_type: 'no_change',
    assessment: `Possible match for ${remedy.latin_name} but score is borderline.`,
    action: 'Deepen the case-taking. Confirm the causation and at least 2 keynotes before prescribing.',
    antidote: antidotes[0],
  };
}

export function formatReport(report: FollowupReport): string {
  const lines = [
    `Response: ${report.response_type.replace('_', ' ').toUpperCase()}`,
    `Assessment: ${report.assessment}`,
    `Action: ${report.action}`,
  ];
  if (report.complement) lines.push(`Complementary remedy to consider: ${report.complement}`);
  if (report.antidote) lines.push(`Antidote if aggravation: ${report.antidote}`);
  return lines.join('\n');
}
