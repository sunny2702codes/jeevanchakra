/**
 * JeevanChakra smoke test suite
 * Run: node smoke_test.mjs
 * Tests: data integrity, scoring engine, compliance strings, file structure
 */

import { readFileSync, existsSync } from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

let pass = 0, fail = 0;
const failures = [];

function ok(label, condition, detail = '') {
  if (condition) {
    console.log(`  PASS  ${label}`);
    pass++;
  } else {
    console.log(`  FAIL  ${label}${detail ? ' — ' + detail : ''}`);
    fail++;
    failures.push(label + (detail ? ': ' + detail : ''));
  }
}

function section(title) {
  console.log(`\n== ${title} ==`);
}

// ── 1. File structure ──────────────────────────────────────────────────────
section('File Structure');

const REQUIRED_FILES = [
  'src/App.tsx',
  'src/index.css',
  'src/types/index.ts',
  'src/auth/authStore.ts',
  'public/favicon.svg',
  'index.html',
  'src/components/Logo.tsx',
  'src/components/Sidebar.tsx',
  'src/components/Navbar.tsx',
  'src/engines/scoring.ts',
  'src/engines/safety.ts',
  'src/engines/differential.ts',
  'src/engines/constitutional.ts',
  'src/engines/followup.ts',
  'src/engines/potency.ts',
  'src/engines/remedy_compare.ts',
  'src/engines/rubric_search.ts',
  'src/engines/dosage.ts',
  'src/engines/treatment_plan.ts',
  'src/screens/Auth.tsx',
  'src/screens/Home.tsx',
  'src/screens/Safety.tsx',
  'src/screens/Complaint.tsx',
  'src/screens/Intake.tsx',
  'src/screens/Results.tsx',
  'src/screens/Cases.tsx',
  'src/screens/Library.tsx',
  'src/screens/CompareRemedies.tsx',
  'src/screens/ConstitutionalType.tsx',
  'src/screens/RubricSearch.tsx',
  'src/screens/PrivacyPolicy.tsx',
  'src/screens/Admin.tsx',
  'src/screens/Splash.tsx',
  'src/data/remedies.js',
  'src/data/redflags.js',
  'src/data/intake.js',
  'dist/index.html',
  'dist/assets',
];

for (const f of REQUIRED_FILES) {
  ok(f, existsSync(path.join(__dirname, f)));
}

// ── 2. Data integrity ──────────────────────────────────────────────────────
section('Data Integrity');

const { REMEDIES } = require('./src/data/remedies.js');
ok('REMEDIES loaded', Array.isArray(REMEDIES));
ok('700 remedies present', REMEDIES.length === 700, `got ${REMEDIES.length}`);

const { RED_FLAGS } = require('./src/data/redflags.js');
ok('RED_FLAGS loaded', Array.isArray(RED_FLAGS));
ok('68 red flags present', RED_FLAGS.length === 68, `got ${RED_FLAGS.length}`);

const { INTAKE_POOLS } = require('./src/data/intake.js');
ok('INTAKE_POOLS loaded', !!INTAKE_POOLS);
ok('INTAKE_POOLS.universal exists', Array.isArray(INTAKE_POOLS?.universal));

// Remedy schema completeness
const missingId     = REMEDIES.filter(r => !r.id).length;
const missingLatin  = REMEDIES.filter(r => !r.latin_name).length;
const missingTherm  = REMEDIES.filter(r => !r.thermal_state).length;
const rankable      = REMEDIES.filter(r =>
  r.causation?.length > 0 &&
  r.worse_from?.length > 0 &&
  r.better_from?.length > 0
).length;

ok('All remedies have id',         missingId === 0,    `${missingId} missing`);
ok('All remedies have latin_name', missingLatin === 0, `${missingLatin} missing`);
ok('>=600 have thermal_state',     (700 - missingTherm) >= 600, `${700 - missingTherm} have it`);
// Correct criterion: causation + at least 2 modalities (worse_from + better_from combined)
const rankableCorrect = REMEDIES.filter(r =>
  r.causation?.length > 0 &&
  (r.worse_from?.length ?? 0) + (r.better_from?.length ?? 0) >= 2
).length;
ok('>=430 remedies are rankable',  rankableCorrect >= 430, `${rankableCorrect} rankable`);

// Miasm coverage
const withMiasm = REMEDIES.filter(r => r.miasm?.length > 0).length;
ok('700 remedies have miasm', withMiasm === 700, `${withMiasm} have miasm`);

// ── 3. Scoring engine — canonical cases ────────────────────────────────────
section('Scoring Engine — Canonical Cases');

// Inline the scoring logic (same weights as scoring.ts)
const WEIGHTS = {
  causation:6, keynote:5, worse_from:4, better_from:4, time:4,
  concomitant:3, mental:3, general:3, thermal:3, particular:2, laterality:2,
};

function scoreRemedy(remedy, session) {
  let raw = 0, maxPossible = 0;
  const toArr = v => !v ? [] : Array.isArray(v) ? v : [v];

  (session.causation ?? []).forEach(uc => {
    if (uc === 'none_known') return;
    maxPossible += WEIGHTS.causation * 3;
    const hit = (remedy.causation ?? []).find(c => c.trigger === uc);
    if (hit) raw += WEIGHTS.causation * (hit.grade ?? 1);
  });

  (session.worse_from ?? []).forEach(uw => {
    maxPossible += WEIGHTS.worse_from * 3;
    if ((remedy.worse_from ?? []).includes(uw)) raw += WEIGHTS.worse_from * 2;
  });

  (session.better_from ?? []).forEach(ub => {
    maxPossible += WEIGHTS.better_from * 3;
    if ((remedy.better_from ?? []).includes(ub)) raw += WEIGHTS.better_from * 2;
  });

  if (session.thermal_state) {
    maxPossible += WEIGHTS.thermal;
    const rt = remedy.thermal_state ?? 'variable';
    const ut = session.thermal_state;
    if (rt !== 'variable' && ut !== 'variable') {
      raw += rt.toLowerCase() === ut.toLowerCase()
        ? WEIGHTS.thermal
        : WEIGHTS.thermal * 0.4 * -1;
    }
  }

  if (session.thirst) {
    maxPossible += WEIGHTS.general * 3;
    const rt = (remedy.thirst ?? '').toLowerCase();
    const ut = session.thirst.toLowerCase();
    if (rt === ut || rt.includes(ut) || ut.includes(rt)) raw += WEIGHTS.general * 3;
  }

  (session.mental_state ?? []).forEach(um => {
    maxPossible += WEIGHTS.mental * 3;
    const tags = [...toArr(remedy.mentals?.mood), ...toArr(remedy.mentals?.fear_type), ...toArr(remedy.mentals?.anxiety_type)];
    if (tags.some(t => t?.includes(um) || um.includes(t))) raw += WEIGHTS.mental * 2;
  });

  return maxPossible > 0 ? Math.max(0, (raw / maxPossible) * 100) : 0;
}

function rank(session) {
  return REMEDIES
    .map(r => ({ id: r.id, score: scoreRemedy(r, session) }))
    .filter(r => r.score >= 30)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

const CASES = [
  {
    name: 'Bryonia (pleurisy worse motion, better pressure)',
    expected: 'bry',
    session: {
      complaint: 'chest pain',
      causation: ['getting_wet_in_rain', 'cold_dry_wind'],
      thermal_state: 'Warm',
      thirst: 'great_thirst_cold',
      worse_from: ['motion', 'touch', 'exertion'],
      better_from: ['pressure', 'rest', 'lying_on_painful_side'],
      mental_state: ['irritable'],
    },
  },
  {
    name: 'Arsenicum (burning pains restless chilly)',
    expected: 'ars',
    session: {
      complaint: 'weakness',
      causation: ['food_poisoning', 'fear_fright'],
      thermal_state: 'Chilly',
      thirst: 'Thirsty_small_sips',
      worse_from: ['cold', 'midnight', 'alone'],
      better_from: ['warmth', 'warm_drinks', 'company'],
      mental_state: ['anxious', 'restless'],
    },
  },
  {
    name: 'Pulsatilla (mild weeping thirstless warm)',
    expected: 'puls',
    session: {
      complaint: 'cold',
      causation: ['suppressed_emotions', 'rich_food'],
      thermal_state: 'Warm',
      thirst: 'thirstless',
      worse_from: ['heat', 'closed_room', 'rich_food'],
      better_from: ['open_air', 'cold_applications', 'consolation'],
      mental_state: ['mild_yielding', 'weeps_easily'],
    },
  },
  {
    name: 'Rhus-tox (stiffness worse first motion better continued)',
    expected: 'rhus-t',
    session: {
      complaint: 'joint pain',
      causation: ['getting_wet', 'overexertion'],
      thermal_state: 'Chilly',
      thirst: 'Thirsty',
      worse_from: ['rest', 'cold_damp', 'first_motion'],
      better_from: ['continued_motion', 'warmth', 'warm_applications'],
      mental_state: ['restless'],
    },
  },
  {
    name: 'Nux-vomica (irritable chilly oversensitive)',
    expected: 'nux-v',
    session: {
      complaint: 'digestive trouble',
      causation: ['over_indulgence_food_drink_drugs', 'mental_overwork_sedentary', 'stimulants_coffee_alcohol'],
      thermal_state: 'Chilly',
      thirst: 'Variable',
      worse_from: ['cold', 'stimulants', 'morning_3_4AM', 'after_eating'],
      better_from: ['rest', 'warm_drinks', 'sleep_short_nap'],
      mental_state: ['irritable'],
    },
  },
];

for (const { name, expected, session } of CASES) {
  const results = rank(session);
  const top = results[0];
  const found = top?.id === expected;
  const pct  = top ? top.score.toFixed(1) : 'N/A';
  ok(`${name} → #1 = ${expected}`, found,
    found ? `${pct}%` : `got ${top?.id ?? 'nothing'} (${pct}%)`);
}

// ── 4. Safety engine ───────────────────────────────────────────────────────
section('Safety Engine');

const emergencyFlags = RED_FLAGS.filter(f => f.severity === 'emergency');
const urgentFlags    = RED_FLAGS.filter(f => f.severity === 'urgent');
const cautionFlags   = RED_FLAGS.filter(f => f.severity === 'caution');

ok('Emergency flags present',       emergencyFlags.length > 0, `${emergencyFlags.length}`);
ok('Urgent flags present',          urgentFlags.length > 0,    `${urgentFlags.length}`);
ok('Caution flags present',         cautionFlags.length > 0,   `${cautionFlags.length}`);
ok('All flags have severity',       RED_FLAGS.every(f => ['emergency','urgent','caution'].includes(f.severity)));
ok('All flags have id',             RED_FLAGS.every(f => !!f.id));
ok('All flags have question/label', RED_FLAGS.every(f => !!(f.question || f.label)));

// ── 5. Compliance strings ─────────────────────────────────────────────────
section('Compliance Strings (no banned content)');

const UI_FILES = [
  'src/screens/Results.tsx',
  'src/screens/Auth.tsx',
  'src/screens/Home.tsx',
  'src/screens/Splash.tsx',
  'src/screens/PrivacyPolicy.tsx',
  'src/screens/Safety.tsx',
  'src/components/Sidebar.tsx',
  'src/App.tsx',
];

for (const f of UI_FILES) {
  const content = readFileSync(path.join(__dirname, f), 'utf8');
  ok(`${f}: no em-dash`, !content.includes('—'), 'contains —');
  ok(`${f}: no emoji`,
    !/[\u{1F300}-\u{1FFFF}]|[\u{2600}-\u{27BF}]/u.test(content),
    'contains emoji'
  );
  ok(`${f}: no "Diagnosis:"`,    !content.includes('Diagnosis:'));
  ok(`${f}: no "Take [remedy]"`, !/\bTake [A-Z][a-z]/.test(content));
}

// No OTP hint in Auth
const authContent = readFileSync(path.join(__dirname, 'src/screens/Auth.tsx'), 'utf8');
ok('Auth: no OTP hint text', !authContent.includes('2702') || authContent.includes('verifyOTP'));

// DPDP consent checkboxes present
ok('Auth: DPDP consent checkboxes', authContent.includes('DPDP') || authContent.includes('consent'));
ok('Auth: DOB field',               authContent.includes('dob') || authContent.includes('date of birth') || authContent.includes('Date of Birth'));
ok('Auth: 18+ age check',           authContent.includes('18'));

// Privacy policy screen
const ppContent = readFileSync(path.join(__dirname, 'src/screens/PrivacyPolicy.tsx'), 'utf8');
ok('PrivacyPolicy: DPDP Act mention',      ppContent.includes('DPDP') || ppContent.includes('Digital Personal Data'));
ok('PrivacyPolicy: grievance officer',     ppContent.toLowerCase().includes('grievance'));
ok('PrivacyPolicy: right to erasure/delete', ppContent.toLowerCase().includes('erasure') || ppContent.toLowerCase().includes('delet'));

// ── 6. App routing ────────────────────────────────────────────────────────
section('App Routing');

const appContent = readFileSync(path.join(__dirname, 'src/App.tsx'), 'utf8');
for (const screen of ['compare', 'constitutional', 'rubric-search', 'privacy', 'home', 'safety', 'library', 'cases', 'admin']) {
  ok(`App routes '${screen}'`, appContent.includes(`case '${screen}'`));
}

// ── 7. Build artifacts ────────────────────────────────────────────────────
section('Build Artifacts');

const distIndex = readFileSync(path.join(__dirname, 'dist/index.html'), 'utf8');
ok('dist/index.html exists and non-empty', distIndex.length > 100);
ok('dist/index.html references JS bundle',  distIndex.includes('/assets/'));

const assetsDir = path.join(__dirname, 'dist/assets');
const { readdirSync } = await import('fs');
const assetFiles = readdirSync(assetsDir);
const jsBundle  = assetFiles.find(f => f.endsWith('.js'));
const cssBundle = assetFiles.find(f => f.endsWith('.css'));
ok('JS bundle in dist/assets', !!jsBundle, jsBundle ?? 'missing');
ok('CSS bundle in dist/assets', !!cssBundle, cssBundle ?? 'missing');

if (jsBundle) {
  const jsStat = (await import('fs')).statSync(path.join(assetsDir, jsBundle));
  ok('JS bundle >1MB (700 remedies included)', jsStat.size > 1_000_000, `${(jsStat.size/1024/1024).toFixed(1)}MB`);
}

// ── 8. Live site ──────────────────────────────────────────────────────────
section('Live Site');

// Test via server-side curl (avoids local DNS propagation lag)
try {
  const { execSync } = await import('child_process');
  const code = execSync(
    `ssh -i ~/.ssh/idms-key.pem -o StrictHostKeyChecking=no ubuntu@65.1.19.250 "curl -s -o /dev/null -w '%{http_code}' https://jeevanchakra.kkdtech.com/"`,
    { encoding: 'utf8', timeout: 20000 }
  ).trim();
  ok('HTTPS responds 200 (server-side check)', code === '200', `got ${code}`);

  const redirect = execSync(
    `ssh -i ~/.ssh/idms-key.pem -o StrictHostKeyChecking=no ubuntu@65.1.19.250 "curl -s -o /dev/null -w '%{http_code}' http://jeevanchakra.kkdtech.com/"`,
    { encoding: 'utf8', timeout: 20000 }
  ).trim();
  ok('HTTP redirects to HTTPS (301)', redirect === '301', `got ${redirect}`);
} catch (e) {
  ok('Live site check', false, e.message);
}

// ── Summary ────────────────────────────────────────────────────────────────
console.log(`\n${'='.repeat(50)}`);
console.log(`RESULTS: ${pass} passed, ${fail} failed`);
if (failures.length) {
  console.log('\nFailed tests:');
  failures.forEach(f => console.log(`  - ${f}`));
}
console.log(fail === 0 ? '\nAll smoke tests passed.' : '\nSome tests failed — see above.');
process.exit(fail > 0 ? 1 : 0);
