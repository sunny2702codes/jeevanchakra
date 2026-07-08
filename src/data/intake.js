/* HDSS Intake Engine , Three-Tier Adaptive Architecture
 * Per Spec §5.
 *
 * window.INTAKE      , legacy-compat: complaints[] only (app.js references this)
 * window.INTAKE_POOLS , new adaptive engine:
 *   Tier 1: universal[]    , asked for every complaint, clinical priority order
 *   Tier 2: pools{}        , one pool per complaint
 *   Tier 3: keynote_bank[] , remedy-keyed probe questions
 *
 * Question schema:
 *   id, prompt, tier, type, session_field, weight, condition, remedy_hints, options[]
 */

/* ════════════════════════════════════════════════════════════
   LEGACY COMPAT , app.js references window.INTAKE.complaints
   ════════════════════════════════════════════════════════════ */
export const INTAKE = {
  complaints: [
    {value: "headache",     label: "Headache / Migraine",                    branch: "headache"},
    {value: "gi",           label: "Stomach / Digestion / Bowel",            branch: "gi"},
    {value: "respiratory",  label: "Cough / Cold / Breathing",               branch: "respiratory"},
    {value: "fever",        label: "Fever / Flu-like illness",               branch: "fever"},
    {value: "mental",       label: "Anxiety / Grief / Mood",                 branch: "mental"},
    {value: "skin",         label: "Skin eruption / Itch",                   branch: "skin"},
    {value: "musculoskel",  label: "Joint / Muscle / Back pain",             branch: "musculoskel"},
    {value: "urinary",      label: "Urinary symptoms",                       branch: "urinary"},
    {value: "injury",       label: "Injury / Trauma",                        branch: "injury"},
    {value: "other",        label: "Other / Not listed",                     branch: "general"},
    {value: "female",       label: "Female / Menstrual / Hormonal",          branch: "female"},
    {value: "paediatric",   label: "Paediatric / Child symptoms",            branch: "paediatric"},
    {value: "sleep",        label: "Sleep disturbance / Insomnia",           branch: "sleep"},
    {value: "vertigo",      label: "Vertigo / Dizziness",                    branch: "vertigo"},
    {value: "face_mouth",   label: "Facial pain / Mouth / Teeth",            branch: "face_mouth"},
    {value: "heart",        label: "Heart / Palpitations / Hypertension",    branch: "heart"}
  ]
};

/* ════════════════════════════════════════════════════════════
   THREE-TIER INTAKE POOLS
   ════════════════════════════════════════════════════════════ */
export const INTAKE_POOLS = {

  /* ─────────────────────────────────────────────────────────
     TIER 1 , UNIVERSAL  (asked for every complaint)
     Clinical priority order per Spec §5 / scoring §6.1
     ───────────────────────────────────────────────────────── */
  universal: [

    /* 1. Causation , weight × 6 in scoring */
    {
      id: "causation",
      prompt: "What triggered or started this illness? Select anything that applies.",
      tier: 1,
      type: "multi",
      session_field: "causation",
      weight: "high",
      condition: null,
      remedy_hints: [],
      options: [
        {value: "grief",                             label: "Grief, loss, sad news"},
        {value: "fright",                            label: "Fright, shock, sudden scare"},
        {value: "anger",                             label: "Anger or upset"},
        {value: "anger_with_indignation",            label: "Anger with indignation (felt wronged)"},
        {value: "humiliation",                       label: "Humiliation or wounded pride"},
        {value: "suppressed_anger_indignation",      label: "Suppressed indignation (had to hold it in)"},
        {value: "disappointed_love",                 label: "Disappointed love / heartbreak"},
        {value: "anticipation",                      label: "Anticipation of an event (exam, performance)"},
        {value: "cold_dry_wind",                     label: "Exposure to cold dry wind"},
        {value: "wet_chilling_exposure",             label: "Got wet / chilled"},
        {value: "wet_feet",                          label: "Wet feet specifically"},
        {value: "exposure_sun",                      label: "Sun exposure / heat"},
        {value: "over_lifting_straining",            label: "Lifting, straining, over-exertion"},
        {value: "injury_trauma_mechanical",          label: "Blow, fall, blunt injury"},
        {value: "puncture_wounds",                   label: "Puncture wound (nail, splinter, bite)"},
        {value: "burns_scalds",                      label: "Burn or scald"},
        {value: "food_poisoning",                    label: "Bad food / spoiled food / iced drinks"},
        {value: "rich_fatty_food",                   label: "Rich, fatty food / over-indulgence"},
        {value: "over_indulgence_food_drink_drugs",  label: "Excess food, alcohol, drugs"},
        {value: "mental_overwork_sedentary",         label: "Mental overwork, sitting too long"},
        {value: "loss_of_sleep_night_watching",      label: "Loss of sleep / night-watching"},
        {value: "loss_of_vital_fluids",              label: "Loss of fluids (bleeding, diarrhoea, lactation)"},
        {value: "suppressed_eruptions",              label: "Skin eruption that was suppressed"},
        {value: "suppressed_discharges_menses_skin", label: "Suppressed discharge / menses"},
        {value: "vaccination",                       label: "Onset shortly after vaccination"},
        {value: "dentition",                         label: "Teething (children)"},
        {value: "hormonal_changes_pregnancy_menopause", label: "Pregnancy / menopause / hormonal shift"},
        {value: "after_sex_cystitis",                label: "After sexual intercourse"},
        {value: "motion_sickness_car_sea",           label: "Travel / motion sickness"},
        {value: "none_known",                        label: "No clear trigger"}
      ]
    },

    /* 2. Thermal state , affects constitutional match */
    {
      id: "thermal_state",
      prompt: "In general, are you a warm person or a chilly person?",
      tier: 1,
      type: "single",
      session_field: "thermal_state",
      weight: "high",
      condition: null,
      remedy_hints: [],
      options: [
        {value: "Chilly",   label: "Chilly , sensitive to cold; like warmth, warm clothes, warm food"},
        {value: "Warm",     label: "Warm , dislike heat; like open air, cool drinks, throw off covers"},
        {value: "Variable", label: "Variable , no clear preference"}
      ]
    },

    /* 3. Thirst , high discriminator */
    {
      id: "thirst",
      prompt: "What is your thirst like right now?",
      tier: 1,
      type: "single",
      session_field: "thirst",
      weight: "high",
      condition: null,
      remedy_hints: [],
      options: [
        {value: "Thirsty",            label: "Thirsty , drink normal-to-large amounts"},
        {value: "Thirsty_small_sips", label: "Thirsty for small sips often"},
        {value: "Thirstless",         label: "Thirstless , barely want to drink"},
        {value: "great_thirst_cold",  label: "Great thirst for large cold drinks"},
        {value: "Variable",           label: "Variable"}
      ]
    },

    /* 4. Worse from , weight × 4 */
    {
      id: "worse_from",
      prompt: "What makes it WORSE? Select anything that applies.",
      tier: 1,
      type: "multi",
      session_field: "worse_from",
      weight: "high",
      condition: null,
      remedy_hints: [],
      options: [
        {value: "motion",             label: "Movement (any motion)"},
        {value: "initial_motion",     label: "Starting to move (better after moving)"},
        {value: "rest",               label: "Rest / keeping still"},
        {value: "cold",               label: "Cold in general"},
        {value: "cold_air",           label: "Cold air / drafts"},
        {value: "cold_drinks",        label: "Cold drinks / cold food"},
        {value: "warmth_of_bed",      label: "Warmth of bed"},
        {value: "warm_room",          label: "Warm rooms"},
        {value: "open_air",           label: "Open air"},
        {value: "light",              label: "Light"},
        {value: "noise",              label: "Noise"},
        {value: "touch",              label: "Touch"},
        {value: "jar",                label: "Jar / vibration / footsteps"},
        {value: "pressure",           label: "Pressure"},
        {value: "after_eating",       label: "After eating"},
        {value: "after_midnight_1_2AM", label: "After midnight (1–2 AM)"},
        {value: "4_to_8PM",           label: "Late afternoon / early evening (4–8 PM)"},
        {value: "morning_on_waking",  label: "Morning, on waking"},
        {value: "morning_3_4AM",      label: "Early morning (3–4 AM)"},
        {value: "evening",            label: "Evening"},
        {value: "night",              label: "Night"},
        {value: "before_midnight",    label: "Before midnight"},
        {value: "consolation",        label: "Being consoled / sympathised with"},
        {value: "lying_down",         label: "Lying down"},
        {value: "lying_on_left_side", label: "Lying on the left side"},
        {value: "stooping",           label: "Stooping / bending forward"},
        {value: "ascending",          label: "Climbing stairs"},
        {value: "exertion",           label: "Physical exertion"},
        {value: "tight_clothing",     label: "Tight clothing"},
        {value: "uncovering",         label: "Uncovering / undressing"},
        {value: "right_side",         label: "On the right side of the body"},
        {value: "left_side",          label: "On the left side of the body"},
        {value: "wet_damp",           label: "Wet / damp weather"},
        {value: "warm_damp_weather",  label: "Warm damp weather"},
        {value: "dry_cold_wind",      label: "Dry cold wind"},
        {value: "sun_heat",           label: "Heat of the sun"},
        /* Kent Repertory modality_worse additions (Generalities chapter) */
        {value: "walking",            label: "Walking (any walking aggravates)"},
        {value: "standing",           label: "Standing in one place"},
        {value: "rising",             label: "Rising from seat or bed"},
        {value: "tobacco",            label: "Tobacco smoke / cigarettes"},
        {value: "running",            label: "Running or rapid exertion"},
        {value: "rubbing_agg",        label: "Rubbing the part"},
        {value: "change_of_position", label: "Changing position"},
        {value: "descending",         label: "Descending / going downstairs"},
        {value: "cloudy_weather",     label: "Cloudy or overcast weather"},
        {value: "foggy_weather",      label: "Foggy or misty weather"}
      ]
    },

    /* 5. Better from , weight × 4 */
    {
      id: "better_from",
      prompt: "What makes it BETTER? Select anything that applies.",
      tier: 1,
      type: "multi",
      session_field: "better_from",
      weight: "high",
      condition: null,
      remedy_hints: [],
      options: [
        {value: "rest",                  label: "Rest / keeping still"},
        {value: "continued_motion",      label: "Continued motion (after starting)"},
        {value: "motion",                label: "Motion in general"},
        {value: "warmth",                label: "Warmth"},
        {value: "warm_drinks",           label: "Warm drinks"},
        {value: "warm_applications",     label: "Warm applications / hot bottle"},
        {value: "cold_applications",     label: "Cold applications / ice"},
        {value: "open_air",              label: "Open air / fresh air"},
        {value: "pressure",              label: "Pressure"},
        {value: "hard_pressure",         label: "Hard pressure / lying on painful side"},
        {value: "doubling_up",           label: "Doubling up / bending forward"},
        {value: "lying_on_painful_side", label: "Lying on the painful side"},
        {value: "lying_down",            label: "Lying down"},
        {value: "sitting_up",            label: "Sitting up"},
        {value: "uncovering",            label: "Uncovering (in bed)"},
        {value: "wrapping_head",         label: "Wrapping head / warm wraps"},
        {value: "eructation",            label: "Belching / passing wind"},
        {value: "vomiting",              label: "Vomiting"},
        {value: "sleep",                 label: "Short sleep / a nap"},
        {value: "company",               label: "Company / being with others"},
        {value: "consolation",           label: "Being consoled / sympathised with"},
        {value: "dark_room",             label: "Dark room"},
        {value: "passing_flatus",        label: "Passing flatus"},
        /* Kent Repertory modality_better additions */
        {value: "eating",              label: "Eating / after a meal"},
        {value: "rubbing",             label: "Rubbing the affected part"},
        {value: "stretching",          label: "Stretching out the part"},
        {value: "bending_backward",    label: "Bending backward / arching back"},
        {value: "cold_drinks",         label: "Cold drinks / cold water"}
      ]
    },

    /* 6. Time modality , weight × 4 */
    {
      id: "time_modality",
      prompt: "When is it WORST? Select up to three.",
      tier: 1,
      type: "multi",
      session_field: "time_modality",
      weight: "high",
      condition: null,
      remedy_hints: [],
      options: [
        {value: "morning_on_waking", label: "Morning, on waking"},
        {value: "morning",           label: "Morning"},
        {value: "10AM",              label: "Around 10 AM"},
        {value: "11AM",              label: "Around 11 AM"},
        {value: "afternoon_3PM",     label: "Mid-afternoon (3 PM)"},
        {value: "4_to_8PM",          label: "Late afternoon / evening (4–8 PM)"},
        {value: "evening",           label: "Evening"},
        {value: "9PM",               label: "Around 9 PM"},
        {value: "before_midnight",   label: "Before midnight"},
        {value: "night",             label: "Night"},
        {value: "after_midnight",    label: "After midnight"},
        {value: "1_2AM",             label: "1–2 AM"},
        {value: "3_4AM",             label: "3–4 AM"},
        {value: "5AM_morning",       label: "5 AM (drives out of bed)"},
        {value: "periodic",          label: "Periodically (same time recurs)"}
      ]
    },

    /* 7. Mental state , weight × 3 */
    {
      id: "mental_state",
      prompt: "How are you emotionally during this illness?",
      tier: 1,
      type: "multi",
      session_field: "mental_state",
      weight: "high",
      condition: null,
      remedy_hints: [],
      options: [
        {value: "irritable",              label: "Irritable / short-tempered"},
        {value: "irritable_extreme",      label: "Extremely irritable , nothing satisfies"},
        {value: "weepy",                  label: "Weepy / tearful"},
        {value: "sad",                    label: "Sad / low"},
        {value: "anxious",                label: "Anxious"},
        {value: "anxious_restlessness",   label: "Anxious + restless , keep changing place"},
        {value: "restless",               label: "Restless , can't sit still"},
        {value: "apathetic",              label: "Apathetic / indifferent / don't care"},
        {value: "indifferent",            label: "Indifferent even to loved ones"},
        {value: "wants_to_be_alone",      label: "Want to be left alone"},
        {value: "wants_consolation",      label: "Want company and consolation"},
        {value: "worse_from_consolation", label: "Consolation makes me worse"},
        {value: "fearful",                label: "Fearful"},
        {value: "fear_death",             label: "Fear of death"},
        {value: "fear_being_alone",       label: "Fear of being alone"},
        {value: "anticipatory_anxiety",   label: "Anticipatory anxiety (before events)"},
        {value: "silent_brooding",        label: "Silent, brooding, can't talk about it"},
        {value: "sighing",                label: "Sighing / lump in throat"},
        {value: "hurried",                label: "Hurried , feel I must rush"},
        {value: "fastidious",             label: "Fastidious , everything must be in order"}
      ]
    },

    /* 8. Consolation response , new, high discriminator */
    {
      id: "consolation_response",
      prompt: "When someone tries to console or sympathise with you...",
      tier: 1,
      type: "single",
      session_field: "consolation_response",
      weight: "high",
      condition: null,
      remedy_hints: [],
      options: [
        {value: "better",  label: "It helps , I feel better"},
        {value: "worse",   label: "Worse , I want them to stop"},
        {value: "neutral", label: "No effect"}
      ]
    },

    /* 9. Emotional worsening , new */
    {
      id: "emotional_worsening",
      prompt: "What makes you feel WORSE emotionally?",
      tier: 1,
      type: "multi",
      session_field: "worse_from",
      weight: "medium",
      condition: null,
      remedy_hints: [],
      options: [
        {value: "consolation",   label: "Consolation / sympathy"},
        {value: "noise",         label: "Noise"},
        {value: "light",         label: "Bright light"},
        {value: "being_alone",   label: "Being alone"},
        {value: "bad_news",      label: "Bad news"},
        {value: "crowd",         label: "Crowds / being around people"},
        {value: "contradiction", label: "Contradiction / being opposed"}
      ]
    },

    /* 10. Emotional calming , new */
    {
      id: "emotional_calming",
      prompt: "What helps you feel calmer or better emotionally?",
      tier: 1,
      type: "multi",
      session_field: "better_from",
      weight: "medium",
      condition: null,
      remedy_hints: [],
      options: [
        {value: "company",        label: "Company / being with others"},
        {value: "solitude",       label: "Solitude / being alone"},
        {value: "music",          label: "Music"},
        {value: "occupation",     label: "Occupation / keeping busy"},
        {value: "prayer",         label: "Prayer / meditation"},
        {value: "open_air",       label: "Open air / fresh air"},
        {value: "dark_quiet_room",label: "Dark, quiet room"}
      ]
    },

    /* 11. Laterality , weight x 2. Skip for purely mental, sleep, or systemic complaints. */
    {
      id: "laterality",
      prompt: "Which side of the body is mainly affected?",
      tier: 1,
      type: "single",
      session_field: "laterality",
      weight: "medium",
      condition: {field: "complaint", not_in: ["mental", "sleep", "female", "paediatric"]},
      remedy_hints: [],
      options: [
        {value: "Right",       label: "Right side"},
        {value: "Left",        label: "Left side"},
        {value: "Bilateral",   label: "Both sides / no clear side"},
        {value: "alternating", label: "Alternates sides"}
      ]
    },

    /* 12. Food desires */
    {
      id: "food_desires",
      prompt: "Are you craving any of these right now?",
      tier: 1,
      type: "multi",
      session_field: "food_desires",
      weight: "medium",
      condition: null,
      remedy_hints: [],
      options: [
        {value: "sweets",             label: "Sweets"},
        {value: "salt",               label: "Salt / salty things"},
        {value: "sour",               label: "Sour / vinegar / pickles"},
        {value: "fats",               label: "Fats / fatty food"},
        {value: "cold_drinks",        label: "Ice-cold drinks"},
        {value: "warm_drinks",        label: "Warm drinks"},
        {value: "eggs",               label: "Eggs"},
        {value: "fruit",              label: "Fruit"},
        {value: "spicy",              label: "Spicy / pungent"},
        {value: "ice_cream",          label: "Ice cream"},
        {value: "alcohol",            label: "Alcohol"},
        {value: "indigestible_chalk", label: "Strange / indigestible things (chalk, dirt)"},
        {value: "nothing",            label: "Nothing in particular"}
      ]
    },

    /* 13. Food aversions */
    {
      id: "food_aversions",
      prompt: "Are you averse to any of these?",
      tier: 1,
      type: "multi",
      session_field: "food_aversions",
      weight: "medium",
      condition: null,
      remedy_hints: [],
      options: [
        {value: "meat",          label: "Meat"},
        {value: "fat",           label: "Fat / fatty food"},
        {value: "milk",          label: "Milk"},
        {value: "warm_food",     label: "Warm food"},
        {value: "cold_drinks",   label: "Cold drinks"},
        {value: "eggs",          label: "Eggs"},
        {value: "bread",         label: "Bread"},
        {value: "smell_of_food", label: "Even the smell of food"},
        {value: "tobacco_smoke", label: "Tobacco smoke"},
        {value: "nothing",       label: "Nothing in particular"}
      ]
    },

    /* 14. Concomitants , weight × 3 */
    {
      id: "concomitants_general",
      prompt: "What else is present at the same time? Select anything that applies.",
      tier: 1,
      type: "multi",
      session_field: "branch_answers",
      weight: "medium",
      condition: null,
      remedy_hints: [],
      options: [
        {value: "nausea",                label: "Nausea"},
        {value: "vomiting",              label: "Vomiting"},
        {value: "dizziness",             label: "Dizziness"},
        {value: "trembling",             label: "Trembling"},
        {value: "weakness_prostration",  label: "Marked weakness / prostration"},
        {value: "drowsiness",            label: "Drowsiness"},
        {value: "burning_sensation",     label: "Burning sensation"},
        {value: "cold_sweat",            label: "Cold sweat"},
        {value: "offensive_perspiration",label: "Offensive-smelling sweat"},
        {value: "flushed_face",          label: "Flushed face"},
        {value: "pale_face",             label: "Pale face"},
        {value: "swelling_edema",        label: "Puffy swelling / edema"},
        {value: "throbbing",             label: "Throbbing / pulsation"},
        {value: "stitching_pain",        label: "Stitching pain"},
        {value: "cramping_pain",         label: "Cramping pain"},
        {value: "none",                  label: "Nothing else notable"}
      ]
    },

    /* 15. Company preference , new */
    {
      id: "company_preference",
      prompt: "Do you prefer company or solitude?",
      tier: 1,
      type: "single",
      session_field: "mental_state",
      weight: "medium",
      condition: null,
      remedy_hints: [],
      options: [
        {value: "wants_consolation",  label: "Prefer company , dislike being alone"},
        {value: "wants_to_be_alone",  label: "Prefer solitude , company aggravates"},
        {value: "neutral",            label: "No clear preference"}
      ]
    },

    /* 16. Duration , informational; migrated from legacy mandatory[] */
    {
      id: "duration",
      prompt: "How long have you had this?",
      tier: 1,
      type: "single",
      session_field: "duration",
      weight: "low",
      condition: null,
      remedy_hints: [],
      options: [
        {value: "acute",    label: "Less than 7 days (acute)"},
        {value: "subacute", label: "7 to 30 days (sub-acute)"},
        {value: "chronic",  label: "More than 30 days (chronic)"}
      ]
    },

    /* 17. Build , constitutional physical type */
    {
      id: "build",
      prompt: "What best describes the patient's physical build?",
      tier: 1,
      type: "single",
      session_field: "build",
      weight: "medium",
      condition: null,
      remedy_hints: [],
      options: [
        {value: "lean_tall",    label: "Lean or tall, slender frame"},
        {value: "stout_heavy",  label: "Stout or heavy, broad constitution"},
        {value: "soft_flabby",  label: "Soft, flabby, or poorly nourished"},
        {value: "average",      label: "Average build, no distinctive feature"}
      ]
    },

    /* 18. Perspiration , constitutional discriminator */
    {
      id: "perspiration",
      prompt: "What best describes perspiration?",
      tier: 1,
      type: "single",
      session_field: "perspiration",
      weight: "medium",
      condition: null,
      remedy_hints: [],
      options: [
        {value: "profuse_sweater", label: "Sweats profusely on any exertion"},
        {value: "offensive_sweat", label: "Sweat is offensive, sour, or staining"},
        {value: "sweats_head",     label: "Sweats mainly on the head during sleep"},
        {value: "little_sweat",    label: "Sweats very little or not at all"}
      ]
    },

    /* 19. Appetite , constitutional / general */
    {
      id: "appetite",
      prompt: "What best describes the patient's appetite?",
      tier: 1,
      type: "single",
      session_field: "appetite",
      weight: "medium",
      condition: null,
      remedy_hints: [],
      options: [
        {value: "ravenous",    label: "Ravenous hunger, especially around 11 AM"},
        {value: "poor",        label: "Poor appetite, must force themselves to eat"},
        {value: "normal",      label: "Normal appetite, no particular characteristic"},
        {value: "hungry_11am", label: "Peculiar hunger at 11 AM even if not otherwise hungry"}
      ]
    },

    /* 20. Sleep position , keynote constitutional discriminator */
    {
      id: "sleep_position",
      prompt: "What sleep position is preferred or characteristic?",
      tier: 1,
      type: "single",
      session_field: "sleep_position",
      weight: "medium",
      condition: null,
      remedy_hints: [],
      options: [
        {value: "knee_chest",  label: "Knee-chest position (curled up, bottom raised)"},
        {value: "back",        label: "On the back, arms spread"},
        {value: "left_side",   label: "On the left side"},
        {value: "right_side",  label: "On the right side"},
        {value: "prone",       label: "Face down (prone)"}
      ]
    },

    /* 21. Skin tendency , miasmatic / constitutional */
    {
      id: "skin_tendency",
      prompt: "Any characteristic skin tendency? Select all that apply.",
      tier: 1,
      type: "multi",
      session_field: "skin_tendency",
      weight: "medium",
      condition: null,
      remedy_hints: [],
      options: [
        {value: "eruptions",   label: "Prone to skin eruptions, rashes, or eczema"},
        {value: "oozing",      label: "Oozing, moist, or weeping eruptions"},
        {value: "dry_cracked", label: "Dry, cracked, or fissured skin"},
        {value: "warts",       label: "Warts, condylomata, or warty growths"},
        {value: "suppurative", label: "Tendency to abscess or suppuration"},
        {value: "normal",      label: "No particular skin tendency"}
      ]
    },

    /* 22. Grief response , high discriminator (Pulsatilla / Nat-m / Ignatia) */
    {
      id: "grief_response",
      prompt: "How does the patient typically respond to grief or emotional distress?",
      tier: 1,
      type: "single",
      session_field: "grief_response",
      weight: "medium",
      condition: null,
      remedy_hints: [],
      options: [
        {value: "weeps_openly",   label: "Weeps freely; better for weeping and company"},
        {value: "weeps_alone",    label: "Weeps but prefers to be alone; averse to consolation"},
        {value: "cannot_weep",    label: "Cannot weep; grief is suppressed or internalized"},
        {value: "not_applicable", label: "Not applicable or no clear pattern"}
      ]
    },

    /* 23. Miasmatic background , optional constitutional hint */
    {
      id: "miasm_hint",
      prompt: "Miasmatic background (optional - skip if unsure)?",
      tier: 1,
      type: "single",
      session_field: "miasm_hint",
      weight: "low",
      condition: null,
      remedy_hints: [],
      options: [
        {value: "psora",      label: "Psoric - functional complaints, deficiency, itching, anxiety, suppressed eruptions"},
        {value: "sycosis",    label: "Sycotic - excess, growths, warts, discharges, fixed ideas, secretive"},
        {value: "syphilis",   label: "Syphilitic - destruction, ulceration, bone pains, night symptoms, despair"},
        {value: "tubercular", label: "Tubercular - restless, desire for change, rapid onset and change, romantic"},
        {value: "skip",       label: "Unsure / prefer to skip"}
      ]
    },

    /* 24. Constitutional type , optional clinical hint */
    {
      id: "constitution_type",
      prompt: "Patient constitutional type (optional - skip if unsure)?",
      tier: 1,
      type: "single",
      session_field: "constitution_type",
      weight: "low",
      condition: null,
      remedy_hints: [],
      options: [
        {value: "sulphur_type",    label: "Sulphur type - warm, lean or obese, philosophical, untidy, skin tendency"},
        {value: "calcarea_type",   label: "Calcarea type - chilly, fair or fat, flabby, slow, sweaty head at night"},
        {value: "phosphorus_type", label: "Phosphorus type - tall thin, warm, sociable, bleed easily, fear alone"},
        {value: "lycopodium_type", label: "Lycopodium type - right-sided, 4-8 PM aggravation, digestive, intellectually capable"},
        {value: "nux_type",        label: "Nux type - chilly, irritable, driven, sedentary, overindulgent"},
        {value: "skip",            label: "Unsure / prefer to skip"}
      ]
    }

  ], // end universal

  /* ─────────────────────────────────────────────────────────
     TIER 2 , COMPLAINT POOLS
     All questions have tier:2, session_field:"branch_answers"
     ───────────────────────────────────────────────────────── */
  pools: {

    headache: [
      {
        id: "h_location",
        prompt: "Where is the headache located?",
        tier: 2, type: "single", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "frontal",      label: "Forehead / behind the eyes"},
          {value: "vertex",       label: "Top of the head (vertex)"},
          {value: "occipital",    label: "Back of the head (occipital)"},
          {value: "right_temple", label: "Right temple"},
          {value: "left_temple",  label: "Left temple"},
          {value: "whole_head",   label: "Whole head"},
          {value: "small_spot",   label: "Small spot , can cover with a fingertip"}
        ]
      },
      {
        id: "h_sensation",
        prompt: "How does the headache feel?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "throbbing_bursting",   label: "Throbbing / bursting"},
          {value: "stitching_tearing",    label: "Stitching / tearing"},
          {value: "pressing",             label: "Pressing / heavy"},
          {value: "hammering",            label: "Like hammers"},
          {value: "constricting",         label: "Band-like / constricting"},
          {value: "splitting",            label: "Splitting"},
          {value: "as_if_nail_driven_in", label: "As if a nail driven in (one spot)"},
          {value: "icy_cold_in_head",     label: "Sensation of cold in head"}
        ]
      },
      {
        id: "h_worse",
        prompt: "What makes the headache WORSE? (select all that apply)",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "h_vertex",        label: "Located at vertex (top of head) - aggravated there"},
          {value: "h_occiput",       label: "Located at occiput (back of head)"},
          {value: "h_right_temple",  label: "Right temple"},
          {value: "h_left_temple",   label: "Left temple"},
          {value: "bending_forward", label: "Bending forward"},
          {value: "stooping",        label: "Stooping / bending over"},
          {value: "sun",             label: "Sun or bright light exposure"},
          {value: "after_sleep",     label: "After sleep / on waking"},
          {value: "before_menses",   label: "Before menstruation"},
          {value: "coffee",          label: "Coffee or stimulants"}
        ]
      },
      {
        id: "h_better",
        prompt: "What gives the headache RELIEF?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "cold_applications", label: "Cold applications / ice pack"},
          {value: "tight_bandage",     label: "Tight binding / bandage around head"},
          {value: "vomiting",          label: "After vomiting"},
          {value: "open_air",          label: "Open air / fresh air"}
        ]
      }
    ],

    gi: [
      {
        id: "gi_main",
        prompt: "What is the main digestive symptom?",
        tier: 2, type: "single", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "nausea",           label: "Nausea"},
          {value: "vomiting",         label: "Vomiting"},
          {value: "heartburn",        label: "Heartburn / acidity"},
          {value: "bloating",         label: "Bloating / flatulence"},
          {value: "colic",            label: "Colic / cramping pain"},
          {value: "diarrhea",         label: "Diarrhoea"},
          {value: "constipation",     label: "Constipation"},
          {value: "loss_of_appetite", label: "Loss of appetite"}
        ]
      },
      {
        id: "gi_pain_character",
        prompt: "If there is pain, what kind?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "burning",    label: "Burning"},
          {value: "cramping",   label: "Cramping"},
          {value: "colicky",    label: "Colicky"},
          {value: "stitching",  label: "Stitching"},
          {value: "distending", label: "Distending / bursting"},
          {value: "none",       label: "No pain"}
        ]
      },
      {
        id: "gi_stool",
        prompt: "If diarrhoea/constipation, what is the stool like?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "hard_dry",                label: "Hard, dry"},
          {value: "watery",                  label: "Watery"},
          {value: "offensive",               label: "Very offensive smell"},
          {value: "bloody_slimy",            label: "Bloody / slimy"},
          {value: "painless",                label: "Painless"},
          {value: "burning",                 label: "Burning during/after"},
          {value: "ineffectual_urging",      label: "Constant urging, little passes"},
          {value: "involuntary_anus_open",   label: "Involuntary / anus remains open"},
          {value: "yellow_watery_squirting", label: "Yellow watery squirting"},
          {value: "undigested",              label: "Undigested food in stool"},
          {value: "white_clay",              label: "White / clay-coloured stool"},
          {value: "green",                   label: "Green stool"},
          {value: "morning_only",            label: "Morning only (drives out of bed)"}
        ]
      },
      {
        id: "gi_worse",
        prompt: "When is the digestive symptom WORSE? (select all that apply)",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "gi_after_eating",   label: "After eating"},
          {value: "fatty_food",        label: "Fatty or rich food"},
          {value: "fruit_cold",        label: "Fruit or cold drinks"},
          {value: "milk",              label: "Milk"},
          {value: "before_stool",      label: "Before stool (pain / urging)"},
          {value: "during_stool",      label: "During stool"},
          {value: "gi_night",          label: "Night"}
        ]
      },
      {
        id: "gi_better",
        prompt: "What gives RELIEF from the digestive symptom?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "bending_double",    label: "Bending double / doubling up"},
          {value: "gi_eructation",     label: "Belching / eructation"},
          {value: "passing_stool",     label: "After passing stool"},
          {value: "gi_warm_drinks",    label: "Warm drinks"}
        ]
      }
    ],

    respiratory: [
      {
        id: "r_cough_type",
        prompt: "What kind of cough?",
        tier: 2, type: "single", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "dry_barking",    label: "Dry, barking"},
          {value: "croupy",         label: "Croupy / sawing"},
          {value: "loose_rattling", label: "Loose, rattling"},
          {value: "spasmodic",      label: "Spasmodic / paroxysmal"},
          {value: "whooping",       label: "Whooping / fits ending in vomiting"},
          {value: "tickling",       label: "Tickling in larynx"},
          {value: "continuous_dry", label: "Continuous dry tickle"},
          {value: "with_vomiting",  label: "Ends in vomiting / retching"}
        ]
      },
      {
        id: "r_expectoration",
        prompt: "What is brought up (if anything)?",
        tier: 2, type: "single", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "dry_none",                 label: "Nothing , dry cough"},
          {value: "thick_yellow",             label: "Thick yellow"},
          {value: "thick_yellow_green_bland", label: "Thick yellow/green, bland"},
          {value: "stringy_ropy",             label: "Stringy / ropy"},
          {value: "blood_streaked",           label: "Blood-streaked"},
          {value: "offensive",                label: "Offensive-smelling"}
        ]
      },
      {
        id: "r_worse",
        prompt: "What makes the cough / breathing WORSE? (select all that apply)",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "r_lying_down",     label: "Lying down"},
          {value: "talking",          label: "Talking or using the voice"},
          {value: "r_warm_room",      label: "Warm room or stuffy air"},
          {value: "r_after_midnight", label: "After midnight (2-3 AM)"}
        ]
      },
      {
        id: "r_better",
        prompt: "What gives RELIEF from the cough / breathing?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "r_sitting_up",       label: "Sitting upright / leaning forward"},
          {value: "expectoration",      label: "After expectoration / coughing up mucus"},
          {value: "r_bending_forward",  label: "Bending forward"}
        ]
      }
    ],

    fever: [
      {
        id: "f_onset",
        prompt: "How did the fever start?",
        tier: 2, type: "single", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "sudden_violent",        label: "Sudden, violent (within hours)"},
          {value: "rapid_after_cold_wind", label: "Rapid, after exposure to dry cold wind"},
          {value: "gradual_dull",          label: "Gradual, dull-feeling onset"},
          {value: "after_wet_chill",       label: "After getting wet / chilled"},
          {value: "after_emotion",         label: "After emotion / bad news"}
        ]
      },
      {
        id: "f_thirst",
        prompt: "Thirst with the fever?",
        tier: 2, type: "single", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "great",      label: "Great thirst (large cold drinks)"},
          {value: "small_sips", label: "Small sips, often"},
          {value: "thirstless", label: "Thirstless"}
        ]
      },
      {
        id: "f_chill_pattern",
        prompt: "Chill pattern?",
        tier: 2, type: "single", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "sudden_violent_chill", label: "Sudden violent chill"},
          {value: "creeping_chill",       label: "Creeping chill (creeps up and down)"},
          {value: "no_distinct_chill",    label: "No distinct chill , just feverish"},
          {value: "periodic_chill",       label: "Periodic , same time each day/cycle"}
        ]
      },
      {
        id: "f_worse",
        prompt: "When is the fever WORST?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "f_after_midnight", label: "After midnight (1-3 AM)"},
          {value: "afternoon_1_4pm",  label: "Afternoon (1-4 PM)"}
        ]
      },
      {
        id: "f_type",
        prompt: "What kind of fever pattern?",
        tier: 2, type: "single", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "continuous",         label: "Continuous - remains high, no significant drop"},
          {value: "intermittent",       label: "Intermittent / periodic - returns at set intervals"},
          {value: "remittent",          label: "Remittent - fluctuates but never fully normal"},
          {value: "one_sided_heat",     label: "One-sided heat - one side of body hot, other cold"}
        ]
      }
    ],

    mental: [
      {
        id: "m_presentation",
        prompt: "Which best describes the picture?",
        tier: 2, type: "single", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "acute_grief",           label: "Acute grief, recent loss, sighing"},
          {value: "chronic_grief",         label: "Chronic grief, dwell on past, weep alone"},
          {value: "anxiety_anticipatory",  label: "Anticipatory anxiety , before events"},
          {value: "anxiety_health",        label: "Anxiety about health, restless at night"},
          {value: "fright_terror",         label: "After fright / terror"},
          {value: "anger_suppressed",      label: "Suppressed anger / indignation"},
          {value: "irritability_extreme",  label: "Extreme irritability , nothing satisfies"},
          {value: "apathy_indifference",   label: "Apathy / indifference"},
          {value: "violent_delirium",      label: "Violent excitement / delirium"}
        ]
      },
      {
        id: "m_consolation",
        prompt: "When someone tries to console you...",
        tier: 2, type: "single", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "better",  label: "It helps , feel better"},
          {value: "worse",   label: "Worse , I want them to stop"},
          {value: "neutral", label: "No effect"}
        ]
      },
      {
        id: "m_worse",
        prompt: "What makes the mental / emotional state WORSE? (select all that apply)",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "m_consolation",    label: "Consolation / sympathy from others"},
          {value: "m_company",        label: "Company / being around people"},
          {value: "m_solitude",       label: "Solitude / being alone"},
          {value: "m_music",          label: "Music"},
          {value: "m_noise",          label: "Noise / loud sounds"},
          {value: "m_before_menses",  label: "Before menstruation"}
        ]
      },
      {
        id: "m_company_pref",
        prompt: "Regarding company and social contact...",
        tier: 2, type: "single", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "desires_company",   label: "Strongly desires company - feels better with others"},
          {value: "aversion_company",  label: "Aversion to company - irritated by presence of others"},
          {value: "neutral_company",   label: "Neutral - no strong preference"}
        ]
      }
    ],

    skin: [
      {
        id: "s_type",
        prompt: "What kind of skin symptom?",
        tier: 2, type: "single", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "vesicular",      label: "Blisters / vesicles, burning itch"},
          {value: "dry_cracking",   label: "Dry, cracking, fissures"},
          {value: "urticaria",      label: "Hives / urticaria (raised wheals)"},
          {value: "abscess_pus",    label: "Abscess / pus formation"},
          {value: "rash_red_hot",   label: "Red, hot rash"},
          {value: "swelling_edema", label: "Puffy edema"}
        ]
      },
      {
        id: "s_worse",
        prompt: "What makes the skin symptom WORSE? (select all that apply)",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "washing",    label: "Washing / contact with water"},
          {value: "wool",       label: "Woollen clothing on skin"},
          {value: "scratching", label: "After scratching (spreads / burns more)"},
          {value: "full_moon",  label: "Full moon (cyclic aggravation)"}
        ]
      },
      {
        id: "s_better",
        prompt: "What gives RELIEF from the skin symptom?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "cold_washing",  label: "Cold washing / cold water on the part"}
        ]
      },
      {
        id: "s_character",
        prompt: "Which best describes the eruption character? (select all that apply)",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "dry_scaly",         label: "Dry and scaly / psoriasiform"},
          {value: "moist_oozing",      label: "Moist / oozing - weeps fluid"},
          {value: "pustular",          label: "Pustular / pus-filled spots"},
          {value: "urticarial",        label: "Urticarial / hives / raised wheals"},
          {value: "vesicular_blisters",label: "Vesicular / small blisters"}
        ]
      }
    ],

    musculoskel: [
      {
        id: "ms_main",
        prompt: "Which best describes the pain?",
        tier: 2, type: "single", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "stiffness_better_motion", label: "Stiff at first, better as I move (rusty gate)"},
          {value: "worse_any_motion",        label: "Any motion makes it worse"},
          {value: "bruised_sore",            label: "Bruised, sore as if beaten"},
          {value: "shooting_along_nerve",    label: "Shooting along a nerve path"},
          {value: "ascending_pains",         label: "Pains begin in feet and move upward"},
          {value: "cramping_better_warmth",  label: "Cramping, better warmth + pressure"}
        ]
      },
      {
        id: "ms_location",
        prompt: "Where is the main location of pain or stiffness?",
        tier: 2, type: "single", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "lower_back",      label: "Lower back / Lumbar"},
          {value: "neck_cervical",   label: "Neck / Cervical spine"},
          {value: "knee",            label: "Knee joint"},
          {value: "hip",             label: "Hip joint"},
          {value: "shoulder",        label: "Shoulder joint"},
          {value: "small_joints",    label: "Small joints , fingers, wrists, toes"},
          {value: "muscles_general", label: "Muscles generally , fibromyalgia type"}
        ]
      },
      {
        id: "ms_modality",
        prompt: "What makes the pain better or worse?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "better_continued_motion", label: "Better for continued motion"},
          {value: "worse_damp_cold",         label: "Worse in damp cold weather"},
          {value: "better_warmth",           label: "Better for warmth / warm applications"},
          {value: "worse_rest",              label: "Worse after rest, better moving"},
          {value: "worse_first_motion",      label: "Worse on first movement, eases with use"},
          {value: "better_hard_pressure",    label: "Better for firm pressure on the part"},
          {value: "worse_change_weather",    label: "Worse with change of weather"},
          {value: "worse_warmth_of_bed",     label: "Worse warmth of bed (joint pain increases at night in bed)"},
          {value: "better_stretching",       label: "Better from stretching out the part fully"}
        ]
      },
      {
        id: "ms_onset",
        prompt: "What started or triggered the complaint?",
        tier: 2, type: "single", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "injury_overexertion", label: "Injury or over-exertion"},
          {value: "exposure_damp_cold",  label: "Exposure to damp or cold"},
          {value: "getting_wet",         label: "Getting wet (rain, swimming)"},
          {value: "gradual_onset",       label: "Gradual, no clear cause"},
          {value: "suppressed_sweat",    label: "After suppression of sweat / perspiration"},
          {value: "post_infection",      label: "After infection / viral illness"}
        ]
      },
      {
        id: "ms_character",
        prompt: "Any of these special features? (select all that apply)",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "restless_must_change_position", label: "Restless , must keep changing position"},
          {value: "bone_deep_pain",                label: "Deep bone pain, as if in marrow"},
          {value: "right_sided",                   label: "Predominantly right-sided"},
          {value: "left_sided",                    label: "Predominantly left-sided"},
          {value: "alternating_sides",             label: "Pains shift and alternate sides"},
          {value: "tearing_lightninglike",         label: "Tearing or lightning-like pains"},
          {value: "numbness_with_pain",            label: "Numbness or tingling with pain"}
        ]
      }
    ],

    urinary: [
      {
        id: "u_main",
        prompt: "Which best describes the urinary symptom?",
        tier: 2, type: "single", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "burning_with_urgency", label: "Intense burning + constant urge, only drops"},
          {value: "after_sex",            label: "Started after sexual intercourse"},
          {value: "blood",                label: "Blood in urine"},
          {value: "frequent_clear",       label: "Frequent, large amounts, pale"}
        ]
      },
      {
        id: "u_character",
        prompt: "Character of urination - which apply?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "burning_scalding",   label: "Burning / scalding during urination"},
          {value: "constant_urging",    label: "Constant urging, little passes"},
          {value: "involuntary",        label: "Involuntary / cannot hold"},
          {value: "dribbling",          label: "Dribbling after urination"},
          {value: "interrupted_stream", label: "Interrupted stream - starts and stops"},
          {value: "slow_stream",        label: "Slow / feeble stream"},
          {value: "u_blood",            label: "Blood in urine (haematuria)"}
        ]
      },
      {
        id: "u_worse",
        prompt: "What makes the urinary symptom WORSE?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "u_cold",    label: "Cold exposure"},
          {value: "nocturia",  label: "Night (nocturia - woken to urinate)"},
          {value: "u_motion",  label: "Motion / jarring"},
          {value: "u_lying",   label: "Lying down"}
        ]
      },
      {
        id: "u_better",
        prompt: "What gives RELIEF from the urinary symptom?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "after_urination", label: "After urination (momentary relief)"}
        ]
      }
    ],

    injury: [
      {
        id: "i_type",
        prompt: "What kind of injury?",
        tier: 2, type: "single", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "blunt_blow",            label: "Blunt blow, fall, bruise"},
          {value: "puncture_wound",        label: "Puncture wound, splinter, animal bite, nail"},
          {value: "incised_wound_surgery", label: "Cut / incised wound / post-surgical"},
          {value: "burn_scald",            label: "Burn / scald"},
          {value: "nerve_rich_injury",     label: "Injury to nerve-rich area (finger, toe, tail-bone)"},
          {value: "sprain_strain",         label: "Sprain, strain, over-lift"}
        ]
      },
      {
        id: "i_worse",
        prompt: "What makes the injury WORSE?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "i_cold",  label: "Cold"},
          {value: "damp",    label: "Damp weather"},
          {value: "i_touch", label: "Touch / slightest contact"},
          {value: "i_motion",label: "Motion"}
        ]
      },
      {
        id: "i_better",
        prompt: "What gives RELIEF from the injury?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "cold_applications_injury", label: "Cold applications on the injured part"},
          {value: "i_rest",                   label: "Rest / keeping still"},
          {value: "elevation",                label: "Elevation of the injured part"}
        ]
      }
    ],

    general: [
      {
        id: "gen_main",
        prompt: "What is the main symptom or area of concern?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "fatigue_exhaustion",  label: "Fatigue and exhaustion"},
          {value: "glandular_swelling",  label: "Glandular swelling , lymph nodes"},
          {value: "weight_change",       label: "Weight change (gain or loss)"},
          {value: "perspiration",        label: "Excessive sweating , night sweats"},
          {value: "bleeding_tendency",   label: "Bleeding tendency , easy bruising"},
          {value: "numbness_tingling",   label: "Numbness and tingling"},
          {value: "general_weakness",    label: "Progressive weakness , anaemia"},
          {value: "appetite_change",     label: "Significant appetite change"}
        ]
      },
      {
        id: "gen_modality",
        prompt: "When is the complaint worst?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "morning",        label: "Morning on waking"},
          {value: "afternoon",      label: "Afternoon 3–5 PM"},
          {value: "evening",        label: "Evening"},
          {value: "night",          label: "At night"},
          {value: "after_exertion", label: "After exertion"},
          {value: "after_eating",   label: "After eating"},
          {value: "periodically",   label: "Periodically"}
        ]
      },
      {
        id: "gen_better_from",
        prompt: "What gives relief?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "rest_lying", label: "Complete rest , lying down"},
          {value: "warmth",     label: "Warmth"},
          {value: "eating",     label: "Eating something"},
          {value: "fresh_air",  label: "Fresh air"},
          {value: "sweating",   label: "Sweating"},
          {value: "company",    label: "Company , distraction"}
        ]
      },
      {
        id: "gen_constitution",
        prompt: "Which constitutional picture fits best?",
        tier: 2, type: "single", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "sluggish_fat_cold",    label: "Sluggish , overweight , chilly , sweats easily"},
          {value: "thin_nervous_chilly",  label: "Thin , nervous , chilly , perfectionist"},
          {value: "thin_warm_anxious",    label: "Thin , warm , anxious , craves company"},
          {value: "plethoric_warm_itchy", label: "Full-blooded , warm , itching skin"},
          {value: "none_fits",            label: "None of these fit well"}
        ]
      }
    ],

    /* ── FEMALE ── */
    female: [
      {
        id: "f_main_complaint",
        prompt: "What is the main female complaint?",
        tier: 2, type: "single", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "dysmenorrhoea",    label: "Painful periods (dysmenorrhoea)"},
          {value: "amenorrhoea",      label: "Absent or suppressed periods"},
          {value: "menorrhagia",      label: "Heavy / prolonged bleeding"},
          {value: "leucorrhoea",      label: "Vaginal discharge (leucorrhoea)"},
          {value: "menopausal",       label: "Menopausal complaints , hot flushes, mood"},
          {value: "pmdd",             label: "Premenstrual , irritability, bloating, breast tenderness"},
          {value: "pregnancy_nausea", label: "Pregnancy , nausea / vomiting"},
          {value: "postpartum",       label: "Post-delivery complaints"}
        ]
      },
      {
        id: "f_menses_timing",
        prompt: "Menstrual timing , when do periods come?",
        tier: 2, type: "single", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "regular",           label: "Regular , arrives on time"},
          {value: "early_frequent",    label: "Too early / frequent (shorter cycle)"},
          {value: "late_delayed",      label: "Late / delayed"},
          {value: "irregular",         label: "Irregular , unpredictable"},
          {value: "absent_amenorrhoea",label: "Absent , amenorrhoea"},
          {value: "not_applicable",    label: "Post-menopausal / not applicable"}
        ]
      },
      {
        id: "f_menses_character",
        prompt: "What is the flow like?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "scanty",           label: "Scanty / too little"},
          {value: "profuse",          label: "Profuse / flooding"},
          {value: "bright_red",       label: "Bright red"},
          {value: "dark_clotted",     label: "Dark, clotted"},
          {value: "offensive",        label: "Offensive-smelling"},
          {value: "early",            label: "Too early / frequent"},
          {value: "late",             label: "Late / irregular"},
          {value: "painful_cramping",    label: "Painful with cramps"},
          {value: "variable_irregular", label: "Variable / irregular in amount"}
        ]
      },
      {
        id: "f_menses_pain_type",
        prompt: "Character of menstrual pain (if present)?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "cramping_spasmodic",   label: "Cramping / spasmodic , comes in waves"},
          {value: "bearing_down",         label: "Bearing-down , as if everything would fall out"},
          {value: "burning",              label: "Burning"},
          {value: "stitching",            label: "Stitching / sharp"},
          {value: "shooting_down_thighs", label: "Shoots down thighs"},
          {value: "backache_with_menses", label: "Backache accompanying menses"},
          {value: "no_pain",              label: "No pain with periods"}
        ]
      },
      {
        id: "f_menses_pain_timing",
        prompt: "When is the menstrual pain worst?",
        tier: 2, type: "single", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "before_onset",       label: "Before the flow starts"},
          {value: "at_onset_first_day", label: "At the very onset / first day"},
          {value: "during_flow",        label: "Throughout the flow"},
          {value: "better_once_flow",   label: "Better once flow begins properly"},
          {value: "after_menses",       label: "After menses ends"},
          {value: "no_pain",            label: "No pain"}
        ]
      },
      {
        id: "f_menses_modality",
        prompt: "What makes the menstrual pain better or worse?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "better_warmth",      label: "Better warmth / hot water bottle"},
          {value: "better_pressure",    label: "Better pressure / doubling up"},
          {value: "better_motion",      label: "Better from walking about"},
          {value: "worse_cold",         label: "Worse from cold"},
          {value: "worse_motion",       label: "Worse from any motion"},
          {value: "worse_beginning",    label: "Worst at the very start of flow"},
          {value: "better_after_flow",  label: "Better once the flow starts properly"}
        ]
      },
      {
        id: "f_intermenstrual",
        prompt: "Between periods , any of the following?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "spotting_midcycle",    label: "Spotting at mid-cycle (ovulation)"},
          {value: "spotting_before",      label: "Spotting days before period"},
          {value: "spotting_after",       label: "Spotting after period ends"},
          {value: "discharge_constant",   label: "Constant discharge throughout cycle"},
          {value: "pelvic_pain_midcycle", label: "Pelvic pain mid-cycle (Mittelschmerz)"},
          {value: "none",                 label: "Nothing between periods"}
        ]
      },
      {
        id: "f_leucorrhoea_type",
        prompt: "If discharge present , what is it like?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "white_milky",          label: "White, milky"},
          {value: "yellow_green",         label: "Yellow or greenish"},
          {value: "thick_ropy",           label: "Thick, ropy, stringy"},
          {value: "watery_excoriating",   label: "Thin, watery, burning/excoriating"},
          {value: "offensive",            label: "Offensive-smelling"},
          {value: "before_menses",        label: "Worse before menses"},
          {value: "after_menses",         label: "Worse after menses"}
        ]
      },
      {
        id: "f_pms_symptoms",
        prompt: "Premenstrual symptoms (days before period)?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "pms_irritability",  label: "Irritability / anger"},
          {value: "pms_weeping",       label: "Weeping / emotional sensitivity"},
          {value: "pms_breast_tender", label: "Breast tenderness / swelling"},
          {value: "pms_bloating",      label: "Bloating / water retention"},
          {value: "pms_headache",      label: "Headache premenstrually"},
          {value: "pms_depression",    label: "Depression / hopelessness"},
          {value: "pms_cravings",      label: "Intense food cravings"},
          {value: "pms_none",          label: "No premenstrual symptoms"}
        ]
      },
      {
        id: "f_hormonal_cycle_effect",
        prompt: "Does the main complaint change with the menstrual cycle?",
        tier: 2, type: "single", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "worse_before",   label: "Worse premenstrually"},
          {value: "worse_during",   label: "Worse during menstruation"},
          {value: "worse_after",    label: "Worse after menstruation"},
          {value: "better_menses",  label: "Better during / after menstruation"},
          {value: "no_relation",    label: "No relation to cycle"},
          {value: "not_applicable", label: "Not applicable"}
        ]
      },
      {
        id: "f_menopausal",
        prompt: "Menopausal or perimenopausal symptoms?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "hot_flushes",      label: "Hot flushes / flashes"},
          {value: "night_sweats",     label: "Night sweats (drenching)"},
          {value: "vaginal_dryness",  label: "Vaginal dryness / atrophy"},
          {value: "mood_changes",     label: "Mood swings / irritability / depression"},
          {value: "palpitations",     label: "Palpitations with flushes"},
          {value: "memory_decline",   label: "Memory / concentration decline"},
          {value: "weight_gain",      label: "Weight gain (especially abdomen)"},
          {value: "not_menopausal",   label: "Not menopausal / not applicable"}
        ]
      },
      {
        id: "f_pregnancy_effect",
        prompt: "Effect of pregnancy on this complaint (if applicable)?",
        tier: 2, type: "single", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "better_pregnancy",  label: "Better during pregnancy"},
          {value: "worse_pregnancy",   label: "Worse during pregnancy"},
          {value: "new_in_pregnancy",  label: "Complaint first appeared in pregnancy"},
          {value: "not_pregnant",      label: "Not pregnant / not applicable"}
        ]
      },
      {
        id: "f_sexual",
        prompt: "Sexual health (select what applies)?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "painful_intercourse", label: "Painful intercourse (dyspareunia)"},
          {value: "decreased_desire",    label: "Decreased libido / desire"},
          {value: "increased_desire",    label: "Increased / excessive desire"},
          {value: "dryness",             label: "Vaginal dryness during intercourse"},
          {value: "normal",              label: "Normal / no concerns"},
          {value: "prefer_not_answer",   label: "Prefer not to answer"}
        ]
      },
      {
        id: "f_associated_other",
        prompt: "Any associated symptoms?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "pelvic_heaviness",     label: "Heaviness / dragging in pelvis"},
          {value: "uterine_prolapse",     label: "Sensation of prolapse / bearing-down"},
          {value: "breast_lumps",         label: "Breast lumps / mastitis"},
          {value: "ovarian_pain",         label: "Ovarian / adnexal pain"},
          {value: "urinary_incontinence", label: "Urinary incontinence with cough/sneeze"},
          {value: "none",                 label: "None of the above"}
        ]
      },
      {
        id: "f_gen_worse",
        prompt: "When / what makes the female complaint WORSE? (select all that apply)",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "before_menses",   label: "Before menstruation (premenstrually)"},
          {value: "during_menses",   label: "During menstruation"},
          {value: "after_menses",    label: "After menstruation ends"},
          {value: "f_motion",        label: "Motion / exertion"},
          {value: "f_cold",          label: "Cold exposure"},
          {value: "f_heat",          label: "Heat / warm applications"}
        ]
      }
    ],

    /* ── PAEDIATRIC ── */
    paediatric: [
      {
        id: "ped_main",
        prompt: "What is the main complaint in the child?",
        tier: 2, type: "single", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "teething",          label: "Teething , irritable, drooling, cheek red"},
          {value: "colic_infant",      label: "Colic / cramping pain in infant"},
          {value: "fever_child",       label: "Fever in child"},
          {value: "recurrent_tonsils", label: "Recurrent tonsillitis / throat infections"},
          {value: "worms",             label: "Worms / parasites (restless sleep, itching nose/anus)"},
          {value: "bedwetting",        label: "Bedwetting (enuresis)"},
          {value: "behavioural",       label: "Behavioural , hyperactive, tantrum, fearful"},
          {value: "failure_to_thrive", label: "Failure to thrive / poor weight gain"}
        ]
      },
      {
        id: "ped_age_group",
        prompt: "Child's age group?",
        tier: 2, type: "single", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "newborn_0_1m",   label: "Newborn (0–1 month)"},
          {value: "infant_1_12m",   label: "Infant (1–12 months)"},
          {value: "toddler_1_3y",   label: "Toddler (1–3 years)"},
          {value: "child_4_12y",    label: "Child (4–12 years)"},
          {value: "teenager_13_18y",label: "Teenager (13–18 years)"}
        ]
      },
      {
        id: "ped_birth_history",
        prompt: "Birth history?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "normal_birth",     label: "Normal vaginal birth"},
          {value: "premature",        label: "Premature birth (<37 weeks)"},
          {value: "caesarean",        label: "Caesarean section"},
          {value: "forceps_ventouse", label: "Forceps or ventouse delivery"},
          {value: "prolonged_labour", label: "Prolonged or difficult labour"},
          {value: "nicu_stay",        label: "NICU / special care admission"},
          {value: "normal_unknown",   label: "Normal / not known"}
        ]
      },
      {
        id: "ped_vaccination",
        prompt: "Vaccination status?",
        tier: 2, type: "single", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "up_to_date",          label: "Fully up to date"},
          {value: "delayed_partial",     label: "Delayed or partially vaccinated"},
          {value: "reaction_to_vaccine", label: "Had reaction after a vaccine"},
          {value: "unvaccinated",        label: "Unvaccinated"},
          {value: "unknown",             label: "Not sure"}
        ]
      },
      {
        id: "ped_milestones",
        prompt: "Developmental milestones?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "on_track",         label: "All milestones on track"},
          {value: "speech_delay",     label: "Speech / language delay"},
          {value: "motor_delay",      label: "Motor delay (sitting, walking late)"},
          {value: "global_delay",     label: "Global developmental delay"},
          {value: "regression",       label: "Regression , lost skills already gained"},
          {value: "advanced",         label: "Advanced / early milestones"},
          {value: "too_young_assess", label: "Too young to assess"}
        ]
      },
      {
        id: "ped_feeding",
        prompt: "Feeding and appetite?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "good_appetite",        label: "Good appetite / eats well"},
          {value: "poor_appetite",        label: "Poor appetite / refuses food"},
          {value: "milk_aversion",        label: "Milk aversion , refuses or vomits milk"},
          {value: "specific_cravings",    label: "Strong specific cravings (sweets/salt/earth)"},
          {value: "pica",                 label: "Pica , eats indigestible things (chalk, dirt)"},
          {value: "vomits_after_feeding", label: "Vomits shortly after feeding"},
          {value: "breast_bottle_ok",     label: "Breast/bottle feeding normally"}
        ]
      },
      {
        id: "ped_recurrent_infections",
        prompt: "Recurrent infections (pattern)?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "tonsillitis_recurrent", label: "Recurrent tonsillitis / quinsy"},
          {value: "ear_infections",        label: "Recurrent ear infections (otitis media)"},
          {value: "chest_infections",      label: "Recurrent chest / bronchial infections"},
          {value: "uti_recurrent",         label: "Recurrent urinary tract infections"},
          {value: "skin_infections",       label: "Recurrent skin infections / boils"},
          {value: "multiple_systems",      label: "Multiple systems , generally susceptible"},
          {value: "none",                  label: "No recurrent infections"}
        ]
      },
      {
        id: "ped_behaviour",
        prompt: "Behaviour and temperament?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "hyperactive",         label: "Hyperactive / constantly in motion"},
          {value: "anxious_fearful",     label: "Anxious / fearful (many fears)"},
          {value: "clingy",              label: "Clingy , wants mother constantly"},
          {value: "angry_violent",       label: "Angry / violent tantrums"},
          {value: "shy_reserved",        label: "Shy and reserved / won't talk to strangers"},
          {value: "impulsive",           label: "Impulsive / acts without thinking"},
          {value: "sensitive_reprimand", label: "Very sensitive to reprimand / criticism"},
          {value: "normal_easy",         label: "Normal, easy-going temperament"}
        ]
      },
      {
        id: "ped_constitution",
        prompt: "Physical constitution of the child?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "sweaty_head_night",  label: "Sweats on head during sleep (wet pillow)"},
          {value: "enlarged_tonsils",   label: "Enlarged tonsils / adenoids / snores"},
          {value: "slow_weight_gain",   label: "Slow to gain weight / thin"},
          {value: "chubby_fat",         label: "Chubby / overweight for age"},
          {value: "delayed_dentition",  label: "Late / slow teething"},
          {value: "fontanelle_slow",    label: "Fontanelle slow to close"},
          {value: "frequently_cold",    label: "Frequently feels cold / chilly child"},
          {value: "robust_healthy",     label: "Robust / generally healthy"}
        ]
      },
      {
        id: "ped_sleep_child",
        prompt: "Sleep pattern in this child?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "sleeps_well",      label: "Sleeps well through the night"},
          {value: "restless_sleep",   label: "Restless , tosses and turns"},
          {value: "talks_in_sleep",   label: "Talks in sleep"},
          {value: "walks_in_sleep",   label: "Sleepwalking"},
          {value: "nightmares_child", label: "Frequent nightmares / night terrors"},
          {value: "wont_sleep_alone", label: "Won't sleep alone , needs parent"},
          {value: "grinds_teeth",     label: "Grinds teeth (bruxism) during sleep"},
          {value: "snores",           label: "Snores loudly"}
        ]
      },
      {
        id: "ped_school",
        prompt: "School and learning (if school-age)?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "no_concerns",          label: "No concerns , doing well"},
          {value: "learning_difficulty",  label: "Learning difficulties / dyslexia"},
          {value: "attention_problems",   label: "Attention / concentration problems"},
          {value: "social_difficulties",  label: "Social difficulties / struggles with peers"},
          {value: "school_refusal",       label: "School refusal / anxiety about school"},
          {value: "performance_declined", label: "Performance has declined recently"},
          {value: "pre_school_age",       label: "Not yet school age"}
        ]
      },
      {
        id: "ped_teething_symptoms",
        prompt: "Teething / early childhood: which fits best?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "one_cheek_red",        label: "One cheek red, other pale"},
          {value: "green_stool",          label: "Green, slimy stools"},
          {value: "shrieking_pain",       label: "Shrieking with pain, nothing satisfies"},
          {value: "wants_carried",        label: "Wants to be carried constantly"},
          {value: "excessive_salivation", label: "Excessive drooling / salivation"},
          {value: "diarrhoea_teething",   label: "Diarrhoea during teething"},
          {value: "convulsions_teething", label: "Convulsions with teething (alert: seek urgent care)"}
        ]
      },
      {
        id: "ped_colic_character",
        prompt: "Colic: what helps or aggravates?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "better_warmth",      label: "Better warmth / hot water bottle on abdomen"},
          {value: "better_pressure",    label: "Better firm pressure on abdomen"},
          {value: "better_doubling_up", label: "Better bending forward / doubling up"},
          {value: "better_motion",      label: "Better being carried or rocked"},
          {value: "worse_cold",         label: "Worse from cold / cold milk"},
          {value: "after_feeding",      label: "Worse shortly after feeding"},
          {value: "gas_colicky",        label: "Much gas / bloating with colic"},
          {value: "draws_legs_up",      label: "Draws legs up to abdomen"}
        ]
      }
    ],

    /* ── SLEEP ── */
    sleep: [
      {
        id: "sl_main_problem",
        prompt: "What is the main sleep complaint?",
        tier: 2, type: "single", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "cannot_fall_asleep", label: "Cannot fall asleep , mind too active"},
          {value: "wakes_and_cannot",   label: "Wakes at 2–3 AM and cannot return to sleep"},
          {value: "unrefreshing_sleep", label: "Sleeps but wakes unrefreshed"},
          {value: "restless_sleep",     label: "Restless, tossing and turning all night"},
          {value: "sleepiness_day",     label: "Excessive sleepiness in the day"},
          {value: "nightmares",         label: "Vivid dreams / nightmares"},
          {value: "sleepwalking",       label: "Sleepwalking / talking in sleep"}
        ]
      },
      {
        id: "sl_onset_pattern",
        prompt: "Sleep onset , when do you usually fall asleep?",
        tier: 2, type: "single", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "falls_asleep_easily",   label: "Falls asleep easily within 15 minutes"},
          {value: "cannot_before_midnight",label: "Cannot sleep before midnight , mind too active"},
          {value: "cannot_before_2_3am",   label: "Cannot sleep before 2–3 AM"},
          {value: "racing_thoughts",       label: "Racing thoughts prevent sleep"},
          {value: "fear_anxiety_onset",    label: "Fear or anxiety at bedtime delays sleep"},
          {value: "falls_asleep_anywhere", label: "Falls asleep anywhere / irresistible drowsiness"}
        ]
      },
      {
        id: "sl_waking_pattern",
        prompt: "Night waking , when does it occur?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "sleeps_through",       label: "Sleeps through without waking"},
          {value: "wakes_1am",            label: "Wakes around 1 AM"},
          {value: "wakes_2am",            label: "Wakes around 2 AM"},
          {value: "wakes_3am",            label: "Wakes around 3 AM"},
          {value: "wakes_4am",            label: "Wakes around 4 AM"},
          {value: "wakes_5am_driven_out", label: "Wakes 5 AM , driven out of bed"},
          {value: "wakes_frequently",     label: "Wakes frequently throughout night"},
          {value: "early_morning_waking", label: "Early morning waking (before alarm)"}
        ]
      },
      {
        id: "sl_insomnia_cause",
        prompt: "What seems to be causing the sleep problem?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "anxiety_thoughts",      label: "Anxious thoughts / mind won't stop"},
          {value: "physical_restlessness", label: "Physical restlessness , can't keep still"},
          {value: "pain_waking",           label: "Woken by pain"},
          {value: "too_hot",               label: "Feels too hot in bed"},
          {value: "too_cold",              label: "Feels too cold / cannot get warm"},
          {value: "noise_sensitive",       label: "Woken by any noise"},
          {value: "grief_worry",           label: "Grief or worry keeping awake"},
          {value: "coffee_stimulants",     label: "After coffee or stimulants"}
        ]
      },
      {
        id: "sl_position",
        prompt: "Preferred sleep position?",
        tier: 2, type: "single", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "back",           label: "On the back (supine)"},
          {value: "left_side",      label: "Left side , comfortable"},
          {value: "right_side",     label: "Right side , comfortable"},
          {value: "prone_face_down",label: "Face down / prone"},
          {value: "elevated_head",  label: "Must have head elevated / extra pillows"},
          {value: "knee_chest",     label: "Knee-chest position / curled up"},
          {value: "cold_feet_out",  label: "Must have feet uncovered / out of covers"}
        ]
      },
      {
        id: "sl_dreams_character",
        prompt: "Nature of dreams (if disturbed by dreams)?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "frightful_nightmares", label: "Frightful / violent nightmares"},
          {value: "anxious_dreams",       label: "Anxious, full of apprehension"},
          {value: "business_work",        label: "Dreams of work / unfinished business"},
          {value: "dead_people",          label: "Dreams of dead people / ghosts"},
          {value: "pleasant_vivid",       label: "Pleasant but very vivid"},
          {value: "prophetic",            label: "Prophetic or clairvoyant dreams"}
        ]
      },
      {
        id: "sl_on_waking",
        prompt: "How do you feel on waking?",
        tier: 2, type: "single", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "refreshed",         label: "Refreshed , ready to start the day"},
          {value: "unrefreshed_worse", label: "Unrefreshed , worse on waking than on going to bed"},
          {value: "drowsy_all_day",    label: "Drowsy throughout the day despite sleep"},
          {value: "better_after_nap",  label: "Better after a short nap in the day"},
          {value: "groggy_confused",   label: "Groggy / confused on waking (sleep inertia)"}
        ]
      },
      {
        id: "sl_duration",
        prompt: "How many hours of sleep do you typically get?",
        tier: 2, type: "single", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "very_short_under5", label: "Very short , under 5 hours"},
          {value: "insufficient_5_6",  label: "Insufficient , 5 to 6 hours"},
          {value: "adequate_6_8",      label: "Adequate , 6 to 8 hours"},
          {value: "excessive_9_plus",  label: "Excessive , 9 or more hours"},
          {value: "daytime_sleepiness",label: "Enough at night but still sleepy all day"}
        ]
      },
      {
        id: "sl_disturbance_factors",
        prompt: "What disturbs your sleep?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "noise",               label: "Any noise , very light sleeper"},
          {value: "light",               label: "Light in the room"},
          {value: "anxiety_worrying",    label: "Anxious thoughts or worrying"},
          {value: "pain",                label: "Pain"},
          {value: "urge_urinate",        label: "Urge to urinate (nocturia)"},
          {value: "partner",             label: "Partner's movements / snoring"},
          {value: "temperature",         label: "Too hot or too cold"},
          {value: "nothing_sleeps_well", label: "Nothing , sleeps soundly"}
        ]
      },
      {
        id: "sl_temperature_bed",
        prompt: "Temperature in bed?",
        tier: 2, type: "single", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "too_hot_throws_off",   label: "Too hot , throws off covers"},
          {value: "too_cold_cannot_warm", label: "Too cold , cannot get warm"},
          {value: "night_sweats",         label: "Drenching night sweats"},
          {value: "feet_cold_always",     label: "Feet always cold in bed"},
          {value: "normal_comfortable",   label: "Normal / comfortable"}
        ]
      },
      {
        id: "sl_sleep_other",
        prompt: "Any other sleep features?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "snoring",       label: "Loud snoring"},
          {value: "sleep_apnoea", label: "Stops breathing / gasps (sleep apnoea)"},
          {value: "restless_legs", label: "Restless legs , must move them"},
          {value: "teeth_grinding",label: "Teeth grinding (bruxism)"},
          {value: "sleeptalking",  label: "Talks in sleep"},
          {value: "sleepwalking",  label: "Sleepwalks"},
          {value: "none",          label: "None of the above"}
        ]
      }
    ],

    /* ── VERTIGO ── */
    vertigo: [
      {
        id: "vrt_trigger",
        prompt: "What triggers or worsens the vertigo?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "rising_from_seat",  label: "Rising from sitting or lying"},
          {value: "turning_head",      label: "Turning or moving the head"},
          {value: "looking_up",        label: "Looking up or down"},
          {value: "lying_down",        label: "Lying down or rolling over in bed"},
          {value: "motion_riding",     label: "Motion , riding in vehicle"},
          {value: "stooping_forward",  label: "Stooping forward"},
          {value: "closed_spaces",     label: "Closed spaces / crowded places"},
          {value: "heights",           label: "Looking down from heights"}
        ]
      },
      {
        id: "vrt_concomitant",
        prompt: "What accompanies the vertigo?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "with_nausea",    label: "Nausea or vomiting"},
          {value: "with_headache",  label: "Headache"},
          {value: "with_tinnitus",  label: "Ringing in ears / tinnitus"},
          {value: "with_deafness",  label: "Deafness or hearing loss"},
          {value: "with_weakness",  label: "Weakness / faintness"},
          {value: "with_anxiety",   label: "Anxiety / panic"}
        ]
      },
      {
        id: "vrt_position",
        prompt: "How does lying down affect the vertigo?",
        tier: 2, type: "single", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "lying_worse",   label: "Worse when lying down , must sit or stand"},
          {value: "lying_better",  label: "Better when lying still , movement aggravates"},
          {value: "standing_worse",label: "Worse on standing, better lying"},
          {value: "no_difference", label: "Position makes no difference"}
        ]
      }
    ],

    /* ── FACE / MOUTH ── */
    face_mouth: [
      {
        id: "fm_area",
        prompt: "Which area is affected?",
        tier: 2, type: "single", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "toothache",        label: "Toothache / dental pain"},
          {value: "mouth_ulcers",     label: "Mouth ulcers / aphthae"},
          {value: "facial_neuralgia", label: "Facial neuralgia , trigeminal nerve"},
          {value: "gum_disease",      label: "Gum disease / pyorrhoea"},
          {value: "tongue_symptoms",  label: "Tongue , coated / sore / mapped"},
          {value: "jaw_pain",         label: "Jaw / TMJ pain"}
        ]
      },
      {
        id: "fm_character",
        prompt: "Character of the pain or sensation?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "worse_cold",          label: "Worse from cold drinks or cold air"},
          {value: "worse_warmth",        label: "Worse from warm food or drinks"},
          {value: "worse_night",         label: "Worse at night"},
          {value: "worse_touch",         label: "Worse from slightest touch"},
          {value: "shooting_along_nerve",label: "Shooting / electric along nerve"},
          {value: "burning_smarting",    label: "Burning or smarting"},
          {value: "throbbing",           label: "Throbbing / pulsating"}
        ]
      }
    ],

    /* ── HEART ── */
    heart: [
      {
        id: "hrt_main",
        prompt: "Which heart symptom is primary?",
        tier: 2, type: "single", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "palpitations",      label: "Palpitations , aware of heartbeat"},
          {value: "chest_pain_angina", label: "Chest pain / pressure / angina"},
          {value: "irregular_pulse",   label: "Irregular or intermittent pulse"},
          {value: "hypertension",      label: "High blood pressure"},
          {value: "breathlessness",    label: "Breathlessness on exertion / lying"},
          {value: "pounding_night",    label: "Pounding heart at night / wakes from sleep"}
        ]
      },
      {
        id: "hrt_worse",
        prompt: "What makes it worse?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "worse_exertion",          label: "Exertion or climbing stairs"},
          {value: "worse_lying_left",        label: "Lying on the left side"},
          {value: "worse_emotions",          label: "Emotional excitement or fright"},
          {value: "worse_cold_wind",         label: "Cold wind or cold air"},
          {value: "worse_night",             label: "Night , wakes patient"},
          {value: "worse_coffee_stimulants", label: "Coffee or stimulants"}
        ]
      },
      {
        id: "hrt_palp_trigger",
        prompt: "What specifically triggers the palpitations?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "palp_exertion",    label: "Physical exertion"},
          {value: "palp_emotion",     label: "Emotional excitement or fright"},
          {value: "palp_lying_left",  label: "Lying on the left side"},
          {value: "palp_night",       label: "At night , wakes from sleep"},
          {value: "palp_climbing",    label: "Climbing stairs"},
          {value: "palp_no_trigger",  label: "No clear trigger"}
        ]
      },
      {
        id: "hrt_character",
        prompt: "What is the character of the palpitations or heart sensation?",
        tier: 2, type: "multi", session_field: "branch_answers",
        weight: "medium", condition: null, remedy_hints: [],
        options: [
          {value: "rapid",       label: "Rapid / fast"},
          {value: "irregular",   label: "Irregular / skipping beats"},
          {value: "violent",     label: "Violent / forceful"},
          {value: "stop_start",  label: "Feels heart stop, then start with a thud"},
          {value: "fluttering",  label: "Fluttering or trembling sensation"}
        ]
      }
    ]

  }, // end pools

  /* ─────────────────────────────────────────────────────────
     TIER 3 , KEYNOTE BANK
     Remedy-keyed probe questions; shown adaptively when
     a remedy rises above threshold in partial scoring.
     Positive values written to session; "_no" filtered out.
     ───────────────────────────────────────────────────────── */
  keynote_bank: [

    {id:'kb_hard_pressure', prompt:'Is the pain completely relieved by firm, hard pressure?',
     tier:3, type:'single', session_field:'better_from', weight:'high',
     condition:null, remedy_hints:['bry','mag-p','coloc'],
     options:[{value:'hard_pressure',label:'Yes , pressing hard relieves it'},{value:'_no',label:'No'}]},

    {id:'kb_motion_worse', prompt:'Is any movement , even turning in bed , intensely aggravating?',
     tier:3, type:'single', session_field:'worse_from', weight:'high',
     condition:null, remedy_hints:['bry'],
     options:[{value:'motion',label:'Yes , completely still is the only relief'},{value:'_no',label:'No'}]},

    {id:'kb_restlessness_drive', prompt:'Is there an intense urge to keep moving , restlessness that forces them to change position constantly?',
     tier:3, type:'single', session_field:'mental_state', weight:'high',
     condition:null, remedy_hints:['ars','rhus-t','tarent'],
     options:[{value:'anxious_restlessness',label:'Yes , must keep moving'},{value:'_no',label:'No'}]},

    {id:'kb_consolation_worse', prompt:'Does sympathy or consolation make the patient feel worse or pull away?',
     tier:3, type:'single', session_field:'worse_from', weight:'high',
     condition:null, remedy_hints:['nat-m','sep','ign'],
     options:[{value:'consolation',label:'Yes , wants to be left alone'},{value:'_no',label:'No, consolation helps'}]},

    {id:'kb_warm_better_gi', prompt:'Does warmth or warm drinks relieve the abdominal pain?',
     tier:3, type:'single', session_field:'better_from', weight:'medium',
     condition:{field:'complaint',value:'gi'}, remedy_hints:['ars','nux-v','mag-p'],
     options:[{value:'warmth',label:'Yes , heat/warm drinks help'},{value:'_no',label:'No'}]},

    {id:'kb_5am_stool', prompt:'Is diarrhoea worst at 5 AM, driving the patient out of bed?',
     tier:3, type:'single', session_field:'time_modality', weight:'high',
     condition:{field:'complaint',value:'gi'}, remedy_hints:['aloe','sulph','pod'],
     options:[{value:'5AM_morning',label:'Yes , 5 AM forces them out of bed'},{value:'_no',label:'No'}]},

    {id:'kb_stool_force', prompt:'Is stool expelled with great urgency and force, almost uncontrollable?',
     tier:3, type:'single', session_field:'branch_answers', weight:'high',
     condition:{field:'complaint',value:'gi'}, remedy_hints:['crot-t','aloe','pod','gamb'],
     options:[{value:'stool_forceful',label:'Yes , spurts out violently'},{value:'_no',label:'No'}]},

    {id:'kb_right_scapula', prompt:'Is there a constant sharp pain in the right shoulder-blade area?',
     tier:3, type:'single', session_field:'branch_answers', weight:'high',
     condition:null, remedy_hints:['chel','kali-c','chen'],
     options:[{value:'right_scapular',label:'Yes , right scapula / under right shoulder blade'},{value:'_no',label:'No'}]},

    {id:'kb_better_cold_apps', prompt:'Do cold applications or ice give definite relief to the painful part?',
     tier:3, type:'single', session_field:'better_from', weight:'high',
     condition:null, remedy_hints:['apis','led','puls'],
     options:[{value:'cold_applications',label:'Yes , cold relieves it'},{value:'_no',label:'No'}]},

    {id:'kb_3am_worse', prompt:'Is the worst time of suffering between 1–3 AM?',
     tier:3, type:'single', session_field:'time_modality', weight:'high',
     condition:null, remedy_hints:['ars','kali-c','dros'],
     options:[{value:'1_2AM',label:'Yes , 1–2 AM worst'},{value:'3_4AM',label:'Yes , 3–4 AM worst'},{value:'_no',label:'No'}]},

    {id:'kb_lyc_4to8', prompt:'Are symptoms distinctly worse between 4 PM and 8 PM?',
     tier:3, type:'single', session_field:'time_modality', weight:'high',
     condition:null, remedy_hints:['lyc','coloc'],
     options:[{value:'4_to_8PM',label:'Yes , late afternoon/evening aggravation'},{value:'_no',label:'No'}]},

    {id:'kb_grief_cause', prompt:'Was there a significant grief, loss, or heartbreak that preceded this illness?',
     tier:3, type:'single', session_field:'causation', weight:'high',
     condition:null, remedy_hints:['ign','nat-m','caust','staph'],
     options:[{value:'grief',label:'Yes , grief or deep loss'},{value:'disappointed_love',label:'Yes , failed love/relationship'},{value:'_no',label:'No'}]},

    {id:'kb_lump_throat', prompt:'Is there a sensation of a lump in the throat (globus) , feels like something stuck that cannot be swallowed?',
     tier:3, type:'single', session_field:'branch_answers', weight:'high',
     condition:null, remedy_hints:['ign','nat-m','sep'],
     options:[{value:'globus',label:'Yes , lump sensation in throat'},{value:'_no',label:'No'}]},

    {id:'kb_worse_left_to_right', prompt:'Do symptoms begin on the left side and gradually move to the right?',
     tier:3, type:'single', session_field:'branch_answers', weight:'high',
     condition:null, remedy_hints:['lach','sep'],
     options:[{value:'left_to_right',label:'Yes'},{value:'_no',label:'No'}]},

    {id:'kb_worse_right_to_left', prompt:'Do symptoms typically affect the right side or start right and move left?',
     tier:3, type:'single', session_field:'branch_answers', weight:'high',
     condition:null, remedy_hints:['lyc','merc-i-f'],
     options:[{value:'right_sided',label:'Yes , right-sided predominance'},{value:'_no',label:'No'}]},

    {id:'kb_thirstless_fever', prompt:'Is the patient remarkably thirstless during fever , almost no desire to drink?',
     tier:3, type:'single', session_field:'thirst', weight:'high',
     condition:{field:'complaint',value:'fever'}, remedy_hints:['puls','apis','gels'],
     options:[{value:'Thirstless',label:'Yes , no thirst even in fever'},{value:'_no',label:'No'}]},

    {id:'kb_burning_better_heat', prompt:'Is there a burning sensation that paradoxically feels better from heat/warm applications?',
     tier:3, type:'single', session_field:'better_from', weight:'high',
     condition:null, remedy_hints:['ars'],
     options:[{value:'warmth',label:'Yes , burning relieved by heat'},{value:'_no',label:'No'}]},

    {id:'kb_sweat_no_relief', prompt:'Is there profuse perspiration that gives no relief whatsoever?',
     tier:3, type:'single', session_field:'branch_answers', weight:'medium',
     condition:null, remedy_hints:['merc','hep'],
     options:[{value:'sweat_no_relief',label:'Yes , sweats but no relief'},{value:'_no',label:'No'}]},

    {id:'kb_better_flatus', prompt:'Is abdominal discomfort greatly relieved by passing flatus?',
     tier:3, type:'single', session_field:'better_from', weight:'medium',
     condition:{field:'complaint',value:'gi'}, remedy_hints:['carb-v','lyc','mag-p','coloc'],
     options:[{value:'passing_flatus',label:'Yes , flatus gives great relief'},{value:'_no',label:'No'}]},

    {id:'kb_worse_initial_motion', prompt:'Is the pain or stiffness worst when first starting to move, then improves with continued motion?',
     tier:3, type:'single', session_field:'worse_from', weight:'high',
     condition:null, remedy_hints:['rhus-t','lyc','puls'],
     options:[{value:'initial_motion',label:'Yes , first motion worst, then eases'},{value:'_no',label:'No'}]},

    {id:'kb_craving_salt', prompt:'Is there a strong, marked craving for salt or salty foods?',
     tier:3, type:'single', session_field:'food_desires', weight:'medium',
     condition:null, remedy_hints:['nat-m','phos','arg-n'],
     options:[{value:'salt',label:'Yes , marked craving for salt'},{value:'_no',label:'No'}]},

    {id:'kb_aversion_consolation_silent', prompt:'Does the patient become silent and withdrawn , unable or unwilling to talk about their suffering?',
     tier:3, type:'single', session_field:'mental_state', weight:'high',
     condition:null, remedy_hints:['nat-m','ign'],
     options:[{value:'silent_brooding',label:'Yes , silent, brooding, cannot talk about it'},{value:'_no',label:'No'}]},

    {id:'kb_worse_milk', prompt:'Does drinking milk specifically aggravate symptoms or is there a strong aversion to milk?',
     tier:3, type:'single', session_field:'food_aversions', weight:'medium',
     condition:null, remedy_hints:['nat-c','mag-c','calc'],
     options:[{value:'milk',label:'Yes , milk disagrees or is averse'},{value:'_no',label:'No'}]},

    {id:'kb_periodicity', prompt:'Do the symptoms recur at very regular intervals , same time each day, week, or every other day?',
     tier:3, type:'single', session_field:'time_modality', weight:'high',
     condition:null, remedy_hints:['chin','ars','nat-m','cedr'],
     options:[{value:'periodic',label:'Yes , strictly periodic'},{value:'_no',label:'No'}]},

    {id:'kb_vaccination_trigger', prompt:'Did the complaint begin or worsen shortly after a vaccination?',
     tier:3, type:'single', session_field:'causation', weight:'high',
     condition:null, remedy_hints:['thuj','sil','ant-t'],
     options:[{value:'vaccination',label:'Yes , onset followed vaccination'},{value:'_no',label:'No'}]},

    {id:'kb_meat_aversion', prompt:'Is there a distinct aversion to meat , even the smell is offensive?',
     tier:3, type:'single', session_field:'food_aversions', weight:'medium',
     condition:null, remedy_hints:['sep','graph','nit-ac'],
     options:[{value:'meat',label:'Yes , averse to meat'},{value:'_no',label:'No'}]},

    {id:'kb_craving_sweets', prompt:'Is there a strong craving for sweets and sweet things?',
     tier:3, type:'single', session_field:'food_desires', weight:'medium',
     condition:null, remedy_hints:['lyc','sulph','arg-n','med'],
     options:[{value:'sweets',label:'Yes , marked craving for sweets'},{value:'_no',label:'No'}]},

    {id:'kb_doubling_up', prompt:'Does doubling up (bending double, knees to chest) give relief?',
     tier:3, type:'single', session_field:'better_from', weight:'high',
     condition:{field:'complaint',value:'gi'}, remedy_hints:['coloc','mag-p','cham'],
     options:[{value:'doubling_up',label:'Yes , bending double relieves'},{value:'_no',label:'No'}]},

    {id:'kb_back_stretching', prompt:'Is the pain distinctly better from bending backwards or stretching the back?',
     tier:3, type:'single', session_field:'better_from', weight:'high',
     condition:null, remedy_hints:['dios'],
     options:[{value:'stretching_back',label:'Yes , stretching/bending backward'},{value:'_no',label:'No'}]},

    {id:'kb_uncovering_better', prompt:'Does uncovering, removing covers, or exposure to cold air give relief?',
     tier:3, type:'single', session_field:'better_from', weight:'medium',
     condition:null, remedy_hints:['puls','sec','sulph','led'],
     options:[{value:'uncovering',label:'Yes , uncovering or cold air helps'},{value:'_no',label:'No'}]},

    {id:'kb_anger_cause', prompt:'Was there a fit of anger, suppressed rage, or feeling of injustice before this illness?',
     tier:3, type:'single', session_field:'causation', weight:'high',
     condition:null, remedy_hints:['staph','nux-v','cham','coloc'],
     options:[{value:'anger',label:'Yes , anger or rage'},{value:'suppressed_anger_indignation',label:'Yes , had to hold it in / suppressed'},{value:'_no',label:'No'}]},

    {id:'kb_fear_death', prompt:'Is there a strong fear of death , a feeling that death is imminent?',
     tier:3, type:'single', session_field:'mental_state', weight:'high',
     condition:null, remedy_hints:['acon','ars','nit-ac'],
     options:[{value:'fear_death',label:'Yes , fear death is imminent'},{value:'_no',label:'No'}]},

    {id:'kb_must_have_order', prompt:'Is the patient extremely fastidious , everything must be in its place?',
     tier:3, type:'single', session_field:'mental_state', weight:'medium',
     condition:null, remedy_hints:['ars','nux-v'],
     options:[{value:'fastidious',label:'Yes , cannot tolerate disorder'},{value:'_no',label:'No'}]},

    {id:'kb_hurried', prompt:'Is there a constant internal hurry , everything must be done quickly?',
     tier:3, type:'single', session_field:'mental_state', weight:'medium',
     condition:null, remedy_hints:['sulph-ac','arg-n','med'],
     options:[{value:'hurried',label:'Yes , internal rush, always hurried'},{value:'_no',label:'No'}]},

    {id:'kb_better_sleep', prompt:'Does even a short sleep or nap distinctly improve the condition?',
     tier:3, type:'single', session_field:'better_from', weight:'medium',
     condition:null, remedy_hints:['phos','sep','psor'],
     options:[{value:'sleep',label:'Yes , sleep gives clear improvement'},{value:'_no',label:'No'}]},

    {id:'kb_10am_worse', prompt:'Is there a regular aggravation around 10–11 AM every day?',
     tier:3, type:'single', session_field:'time_modality', weight:'high',
     condition:null, remedy_hints:['nat-m','gels'],
     options:[{value:'10AM',label:'Yes , 10–11 AM aggravation'},{value:'_no',label:'No'}]},

    {id:'kb_scalp_perspiration', prompt:'Is there profuse perspiration of the head and scalp, especially at night?',
     tier:3, type:'single', session_field:'branch_answers', weight:'medium',
     condition:null, remedy_hints:['calc','sil','merc'],
     options:[{value:'head_sweat',label:'Yes , soaks pillow with head sweat'},{value:'_no',label:'No'}]},

    {id:'kb_desires_company_anxiety', prompt:'When anxious, is there a strong desire for company or to be near people?',
     tier:3, type:'single', session_field:'mental_state', weight:'medium',
     condition:null, remedy_hints:['phos','puls','ars'],
     options:[{value:'wants_consolation',label:'Yes , needs company when anxious'},{value:'_no',label:'No'}]},

    {id:'kb_sighing_involuntary', prompt:'Is there involuntary, deep, frequent sighing , cannot help it?',
     tier:3, type:'single', session_field:'mental_state', weight:'high',
     condition:null, remedy_hints:['ign','sep','calc'],
     options:[{value:'sighing',label:'Yes , constant involuntary sighing'},{value:'_no',label:'No'}]},

    {id:'kb_burning_urination_before', prompt:'Is burning/pain present BEFORE urination begins , in the urethra before the stream starts?',
     tier:3, type:'single', session_field:'branch_answers', weight:'high',
     condition:{field:'complaint',value:'urinary'}, remedy_hints:['canth'],
     options:[{value:'burn_before_urine',label:'Yes , burns before stream starts'},{value:'_no',label:'No'}]},

    {id:'kb_incomplete_emptying', prompt:'Is there a constant sensation that the bladder is not fully emptied after urination?',
     tier:3, type:'single', session_field:'branch_answers', weight:'high',
     condition:{field:'complaint',value:'urinary'}, remedy_hints:['equis','canth','clem'],
     options:[{value:'incomplete_emptying',label:'Yes , always feels not fully empty'},{value:'_no',label:'No'}]},

    {id:'kb_menses_flow_dark', prompt:'Is the menstrual flow dark, clotted, or offensive?',
     tier:3, type:'single', session_field:'branch_answers', weight:'high',
     condition:{field:'complaint',value:'female'}, remedy_hints:['sep','puls','kreos'],
     options:[{value:'flow_dark_clotted',label:'Yes , dark or clotted'},{value:'_no',label:'No'}]},

    {id:'kb_menses_worse_before', prompt:'Are symptoms noticeably worse just before menses?',
     tier:3, type:'single', session_field:'branch_answers', weight:'high',
     condition:{field:'complaint',value:'female'}, remedy_hints:['lach','calc','puls','sep'],
     options:[{value:'worse_before_menses',label:'Yes , premenstrual aggravation'},{value:'_no',label:'No'}]},

    {id:'kb_better_during_menses', prompt:'Does the patient feel better while menstruating (improvement during flow)?',
     tier:3, type:'single', session_field:'branch_answers', weight:'high',
     condition:{field:'complaint',value:'female'}, remedy_hints:['lach'],
     options:[{value:'better_during_menses',label:'Yes , better when flow starts'},{value:'_no',label:'No'}]},

    {id:'kb_cough_worse_lying', prompt:'Does the cough worsen immediately on lying down?',
     tier:3, type:'single', session_field:'worse_from', weight:'high',
     condition:{field:'complaint',value:'respiratory'}, remedy_hints:['puls','dros','hyos','con'],
     options:[{value:'lying_down',label:'Yes , cough worse lying down'},{value:'_no',label:'No'}]},

    {id:'kb_barking_cough', prompt:'Is the cough loud, barking, or hollow , like a seal?',
     tier:3, type:'single', session_field:'branch_answers', weight:'high',
     condition:{field:'complaint',value:'respiratory'}, remedy_hints:['spong','dros','hep'],
     options:[{value:'barking_cough',label:'Yes , barking, hollow cough'},{value:'_no',label:'No'}]},

    {id:'kb_cough_tickle', prompt:'Is a dry, tickling sensation at the larynx the trigger for the cough?',
     tier:3, type:'single', session_field:'branch_answers', weight:'medium',
     condition:{field:'complaint',value:'respiratory'}, remedy_hints:['bell','phos','rumx'],
     options:[{value:'tickle_larynx',label:'Yes , dry tickle in throat'},{value:'_no',label:'No'}]},

    {id:'kb_fever_chill_heat_sequence', prompt:'During fever, which pattern fits best?',
     tier:3, type:'single', session_field:'branch_answers', weight:'high',
     condition:{field:'complaint',value:'fever'}, remedy_hints:['ars','nat-m','chin','acon','gels'],
     options:[
       {value:'chill_then_heat_then_sweat',label:'Chill → heat → sweat (classic)'},
       {value:'chill_predominant',label:'Chill predominates, little sweat'},
       {value:'heat_no_chill',label:'Heat without chill'},
       {value:'sweat_no_relief',label:'Sweat without relief'}
     ]},

    {id:'kb_headache_temples', prompt:'Is the headache mainly at the temples or sides of the head?',
     tier:3, type:'single', session_field:'branch_answers', weight:'medium',
     condition:{field:'complaint',value:'headache'}, remedy_hints:['spig','glon','lac-c'],
     options:[{value:'temporal',label:'Yes , temporal / sides'},{value:'_no',label:'No'}]},

    {id:'kb_headache_vertex', prompt:'Is the headache worst at the very top (vertex) of the head?',
     tier:3, type:'single', session_field:'branch_answers', weight:'high',
     condition:{field:'complaint',value:'headache'}, remedy_hints:['nat-m','calc','sep','lac-c'],
     options:[{value:'vertex',label:'Yes , vertex / crown worst'},{value:'_no',label:'No'}]},

    {id:'kb_headache_band', prompt:'Is there a tight band sensation around the head?',
     tier:3, type:'single', session_field:'branch_answers', weight:'high',
     condition:{field:'complaint',value:'headache'}, remedy_hints:['gels','carb-ac','puls'],
     options:[{value:'band_sensation',label:'Yes , band or tight circle'},{value:'_no',label:'No'}]},

    {id:'kb_joint_cold_swollen', prompt:'Are the joints swollen, shiny, and better from cold applications?',
     tier:3, type:'single', session_field:'better_from', weight:'high',
     condition:{field:'complaint',value:'musculoskel'}, remedy_hints:['apis','led','puls'],
     options:[{value:'cold_applications',label:'Yes , swollen and cold relieves'},{value:'_no',label:'No'}]},

    {id:'kb_joint_hot_inflamed', prompt:'Are the joints hot, red, very tender , worse from any touch?',
     tier:3, type:'single', session_field:'branch_answers', weight:'high',
     condition:{field:'complaint',value:'musculoskel'}, remedy_hints:['bell','bry','apis'],
     options:[{value:'hot_inflamed',label:'Yes , hot, red, touch-sensitive'},{value:'_no',label:'No'}]},

    {id:'kb_msk_weather_change', prompt:'Do joint/muscle symptoms worsen distinctly before a storm or weather change?',
     tier:3, type:'single', session_field:'worse_from', weight:'medium',
     condition:{field:'complaint',value:'musculoskel'}, remedy_hints:['rhus-t','rhod','nat-s'],
     options:[{value:'wet_damp',label:'Yes , worse before rain/storm'},{value:'_no',label:'No'}]},

    {id:'kb_skin_worse_heat', prompt:'Is the skin eruption / itch distinctly worse from warmth, heat, or hot bathing?',
     tier:3, type:'single', session_field:'worse_from', weight:'high',
     condition:{field:'complaint',value:'skin'}, remedy_hints:['sulph','apis','puls','merc'],
     options:[{value:'warmth_of_bed',label:'Yes , warmth and hot bath aggravate'},{value:'_no',label:'No'}]},

    {id:'kb_skin_suppression', prompt:'Was there a previous skin eruption that was suppressed by ointments or steroids?',
     tier:3, type:'single', session_field:'causation', weight:'high',
     condition:{field:'complaint',value:'skin'}, remedy_hints:['sulph','psor','graph'],
     options:[{value:'suppressed_eruptions',label:'Yes , prior suppressed eruption'},{value:'_no',label:'No'}]},

    {id:'kb_skin_oozing_honey', prompt:'Is there a sticky, honey-like oozing from the eruption that crusts and cracks?',
     tier:3, type:'single', session_field:'branch_answers', weight:'high',
     condition:{field:'complaint',value:'skin'}, remedy_hints:['graph','kreos'],
     options:[{value:'honey_ooze',label:'Yes , sticky honey-like ooze'},{value:'_no',label:'No'}]},

    {id:'kb_sleep_early_waking', prompt:'Does the patient fall asleep normally but wake early (3–5 AM) and cannot return to sleep?',
     tier:3, type:'single', session_field:'branch_answers', weight:'high',
     condition:{field:'complaint',value:'sleep'}, remedy_hints:['ars','kali-c','nux-v','nat-m'],
     options:[{value:'early_waking',label:'Yes , wakes 3–5 AM, cannot sleep again'},{value:'_no',label:'No'}]},

    {id:'kb_sleeplessness_thoughts', prompt:'Is sleeplessness caused by a rush of thoughts, plans, or business ideas at bedtime?',
     tier:3, type:'single', session_field:'branch_answers', weight:'high',
     condition:{field:'complaint',value:'sleep'}, remedy_hints:['nux-v','arg-n','lyc','coff'],
     options:[{value:'sleepless_thoughts',label:'Yes , thoughts race at bedtime'},{value:'_no',label:'No'}]},

    {id:'kb_paed_carried', prompt:'Is the child only calmed when carried , screams if put down?',
     tier:3, type:'single', session_field:'branch_answers', weight:'high',
     condition:{field:'complaint',value:'paediatric'}, remedy_hints:['cham','puls','ant-t'],
     options:[{value:'must_be_carried',label:'Yes , only quiet when carried'},{value:'_no',label:'No'}]},

    {id:'kb_paed_fontanelle', prompt:'Is the fontanelle slow to close, open, or pulsating?',
     tier:3, type:'single', session_field:'branch_answers', weight:'high',
     condition:{field:'complaint',value:'paediatric'}, remedy_hints:['calc','sil','bar-c'],
     options:[{value:'fontanelle_open',label:'Yes , open or pulsating fontanelle'},{value:'_no',label:'No'}]},

    {id:'kb_better_eructation', prompt:'Is there marked relief from belching or eructation?',
     tier:3, type:'single', session_field:'better_from', weight:'medium',
     condition:{field:'complaint',value:'gi'}, remedy_hints:['carb-v','arg-n','lyc'],
     options:[{value:'eructation',label:'Yes , belching relieves'},{value:'_no',label:'No'}]},

    {id:'kb_nausea_sight_food', prompt:'Is there nausea that is triggered even by the sight or smell of food?',
     tier:3, type:'single', session_field:'food_aversions', weight:'high',
     condition:{field:'complaint',value:'gi'}, remedy_hints:['colch','ars','sep'],
     options:[{value:'smell_of_food',label:'Yes , sight/smell of food nauseates'},{value:'_no',label:'No'}]},

    {id:'kb_thirst_large_cold', prompt:'Is there intense thirst for large quantities of cold water at a time?',
     tier:3, type:'single', session_field:'thirst', weight:'high',
     condition:null, remedy_hints:['phos','bry','nat-m','verat'],
     options:[{value:'great_thirst_cold',label:'Yes , large cold drinks often'},{value:'_no',label:'No'}]},

    {id:'kb_weeping_better', prompt:'Does weeping or crying make the patient feel better (relieved after tears)?',
     tier:3, type:'single', session_field:'better_from', weight:'medium',
     condition:null, remedy_hints:['puls','sep'],
     options:[{value:'weeping_better',label:'Yes , feels better after crying'},{value:'_no',label:'No'}]},

    {id:'kb_fear_alone_night', prompt:'Is there a marked fear of being alone, especially at night?',
     tier:3, type:'single', session_field:'mental_state', weight:'medium',
     condition:null, remedy_hints:['ars','phos','lyc'],
     options:[{value:'fear_being_alone',label:'Yes , cannot bear to be alone'},{value:'_no',label:'No'}]},

    {id:'kb_worse_anticipation', prompt:'Does anticipating an event (exam, performance, meeting) bring on or worsen symptoms?',
     tier:3, type:'single', session_field:'causation', weight:'high',
     condition:null, remedy_hints:['gels','arg-n','lyc'],
     options:[{value:'anticipation',label:'Yes , anticipatory aggravation'},{value:'_no',label:'No'}]},

    {id:'kb_injuries_bruised_soreness', prompt:'Is the whole body or affected part sore and bruised-feeling, worse from touch?',
     tier:3, type:'single', session_field:'branch_answers', weight:'high',
     condition:{field:'complaint',value:'injury'}, remedy_hints:['arn','bry','rhus-t'],
     options:[{value:'bruised_sore',label:'Yes , bruised, sore all over, worse touch'},{value:'_no',label:'No'}]},

    {id:'kb_nerve_injury', prompt:'Is there shooting, darting pain along nerve pathways after injury , worse from slightest touch?',
     tier:3, type:'single', session_field:'branch_answers', weight:'high',
     condition:{field:'complaint',value:'injury'}, remedy_hints:['hyper','led'],
     options:[{value:'nerve_shooting',label:'Yes , shooting nerve pain from injury'},{value:'_no',label:'No'}]},

    {id:'kb_puncture_cold', prompt:'Was the injury a puncture wound (nail, splinter, bite) and is the part cold yet relieved by cold?',
     tier:3, type:'single', session_field:'causation', weight:'high',
     condition:{field:'complaint',value:'injury'}, remedy_hints:['led'],
     options:[{value:'puncture_wounds',label:'Yes , puncture wound, cold helps'},{value:'_no',label:'No'}]}

  ] // end keynote_bank

}; // end INTAKE_POOLS
