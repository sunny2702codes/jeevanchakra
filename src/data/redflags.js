/* HDSS Safety Layer - Red-Flag Patterns
 * Fires BEFORE any remedy logic. Per Spec §8.
 * Each red flag has a severity:
 *   "emergency"  → HALT, display 999/911 guidance, no remedy display
 *   "urgent"     → strongly recommend same-day medical consultation, may still proceed with remedy as supportive
 *   "caution"    → display a banner; remedy display proceeds
 */
export const RED_FLAGS = [

  /* ── EMERGENCY: Cardiovascular ─────────────────────────────── */
  {
    id: "rf_cardiac_chest_pain",
    category: "Cardiovascular",
    severity: "emergency",
    question: "Crushing or squeezing chest pain, especially radiating to the jaw, left arm, or back?",
    trigger: ["chest_pain_crushing", "chest_pain_radiating_arm_jaw"],
    message: "Crushing chest pain radiating to jaw or arm may indicate a heart attack. Call emergency services immediately (999 / 911 / 108)."
  },
  {
    id: "rf_stroke",
    category: "Neurological",
    severity: "emergency",
    question: "Sudden facial droop, weakness on one side of the body, slurred speech, or sudden severe headache 'like never before'?",
    trigger: ["facial_droop", "one_sided_weakness", "slurred_speech", "thunderclap_headache"],
    message: "Sudden neurological symptoms (face droop, arm weakness, speech difficulty) may indicate a stroke. Time is critical - call emergency services immediately. Note the time of onset."
  },
  {
    id: "rf_severe_breathing",
    category: "Respiratory",
    severity: "emergency",
    question: "Severe difficulty breathing - gasping, blue lips, or inability to speak in full sentences?",
    trigger: ["severe_dyspnea", "blue_lips", "cannot_speak_full_sentence"],
    message: "Severe respiratory distress requires immediate emergency care. Call 999 / 911 / 108."
  },
  {
    id: "rf_anaphylaxis",
    category: "Allergic",
    severity: "emergency",
    question: "Swelling of face, lips, or tongue with breathing difficulty after exposure to food, medicine, or insect bite?",
    trigger: ["facial_swelling_with_breathing", "tongue_swelling"],
    message: "These signs suggest anaphylaxis - a life-threatening allergic reaction. Use an epinephrine auto-injector if available, and call emergency services immediately."
  },
  {
    id: "rf_meningitis",
    category: "Neurological",
    severity: "emergency",
    question: "Severe headache + stiff neck + high fever + sensitivity to light, especially with a non-blanching rash?",
    trigger: ["stiff_neck_with_fever", "non_blanching_rash"],
    message: "Stiff neck + fever + photophobia + (purple non-blanching rash) is a meningitis pattern. Seek emergency care now."
  },
  {
    id: "rf_severe_abdominal",
    category: "Gastrointestinal",
    severity: "emergency",
    question: "Sudden severe abdominal pain with rigid hard abdomen, vomiting blood, or passing black tarry stools?",
    trigger: ["rigid_abdomen", "hematemesis", "melena"],
    message: "These signs suggest an acute surgical or bleeding emergency. Seek emergency care immediately."
  },
  {
    id: "rf_suicidal",
    category: "Mental Health",
    severity: "emergency",
    question: "Active thoughts of harming yourself, or a plan to end your life?",
    trigger: ["suicidal_ideation_with_plan"],
    message: "Please reach out for support right now. Call a crisis line (e.g., 988 in the US, 116 123 in the UK/Samaritans, iCall +91-9152987821 in India) or go to your nearest emergency department. You are not alone."
  },

  /* ── URGENT: Pediatric ─────────────────────────────────────── */
  {
    id: "rf_infant_fever",
    category: "Pediatric",
    severity: "urgent",
    question: "Is the patient under 3 months old with a fever above 38°C / 100.4°F?",
    trigger: ["infant_under_3_months_fever"],
    message: "Any fever in an infant under 3 months requires same-day medical evaluation. Homeopathy may be supportive but is not a substitute for paediatric assessment."
  },
  {
    id: "rf_child_dehydration",
    category: "Pediatric",
    severity: "urgent",
    question: "Child with persistent vomiting/diarrhoea and signs of dehydration (no urine for 8 hours, sunken eyes, lethargy, no tears when crying)?",
    trigger: ["pediatric_dehydration"],
    message: "Dehydration in a child can deteriorate rapidly. Seek same-day medical care; oral rehydration salts should be started in the meantime."
  },
  {
    id: "rf_child_lethargy",
    category: "Pediatric",
    severity: "urgent",
    question: "Child unusually drowsy, hard to wake, or limp?",
    trigger: ["pediatric_lethargy"],
    message: "Lethargy or floppiness in a child is a serious sign - seek urgent medical assessment."
  },

  /* ── URGENT: Pregnancy ─────────────────────────────────────── */
  {
    id: "rf_pregnancy_bleeding",
    category: "Pregnancy",
    severity: "urgent",
    question: "Pregnant with vaginal bleeding, severe abdominal pain, severe headache, or visual disturbance?",
    trigger: ["pregnancy_bleeding", "pregnancy_severe_pain", "pre_eclampsia_signs"],
    message: "Any bleeding, severe pain, severe headache, or visual change in pregnancy requires immediate obstetric review."
  },
  {
    id: "rf_pregnancy_general",
    category: "Pregnancy",
    severity: "caution",
    question: "Are you currently pregnant or breastfeeding?",
    trigger: ["pregnancy_general"],
    message: "Several remedies and potencies require careful selection during pregnancy and lactation. A qualified homeopath should oversee the case. The suggestions here are educational only."
  },

  /* ── URGENT: Severe systemic ───────────────────────────────── */
  {
    id: "rf_high_persistent_fever",
    category: "Fever",
    severity: "urgent",
    question: "Fever above 39.5°C / 103°F persisting more than 48 hours despite measures?",
    trigger: ["persistent_high_fever"],
    message: "A high fever lasting more than 48 hours needs medical evaluation to rule out bacterial infection or other serious cause."
  },
  {
    id: "rf_severe_weight_loss",
    category: "Constitutional",
    severity: "urgent",
    question: "Unexplained weight loss of more than 5 kg / 10 lbs in 3 months, or night sweats with persistent low-grade fever?",
    trigger: ["unexplained_weight_loss", "night_sweats_chronic"],
    message: "Unexplained weight loss or chronic night sweats may indicate underlying disease (TB, malignancy, endocrine). Medical work-up is essential."
  },
  {
    id: "rf_severe_pain_unrelieved",
    category: "Pain",
    severity: "urgent",
    question: "Severe pain (8–10/10) that has not responded to anything and is increasing?",
    trigger: ["severe_unrelieved_pain"],
    message: "Severe escalating pain requires medical evaluation to identify the underlying cause."
  },
  {
    id: "rf_blood_in_urine_stool",
    category: "Gastrointestinal",
    severity: "urgent",
    question: "Visible blood in urine, stool, sputum, or vomit?",
    trigger: ["visible_blood_in_excreta"],
    message: "Visible blood in urine, stool, sputum, or vomit must be investigated medically. Homeopathy may be supportive but cannot replace diagnostic work-up."
  },

  /* ── CAUTION: Chronic disease and known diagnoses ──────────── */
  {
    id: "rf_known_chronic_disease",
    category: "Chronic",
    severity: "caution",
    question: "Do you have a known chronic condition (diabetes, hypertension, heart disease, kidney disease, autoimmune, cancer)?",
    trigger: ["chronic_disease_known"],
    message: "Chronic disease management should remain with your primary physician. Homeopathic suggestions here are supportive and educational, not a replacement for prescribed treatment. Do not stop conventional medication based on this app."
  },
  {
    id: "rf_on_medication",
    category: "Medication",
    severity: "caution",
    question: "Currently taking prescription medication (especially blood thinners, immunosuppressants, chemotherapy, antipsychotics)?",
    trigger: ["on_prescription_medication"],
    message: "Some homeopathic remedies may be antidoted by, or interact with, conventional medication. Discuss any planned remedy with a qualified homeopath who can review your current prescriptions."
  },
  {
    id: "rf_post_surgical_recent",
    category: "Surgical",
    severity: "caution",
    question: "Recent surgery (within last 2 weeks) or post-operative complications?",
    trigger: ["recent_surgery"],
    message: "Post-surgical care should be supervised by the surgical team. Arnica, Staphysagria, Hypericum can be supportive but do not substitute for surgical follow-up. Report unexpected symptoms to your surgeon."
  },

  /* ── EMERGENCY: Paediatric ─────────────────────────────────── */
  {
    id: "rf_infant_bulging_fontanelle",
    category: "Pediatric",
    severity: "emergency",
    question: "Infant with a bulging or tense fontanelle (soft spot on head), fever, and stiff neck?",
    trigger: ["infant_bulging_fontanelle", "infant_stiff_neck_fever"],
    message: "A bulging fontanelle with fever and neck stiffness in an infant is a medical emergency - this pattern strongly suggests meningitis. Call emergency services (999 / 911 / 108) immediately. Do not delay for any other treatment."
  },
  {
    id: "rf_infant_projectile_vomiting",
    category: "Pediatric",
    severity: "emergency",
    question: "Infant under 3 months with forceful projectile vomiting after every feed, not gaining weight?",
    trigger: ["infant_projectile_vomiting", "infant_failure_to_thrive"],
    message: "Repeated projectile vomiting in a young infant may indicate pyloric stenosis, which can lead to dangerous dehydration and electrolyte imbalance. Seek emergency paediatric assessment today."
  },
  {
    id: "rf_infant_high_fever",
    category: "Pediatric",
    severity: "emergency",
    question: "Child under 3 months with fever above 40°C / 104°F?",
    trigger: ["infant_extreme_fever", "infant_under_3_months_high_fever"],
    message: "A fever above 40°C in an infant under 3 months is a paediatric emergency. Serious bacterial infection must be excluded immediately. Call emergency services or go to the nearest emergency department now."
  },
  {
    id: "rf_febrile_convulsion_prolonged",
    category: "Pediatric",
    severity: "emergency",
    question: "Child having a convulsion (fit) lasting more than 5 minutes, or not fully recovering consciousness after a febrile seizure?",
    trigger: ["febrile_convulsion_prolonged", "child_postictal_not_recovering"],
    message: "A febrile convulsion lasting more than 5 minutes or failure to recover consciousness is a medical emergency. Call emergency services (999 / 911 / 108) immediately. Turn the child onto their side and protect from injury."
  },
  {
    id: "rf_child_respiratory_distress",
    category: "Pediatric",
    severity: "emergency",
    question: "Child showing severe breathing difficulty - stridor (harsh crowing sound), blue or grey lips, skin pulling in between the ribs with each breath?",
    trigger: ["child_stridor", "child_cyanosis", "child_intercostal_recession"],
    message: "Stridor, cyanosis, or severe intercostal recession in a child indicate a respiratory emergency (epiglottitis, croup, foreign body, bronchiolitis). Call emergency services immediately. Keep the child calm and upright."
  },

  /* ── EMERGENCY: Obstetric / Gynaecological ─────────────────── */
  {
    id: "rf_ectopic_pregnancy",
    category: "Obstetric",
    severity: "emergency",
    question: "Severe one-sided lower abdominal or pelvic pain, missed period, and any vaginal bleeding in a woman of childbearing age?",
    trigger: ["ectopic_pregnancy_signs", "pelvic_pain_missed_period_bleeding"],
    message: "Severe one-sided pelvic pain with a missed period and vaginal bleeding is a classic ectopic pregnancy pattern - a potentially fatal surgical emergency. Call emergency services immediately. Do not eat or drink."
  },
  {
    id: "rf_postpartum_haemorrhage",
    category: "Obstetric",
    severity: "emergency",
    question: "Postpartum (after giving birth) and soaking through more than one sanitary pad per hour, or passing large clots?",
    trigger: ["postpartum_haemorrhage", "excessive_postpartum_bleeding"],
    message: "Heavy postpartum bleeding (soaking more than one pad per hour) is a life-threatening obstetric emergency. Call emergency services (999 / 911 / 108) immediately and keep the mother lying down."
  },
  {
    id: "rf_pre_eclampsia",
    category: "Obstetric",
    severity: "emergency",
    question: "Pregnant and experiencing severe headache, visual disturbances (flashing lights, blurred vision), OR significant swelling of the face and hands?",
    trigger: ["pre_eclampsia_headache_visual", "pregnancy_facial_swelling", "pregnancy_severe_headache"],
    message: "Severe headache, visual disturbances, or sudden face and hand swelling during pregnancy may indicate pre-eclampsia - a serious condition that can progress to eclamptic seizures. Seek emergency obstetric care immediately."
  },

  /* ── EMERGENCY: Endocrine ──────────────────────────────────── */
  {
    id: "rf_diabetic_ketoacidosis",
    category: "Endocrine",
    severity: "emergency",
    question: "Known diabetic with fruity or sweet-smelling breath, deep rapid gasping breathing, confusion, or inability to keep fluids down?",
    trigger: ["dka_fruity_breath", "kussmaul_breathing", "diabetic_confusion"],
    message: "Fruity breath, Kussmaul (deep, rapid) breathing, and confusion in a diabetic are signs of diabetic ketoacidosis (DKA) - a life-threatening emergency. Call emergency services immediately. Do not give insulin without medical supervision."
  },
  {
    id: "rf_hypoglycaemia",
    category: "Endocrine",
    severity: "emergency",
    question: "Known diabetic suddenly cold and clammy, trembling, confused, or losing consciousness?",
    trigger: ["hypoglycaemia_confusion", "hypoglycaemia_cold_sweat", "diabetic_altered_consciousness"],
    message: "These signs suggest severe hypoglycaemia (dangerously low blood sugar). If the person is conscious, give sugar (glucose tablets, juice, or sugary drink) immediately. If unconscious, call emergency services - do not give anything by mouth."
  },

  /* ── EMERGENCY: Mental Health ──────────────────────────────── */
  {
    id: "rf_suicidal_active_plan",
    category: "Mental Health",
    severity: "emergency",
    question: "Do you have an active, specific plan to end your life, and access to the means to carry it out?",
    trigger: ["suicidal_active_plan_with_means"],
    message: "An active suicidal plan with means and intent is a psychiatric emergency. Please call a crisis line right now (988 in the US; 116 123 Samaritans UK; iCall +91-9152987821 India) or go to your nearest emergency department with someone you trust. You will not be judged."
  },
  {
    id: "rf_homicidal_ideation",
    category: "Mental Health",
    severity: "emergency",
    question: "Are you having thoughts of harming or killing a specific other person?",
    trigger: ["homicidal_ideation_named_target"],
    message: "Thoughts of harming a specific person require immediate professional intervention. Please speak to a mental health crisis team, call emergency services, or go to the nearest emergency department immediately."
  },
  {
    id: "rf_acute_psychosis",
    category: "Mental Health",
    severity: "emergency",
    question: "Complete loss of contact with reality - hallucinations, delusions, or behaviour that poses an immediate danger to self or others?",
    trigger: ["acute_psychosis", "psychosis_danger_to_self_others"],
    message: "Acute psychosis with danger to self or others is a psychiatric emergency. Call emergency services (999 / 911 / 108) or a mental health crisis line immediately. Do not leave the person alone."
  },

  /* ── EMERGENCY: Overdose / Poisoning ───────────────────────── */
  {
    id: "rf_drug_overdose",
    category: "Toxicological",
    severity: "emergency",
    question: "Suspected ingestion of an excessive dose of any medication, recreational drug, or substance?",
    trigger: ["drug_overdose_suspected", "medication_overdose"],
    message: "Suspected drug or medication overdose is a medical emergency. Call emergency services (999 / 911 / 108) or Poison Control immediately. Note the substance, amount, and time of ingestion if known. Do not induce vomiting unless directed by Poison Control."
  },
  {
    id: "rf_chemical_poisoning",
    category: "Toxicological",
    severity: "emergency",
    question: "Suspected ingestion or inhalation of a chemical substance, household product, or plant toxin?",
    trigger: ["chemical_poisoning_suspected", "plant_toxin_ingested"],
    message: "Suspected chemical or plant poisoning requires emergency medical attention. Call Poison Control or emergency services (999 / 911 / 108) immediately. Bring the container or a sample of the substance if safe to do so."
  },

  /* ── EMERGENCY: Neurological / Vascular ────────────────────── */
  {
    id: "rf_cauda_equina",
    category: "Neurological",
    severity: "emergency",
    question: "Severe lower back pain with new weakness in both legs, loss of bladder or bowel control, or numbness in the groin or inner thighs ('saddle anaesthesia')?",
    trigger: ["cauda_equina_bladder_bowel", "saddle_anaesthesia", "bilateral_leg_weakness_acute"],
    message: "Loss of bladder or bowel control with leg weakness and back pain is the classic cauda equina syndrome - a spinal emergency requiring surgery within hours to prevent permanent paralysis. Go to the nearest emergency department immediately."
  },
  {
    id: "rf_dvt_pe",
    category: "Cardiovascular",
    severity: "emergency",
    question: "One calf that is hot, swollen, and tender, combined with sudden shortness of breath or chest pain?",
    trigger: ["dvt_signs", "calf_swollen_hot_tender", "dvt_with_breathlessness"],
    message: "A swollen, hot, tender calf combined with sudden breathlessness raises concern for deep vein thrombosis (DVT) with pulmonary embolism (PE) - a potentially fatal emergency. Call emergency services immediately."
  },
  {
    id: "rf_acute_eye_emergency",
    category: "Ophthalmological",
    severity: "emergency",
    question: "Sudden severe eye pain with rapid vision loss, halos around lights, or a red eye that is very hard to the touch?",
    trigger: ["acute_eye_pain_vision_loss", "sudden_vision_loss", "acute_angle_closure_glaucoma"],
    message: "Sudden severe eye pain with vision loss may indicate acute angle-closure glaucoma or retinal detachment - both ophthalmic emergencies where delay causes permanent blindness. Go to an eye casualty unit or emergency department immediately."
  },

  /* ── URGENT: Urological ────────────────────────────────────── */
  {
    id: "rf_acute_urinary_retention",
    category: "Urological",
    severity: "urgent",
    question: "Complete inability to pass urine for more than 6–8 hours with a painful, distended bladder?",
    trigger: ["acute_urinary_retention", "bladder_distended_painful"],
    message: "Acute urinary retention (inability to pass urine with a distended bladder) requires same-day catheterisation to relieve pressure and protect kidney function. Go to your nearest emergency department or urgent care centre."
  },

  /* ── EMERGENCY: Paediatric - bacterial meningitis ──────────── */
  {
    id: "ped_meningitis",
    category: "Paediatric / Neurological",
    severity: "emergency",
    question: "In a child: bulging fontanelle in an infant, high-pitched cry with fever, purple or red rash that does not fade on the glass test, or stiff neck with fever and extreme light sensitivity?",
    trigger: ["bulging_fontanelle", "non_blanching_rash_child", "infant_high_pitched_cry_fever", "stiff_neck_child_fever"],
    message: "These are signs of possible bacterial meningitis or meningococcal sepsis in a child. This is fatal without emergency antibiotics. Call emergency services immediately (999 / 911 / 108)."
  },

  /* ── EMERGENCY: Obstetric - eclampsia ──────────────────────── */
  {
    id: "eclampsia",
    category: "Obstetric",
    severity: "emergency",
    question: "Pregnant woman having a seizure or convulsion, or a pregnant woman who had a seizure and is now post-ictal / confused?",
    trigger: ["seizure_in_pregnancy", "eclamptic_seizure", "pregnant_convulsion"],
    message: "A seizure during pregnancy is eclampsia - a life-threatening obstetric emergency. Call emergency services (999 / 911 / 108) immediately. Lay the woman on her left side, protect her airway, and do not leave her alone."
  },

  /* ── EMERGENCY: Cardiovascular - aortic dissection ─────────── */
  {
    id: "aortic_dissection",
    category: "Cardiovascular",
    severity: "emergency",
    question: "Sudden tearing or ripping chest or back pain, or a dramatic difference in blood pressure or pulse between the two arms?",
    trigger: ["tearing_chest_back_pain", "unequal_arm_bp_pulse", "aortic_dissection_signs"],
    message: "Sudden tearing chest or back pain is the hallmark of aortic dissection - a surgical emergency where the main artery is splitting. Call emergency services immediately. Do not eat or drink. Do not give aspirin."
  },

  /* ── EMERGENCY: Vascular - acute limb ischaemia ─────────────── */
  {
    id: "acute_limb_ischaemia",
    category: "Vascular",
    severity: "emergency",
    question: "A limb (arm or leg) that is suddenly cold, pale, pulseless, painful, and with pins-and-needles or numbness - the 6 Ps?",
    trigger: ["cold_pale_pulseless_limb", "acute_limb_ischaemia_signs", "limb_mottled_blue_cold"],
    message: "A cold, pale, pulseless, painful limb indicates acute limb ischaemia - limb viability is measured in hours. Call emergency services immediately. Do not elevate the limb; keep it flat or slightly dependent."
  },

  /* ── EMERGENCY: Abdominal - peritonitis / surgical abdomen ──── */
  {
    id: "acute_abdomen_peritonitis",
    category: "Gastrointestinal",
    severity: "emergency",
    question: "Abdomen that is rigid and board-like to the touch, or severe constant abdominal pain with guarding, rebound tenderness, and fever?",
    trigger: ["rigid_board_abdomen", "rebound_tenderness", "peritonitis_signs", "abdominal_guarding_fever"],
    message: "A rigid board-like abdomen with rebound tenderness and fever indicates peritonitis or a perforated viscus - a surgical emergency. Call emergency services (999 / 911 / 108) immediately. Do not eat or drink. Do not give painkillers that may mask symptoms."
  },

  /* ── URGENT: Abdominal - intestinal obstruction ─────────────── */
  {
    id: "intestinal_obstruction",
    category: "Gastrointestinal",
    severity: "urgent",
    question: "Colicky abdominal pain with vomiting, abdominal distension, and absolute constipation (no flatus or stool for 24+ hours)?",
    trigger: ["no_flatus_24h", "abdominal_distension_vomiting", "intestinal_obstruction_signs"],
    message: "Colicky pain, distension, vomiting, and inability to pass flatus or stool suggest intestinal obstruction. This requires urgent hospital assessment within hours. Do not eat or drink. Go to the nearest emergency department."
  },

  /* ── EMERGENCY: Endocrine - thyroid storm ───────────────────── */
  {
    id: "thyroid_storm",
    category: "Endocrine",
    severity: "emergency",
    question: "Known thyroid condition with sudden very high fever, racing or irregular heartbeat, confusion or agitation, and excessive sweating?",
    trigger: ["thyroid_storm_signs", "hyperthyroid_crisis", "thyroid_fever_confusion_tachycardia"],
    message: "Thyroid storm (thyrotoxic crisis) is a rare but life-threatening endocrine emergency. The combination of high fever, rapid heart rate, and confusion in a known thyroid patient requires immediate emergency care. Call 999 / 911 / 108."
  },

  /* ── EMERGENCY: Endocrine - adrenal crisis ──────────────────── */
  {
    id: "adrenal_crisis",
    category: "Endocrine",
    severity: "emergency",
    question: "Known adrenal insufficiency or long-term steroid use, now with sudden severe weakness, vomiting, severe abdominal pain, and collapse or near-collapse?",
    trigger: ["adrenal_crisis_signs", "addisonian_crisis", "steroid_dependent_collapse"],
    message: "Sudden collapse with severe weakness, vomiting, and abdominal pain in a patient on long-term steroids or with known adrenal disease is an Addisonian (adrenal) crisis. This is fatal without emergency hydrocortisone. Call emergency services immediately."
  },

  /* ── URGENT: Geriatric - fall with fracture pattern ─────────── */
  {
    id: "geriatric_hip_fracture",
    category: "Geriatric",
    severity: "urgent",
    question: "Elderly person who has fallen and cannot bear weight on a leg, with pain in the hip or groin, and one leg appearing shortened or rotated outward?",
    trigger: ["elderly_fall_cannot_weight_bear", "hip_pain_after_fall", "leg_shortened_rotated_after_fall"],
    message: "A fall with inability to weight-bear and a shortened or externally rotated leg in an elderly person strongly suggests a hip fracture. This requires same-day hospital assessment and imaging. Do not attempt to move the person without support."
  },

  /* ── URGENT: Geriatric - acute delirium ─────────────────────── */
  {
    id: "geriatric_acute_delirium",
    category: "Geriatric",
    severity: "urgent",
    question: "Elderly person with sudden onset confusion, disorientation, fluctuating level of consciousness, or dramatic change in behaviour over hours to days?",
    trigger: ["acute_delirium_elderly", "sudden_confusion_elderly", "fluctuating_consciousness_elderly"],
    message: "Sudden confusion or disorientation in an elderly person (acute delirium) is a medical emergency with many causes including infection, medication, stroke, and metabolic disturbance. Seek same-day medical assessment. Do not attribute it to dementia without excluding treatable causes."
  },

  /* ── URGENT: Travel - suspected malaria ─────────────────────── */
  {
    id: "travel_malaria",
    category: "Travel Medicine",
    severity: "urgent",
    question: "Fever with rigors (severe shaking chills) within 3 months of travel to a malaria-endemic region (sub-Saharan Africa, South Asia, Southeast Asia, parts of South America)?",
    trigger: ["fever_after_tropical_travel", "rigors_after_travel", "malaria_risk_travel"],
    message: "Fever and rigors within 3 months of travel to a malaria-endemic area must be assessed for malaria urgently. A blood smear or rapid diagnostic test is needed today. Delay can be fatal. Go to a hospital or travel medicine clinic with full travel history."
  },

  /* ── URGENT: Travel - dengue warning signs ──────────────────── */
  {
    id: "travel_dengue_warning",
    category: "Travel Medicine",
    severity: "urgent",
    question: "Fever after tropical travel, with severe abdominal pain, persistent vomiting, bleeding from gums or nose, or a rash with rapid deterioration?",
    trigger: ["dengue_warning_signs", "tropical_fever_bleeding_rash", "dengue_severe_abdominal_pain"],
    message: "These are dengue fever warning signs indicating possible severe dengue (dengue haemorrhagic fever). Seek urgent hospital assessment today. Do not take ibuprofen or aspirin - these increase bleeding risk. Paracetamol only for fever, and maintain fluid intake."
  },

  /* ── EMERGENCY: Paediatric - bulging fontanelle ─────────────── */
  {
    id: "rf_paediatric_bulging_fontanelle",
    category: "Paediatric",
    severity: "emergency",
    question: "Infant with a bulging or tense fontanelle (soft spot on head) when calm and upright, combined with fever, irritability, a high-pitched cry, or stiff neck?",
    trigger: ["infant_bulging_fontanelle_fever", "infant_tense_fontanelle", "infant_meningism_signs"],
    message: "A bulging fontanelle with fever and irritability in an infant indicates raised intracranial pressure — most commonly bacterial meningitis or encephalitis. This is a life-threatening emergency. Call emergency services (999 / 911 / 108) immediately. Do not delay for any observation period."
  },

  /* ── URGENT: Paediatric - projectile vomiting neonate ──────── */
  {
    id: "rf_paediatric_projectile_vomiting",
    category: "Paediatric",
    severity: "urgent",
    question: "Infant aged 2–8 weeks with forceful projectile non-bilious (milk-coloured) vomiting after every feed, always hungry immediately after vomiting, and failing to gain weight?",
    trigger: ["neonate_projectile_vomiting", "pyloric_stenosis_pattern", "infant_non_bilious_projectile_vomit"],
    message: "Projectile non-bilious vomiting in a 2–8 week old infant after every feed is the classic presentation of pyloric stenosis — a correctable surgical condition. Without treatment, severe dehydration and dangerous electrolyte imbalance develops rapidly. Seek same-day paediatric assessment."
  },

  /* ── EMERGENCY: Paediatric - intussusception ────────────────── */
  {
    id: "rf_paediatric_intussusception",
    category: "Paediatric",
    severity: "emergency",
    question: "Child (usually 3 months to 6 years) with episodes of sudden severe colicky pain causing drawing up of knees, followed by bloody mucous stool ('currant jelly'), or a sausage-shaped mass felt in the abdomen?",
    trigger: ["intussusception_colicky_pain", "currant_jelly_stool", "abdominal_sausage_mass_child"],
    message: "Colicky pain, 'currant jelly' (blood-mucus) stool, and a palpable sausage mass in a young child strongly suggest intussusception — a surgical emergency where one bowel segment telescopes into another causing ischaemia. Call emergency services (999 / 911 / 108) immediately."
  },

  /* ── EMERGENCY: Paediatric - epiglottitis ───────────────────── */
  {
    id: "rf_paediatric_epiglottitis",
    category: "Paediatric",
    severity: "emergency",
    question: "Child who looks toxic and frightened, drooling and refusing to swallow, leaning forward in a tripod position, with a high-pitched inspiratory stridor and a muffled 'hot potato' voice?",
    trigger: ["child_drooling_tripod_stridor", "epiglottitis_signs", "child_toxic_appearing_drooling_stridor"],
    message: "Drooling, tripod posture, and stridor in a toxic-looking child are classic signs of epiglottitis — a rapidly fatal upper airway emergency. Do NOT examine the throat or attempt to use a tongue depressor as this can precipitate complete airway obstruction. Keep the child calm and upright. Call emergency services immediately (999 / 911 / 108). Airway management must occur only in a controlled hospital setting."
  },

  /* ── URGENT: Paediatric - complex febrile seizure ──────────── */
  {
    id: "rf_paediatric_febrile_seizure_complex",
    category: "Paediatric",
    severity: "urgent",
    question: "Child with a febrile seizure lasting more than 15 minutes, a seizure affecting only one side of the body, more than one seizure within 24 hours, or a febrile seizure in a child under 6 months or over 5 years of age?",
    trigger: ["complex_febrile_seizure", "febrile_seizure_prolonged_15min", "focal_febrile_seizure", "febrile_seizure_atypical_age"],
    message: "A complex febrile seizure (duration >15 min, focal, recurrent within 24 h, or occurring outside the typical age window of 6 months to 5 years) requires same-day medical evaluation to exclude meningitis or an underlying neurological cause. Seek emergency assessment today."
  },

  /* ── EMERGENCY: Obstetric - placenta praevia ────────────────── */
  {
    id: "rf_placenta_previa",
    category: "Obstetric",
    severity: "emergency",
    question: "Pregnant woman (especially after 20 weeks) with sudden painless bright red vaginal bleeding, with no abdominal pain?",
    trigger: ["painless_antepartum_haemorrhage", "placenta_previa_bleeding", "bright_red_painless_antenatal_bleed"],
    message: "Painless bright red vaginal bleeding after 20 weeks of pregnancy is the hallmark of placenta praevia — a potentially life-threatening obstetric emergency for both mother and baby. Call emergency services (999 / 911 / 108) immediately. Do NOT perform a vaginal examination. Keep the mother lying on her left side."
  },

  /* ── EMERGENCY: Gynaecological - ovarian torsion ────────────── */
  {
    id: "rf_ovarian_torsion",
    category: "Gynaecological",
    severity: "emergency",
    question: "Sudden severe one-sided pelvic or lower abdominal pain coming on abruptly, with nausea and vomiting, in a woman of childbearing age?",
    trigger: ["ovarian_torsion_sudden_pelvic_pain", "acute_unilateral_pelvic_pain_vomiting", "adnexal_pain_sudden_onset"],
    message: "Sudden severe one-sided pelvic pain with nausea and vomiting in a woman may indicate ovarian torsion — twisting of the ovary that cuts off its blood supply. Ovarian salvage is time-critical (typically within 4–6 hours of onset). Call emergency services or go immediately to the nearest emergency department."
  },

  /* ── EMERGENCY: Obstetric / Mental Health - postpartum psychosis */
  {
    id: "rf_postpartum_psychosis",
    category: "Obstetric / Mental Health",
    severity: "emergency",
    question: "Woman within 2 weeks of giving birth with sudden onset of confusion, hallucinations, delusions, grossly disorganised behaviour, or manic agitation?",
    trigger: ["postpartum_psychosis_onset", "puerperal_psychosis_hallucinations", "early_postpartum_confusion_mania"],
    message: "Postpartum psychosis is a psychiatric emergency that typically begins abruptly within the first 2 weeks after delivery. It carries significant risk of harm to both mother and infant. Call emergency services (999 / 911 / 108) immediately or go directly to an emergency department. The mother should not be left alone with the baby."
  },

  /* ── EMERGENCY: Endocrine - diabetic ketoacidosis ───────────── */
  {
    id: "rf_dka",
    category: "Endocrine",
    severity: "emergency",
    question: "Known diabetic with excessive thirst and urination, fruity or acetone-smelling breath, deep and rapid (Kussmaul) breathing, nausea or vomiting, or confusion?",
    trigger: ["dka_polyuria_polydipsia", "dka_fruity_acetone_breath", "dka_kussmaul_breathing", "dka_diabetic_confusion_vomiting"],
    message: "Polyuria, fruity breath, Kussmaul (deep, gasping) breathing, and confusion in a diabetic patient are signs of diabetic ketoacidosis (DKA) — a life-threatening emergency. Call emergency services (999 / 911 / 108) immediately. IV fluids and insulin under medical supervision are required urgently."
  },

  /* ── EMERGENCY: Endocrine - thyroid storm ───────────────────── */
  {
    id: "rf_thyroid_storm",
    category: "Endocrine",
    severity: "emergency",
    question: "Known hyperthyroid patient, or post-thyroid surgery, with very high fever (above 39°C / 102°F), heart rate over 140–150, extreme agitation or confusion, and profuse sweating?",
    trigger: ["rf_thyroid_storm_hyperpyrexia", "rf_thyroid_crisis_tachycardia", "hyperthyroid_crisis_agitation_fever"],
    message: "High fever, extreme tachycardia, agitation, and confusion in a known hyperthyroid patient constitutes a thyroid storm (thyrotoxic crisis) — a rare but potentially fatal endocrine emergency with mortality up to 20–30% even with treatment. Call emergency services (999 / 911 / 108) immediately."
  },

  /* ── EMERGENCY: Endocrine - Addisonian crisis ───────────────── */
  {
    id: "rf_addisonian_crisis",
    category: "Endocrine",
    severity: "emergency",
    question: "Known adrenal insufficiency or sudden steroid withdrawal, with severe weakness, vomiting, diarrhoea, severe abdominal pain, low blood pressure, and near-collapse or collapse?",
    trigger: ["addisonian_crisis_collapse", "adrenal_insufficiency_acute", "steroid_withdrawal_hypotension"],
    message: "Sudden collapse with severe weakness, vomiting, and hypotension in a patient with known adrenal disease or long-term steroid use indicates an Addisonian (adrenal) crisis. Without emergency hydrocortisone this is fatal. Call emergency services (999 / 911 / 108) immediately."
  },

  /* ── EMERGENCY: Endocrine - severe hypoglycaemia ────────────── */
  {
    id: "rf_hypoglycaemia_severe",
    category: "Endocrine",
    severity: "emergency",
    question: "Known diabetic on insulin or oral hypoglycaemics, now with altered or reduced consciousness, unresponsiveness, or seizures — unable to swallow?",
    trigger: ["severe_hypoglycaemia_unconscious", "hypoglycaemia_seizure", "diabetic_unresponsive_on_medication"],
    message: "Unconsciousness or seizure from severe hypoglycaemia is a medical emergency. Do NOT give anything by mouth to an unconscious person — aspiration risk. Call emergency services (999 / 911 / 108) immediately. If trained, administer glucagon injection. If conscious and able to swallow safely, give glucose without delay."
  },

  /* ── EMERGENCY: Mental Health - severe psychosis ────────────── */
  {
    id: "rf_severe_psychosis",
    category: "Mental Health",
    severity: "emergency",
    question: "Person hearing command hallucinations (voices instructing them to harm themselves or others), completely unable to care for themselves due to psychotic symptoms, or posing immediate danger?",
    trigger: ["command_hallucinations_harm", "psychosis_unable_to_self_care", "psychosis_immediate_danger_to_self_others"],
    message: "Command hallucinations directing harm, or an inability to care for oneself due to acute psychosis, constitute a psychiatric emergency. Call emergency services (999 / 911 / 108) or a mental health crisis team immediately. Do not leave the person alone."
  },

  /* ── EMERGENCY: Toxicological - suspected overdose ──────────── */
  {
    id: "rf_overdose_suspected",
    category: "Toxicological",
    severity: "emergency",
    question: "Person with altered or reduced consciousness, found near empty pill bottles or drug paraphernalia, or with a known or strongly suspected ingestion of medications, recreational drugs, or other substances?",
    trigger: ["suspected_drug_overdose", "altered_consciousness_empty_bottles", "substance_ingestion_suspected"],
    message: "Suspected drug or medication overdose with altered consciousness is a medical emergency. Call emergency services (999 / 911 / 108) or Poison Control immediately. Note the substance name, estimated amount, and time of ingestion if known. Do not induce vomiting unless specifically directed by Poison Control."
  },

  /* ── EMERGENCY: Toxicological - carbon monoxide poisoning ───── */
  {
    id: "rf_carbon_monoxide",
    category: "Toxicological",
    severity: "emergency",
    question: "Headache, nausea, dizziness, confusion, or cherry-red skin affecting multiple people in the same enclosed space, or occurring near faulty heating, boilers, or cooking appliances?",
    trigger: ["carbon_monoxide_multiple_affected", "co_poisoning_cherry_red_skin", "enclosed_space_headache_confusion_multiple_persons"],
    message: "Headache, nausea, and confusion affecting multiple people in the same enclosed space strongly suggests carbon monoxide poisoning. CO is odourless and colourless — symptoms may seem mild before sudden collapse. Get everyone out of the building immediately and call emergency services (999 / 911 / 108). Do not re-enter the building. Do not use lifts."
  },

  /* ── EMERGENCY: Vascular - mesenteric ischaemia ─────────────── */
  {
    id: "rf_mesenteric_ischaemia",
    category: "Vascular / Gastrointestinal",
    severity: "emergency",
    question: "Sudden severe central or diffuse abdominal pain that seems out of all proportion to what examination reveals, in a patient with known atrial fibrillation, heart disease, or vascular disease — possibly worse after meals?",
    trigger: ["mesenteric_ischaemia_af", "abdominal_pain_disproportionate_to_exam", "post_prandial_severe_abdominal_pain_vascular"],
    message: "Severe abdominal pain grossly disproportionate to examination findings in a patient with atrial fibrillation or known arterial disease suggests acute mesenteric ischaemia — loss of blood supply to the intestines. This is a surgical emergency with very high mortality without prompt intervention. Call emergency services (999 / 911 / 108) immediately. Do not eat or drink."
  },

  /* ── EMERGENCY: Vascular - acute limb ischaemia ─────────────── */
  {
    id: "rf_limb_ischaemia",
    category: "Vascular",
    severity: "emergency",
    question: "A limb (arm or leg) that has suddenly become cold, pale or mottled, pulseless, with severe pain, inability to move it, and pins-and-needles or complete numbness (the 6 Ps)?",
    trigger: ["limb_ischaemia_6Ps", "cold_pale_pulseless_paralysed_limb", "acute_arterial_occlusion_limb"],
    message: "A cold, pale, pulseless, painful limb with paralysis and paraesthesia (the 6 Ps — Pain, Pallor, Pulselessness, Paralysis, Paraesthesia, Poikilothermia) indicates acute limb ischaemia. Limb viability is lost within 6 hours without revascularisation. Call emergency services (999 / 911 / 108) immediately. Keep the limb flat or slightly lowered — do not elevate."
  },

  /* ── EMERGENCY: Neurological - status epilepticus ───────────── */
  {
    id: "rf_status_epilepticus",
    category: "Neurological",
    severity: "emergency",
    question: "Seizure that has been continuing for more than 5 minutes without stopping, or two or more seizures occurring consecutively with no return to normal consciousness between them?",
    trigger: ["seizure_over_5_minutes", "status_epilepticus_continuous", "multiple_seizures_no_recovery_between"],
    message: "A seizure lasting more than 5 minutes, or a series of seizures without recovery of consciousness between them, is status epilepticus — a neurological emergency with risk of permanent brain damage and death. Call emergency services (999 / 911 / 108) immediately. Place the person on their side, protect from injury, note the exact time the seizure started. Do not restrain or place anything in the mouth."
  }
];

/* Severity ordering used by the safety engine */
export const RED_FLAG_SEVERITY_ORDER = {emergency: 3, urgent: 2, caution: 1};
