import { REMEDIES } from '../data/remedies.js';
import type { Remedy } from '../types';

export interface RubricEntry {
  id: string;
  r: string;
  cat: string;
  rem: [string, number][];
  chapterName: string;
}

export interface RubricRemedyResult {
  remedy_id: string;
  grade: number;
  latin_name: string;
  abbreviation: string;
}

const _remedyMap: Record<string, Remedy> = {};
let _mapBuilt = false;

function getRemedyMap(): Record<string, Remedy> {
  if (_mapBuilt) return _remedyMap;
  for (const r of (REMEDIES as unknown) as Remedy[]) {
    if (r?.id !== undefined) _remedyMap[r.id] = r;
  }
  _mapBuilt = true;
  return _remedyMap;
}

export function search(_query: string, _maxResults?: number): RubricEntry[] {
  // Kent chapter arrays are not loaded in this build.
  // Full rubric search is available in the classic HDSS (file://) build.
  return [];
}

export function getRemediesForRubric(_rubricId: string, _topN?: number): RubricRemedyResult[] {
  return [];
}

export function getRubricsForRemedy(remedyId: string): Array<{ field: string; value: string }> {
  const rMap = getRemedyMap();
  const remedy = rMap[remedyId];
  if (!remedy) return [];

  const results: Array<{ field: string; value: string }> = [];
  (remedy.keynotes ?? []).forEach((k: { symptom: string }) => {
    if (k.symptom) results.push({ field: 'Keynote', value: k.symptom });
  });
  (remedy.worse_from ?? []).forEach((v: string) => results.push({ field: 'Worse from', value: v }));
  (remedy.better_from ?? []).forEach((v: string) => results.push({ field: 'Better from', value: v }));
  (remedy.causation ?? []).forEach((c: { trigger: string }) => {
    if (c.trigger) results.push({ field: 'Causation', value: c.trigger });
  });
  return results;
}

export function getAllChapters(): string[] {
  return [];
}
