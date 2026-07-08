import type { ClinicalSession, ScoringResult } from '../types';

interface ConstitutionalType {
  description: string;
  traits: string[];
  miasms: string[];
}

const TYPES: Record<string, ConstitutionalType> = {
  Sulphur:     { description: 'Warm, untidy, philosophical; burning soles; hungry at 11am.', traits: ['philosophical','warm','untidy','selfish','hungry_11am','burning_soles','morning_diarrhoea','red_orifices','skin_eruptions'], miasms: ['psora'] },
  Calcarea:    { description: 'Chilly, sweaty-headed, slow, anxious about health, obese.', traits: ['chilly','sweaty_head','slow_methodical','anxious_health','obese_flabby','sour_sweat','craving_eggs','fear_insanity'], miasms: ['psora'] },
  Lycopodium:  { description: 'Intellectual with weak digestion; cowardly; right-sided; anticipatory anxiety.', traits: ['intellectual_weak_body','cowardly','flatulence_4_8pm','craving_sweets','right_sided','anticipatory_anxiety','better_warm_drinks','lean_tall'], miasms: ['psora','sycosis'] },
  Phosphorus:  { description: 'Tall, slim, sympathetic; fears being alone; bleeding tendency.', traits: ['tall_slim','sympathetic','fearful','craving_cold_drinks','bleeding_tendency','better_sleep','sensitive_all_impressions'], miasms: ['psora','tubercular'] },
  'Natrum-mur':{ description: 'Dwells on grief; worse consolation; craves salt; weeps alone.', traits: ['grief_dwells','consolation_worse','craving_salt','weeps_alone','headache_sun','herpes_lips','emaciation_eating_well','reserved'], miasms: ['psora'] },
  Pulsatilla:  { description: 'Mild, weepy, yielding; thirstless; changeable; better open air.', traits: ['mild_yielding','weeps_openly','thirstless','warm','better_open_air','changeable_symptoms','consolation_better'], miasms: ['psora','sycosis'] },
  'Nux-vomica':{ description: 'Irritable, chilly, over-indulgent; worse mornings; hypersensitive.', traits: ['irritable','chilly','sedentary_mental_work','over_indulgence','hypersensitive','morning_worse','constipation_ineffectual'], miasms: ['psora'] },
  Sepia:       { description: 'Indifferent to loved ones; hormonal complaints; better vigorous exercise.', traits: ['indifferent_family','weary','chilly_warm','craving_sour','better_exercise','consolation_worse','hormonal_complaints'], miasms: ['psora','sycosis'] },
  Arsenicum:   { description: 'Anxious, restless, chilly, fastidious; burns better warmth; fear of death.', traits: ['anxious_restless','chilly','fastidious','midnight_worse','burning_better_warmth','thirsty_small_sips','fear_death'], miasms: ['psora','syphilis'] },
  Silica:      { description: 'Timid, yielding, chilly; offensive foot sweat; slow healing.', traits: ['timid_yielding','chilly','lack_stamina','suppressed_perspiration','offensive_foot_sweat','fixed_ideas','slow_healing'], miasms: ['psora'] },
  Ignatia:     { description: 'Grief constitution; contradictions; involuntary sighing; rapid mood swings.', traits: ['chilly','grief_dwells','weeps_alone','contradiction_symptoms','involuntary_sighing','consolation_worse','twitching_spasms','thirsty_large_quantities','idealistic'], miasms: ['psora','sycosis'] },
  Lachesis:    { description: 'Talkative, jealous, left-sided; worse on waking; cannot bear anything touching neck.', traits: ['warm','talkative','jealous','suspicious','left_sided','worse_on_waking','cannot_bear_neck_touch','better_onset_discharge','suppression_worse'], miasms: ['syphilis','sycosis'] },
  Tuberculinum:{ description: 'Restless; craves travel; chilly but desires open air; emaciation despite eating.', traits: ['chilly','restless','desire_travel','dissatisfied','love_animals','desire_open_air','emaciation_eating_well','lean_tall','recurrent_chest_colds'], miasms: ['tubercular','psora'] },
  Medorrhinum: { description: 'Intense, hurried; sleeps knee-chest; worst at night; better at seaside.', traits: ['warm','intense_nature','hurried','anticipatory_anxiety','sleep_knee_chest','craving_cold_drinks','night_aggravation','better_seashore','wild_history'], miasms: ['sycosis'] },
  Graphites:   { description: 'Obese, chilly; oozing honey-like skin cracks; weeps at music.', traits: ['chilly','obese_flabby','oozing_skin','weeps_at_music','slow_methodical','thirstless','dry_cracked_skin','timid_yielding','menses_delayed'], miasms: ['psora','sycosis'] },
  Causticum:   { description: 'Deeply sympathetic, idealistic; paralytic tendency; warts; better in damp weather.', traits: ['chilly','sympathetic','idealistic','paralytic_tendency','warts_face_hands','involuntary_urination','consolation_better','better_damp_weather','rawness_burning'], miasms: ['psora','sycosis'] },
};

const SESSION_TRAIT_MAP: Record<string, Record<string, string[]>> = {
  thermal:       { Chilly: ['chilly'], Warm: ['warm'], Variable: ['chilly_warm'] },
  build:         { lean_tall: ['tall_slim','lean_tall'], stout_heavy: ['obese_flabby'], soft_flabby: ['obese_flabby'], average: [] },
  perspiration:  { profuse_sweater: ['sweaty_head'], offensive_sweat: ['offensive_foot_sweat','sour_sweat'], sweats_head: ['sweaty_head'], little_sweat: ['suppressed_perspiration'] },
  emotional_type:{ anxious: ['anxious_health','anxious_restless','anticipatory_anxiety','fearful','fear_death'], irritable: ['irritable','hypersensitive'], mild_yielding: ['mild_yielding','timid_yielding','sympathetic'], indifferent: ['indifferent_family','weary','reserved'], philosophical: ['philosophical','intellectual_weak_body','idealistic'], intense: ['intense_nature','talkative','hurried'], grief_stricken: ['grief_dwells','weeps_alone'] },
  consolation:   { better: ['consolation_better'], worse: ['consolation_worse'], neutral: [] },
  thirst:        { thirstless: ['thirstless'], thirsty_small_sips: ['thirsty_small_sips'], thirsty_large_quantities: ['thirsty_large_quantities'], thirsty_cold: ['craving_cold_drinks'] },
  laterality:    { left_sided: ['left_sided'], right_sided: ['right_sided'], bilateral: [] },
};

function normalizeSession(session: ClinicalSession): Record<string, string> {
  const out: Record<string, string> = {};
  out.thermal = session.thermal_state ?? '';

  const thr = session.thirst ?? '';
  if (thr === 'Thirstless') out.thirst = 'thirstless';
  else if (thr === 'Thirsty_small_sips') out.thirst = 'thirsty_small_sips';
  else if (thr === 'great_thirst_cold') out.thirst = 'thirsty_cold';
  else if (thr === 'Thirsty') out.thirst = 'thirsty_large_quantities';
  else out.thirst = thr.toLowerCase();

  const lat = session.laterality ?? '';
  if (lat === 'Left') out.laterality = 'left_sided';
  else if (lat === 'Right') out.laterality = 'right_sided';
  else if (lat === 'Bilateral') out.laterality = 'bilateral';
  else out.laterality = lat.toLowerCase().replace(' ', '_');

  out.consolation = session.consolation_response ?? '';

  const ms = session.mental_state ?? [];
  if (ms.includes('apathetic') || ms.includes('indifferent')) out.emotional_type = 'indifferent';
  else if (ms.some(m => ['anxious_restlessness','anxious','fearful','fear_death','anticipatory_anxiety'].includes(m))) out.emotional_type = 'anxious';
  else if (ms.includes('irritable_extreme') || ms.includes('irritable')) out.emotional_type = 'irritable';
  else if (ms.includes('hurried')) out.emotional_type = 'intense';
  else if (ms.includes('silent_brooding') || ms.includes('sighing')) out.emotional_type = 'grief_stricken';
  else if (ms.includes('fastidious')) out.emotional_type = 'philosophical';
  else if (ms.includes('weepy') || ms.includes('sad')) out.emotional_type = 'mild_yielding';
  else out.emotional_type = '';

  return out;
}

function buildTraitSet(data: Record<string, string>): Set<string> {
  const active = new Set<string>();
  for (const [field, mapping] of Object.entries(SESSION_TRAIT_MAP)) {
    const answer = data[field];
    if (!answer) continue;
    const traits = mapping[answer];
    if (Array.isArray(traits)) traits.forEach(t => active.add(t));
  }
  return active;
}

export interface ConstitutionalScore {
  type: string;
  score: number;
  percentage: number;
  description: string;
  matched_traits: string[];
}

export function scoreConstitution(session: ClinicalSession): ConstitutionalScore[] {
  const data = normalizeSession(session);
  const active = buildTraitSet(data);

  return Object.entries(TYPES).map(([name, td]) => {
    const matched = td.traits.filter(t => active.has(t));
    const pct = td.traits.length > 0 ? Math.round((matched.length / td.traits.length) * 100) : 0;
    return { type: name, score: matched.length, percentage: pct, description: td.description, matched_traits: matched };
  }).sort((a, b) => b.score - a.score);
}

export function adjustScores(session: ClinicalSession, results: ScoringResult[]): ScoringResult[] {
  const typesRanked = scoreConstitution(session);
  const topType = typesRanked[0];
  if (!topType || topType.score === 0) return results;

  const topTypeName = topType.type.toLowerCase();

  return results.map(r => {
    const rid = r.remedy_id.toLowerCase();
    const match = topTypeName === rid
      || rid.includes(topTypeName.split('-')[0].toLowerCase())
      || topTypeName.includes(rid.split('-')[0].toLowerCase());

    if (!match) return r;
    const bonus = Math.min(r.normalised_score * 0.25, 25);
    return {
      ...r,
      normalised_score: Math.min(99, Math.round((r.normalised_score + bonus) * 10) / 10),
      raw_score: r.raw_score + bonus,
    };
  }).sort((a, b) => b.normalised_score - a.normalised_score);
}
