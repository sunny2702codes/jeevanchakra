import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, AlertCircle, Info, User, Activity } from 'lucide-react';
import type { RedFlag, FlagSeverity, ClinicalSession } from '../types';
import { useApp } from '../App';
import { patientStore } from '../data/patientStore';
import { draftStore } from '../data/draftStore';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - JS data file, typed below
import { RED_FLAGS as _RAW } from '../data/redflags.js';

const RED_FLAGS = _RAW as unknown as RedFlag[];

interface SafetyProps {
  navigate: (s: string) => void;
  session?: unknown;
}

const SEV: Record<FlagSeverity, { label: string; cls: string; bg: string; bdr: string; Icon: typeof AlertTriangle }> = {
  emergency: { label: 'Emergency', cls: 'text-red-700',    bg: 'bg-red-50',    bdr: 'border-red-200',    Icon: AlertTriangle },
  urgent:    { label: 'Urgent',    cls: 'text-orange-700', bg: 'bg-orange-50', bdr: 'border-orange-200', Icon: AlertCircle   },
  caution:   { label: 'Caution',   cls: 'text-yellow-700', bg: 'bg-yellow-50', bdr: 'border-yellow-200', Icon: Info          },
};

export default function Safety({ navigate }: SafetyProps) {
  const { clinicalSession, setClinicalSession, currentPatientId, session: authSession } = useApp();

  const [declared, setDeclared] = useState(false);
  const [caseMode, setCaseMode] = useState<'acute' | 'chronic'>('chronic');
  const [patientName, setPatientName]   = useState('');
  const [patientAgeStr, setPatientAgeStr] = useState('');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [fromRecord, setFromRecord] = useState(false);
  const [hasDraft, setHasDraft] = useState(() => authSession?.phone ? draftStore.exists(authSession.phone) : false);
  const [draftInfo, setDraftInfo] = useState(() => authSession?.phone ? draftStore.load(authSession.phone) : null);

  useEffect(() => {
    if (currentPatientId) {
      const p = patientStore.findById(currentPatientId);
      if (p) {
        setPatientName(p.name);
        setPatientAgeStr(p.age ? String(p.age) : '');
        setPatientGender(p.gender);
        setFromRecord(true);
      }
    } else if (clinicalSession?.patientName) {
      setPatientName(clinicalSession.patientName);
      setPatientAgeStr(clinicalSession.patientAge ? String(clinicalSession.patientAge) : '');
      setPatientGender(clinicalSession.patientGender ?? 'Male');
    }
  }, [currentPatientId, clinicalSession]);

  const grouped: Record<FlagSeverity, RedFlag[]> = { emergency: [], urgent: [], caution: [] };
  for (const f of RED_FLAGS) grouped[f.severity].push(f);

  function handleResumeDraft() {
    if (!authSession?.phone) return;
    const draft = draftStore.load(authSession.phone);
    if (!draft) return;
    setClinicalSession(draft.session);
    navigate('intake');
  }

  function handleDiscardDraft() {
    if (!authSession?.phone) return;
    draftStore.clear(authSession.phone);
    setHasDraft(false);
    setDraftInfo(null);
  }

  function handleContinue() {
    if (!declared) return;
    const parsedAge = patientAgeStr ? parseInt(patientAgeStr, 10) : undefined;
    const age = parsedAge && !isNaN(parsedAge) && parsedAge >= 0 && parsedAge <= 120 ? parsedAge : undefined;

    const patientData = {
      patientName: patientName.trim() || undefined,
      patientAge: age,
      patientGender: patientGender as 'Male' | 'Female' | 'Other',
    };

    if (clinicalSession) {
      setClinicalSession({ ...clinicalSession, ...patientData, caseMode });
    } else {
      const newSession: ClinicalSession = {
        id: `sess_${Date.now()}`,
        started: new Date().toISOString(),
        complaint: null,
        branch: null,
        safety_flags: [],
        duration: null,
        causation: [],
        thermal_state: null,
        thirst: null,
        worse_from: [],
        better_from: [],
        time_modality: [],
        mental_state: [],
        consolation_response: null,
        laterality: null,
        food_desires: [],
        food_aversions: [],
        concomitants_general: [],
        branch_answers: {},
        collected_keynotes: [],
        caseMode,
        ...patientData,
      };
      setClinicalSession(newSession);
    }
    navigate('complaint');
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Banner */}
      <div className="jc-section-banner flex items-start gap-4">
        <div className="p-3 bg-white/15 rounded-xl">
          <Shield size={24} className="text-white" />
        </div>
        <div>
          <div className="text-xs font-semibold text-jc-gold-300 uppercase tracking-widest mb-1">Step 1 of 5</div>
          <h2 className="text-xl font-bold text-white">Safety Screen</h2>
          <p className="text-white/70 text-sm mt-1">
            Review all {RED_FLAGS.length} patterns. If any apply to this patient, refer for emergency care immediately.
          </p>
        </div>
      </div>

      {/* Draft resume banner */}
      {hasDraft && draftInfo && (
        <div className="flex items-center gap-4 px-4 py-3 bg-jc-purple-50 border border-jc-purple-200 rounded-xl">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-jc-purple-800">Assessment in progress</p>
            <p className="text-xs text-jc-purple-600 mt-0.5">
              {draftInfo.session.complaint ?? 'Unknown complaint'} - step {draftInfo.step + 1} completed
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              className="text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
              onClick={handleDiscardDraft}
            >
              Discard
            </button>
            <button
              className="jc-btn-primary py-1.5 px-3 text-xs"
              onClick={handleResumeDraft}
            >
              Resume
            </button>
          </div>
        </div>
      )}

      {/* Patient details card */}
      <div className="jc-card space-y-4">
        <div className="flex items-center gap-2">
          <User size={16} className="text-jc-purple-600 shrink-0" />
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">Patient Details</h3>
            <p className="text-xs text-slate-400">Who is this assessment for?</p>
          </div>
          {fromRecord && (
            <span className="ml-auto text-xs text-jc-purple-500 bg-jc-purple-50 border border-jc-purple-100 rounded-full px-2 py-0.5">
              from patient record
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="jc-label">Full Name (optional)</label>
            <input
              className="jc-input"
              value={patientName}
              onChange={e => setPatientName(e.target.value)}
              placeholder="Patient name"
            />
          </div>
          <div>
            <label className="jc-label">Age (optional)</label>
            <input
              className="jc-input"
              type="number"
              min="0"
              max="120"
              value={patientAgeStr}
              onChange={e => setPatientAgeStr(e.target.value)}
              placeholder="Years"
            />
          </div>
          <div className="col-span-2">
            <label className="jc-label">Gender</label>
            <div className="flex gap-2">
              {(['Male', 'Female', 'Other'] as const).map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setPatientGender(g)}
                  className={[
                    'flex-1 py-2 rounded-xl border text-sm font-medium transition-all cursor-pointer',
                    patientGender === g
                      ? 'border-jc-purple-700 bg-jc-purple-50 text-jc-purple-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300',
                  ].join(' ')}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Assessment mode toggle - Feature 7 */}
      <div className="jc-card">
        <div className="flex items-center gap-2 mb-3">
          <Activity size={16} className="text-jc-purple-600 shrink-0" />
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">Assessment Mode</h3>
            <p className="text-xs text-slate-400">Acute focuses on presenting symptoms; Chronic includes constitutional profile</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(['Acute', 'Chronic'] as const).map(mode => (
            <button
              key={mode}
              type="button"
              onClick={() => setCaseMode(mode === 'Acute' ? 'acute' : 'chronic')}
              className={[
                'flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer text-left px-4',
                caseMode === (mode === 'Acute' ? 'acute' : 'chronic')
                  ? 'border-jc-purple-700 bg-jc-purple-50 text-jc-purple-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300',
              ].join(' ')}
            >
              {mode}
              <div className="text-xs font-normal text-slate-400 mt-0.5">
                {mode === 'Acute' ? 'Presenting symptoms only' : 'Full constitutional intake'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Red flags grid */}
      <div className="grid grid-cols-3 gap-4">
        {(['emergency', 'urgent', 'caution'] as FlagSeverity[]).map(sev => {
          const cfg = SEV[sev];
          const Icon = cfg.Icon;
          return (
            <div key={sev} className={`rounded-xl border ${cfg.bg} ${cfg.bdr} p-4`}>
              <div className="flex items-center gap-2 mb-3">
                <Icon size={14} className={cfg.cls} />
                <h3 className={`font-bold text-xs uppercase tracking-wide ${cfg.cls}`}>
                  {cfg.label} ({grouped[sev].length})
                </h3>
              </div>
              <ul className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {grouped[sev].map(f => (
                  <li key={f.id} className="flex gap-2 text-xs text-slate-700 leading-snug">
                    <span className={`mt-0.5 shrink-0 ${cfg.cls}`}>&#9632;</span>
                    <span>{f.label ?? f.question}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="jc-card">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 accent-jc-purple-700 w-4 h-4 shrink-0"
            checked={declared}
            onChange={e => setDeclared(e.target.checked)}
          />
          <span className="text-sm text-slate-700">
            I have reviewed all {RED_FLAGS.length} safety patterns above. None apply to this patient, or they have
            already been addressed by appropriate emergency medical care. I understand JeevanChakra matches
            symptom pictures to remedy pictures and does not diagnose disease.
          </span>
        </label>
      </div>

      <div className="flex justify-between">
        <button className="jc-btn-ghost" onClick={() => navigate('home')}>Back to Home</button>
        <button className="jc-btn-primary" disabled={!declared} onClick={handleContinue}>
          Confirmed - Continue
        </button>
      </div>
    </div>
  );
}
