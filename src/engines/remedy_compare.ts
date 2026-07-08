import { REMEDIES } from '../data/remedies.js';
import type { Remedy } from '../types';

export interface RemedyCompareResult {
  remedy1: Remedy;
  remedy2: Remedy;
  shared: { field: string; values: string[] }[];
  only1: { field: string; values: string[] }[];
  only2: { field: string; values: string[] }[];
}

function getRemedy(id: string): Remedy | undefined {
  return (REMEDIES as unknown as Remedy[]).find(r => r.id === id || r.abbreviation?.toLowerCase() === id.toLowerCase());
}

export function compare(id1: string, id2: string): RemedyCompareResult | null {
  const r1 = getRemedy(id1);
  const r2 = getRemedy(id2);
  if (!r1 || !r2) return null;

  function compareField(
    field: string,
    v1: string[],
    v2: string[],
    acc: { shared: typeof result.shared; only1: typeof result.only1; only2: typeof result.only2 },
  ) {
    const set1 = new Set(v1);
    const set2 = new Set(v2);
    const shared = v1.filter(v => set2.has(v));
    const only1 = v1.filter(v => !set2.has(v));
    const only2 = v2.filter(v => !set1.has(v));
    if (shared.length) acc.shared.push({ field, values: shared });
    if (only1.length)  acc.only1.push({ field, values: only1 });
    if (only2.length)  acc.only2.push({ field, values: only2 });
  }

  const result: RemedyCompareResult = { remedy1: r1, remedy2: r2, shared: [], only1: [], only2: [] };

  compareField('Worse from', r1.worse_from ?? [], r2.worse_from ?? [], result);
  compareField('Better from', r1.better_from ?? [], r2.better_from ?? [], result);
  compareField('Time modality', r1.time_modality ?? [], r2.time_modality ?? [], result);
  compareField('Complaints', r1.complaints ?? [], r2.complaints ?? [], result);

  const kn1 = (r1.keynotes ?? []).map((k: { symptom: string }) => k.symptom).filter(Boolean);
  const kn2 = (r2.keynotes ?? []).map((k: { symptom: string }) => k.symptom).filter(Boolean);
  compareField('Keynotes', kn1, kn2, result);

  return result;
}

export function findSimilarRemedies(id: string, k = 5): Remedy[] {
  const remedy = getRemedy(id);
  if (!remedy) return [];

  const all = (REMEDIES as unknown as Remedy[]).filter(r => r.id !== remedy.id);
  const scored = all.map(r => {
    let score = 0;
    if (r.thermal_state === remedy.thermal_state) score += 2;
    if (r.laterality === remedy.laterality) score += 1;
    const sharedWorse = (r.worse_from ?? []).filter(v => (remedy.worse_from ?? []).includes(v)).length;
    const sharedBetter = (r.better_from ?? []).filter(v => (remedy.better_from ?? []).includes(v)).length;
    score += sharedWorse + sharedBetter;
    const sharedMiasm = (r.miasm ?? []).filter((m: string) => ((remedy.miasm ?? []) as string[]).includes(m)).length;
    score += sharedMiasm;
    return { remedy: r, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map(s => s.remedy);
}

export function searchRemedies(query: string, filters: { kingdom?: string; thermal?: string; miasm?: string } = {}): Remedy[] {
  const q = query.toLowerCase().trim();
  return (REMEDIES as unknown as Remedy[]).filter(r => {
    if (filters.kingdom && filters.kingdom !== 'All' && (r.kingdom ?? '').toLowerCase() !== filters.kingdom.toLowerCase()) return false;
    if (filters.thermal && filters.thermal !== 'All' && (r.thermal_state ?? '').toLowerCase() !== filters.thermal.toLowerCase()) return false;
    if (filters.miasm && filters.miasm !== 'All' && !(r.miasm ?? []).some((m: string) => m.toLowerCase() === filters.miasm!.toLowerCase())) return false;
    if (!q) return true;
    return (
      r.id.toLowerCase().includes(q) ||
      (r.latin_name ?? '').toLowerCase().includes(q) ||
      (r.common_name ?? '').toLowerCase().includes(q) ||
      (r.abbreviation ?? '').toLowerCase().includes(q) ||
      (r.description ?? '').toLowerCase().includes(q) ||
      (r.complaints ?? []).some((c: string) => c.toLowerCase().includes(q))
    );
  });
}
