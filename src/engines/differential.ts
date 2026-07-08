import { REMEDIES } from '../data/remedies.js';
import type { ScoringResult, Remedy } from '../types';

export interface Differential {
  remedy_id: string;
  latin_name: string;
  abbreviation: string;
  score: number;
  differentiating_points: string[];
}

function getRemedyById(id: string): Remedy | undefined {
  return (REMEDIES as unknown as Remedy[]).find(r => r.id === id);
}

function diffPoints(r1: Remedy, r2: Remedy): string[] {
  const points: string[] = [];

  const th1 = r1.thermal_state ?? '';
  const th2 = r2.thermal_state ?? '';
  if (th1 && th2 && th1 !== th2) {
    points.push(`Thermal: ${r2.abbreviation} is ${th2}, ${r1.abbreviation} is ${th1}`);
  }

  const lat1 = r1.laterality ?? '';
  const lat2 = r2.laterality ?? '';
  if (lat1 && lat2 && lat1 !== lat2) {
    points.push(`Laterality: ${r2.abbreviation} is ${lat2}-sided`);
  }

  const m1 = r1.mentals?.consolation_response ?? '';
  const m2 = r2.mentals?.consolation_response ?? '';
  if (m1 !== m2 && (m1 || m2)) {
    points.push(`Consolation: ${r2.abbreviation} ${m2 || 'unspecified'}`);
  }

  const k2 = (r2.keynotes ?? []) as Array<{ symptom: string }>;
  for (const kn of k2.slice(0, 3)) {
    const sym = kn.symptom;
    if (sym && !(r1.keynotes ?? []).some((k: { symptom: string }) => k.symptom === sym)) {
      points.push(`Keynote of ${r2.abbreviation}: ${sym}`);
    }
  }

  return points.slice(0, 4);
}

export function buildDifferentials(results: ScoringResult[]): Differential[] {
  if (results.length < 2) return [];
  const top = results[0];
  const topRemedy = getRemedyById(top.remedy_id);
  if (!topRemedy) return [];

  return results.slice(1, 5).map(r => {
    const rem = getRemedyById(r.remedy_id);
    if (!rem) return null;
    return {
      remedy_id: r.remedy_id,
      latin_name: rem.latin_name ?? r.remedy_id,
      abbreviation: rem.abbreviation ?? r.remedy_id,
      score: r.normalised_score,
      differentiating_points: diffPoints(topRemedy, rem),
    };
  }).filter((d): d is Differential => d !== null);
}

export function suggestNextQuestion(results: ScoringResult[]): string | null {
  if (results.length < 2) return null;
  const top = getRemedyById(results[0].remedy_id);
  const second = getRemedyById(results[1]?.remedy_id);
  if (!top || !second) return null;

  if (top.thermal_state !== second.thermal_state) {
    return `Ask about thermal state to differentiate ${top.abbreviation} (${top.thermal_state}) from ${second.abbreviation} (${second.thermal_state})`;
  }
  if (top.laterality !== second.laterality) {
    return `Ask about which side is affected to differentiate ${top.abbreviation} (${top.laterality}) from ${second.abbreviation} (${second.laterality})`;
  }
  const topKn = (top.keynotes ?? [])[0] as { symptom: string } | undefined;
  if (topKn) {
    return `Ask about: "${topKn.symptom}" (keynote of ${top.abbreviation})`;
  }
  return null;
}
