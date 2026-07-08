# JeevanChakra — Full Product Backlog
> Last updated: 2026-07-08. Every item confirmed against live screenshots + codebase audit.
> Priority: P0 = blocking / broken | P1 = high clinical/UX value | P2 = important but deferrable | P3 = nice to have

---

## SECTION 1 — Bug Fixes (broken today)

### B-01 | OTP always bypassed after first login — P0
**File:** `src/App.tsx:103-108`
**Issue:** On page load, `authStore.getSession()` restores the localStorage session and navigates straight to `home` without asking for OTP again. Any user who stayed logged in, or whose browser cached the session, never sees OTP again — even after explicit logout followed by page refresh.
**Fix:** On every login attempt (even session restore), require OTP `2702` to be entered. `clearSession()` on logout must also clear the restored-session path. OTP `2702` must be asked every single time, for every user, every session, no exceptions.

### B-02 | Privacy Policy button on register screen does nothing — P0
**File:** `src/screens/Auth.tsx:150`
**Issue:** The "Privacy Policy" button during account creation is wired but calls nothing — no navigate, no popup. Users cannot read the policy before consenting to it. DPDP Act 2023 compliance requires informed, specific consent.
**Fix:** Button should open a full-screen in-app modal (not browser alert, not new tab) showing the full Privacy Policy + Data Usage Notice document. Same modal accessible from the sidebar Privacy Policy link.

### B-03 | Browser `alert()` used instead of in-app modals — P0
**File:** `src/components/Sidebar.tsx:103` (Help & Support) and `src/components/Sidebar.tsx:147` (notification bell)
**Issue:** Two places use native `window.alert()` which shows an ugly browser popup with the domain name. Looks unfinished, breaks the UI flow.
**Fix:** Replace both with a styled in-app modal/dialog component. No `alert()`, `confirm()`, or `prompt()` anywhere in the codebase — ever.

### B-04 | Banner text invisible — contrast failure across all screens — P0
**Screens affected:** Remedy Library, My Health Journey, Admin Panel, Compare Remedies, Search Symptoms banners
**Issue:** Section banner titles ("Homoeopathic Library", "My Health Journey", "Admin Panel") are rendered in a purple or dark colour on top of the dark purple banner background. Text is barely readable — fails WCAG AA contrast ratio.
**Fix:** Banner title and subtitle must use `text-white` (or very light colour with sufficient contrast). Icon background should be `bg-white/15`. Check all `jc-section-banner` instances.

### B-05 | Remedy Library card expand breaks grid layout — P0
**Screen:** Remedy Library (Image #55)
**Issue:** Clicking a remedy card expands it inline within the 3-column grid. This pushes surrounding cards out of position, makes the expanded content look blank and cramped, and is confusing UX.
**Fix:** Remove the inline expand entirely. Clicking any remedy card should open a full-detail popup modal (see UI-04 below). The card itself never expands.

### B-06 | Notification bell non-functional — P1
**File:** `src/components/Sidebar.tsx:147`
**Issue:** Bell icon with red badge (showing "3") is visible in header but clicking it fires an `alert('Coming soon.')`. Badge implies there are notifications; clicking does nothing useful.
**Fix:** Short term — remove the badge count so it does not imply pending notifications. Replace the alert with an in-app dropdown or modal listing system notifications (e.g., "Assessment saved", "Welcome to JeevanChakra"). Do not show a badge unless there are real notifications to show.

---

## SECTION 2 — Auth, Account & Compliance

### A-01 | Privacy Policy + Data Usage Notice modal — P0
The full DPDP Act 2023 compliant document must be accessible:
- As a modal triggered from the "Privacy Policy" button on the register screen
- As a modal triggered from the Privacy Policy sidebar link (currently navigates to a separate screen — convert to in-app modal so user never loses their place)
- Document must include: data collected, purpose, retention period, right to erasure, grievance officer (Mounik Pani, grievance@jeevanchakra.in)

### A-02 | User Profile page — P1
New screen at route `profile`, accessible from the user avatar / dropdown in header.
**Contents:**
- Display: name, phone number (masked), date of birth, account created date
- Edit name: inline edit, save button
- Edit phone: requires OTP flow on new number, 18+ age gate enforced (DOB must confirm age >= 18 at time of change)
- Delete account: confirmation modal ("Your data will be removed. This cannot be undone.") — triggers soft delete, not hard delete
- After soft delete: user is logged out, cannot log back in, account shows as "Deleted" in Admin Panel

### A-03 | Admin Panel — deleted user visibility — P1
When a user soft-deletes their account:
- Admin Panel Registered Users table must still show that row
- Add a "Status" column: `active` (green badge) | `deleted` (red badge with deletion date)
- Deleted users cannot log in but their case history (if any) remains visible to admin

### A-04 | 18+ enforcement on profile edit — P1
When a user edits their phone number or any detail that triggers re-verification:
- Re-validate DOB on file: if user would be under 18 at time of change, block the update with an in-app message
- Do not rely solely on the registration gate — enforce at every edit point

---

## SECTION 3 — UI / Visual Design

### UI-01 | Global card design uplift — P1
**Every card across the system** currently uses flat, low-shadow styling. Apply consistently:
- `rounded-2xl` (not `rounded-xl`) for all content cards
- `shadow-md hover:shadow-lg` with transition
- Subtle border: `border border-slate-100`
- Inner padding: `p-5` or `p-6`
- Cards with interactive content (library, search results) should show a faint hover background: `hover:bg-slate-50/60`

### UI-02 | Human-readable text everywhere — P1
**Screens affected:** Search Symptoms results, Remedy Library expanded view, Compare Remedies table, Results screen match indicators
**Issue:** All data is displayed as raw underscore strings: `restless_must_change_position_constantly`, `cold_wet_weather`, `burning_pains_better_warmth`. These are machine identifiers, not clinical text.
**Fix:** A `humanize(str: string)` utility: replace `_` with space, capitalise first letter. Apply to every symptom, modality, keynote, causation, and attribute rendered anywhere in the UI. This single change transforms the entire app from developer-tool to usable product.
Example: `worse_initial_motion_better_continued_motion` → `Worse from initial motion, better from continued motion`

### UI-03 | Search Symptoms page redesign — P1
**Current:** Plain white cards with raw underscore text, no visual differentiation between remedy name, keynote category, and values.
**Target:**
- Result cards: remedy name prominent (large, bold), abbreviation as pill badge, thermal + miasm as coloured tags (same as Library)
- Matched fields grouped by type with coloured labels: Keynote (purple), Causation (amber), Modality (blue)
- Each matched value as a readable sentence, not an underscore string
- Clicking a result card → opens Remedy Detail Modal (see UI-04)
- Clicking a rubric/keyword → opens Rubric Detail popup (see UI-05)

### UI-04 | Remedy Detail Modal — P1
A reusable full-screen overlay (not inline expand) triggered from:
- Remedy Library card click
- Search Symptoms result click
- Results screen "View full profile" (to be added)
- Compare Remedies remedy header click

**Modal contents (all human-readable):**
- Header: Latin name, common name, abbreviation pill, kingdom/thermal/miasm tags
- Boericke description paragraph (from `boer_mm.js` or `remedy.description`)
- Keynotes: listed as readable sentences with grade indicator (K = grade 1, KK = 2, KKK = 3)
- Worse from / Better from: comma-separated readable phrases
- Causation: readable sentences
- Mentals: narrative paragraph style, not bullet list of raw keys
- Generals: thirst, thermal preference, food desires/aversions
- Complementary remedies: clickable chips that open another modal
- Antidotes: same
- Boericke reference: "Boericke 8th Ed., p.13" plus a short editorial note where available
- Constitutional profile (if in CONSTITUTIONAL table)
- "Start Assessment for this Remedy" shortcut button

### UI-05 | Rubric / Symptom popup — P1
When user clicks a rubric or symptom string anywhere (search results, compare table, results details):
- Opens a small floating card/tooltip with: human-readable symptom name, which remedies carry it (top 5 by grade), and a "See all remedies" link to search
- Non-blocking — closes on click outside or Escape

### UI-06 | My Health Journey empty state — P1
**Current:** Generic icon + "No assessments saved yet" on a white card. Too plain.
**Target:**
- Illustrated placeholder (SVG, not emoji) relevant to health/journey
- Short copy: "Your clinical record begins here. Complete and save an assessment to track your journey."
- Two CTAs: "Start New Assessment" (primary) and "How it works" (secondary, opens a 3-step explanation modal)

### UI-07 | Home / Welcome page overhaul — P1
**Current:** Generic card layout, no visual identity, no guidance.
**Target:**
- Hero section with the JeevanChakra tagline and a one-line value proposition
- Quick action cards with icons: New Assessment, Search Symptoms, Remedy Library, My Journey
- "How DSS works" section: 3-step visual flow (Symptoms → Scoring → Considerations)
- Recent cases strip (if user has saved cases): last 2-3, clickable
- If no cases: encouraging onboarding prompt

### UI-08 | In-app modal system — P1
Build a single reusable `Modal` component (or use Radix Dialog which is likely already in the stack).
- All alerts, confirmations, "coming soon", Help & Support messages → use this component
- No `window.alert()` or `window.confirm()` anywhere
- Modal has: title, body, primary action button, optional secondary/cancel button, close X
- Backdrop closes modal on click; Escape key closes it

### UI-09 | Admin Panel visual uplift — P2
**Current:** Stat cards with numbers, plain white table, illegible banner.
**Target:**
- Fix banner contrast (B-04)
- Stat cards: add colour-coded left border (purple for users, gold for cases, green for remedies)
- Registered Users table: add Status column (active/deleted), add "Last active" column, make rows expandable to show that user's saved cases
- Admin actions (e.g., promote to admin, view cases) as in-app dropdown menus per row, not browser popups

### UI-10 | Compare Remedies — expand to 5 slots — P1
**Current:** Fixed 2 slots (Remedy A, Remedy B).
**Target:**
- Dynamic slot system: start with 2, add up to 5 via "+ Add Remedy" button
- Each slot has its own search box and clear (x) button
- Comparison table updates columns dynamically
- All values human-readable (applies UI-02)
- Highlight differences across remedies (e.g., if Thermal differs across columns, highlight that row)
- "Remove" button per column header to drop a remedy from comparison

---

## SECTION 4 — Clinical & Engine

### C-01 | Expose Kent rubrics in adaptive intake — P1
**Current:** 947 selectable options across 12 branches. 18,274 Kent rubrics loaded in `kent_full/` but unused in intake.
**Target:** Wire 2,000-3,000 additional rubrics from `kent_full/` into branch-specific intake pools. Prioritise rubrics with 3+ remedies at grade 2+. Even partial wiring dramatically improves differentiation for rare presentations. No new data needed — files already present.

### C-02 | Q17-Q24 constitutional questions — make optional — P1
**Current:** Build, perspiration, sleep position, appetite, skin, grief, miasm, constitution all appear in the main numbered flow.
**Target:** After Q16, show a collapsible section: "Constitutional details (optional — skip for acute conditions)". Collapsed by default for branches flagged as acute (injury, fever, respiratory). Expanded by default for chronic branches (mental, constitutional, skin). Answers still score via CONSTITUTIONAL table if provided.

### C-03 | "What's missing" hint on Results — P1
For the top-ranked remedy, show 2-3 unconfirmed keynotes that would raise the score significantly if present.
Example: "If midnight aggravation were also confirmed, Arsenicum Album would rise from 58% to 76%."
The scoring engine already tracks `missing[]` in ScoringResult. This needs a UI surface — a collapsible "Confirm additional symptoms" strip below the top remedy card.

### C-04 | Materia Medica panel in Results — P1
`boer_mm.js` (688 entries) and `clarke_mm.js` (1009 entries) are loaded in the bundle but never shown to the user.
**Target:** In the expanded remedy card on Results screen, add a "Materia Medica" tab or section that renders the Boericke MM entry for that remedy in readable prose. Clarke entry as secondary reference. This closes the verification loop — practitioner can confirm the match before noting a consideration.

### C-05 | Differential narrow-down flow — P1
When top-2 remedies are within 5-8% of each other, show a "Narrow down" button after results.
Triggers 2-3 focused questions targeting the most discriminating symptoms between those two specific remedies, then re-ranks. Uses existing scoring engine — only question selection is new.

### C-06 | Antidote / inimical check against prior saved case — P2
If user has a saved case from a prior session and the current top result is listed as inimical to the previously noted remedy, show a clinical caution flag:
"Note: [New Remedy] is listed as inimical to [Prior Remedy]. Discuss with a practitioner before proceeding."
Data: `remedy.inimical_remedies[]` already populated for 700 remedies.

### C-07 | Follow-up flow entry point from My Health Journey — P1
FollowupEngine is fully built but not reachable from the UI.
**Target:** In My Health Journey, each saved case card should have a "Start Follow-up" button. This loads the prior case into context and begins a shortened intake (only changes since last visit), then runs case comparison and complement/antidote detection via FollowupEngine.

### C-08 | Grade-2 keynote probes for close differentials — P2
Current keynote probe stage (built 2026-07-08) targets only grade-3 keynotes.
**Target:** When top-2 remedies are within 5%, add a second probe pass targeting grade-2 keynotes unique to those two remedies. Max 3 additional probes. Helps break ties that grade-3 probes cannot resolve.

### C-09 | Keynote_bank salvage — P2
`INTAKE_POOLS.keynote_bank` has 70 pre-written yes/no questions but option values (`'hard_pressure'`, `'motion'`) do not match `remedy.keynotes[].symptom` strings. These 70 can be remapped to actual keynote strings and folded into `KEYNOTE_PROBES` as additional probe vocabulary. Doubles probe coverage with no new content.

### C-10 | "Boericke reference" enrichment — P2
**Current:** Remedy cards show "Boericke p.13" — too minimal.
**Target:** Show page reference plus a one-line editorial note from the MM entry, e.g.:
"Boericke 8th Ed., p.13 — First remedy in acute, sudden violent onset after exposure to dry cold wind."
Source: `boer_mm.js[remedy_id].summary` or first sentence of description.

---

## SECTION 5 — Performance & Platform

### P-01 | PWA / offline support — P1
Add Vite PWA plugin (`vite-plugin-pwa`): service worker + `manifest.json`.
- App installs on Android/iOS home screen
- Works fully offline (all 700 remedies are in-bundle, no network required for scoring)
- Critical for rural clinic use
- Estimated effort: 2-3 hours

### P-02 | Bundle code-split — P2
JS bundle is 1.4MB (gzipped 350KB). On 4G mobile: 2-3 seconds to first interaction.
- Lazy-load `kent_full/*.js` (only needed by RubricSearch) — saves ~200KB from initial bundle
- Lazy-load `boer_mm.js` + `clarke_mm.js` (only needed by MM panel) — saves ~150KB
- Target initial bundle under 600KB gzipped
- Use Vite dynamic `import()` — no architecture change needed

### P-03 | Print / PDF export from Results — P2
One-page printable summary: complaint, symptom summary, top 3 remedy considerations, dosage card, compliance disclaimer.
- `window.print()` with a `@media print` stylesheet is sufficient — no library needed
- Add "Print Summary" button to Results action bar
- Print view hides navigation, banners, action buttons; shows only clinical content

---

## SECTION 6 — Known Data Gaps

### D-01 | 269 remedies with no rankable modality data
These are genuine P2/P3 remedies where all public-domain sources have been exhausted (Boericke, Clarke, Hering, Allen, Kent MM, Kent Repertory). They appear in the database but score 0 on most cases. No further scraping will help — only licensed databases (RADAR, MacRepertory) or clinical curation can rescue them. Accept as hard floor.

### D-02 | constitution_type coverage: 347 / 700
353 remedies lack `constitution_type`. Enrichment possible for the next 100-150 from clinical literature for well-documented remedies. Low priority vs clinical flow improvements.

### D-03 | complementary_remedies coverage: 592 / 700
108 remedies lack complementary data. Fill from Clarke's Dictionary cross-references for documented remedies.

---

## Summary Table

> **Highest leverage trio (all low effort, all high impact):**
> C-04 (MM panel) + P-03 (Print/PDF) + P-01 (PWA) together transform JeevanChakra from a scoring tool into something a practitioner can hand to a patient or pull out in a rural clinic.

| ID | Title | Priority | Impact | Effort | Category |
|----|-------|----------|--------|--------|----------|
| B-01 | OTP always bypassed after first login | P0 | Blocking | Low | Bug |
| B-02 | Privacy Policy button does nothing on register | P0 | Blocking | Low | Bug |
| B-03 | Browser alert() used instead of in-app modals | P0 | Blocking | Low | Bug |
| B-04 | Banner text invisible — contrast failure | P0 | Blocking | Low | Bug |
| B-05 | Remedy Library card inline expand breaks grid | P0 | Blocking | Low | Bug |
| B-06 | Notification bell non-functional | P1 | Medium | Low | Bug |
| A-01 | Privacy Policy + Data Usage Notice modal | P0 | Blocking | Low | Auth |
| A-02 | User Profile page (edit, delete account) | P1 | High | Medium | Auth |
| A-03 | Admin: deleted users visible with status | P1 | Medium | Low | Auth |
| A-04 | 18+ gate enforcement on profile edit | P1 | Medium | Low | Auth |
| UI-01 | Global card shadow and border uplift | P1 | High | Low | Design |
| UI-02 | Human-readable text everywhere (humanize util) | P1 | High | Low | Design |
| UI-03 | Search Symptoms page redesign | P1 | High | Medium | Design |
| UI-04 | Remedy Detail Modal (replaces inline expand) | P1 | High | Medium | Design |
| UI-05 | Rubric / Symptom click popup | P1 | Medium | Low | Design |
| UI-06 | My Health Journey empty state redesign | P1 | Medium | Low | Design |
| UI-07 | Home / Welcome page overhaul | P1 | High | Medium | Design |
| UI-08 | In-app modal system (no browser popups) | P1 | High | Low | Design |
| UI-09 | Admin Panel visual uplift | P2 | Medium | Low | Design |
| UI-10 | Compare Remedies expand to 5 slots | P1 | High | Medium | Design |
| C-01 | Expose Kent rubrics in adaptive intake (18,274 loaded, 947 wired — target 3,000+) | P1 | High | Medium | Clinical |
| C-02 | Q17-Q24 constitutional questions collapsible | P1 | High | Low | Clinical |
| C-03 | "What's missing" hint on Results | P1 | High | Low | Clinical |
| C-04 | Materia Medica panel in Results (688 Boericke + 1009 Clarke entries already in bundle) | P1 | High | Low | Clinical |
| C-05 | Differential narrow-down flow | P1 | High | Medium | Clinical |
| C-06 | Antidote/inimical check against prior case | P2 | Medium | Low | Clinical |
| C-07 | Follow-up flow entry point from My Health Journey | P1 | Medium | Low | Clinical |
| C-08 | Grade-2 keynote probes for close differentials | P2 | Medium | Low | Clinical |
| C-09 | Keynote_bank salvage (70 Qs remapped to probe architecture) | P2 | Medium | Low | Clinical |
| C-10 | Boericke reference enrichment (p.13 + one-line clinical note) | P2 | Medium | Low | Clinical |
| P-01 | PWA offline support (vite-plugin-pwa, ~1 hr) | P1 | High | Low | Platform |
| P-02 | Bundle code-split — lazy load kent_full + MM files (1.4MB → under 400KB initial) | P2 | Medium | Medium | Platform |
| P-03 | Print / PDF export from Results (window.print + CSS) | P2 | High | Low | Platform |
| D-01 | 269 thin remedies — hard floor, no further action | — | — | — | Data |
| D-02 | constitution_type: 353 remedies missing | P3 | Low | High | Data |
| D-03 | complementary_remedies: 108 missing | P3 | Low | Medium | Data |
