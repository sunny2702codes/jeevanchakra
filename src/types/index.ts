// ── Auth ──────────────────────────────────────────────────────────
export interface JCUser {
  phone: string;
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  city: string;
  role: 'admin' | 'user';
  cases: SavedCase[];
}

export interface JCSession {
  phone: string;
  name: string;
  role: 'admin' | 'user';
}

// ── Screen navigation ─────────────────────────────────────────────
export type JCScreen =
  | 'splash' | 'login' | 'register' | 'otp'
  | 'home' | 'safety' | 'halt' | 'complaint' | 'intake' | 'results'
  | 'cases' | 'library' | 'admin' | 'constitutional' | 'compare' | 'rubric-search';

// ── Remedy schema (matches hdss/data/remedies.js) ─────────────────
export type ThermalState = 'chilly' | 'warm' | 'variable' | 'hot' | 'cold';
export type Miasm = 'psora' | 'sycosis' | 'syphilis' | 'tubercular';
export type ConstitutionType =
  | 'sulphur_type' | 'calcarea_type' | 'phosphorus_type'
  | 'lycopodium_type' | 'arsenicum_type' | 'nux_type'
  | 'pulsatilla_type' | 'sepia_type' | string;

export interface Keynote {
  symptom: string;
  grade: 1 | 2 | 3;
}

export interface Causation {
  trigger: string;
  grade: 1 | 2 | 3;
}

export interface RemedyMentals {
  anxiety_type?: string;
  fear_type?: string;
  mood?: string;
  consolation_response?: 'better' | 'worse' | 'indifferent';
  desires_company?: boolean;
}

export interface RemedyGenerals {
  thermal?: string;
  thirst?: string;
  food_desires?: string[];
  food_aversions?: string[];
}

export interface RemedyBranches {
  [branch: string]: string[];
}

export interface Remedy {
  id: string;
  latin_name: string;
  common_name: string;
  abbreviation: string;
  kingdom?: string;
  thermal_state?: ThermalState;
  thirst?: string;
  laterality?: string;
  causation?: Causation[];
  keynotes?: Keynote[];
  mentals?: RemedyMentals;
  generals?: RemedyGenerals;
  worse_from?: string[];
  better_from?: string[];
  time_modality?: string[];
  complaints?: string[];
  branches?: RemedyBranches;
  complementary_remedies?: string[];
  antidotes?: string[];
  inimical_remedies?: string[];
  miasm?: Miasm[];
  constitution_type?: ConstitutionType;
  boericke_page?: number;
  description?: string;
  priority?: string;
}

// ── Red flags ─────────────────────────────────────────────────────
export type FlagSeverity = 'emergency' | 'urgent' | 'caution';

export interface RedFlag {
  id: string;
  severity: FlagSeverity;
  label: string;
  description: string;
  keywords?: string[];
  branch?: string;
}

// ── Clinical session state ────────────────────────────────────────
export interface ClinicalSession {
  id: string;
  started: string;
  complaint: string | null;
  branch: string | null;
  safety_flags: string[];
  duration: string | null;
  causation: string[];
  thermal_state: ThermalState | null;
  thirst: string | null;
  worse_from: string[];
  better_from: string[];
  time_modality: string[];
  mental_state: string[];
  consolation_response: string | null;
  laterality: string | null;
  food_desires: string[];
  food_aversions: string[];
  concomitants_general: string[];
  branch_answers: Record<string, string[]>;
  collected_keynotes: string[];
  miasm_hint?: Miasm;
  constitution_hint?: ConstitutionType;
}

// ── Scoring ───────────────────────────────────────────────────────
export type ScoreTier = 'Strong' | 'Probable' | 'Possible';

export interface MatchedSymptom {
  field: string;
  value: string;
  weight: number;
  kent_grade: number;
  points: number;
}

export interface ScoringResult {
  remedy_id: string;
  raw: number;
  normalised: number;
  tier: ScoreTier;
  matched: MatchedSymptom[];
}

export interface RankedResults {
  results: ScoringResult[];
  max_possible: number;
  session_id: string;
}

// ── Saved case ────────────────────────────────────────────────────
export interface SavedCase {
  id: string;
  date: string;
  complaint: string;
  session: ClinicalSession;
  results: ScoringResult[];
  topRemedy?: string;
  notes?: string;
}

// ── Intake pool (matches hdss/data/intake.js) ─────────────────────
export interface IntakeOption {
  id: string;
  label: string;
  field: string;
  value: string;
  weight?: number;
  grade?: 1 | 2 | 3;
}

export interface IntakeQuestion {
  id: string;
  prompt: string;
  type: 'single' | 'multi' | 'text';
  field: string;
  options: IntakeOption[];
  branch?: string;
  tier?: 1 | 2 | 3;
}
