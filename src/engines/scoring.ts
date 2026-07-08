import { REMEDIES } from '../data/remedies.js';
import { CONSTITUTIONAL } from '../data/constitutional.js';
import type { ClinicalSession, ScoringResult, ScoreTier, Remedy } from '../types';

interface ConstitutionalProfile {
  build?: string;
  perspiration?: string;
  sleep_pos?: string;
  appetite?: string;
  skin?: string[];
  grief?: string;
}

const WEIGHTS = {
  causation:   6,
  keynote:     5,
  worse_from:  4,
  better_from: 4,
  time:        4,
  concomitant: 3,
  mental:      3,
  general:     3,
  thermal:     3,
  particular:  2,
  laterality:  2,
} as const;

export function hasMinimumSet(session: ClinicalSession): boolean {
  const hasChief = !!session.complaint;
  const hasCausation = Array.isArray(session.causation) && session.causation.length > 0
    && !(session.causation.length === 1 && session.causation[0] === 'none_known');
  const hasThermal = !!session.thermal_state;
  const modCount = (session.worse_from?.length ?? 0) + (session.better_from?.length ?? 0);
  return hasChief && hasCausation && hasThermal && modCount >= 2;
}

function tierFor(n: number): ScoreTier | 'BelowThreshold' {
  if (n >= 75) return 'Strong';
  if (n >= 50) return 'Probable';
  if (n >= 30) return 'Possible';
  return 'BelowThreshold';
}

function gradeFor(item: unknown): number {
  if (item && typeof item === 'object' && 'grade' in item && typeof (item as { grade: unknown }).grade === 'number') {
    return (item as { grade: number }).grade;
  }
  return 1;
}

function scoreRemedy(remedy: Remedy, session: ClinicalSession): { result: ScoringResult; normalised: number } {
  const matched: Array<{ field: string; value: string; weight: number; kent_grade: number; points: number }> = [];
  let raw = 0;
  let maxPossible = 0;

  // CAUSATION
  const causations = (remedy.causation ?? []) as Array<{ trigger: string; grade: number }>;
  (session.causation ?? []).forEach(userCause => {
    if (userCause === 'none_known') return;
    maxPossible += WEIGHTS.causation * 3;
    const hit = causations.find(c => c.trigger === userCause);
    if (hit) {
      const g = hit.grade ?? 1;
      const pts = WEIGHTS.causation * g;
      raw += pts;
      matched.push({ field: 'Causation', value: userCause, weight: WEIGHTS.causation, kent_grade: g, points: pts });
    }
  });

  // KEYNOTES
  const userKeynotes = session.collected_keynotes ?? [];
  const remedyKeynotes = (remedy.keynotes ?? []) as Array<{ symptom: string; grade: number }>;
  if (userKeynotes.length > 0) {
    userKeynotes.forEach(uk => {
      maxPossible += WEIGHTS.keynote * 3;
      const hit = remedyKeynotes.find(k => k.symptom === uk);
      if (hit) {
        const g = gradeFor(hit);
        const pts = WEIGHTS.keynote * g;
        raw += pts;
        matched.push({ field: 'Keynote', value: uk, weight: WEIGHTS.keynote, kent_grade: g, points: pts });
      }
    });
  }

  // WORSE FROM
  (session.worse_from ?? []).forEach(uw => {
    maxPossible += WEIGHTS.worse_from * 3;
    if ((remedy.worse_from ?? []).includes(uw)) {
      const pts = WEIGHTS.worse_from * 2;
      raw += pts;
      matched.push({ field: 'Worse from', value: uw, weight: WEIGHTS.worse_from, kent_grade: 2, points: pts });
    }
  });

  // BETTER FROM
  (session.better_from ?? []).forEach(ub => {
    maxPossible += WEIGHTS.better_from * 3;
    if ((remedy.better_from ?? []).includes(ub)) {
      const pts = WEIGHTS.better_from * 2;
      raw += pts;
      matched.push({ field: 'Better from', value: ub, weight: WEIGHTS.better_from, kent_grade: 2, points: pts });
    }
  });

  // TIME MODALITY
  (session.time_modality ?? []).forEach(ut => {
    maxPossible += WEIGHTS.time * 3;
    if ((remedy.time_modality ?? []).includes(ut)) {
      const pts = WEIGHTS.time * 3;
      raw += pts;
      matched.push({ field: 'Time', value: ut, weight: WEIGHTS.time, kent_grade: 3, points: pts });
    }
  });

  // MENTAL STATE
  const rm = remedy.mentals ?? {};
  const toStrArr = (v: string | string[] | undefined): string[] => !v ? [] : Array.isArray(v) ? v : [v];
  const allMentalTags: string[] = [
    ...toStrArr(rm.mood),
    ...toStrArr(rm.fear_type),
    ...toStrArr(rm.anxiety_type),
  ];
  (session.mental_state ?? []).forEach(um => {
    maxPossible += WEIGHTS.mental * 3;
    const hit = allMentalTags.some(t => t.includes(um) || um.includes(t));
    if (hit) {
      const pts = WEIGHTS.mental * 2;
      raw += pts;
      matched.push({ field: 'Mental', value: um, weight: WEIGHTS.mental, kent_grade: 2, points: pts });
    }
  });

  // CONSOLATION RESPONSE
  if (session.consolation_response) {
    maxPossible += WEIGHTS.mental * 3;
    const want = session.consolation_response;
    const remedyResp = (rm.consolation_response ?? '').toLowerCase();
    if (remedyResp.includes(want)) {
      const pts = WEIGHTS.mental * 3;
      raw += pts;
      matched.push({ field: 'Mental (consolation)', value: want, weight: WEIGHTS.mental, kent_grade: 3, points: pts });
    }
  }

  // THIRST
  if (session.thirst) {
    maxPossible += WEIGHTS.general * 3;
    const rt = (remedy.thirst ?? '').toLowerCase();
    const ut = session.thirst.toLowerCase();
    if (rt === ut || rt.includes(ut) || ut.includes(rt)) {
      const pts = WEIGHTS.general * 3;
      raw += pts;
      matched.push({ field: 'General (thirst)', value: session.thirst, weight: WEIGHTS.general, kent_grade: 3, points: pts });
    }
  }

  // THERMAL
  if (session.thermal_state) {
    maxPossible += WEIGHTS.thermal;
    const userTherm = session.thermal_state;
    const remTherm = remedy.thermal_state ?? 'variable';
    let thermScore = 0;
    if (remTherm === 'variable' || userTherm === 'variable') {
      thermScore = 0;
    } else if (remTherm.toLowerCase() === userTherm.toLowerCase()) {
      thermScore = WEIGHTS.thermal;
    } else {
      thermScore = WEIGHTS.thermal * 0.4 * -1;
    }
    raw += thermScore;
    if (thermScore !== 0) {
      matched.push({ field: 'Thermal', value: `${userTherm} vs ${remTherm}`, weight: WEIGHTS.thermal, kent_grade: 1, points: thermScore });
    }
  }

  // LATERALITY
  if (session.laterality) {
    maxPossible += WEIGHTS.laterality * 3;
    const userL = session.laterality;
    const remL = remedy.laterality ?? 'Bilateral';
    if (userL === remL || remL === 'Bilateral') {
      const grade = remL === userL ? 3 : 1;
      const pts = WEIGHTS.laterality * grade;
      raw += pts;
      matched.push({ field: 'Laterality', value: userL, weight: WEIGHTS.laterality, kent_grade: grade, points: pts });
    }
  }

  // FOOD DESIRES
  const rg = remedy.generals ?? {};
  const remDesires = rg.food_desires ?? [];
  (session.food_desires ?? []).forEach(fd => {
    if (fd === 'nothing') return;
    maxPossible += WEIGHTS.general * 3;
    if (remDesires.includes(fd)) {
      const pts = WEIGHTS.general * 2;
      raw += pts;
      matched.push({ field: 'Craves', value: fd, weight: WEIGHTS.general, kent_grade: 2, points: pts });
    }
  });

  // FOOD AVERSIONS
  const remAverse = rg.food_aversions ?? [];
  (session.food_aversions ?? []).forEach(fa => {
    if (fa === 'nothing') return;
    maxPossible += WEIGHTS.general * 3;
    if (remAverse.includes(fa)) {
      const pts = WEIGHTS.general * 2;
      raw += pts;
      matched.push({ field: 'Aversion', value: fa, weight: WEIGHTS.general, kent_grade: 2, points: pts });
    }
  });

  // DESIRES COMPANY (Q15: wants_consolation / wants_to_be_alone)
  // Separate from consolation_response: scores company preference vs remedy.mentals.desires_company
  if (session.mental_state?.includes('wants_consolation')) {
    maxPossible += WEIGHTS.mental * 2;
    if ((rm as { desires_company?: boolean }).desires_company === true) {
      const pts = WEIGHTS.mental * 2;
      raw += pts;
      matched.push({ field: 'Mental (prefers company)', value: 'wants_consolation', weight: WEIGHTS.mental, kent_grade: 2, points: pts });
    }
  } else if (session.mental_state?.includes('wants_to_be_alone')) {
    maxPossible += WEIGHTS.mental * 2;
    if ((rm as { desires_company?: boolean }).desires_company === false) {
      const pts = WEIGHTS.mental * 2;
      raw += pts;
      matched.push({ field: 'Mental (prefers solitude)', value: 'wants_to_be_alone', weight: WEIGHTS.mental, kent_grade: 2, points: pts });
    }
  }

  // CONSTITUTION TYPE MATCH (Q24 — if user identified the constitutional type)
  if (session.constitution_hint) {
    const remedyConst = (remedy as unknown as { constitution_type?: string }).constitution_type ?? '';
    if (remedyConst) {
      maxPossible += WEIGHTS.general * 3;
      if (remedyConst === session.constitution_hint) {
        const pts = WEIGHTS.general * 2;
        raw += pts;
        matched.push({ field: 'Constitutional type', value: session.constitution_hint, weight: WEIGHTS.general, kent_grade: 2, points: pts });
      }
    }
  }

  // CONSTITUTIONAL PARTICULARS (Q17-Q22: build, perspiration, sleep, appetite, skin, grief)
  // Scored against CONSTITUTIONAL lookup table; only adds to maxPossible when the remedy has data.
  {
    const conData: ConstitutionalProfile = (CONSTITUTIONAL as Record<string, ConstitutionalProfile>)[remedy.id] ?? {};
    const ba = session.branch_answers ?? {};
    const CW = WEIGHTS.general; // weight 3

    const pairs: Array<[string, string | undefined]> = [
      [ba['build']?.[0] ?? '', conData.build],
      [ba['perspiration']?.[0] ?? '', conData.perspiration],
      [ba['sleep_position']?.[0] ?? '', conData.sleep_pos],
      [ba['appetite']?.[0] ?? '', conData.appetite],
      [ba['grief_response']?.[0] ?? '', conData.grief],
    ];
    for (const [userVal, remedyVal] of pairs) {
      if (!remedyVal || !userVal) continue;
      maxPossible += CW * 3;
      if (userVal === remedyVal) {
        const pts = CW * 2;
        raw += pts;
        matched.push({ field: 'Constitutional', value: userVal.replace(/_/g, ' '), weight: CW, kent_grade: 2, points: pts });
      }
    }

    // Skin tendency is multi-select
    const userSkins: string[] = ba['skin_tendency'] ?? [];
    if (conData.skin && conData.skin.length > 0 && userSkins.length > 0) {
      for (const us of userSkins) {
        if (us === 'normal') continue;
        maxPossible += CW * 3;
        if (conData.skin.includes(us)) {
          const pts = CW * 2;
          raw += pts;
          matched.push({ field: 'Skin tendency', value: us.replace(/_/g, ' '), weight: CW, kent_grade: 2, points: pts });
        }
      }
    }
  }

  // MIASM BONUS
  if (session.miasm_hint) {
    const hint = session.miasm_hint.toLowerCase();
    const remMiasms = (remedy.miasm ?? []).map((m: string) => m.toLowerCase());
    if (remMiasms.includes(hint)) {
      const bonus = 0.3 * WEIGHTS.thermal;
      raw += bonus;
      matched.push({ field: 'Miasm', value: hint, weight: WEIGHTS.thermal, kent_grade: 1, points: bonus });
    }
  }

  // BRANCH PARTICULARS
  const branchAnswers = session.branch_answers ?? {};
  const branchKey = session.branch ?? '';
  if (branchKey && remedy.branches?.[branchKey]) {
    const remBranch = remedy.branches[branchKey];
    Object.values(branchAnswers).forEach(val => {
      const values = Array.isArray(val) ? val : [val];
      values.forEach(v => {
        if (!v) return;
        maxPossible += WEIGHTS.particular * 3;
        const hits = Object.values(remBranch as unknown as Record<string, unknown>).some(rv => {
          if (Array.isArray(rv)) return (rv as string[]).includes(v as string);
          if (typeof rv === 'string') return rv === v || rv.includes(v as string);
          return false;
        });
        if (hits) {
          const pts = WEIGHTS.particular * 2;
          raw += pts;
          matched.push({ field: `Particular (${branchKey})`, value: v as string, weight: WEIGHTS.particular, kent_grade: 2, points: pts });
        }
      });
    });
  }

  const normalised = maxPossible > 0 ? Math.max(0, (raw / maxPossible) * 100) : 0;
  const tier = tierFor(normalised);

  return {
    normalised,
    result: {
      remedy_id: remedy.id,
      latin_name: remedy.latin_name,
      common_name: remedy.common_name,
      abbreviation: remedy.abbreviation,
      raw_score: raw,
      max_possible: maxPossible,
      normalised_score: Math.round(normalised * 10) / 10,
      tier: (tier === 'BelowThreshold' ? 'Possible' : tier) as ScoreTier,
      matches: matched,
      missing: [],
    } as ScoringResult,
  };
}

export function rank(session: ClinicalSession): ScoringResult[] {
  const all = REMEDIES as unknown as Remedy[];
  const scored: Array<{ result: ScoringResult; normalised: number }> = [];

  for (const remedy of all) {
    const s = scoreRemedy(remedy, session);
    if (s.normalised >= 30) {
      scored.push(s);
    }
  }

  scored.sort((a, b) => b.normalised - a.normalised);
  return scored.slice(0, 20).map(s => s.result);
}
