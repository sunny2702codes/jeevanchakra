/**
 * Keynote probe bank — adaptive yes/no questions shown after preliminary ranking.
 * Key = exact keynote symptom string from remedy.keynotes[].symptom
 * Value = plain-language yes/no prompt shown to the user
 *
 * These are shown ONLY for the keynotes of the top-5 ranked remedies, so the
 * user never sees more than 5-8 probes per case. Answering yes adds the keynote
 * string to session.collected_keynotes, which the scoring engine weights at x5.
 *
 * Source: Boericke 8th Ed. keynotes, grade 3 (most characteristic).
 */

export const KEYNOTE_PROBES = {

  // ── Arsenicum album ───────────────────────────────────────────────────────
  'burning_pains_better_warmth':
    'Is there burning pain or burning sensations that feel better from heat or warm applications?',
  'midnight_to_2AM_aggravation':
    'Does the condition consistently worsen between midnight and 2 AM?',
  'great_anxiety_restlessness_changes_place':
    'Is there marked anxiety with physical restlessness, constantly moving from place to place?',
  'thirst_small_sips_frequent':
    'Is there thirst for small sips of water taken frequently rather than large drinks?',
  'extreme_prostration_disproportionate':
    'Is the weakness or exhaustion out of proportion to the illness (far more than expected)?',
  'fastidious_orderly':
    'Is the patient unusually fastidious, needing everything in its exact place even when ill?',
  'fear_of_death_being_alone':
    'Is there a strong fear of dying or a marked fear of being left alone?',

  // ── Pulsatilla ────────────────────────────────────────────────────────────
  'mild_yielding_weepy_emotional':
    'Is the patient mild, gentle, easily moved to tears, and seeking consolation?',
  'thirstless_even_with_fever_or_dry_mouth':
    'Is there unusual thirstlessness even with fever or a noticeably dry mouth?',
  'warm_blooded_better_open_air':
    'Does the patient strongly desire open air and feel worse in warm or closed rooms?',
  'changeable_wandering_symptoms':
    'Do the symptoms change location or character frequently, never staying the same?',
  'discharges_thick_bland_yellow_green':
    'Are the discharges (nasal, eye, ear, vaginal) thick, bland, yellow-green, and non-irritating?',
  'better_consolation_sympathy':
    'Does the patient feel distinctly better with sympathy, attention, and company?',

  // ── Bryonia alba ──────────────────────────────────────────────────────────
  'worse_from_slightest_motion':
    'Is the slightest movement intensely aggravating, even turning in bed?',
  'better_lying_on_painful_side_pressure':
    'Is there marked relief from lying on the painful side or from firm pressure?',
  'stitching_tearing_pains':
    'Are the pains predominantly stitching or tearing in character?',
  'great_thirst_for_large_quantities_cold_water':
    'Is there strong thirst for large quantities of cold water at long intervals?',
  'dryness_of_all_mucous_membranes':
    'Are all mucous membranes (lips, mouth, throat) markedly dry?',
  'wants_to_be_left_alone_irritable':
    'Does the patient strongly want to be left alone and becomes irritable when disturbed?',

  // ── Lycopodium ────────────────────────────────────────────────────────────
  'aggravation_4_to_8PM':
    'Do symptoms consistently worsen between 4 PM and 8 PM?',
  'right_sided_complaints_or_right_to_left':
    'Are complaints predominantly right-sided, or do they move from right to left?',
  'great_flatulence_distention_after_eating_small_amount':
    'Is there marked bloating and flatulence even after eating only a small amount?',
  'hungry_but_full_after_few_bites':
    'Does the patient feel hungry but become full or bloated after just a few bites?',
  'craves_sweets_warm_drinks':
    'Is there a noticeable craving for sweets and preference for warm food and drinks?',
  'lack_of_self_confidence_appears_arrogant':
    'Is there hidden lack of self-confidence, fear of failure, with an outwardly confident or arrogant manner?',

  // ── Nux vomica ────────────────────────────────────────────────────────────
  'extreme_irritability_fastidious_zealous':
    'Is the patient extremely irritable, impatient, driven, and overly critical of others?',
  'oversensitive_noise_light_odors_drafts':
    'Is there extreme hypersensitivity to noise, light, odors, or the slightest draft?',
  'constipation_with_constant_ineffectual_urging':
    'Is there constipation with constant, ineffectual urging to stool?',
  'morning_aggravation_especially_3_4AM':
    'Is there a characteristic worsening in the early morning, especially 3 to 4 AM?',
  'chilly_cannot_get_warm_even_with_wraps':
    'Is the patient chilly and unable to get warm even when well covered?',
  'ailments_from_high_living_overwork':
    'Did the illness follow a period of overindulgence (food, drink, stimulants) or mental overwork?',

  // ── Calcarea carbonica ────────────────────────────────────────────────────
  'head_sweats_profusely_during_sleep_wets_pillow':
    'Does the patient sweat profusely on the head during sleep, wetting the pillow?',
  'sour_smelling_perspiration_stool_vomit':
    'Is there a distinctive sour smell to the perspiration, stool, or vomit?',
  'cold_clammy_feet_as_if_wet_stockings':
    'Are the feet cold and clammy, as if wearing cold, damp stockings?',
  'fat_flabby_chilly_pale':
    'Is the patient fair, fat, flabby, chilly, and pale with a tendency to obesity?',
  'craving_eggs_indigestible_things_chalk':
    'Is there a craving for eggs, chalk, or indigestible substances?',

  // ── Sepia ─────────────────────────────────────────────────────────────────
  'indifference_to_loved_ones_to_family_to_occupation':
    'Is there marked indifference to loved ones, family, or usual interests that is uncharacteristic?',
  'bearing_down_sensation_pelvis_must_cross_legs':
    'Is there a bearing-down sensation in the pelvis, as if organs might fall out, relieved by crossing the legs?',
  'irritable_better_violent_exertion_dancing':
    'Is the patient irritable and exhausted, but feels better after vigorous exercise or dancing?',

  // ── Natrum muriaticum ─────────────────────────────────────────────────────
  'ailments_from_chronic_grief_cannot_weep_in_company':
    'Did the illness begin after prolonged grief, with an inability to cry in company?',
  'weeps_alone_consolation_aggravates':
    'Does the patient weep alone and feel distinctly worse when others try to console?',
  'great_craving_for_salt':
    'Is there a marked craving for salt or very salty food?',
  'headache_like_hammers_worse_sun_morning':
    'Is there a headache with a hammering or throbbing character, worse from sun or in the morning?',
  'introspective_holds_grudges_dwells_on_past':
    'Is the patient introspective, tends to dwell on past hurts, and holds grudges?',

  // ── Sulphur ───────────────────────────────────────────────────────────────
  'burning_pains_redness_of_orifices':
    'Is there burning pain with redness of the body openings (lips, nostrils, anus, eyelids)?',
  'worse_warmth_of_bed_throws_off_covers':
    'Does warmth, especially the warmth of the bed, aggravate, causing the patient to throw off covers?',
  'morning_diarrhea_drives_out_of_bed_5AM':
    'Is there diarrhoea in the early morning around 5 AM that drives the patient out of bed?',
  'hot_burning_feet_uncovers_at_night':
    'Are the feet hot and burning, causing the patient to stick them out from under the covers at night?',
  '11AM_faint_sinking_hunger':
    'Is there a characteristic sinking, faint, empty feeling in the stomach around 11 AM?',

  // ── Phosphorus ────────────────────────────────────────────────────────────
  'fearful_anxious_better_company_sympathy':
    'Is the patient fearful, anxious, sensitive, and distinctly better with company and sympathy?',
  'burning_pains_localised_better_cold':
    'Are there localised burning sensations that feel better from cold applications?',
  'great_thirst_for_cold_water_vomited_when_warm':
    'Is there strong thirst for cold water that may be vomited as soon as it becomes warm in the stomach?',
  'easy_bleeding_bright_red_small_wounds':
    'Is there a tendency to easy bleeding from small wounds with bright red blood?',
  'fears_thunderstorm_dark_being_alone':
    'Is there a marked fear of thunderstorms, darkness, or being alone?',
  'weak_empty_sinking_in_stomach_11AM':
    'Is there a weak, empty, all-gone feeling in the stomach around 11 AM?',

  // ── Silicea ───────────────────────────────────────────────────────────────
  'yielding_timid_lacks_grit_self_confidence':
    'Is the patient timid, yielding, and lacking in self-confidence, though capable once started?',
  'icy_cold_feet_with_offensive_perspiration':
    'Are the feet icy cold with offensive-smelling perspiration?',
  'tendency_to_suppuration_chronic_abscess':
    'Is there a tendency to form abscesses or suppuration that heals slowly?',
  'expels_foreign_bodies_splinters':
    'Has the patient a history of expelling foreign bodies such as splinters or bone fragments?',

  // ── Ignatia ───────────────────────────────────────────────────────────────
  'contradictory_paradoxical_symptoms':
    'Are there contradictory or paradoxical symptoms (e.g., sore throat better from swallowing, empty stomach better from eating)?',
  'deep_sighing_involuntary':
    'Is there frequent, deep, involuntary sighing?',
  'lump_in_throat_globus_hystericus':
    'Is there a sensation of a lump in the throat that is not relieved by swallowing?',
  'moods_change_rapidly_laughing_weeping':
    'Do the moods change rapidly, alternating between laughing and weeping in quick succession?',

  // ── Lachesis ─────────────────────────────────────────────────────────────
  'worse_after_sleep_amelioration_from_discharges':
    'Is there a characteristic worsening after sleep (even a short nap) and relief when any discharge appears?',
  'left_sided_complaints_or_left_to_right':
    'Are complaints predominantly left-sided, or do they move from left to right?',
  'loquacity_jumping_subject_to_subject':
    'Is there marked talkativeness, jumping from subject to subject during conversation?',
  'intolerance_of_tight_clothing_around_neck':
    'Is there intolerance of anything tight around the neck, throat, or waist?',

  // ── Belladonna ────────────────────────────────────────────────────────────
  'sudden_violent_onset':
    'Was the onset sudden and violent, reaching full intensity within minutes to hours?',
  'burning_radiating_heat':
    'Is there an intense burning, radiating heat from the affected part?',
  'throbbing_carotid_pulsation':
    'Is there a strong, visible throbbing of the arteries (especially carotid) or a pounding headache?',
  'red_flushed_face_bright':
    'Is the face bright red, hot, and flushed with dilated pupils?',

  // ── Rhus toxicodendron ────────────────────────────────────────────────────
  'restless_must_change_position_constantly':
    'Is there marked restlessness with a constant need to change position?',
  'worse_initial_motion_better_continued_motion':
    'Is there stiffness and pain on first moving, which eases with continued motion (rusty gate effect)?',
  'worse_cold_damp_better_warmth_dry':
    'Does cold, damp weather aggravate, and does warmth and dry conditions relieve?',
  'vesicular_eruption_burning_itching':
    'Is there a vesicular (blister-like) eruption with intense burning and itching?',

  // ── Mercurius ─────────────────────────────────────────────────────────────
  'profuse_offensive_sweat_does_not_relieve':
    'Is there profuse, offensive perspiration that does not relieve the complaints?',
  'tongue_flabby_indented_by_teeth':
    'Is the tongue flabby, coated, and showing indentations of the teeth on its edges?',
  'metallic_taste_excessive_salivation':
    'Is there a metallic taste in the mouth along with excessive salivation?',
  'worse_night_warmth_of_bed':
    'Do all complaints worsen at night and in the warmth of the bed?',

  // ── Thuja occidentalis ────────────────────────────────────────────────────
  'ailments_from_vaccination':
    'Did the illness begin, worsen, or first appear after a vaccination?',
  'sycotic_warts_condylomata_figwarts':
    'Is there a tendency to warts, condylomata, or fig-wart-like growths on the skin or mucous membranes?',
  'sweat_only_on_uncovered_parts':
    'Does perspiration occur only on uncovered parts of the body?',

  // ── Aconite ───────────────────────────────────────────────────────────────
  'intense_anxiety_fear_death':
    'Is there intense anxiety with a specific fear that the patient will die, perhaps even predicting the time?',
  'restlessness_with_anguish':
    'Is there extreme restlessness with anguish, tossing about with fear?',

  // ── Gelsemium ────────────────────────────────────────────────────────────
  'the_four_Ds_dullness_dizziness_drowsiness_droopy_eyelids':
    'Are the four Ds present: dullness of mind, dizziness, drowsiness, and drooping of the eyelids?',
  'trembling_weakness_from_emotion':
    'Is there trembling, weakness, or diarrhoea brought on by anticipation or emotional excitement?',

  // ── Chamomilla ────────────────────────────────────────────────────────────
  'extreme_irritability_nothing_satisfies':
    'Is there extreme irritability with nothing satisfying the patient, who demands things and then refuses them?',
  'intolerable_pains_drive_to_despair':
    'Are the pains intolerable, seemingly out of proportion, driving the patient to anguish or despair?',
  'one_cheek_red_one_pale':
    'Is one cheek red and hot while the other is pale and cool?',

  // ── Hepar sulphur ─────────────────────────────────────────────────────────
  'extreme_sensitivity_to_cold_air_must_be_wrapped':
    'Is there extreme chilliness, with the patient wanting to be completely wrapped, even a tiny draught causing aggravation?',
  'splinter_like_pains_in_inflamed_parts':
    'Is there a distinctive splinter-like or sticking pain in inflamed or sore areas?',
  'hypersensitive_to_pain_to_touch':
    'Is the patient hypersensitive to pain, crying out at the slightest touch?',

  // ── Staphysagria ─────────────────────────────────────────────────────────
  'ailments_from_suppressed_emotion_indignation':
    'Did the illness follow suppressed anger, humiliation, or indignation where the patient could not express feelings?',
  'trembling_after_anger_kept_in':
    'Is there trembling, weakness, or physical symptoms that appear after suppressed anger?',
  'extreme_sensitivity_to_what_others_say':
    'Is there extreme sensitivity to what others say about the patient, dwelling on perceived insults?',

  // ── Argentum nitricum ─────────────────────────────────────────────────────
  'anticipatory_anxiety_diarrhea':
    'Is there anticipatory anxiety with diarrhoea or urgency that appears before important events?',
  'hurried_must_walk_fast':
    'Is there a marked sense of hurry, as if always running behind, walking or doing everything fast?',
  'fear_of_heights_bridges_crowds':
    'Is there a marked fear of heights, bridges, or high buildings with an impulse to jump?',

  // ── Carbo vegetabilis ─────────────────────────────────────────────────────
  'patient_cold_blue_collapsed_but_wants_to_be_fanned':
    'Is the patient cold, bluish, and almost collapsed, but craving air and wanting to be fanned?',
  'great_flatulence_better_eructation':
    'Is there great bloating and flatulence in the upper abdomen with relief from belching?',

  // ── Kali bichromicum ─────────────────────────────────────────────────────
  'stringy_ropy_yellow_green_discharge':
    'Are the discharges (nasal, mucus, expectoration) thick, stringy, ropy, and difficult to detach?',
  'pain_in_small_circumscribed_spots':
    'Can the pain be covered by a fingertip, wandering suddenly to a distant spot?',
  'pains_appear_disappear_suddenly':
    'Do pains appear and disappear suddenly, shifting from place to place?',

  // ── Apis mellifica ────────────────────────────────────────────────────────
  'stinging_burning_pains':
    'Are the pains stinging and burning in character, like bee stings?',
  'edema_puffy_swelling':
    'Is there puffy, watery swelling of the eyelids, face, or affected parts?',
  'worse_heat_better_cold_application':
    'Does any form of heat aggravate while cold applications bring relief?',

  // ── Medorrhinum ──────────────────────────────────────────────────────────
  'sleeps_in_knee_chest_position_face_down':
    'Does the patient prefer or instinctively sleep in the knee-chest position (bottom up, face down)?',
  'intense_thirst_for_cold_water_ice':
    'Is there intense thirst for cold water or ice?',
  'time_passes_too_slowly_or_too_fast_distorted':
    'Is there a distorted sense of time, feeling as if time passes too slowly or that events happened long ago?',

  // ── Aurum metallicum ─────────────────────────────────────────────────────
  'profound_melancholy_with_suicidal_thoughts':
    'Is there profound depression with thoughts of suicide or a desire for death?',
  'bone_pains_worse_at_night':
    'Are there deep bone pains that are markedly worse at night?',

  // ── Ledum palustre ────────────────────────────────────────────────────────
  'puncture_wounds_better_cold_application':
    'Is the complaint from a puncture wound or insect bite, where the affected part feels better from cold?',
  'ascending_rheumatism_feet_upward':
    'Does the rheumatism or joint pain begin in the feet and travel upward?',
  'affected_parts_cold_to_touch_yet_better_cold':
    'Are the affected parts cold to the touch yet feel better from cold applications?',

  // ── Ferrum phosphoricum ───────────────────────────────────────────────────
  'first_stage_fever_low_grade_no_distinct_symptoms':
    'Is this the early stage of an illness with mild fever but no clear, characteristic symptoms yet?',
  'predisposition_to_hemorrhage_bright_red':
    'Is there easy bleeding with bright red blood from any mucous membrane?',
};
