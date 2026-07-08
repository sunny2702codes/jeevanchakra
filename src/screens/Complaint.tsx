import { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { useApp } from '../App';
import type { ClinicalSession } from '../types';

interface ComplaintProps { navigate: (s: string) => void; }

const COMPLAINTS = [
  { value: 'headache',    branch: 'headache',    label: 'Headache',          emoji: '🤕' },
  { value: 'gi',         branch: 'gi',          label: 'Digestion / GI',    emoji: '🫃' },
  { value: 'respiratory',branch: 'respiratory', label: 'Respiratory',       emoji: '🫁' },
  { value: 'fever',      branch: 'fever',       label: 'Fever / Infection', emoji: '🌡️' },
  { value: 'mental',     branch: 'mental',      label: 'Mental / Emotional',emoji: '🧠' },
  { value: 'skin',       branch: 'skin',        label: 'Skin Conditions',   emoji: '🩹' },
  { value: 'musculoskel',branch: 'musculoskel', label: 'Joints / Muscles',  emoji: '🦴' },
  { value: 'urinary',    branch: 'urinary',     label: 'Urinary',           emoji: '💧' },
  { value: 'injury',     branch: 'injury',      label: 'Injury / Trauma',   emoji: '🩻' },
  { value: 'female',     branch: 'female',      label: 'Female Health',     emoji: '🌸' },
  { value: 'paediatric', branch: 'paediatric',  label: 'Paediatric',        emoji: '👶' },
  { value: 'general',    branch: 'general',     label: 'General / Other',   emoji: '⚕️' },
];

function newSession(complaint: string, branch: string): ClinicalSession {
  return {
    id: `sess_${Date.now()}`,
    started: new Date().toISOString(),
    complaint,
    branch,
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
  };
}

export default function Complaint({ navigate }: ComplaintProps) {
  const { setClinicalSession, setClinicalResults } = useApp();
  const [selected, setSelected] = useState('');

  function handleContinue() {
    if (!selected) return;
    const comp = COMPLAINTS.find(c => c.value === selected)!;
    setClinicalResults(null);
    setClinicalSession(newSession(comp.label, comp.branch));
    navigate('intake');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="jc-section-banner flex items-start gap-4">
        <div className="p-3 bg-white/15 rounded-xl">
          <ClipboardList size={24} className="text-white" />
        </div>
        <div>
          <div className="text-xs font-semibold text-jc-gold-300 uppercase tracking-widest mb-1">Step 2 of 5</div>
          <h2 className="text-xl font-bold text-white">Chief Complaint</h2>
          <p className="text-white/70 text-sm mt-1">Select the category that best describes the main problem today.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {COMPLAINTS.map(c => (
          <button key={c.value} onClick={() => setSelected(c.value)}
            className={`jc-card text-left cursor-pointer transition-all hover:scale-105 ${
              selected === c.value
                ? 'border-2 border-jc-purple-700 bg-jc-purple-50'
                : 'border-2 border-transparent hover:border-slate-200'
            }`}>
            <div className="text-2xl mb-2">{c.emoji}</div>
            <div className={`font-medium text-sm ${selected === c.value ? 'text-jc-purple-700' : 'text-slate-700'}`}>
              {c.label}
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <button className="jc-btn-ghost" onClick={() => navigate('safety')}>Back</button>
        <button className="jc-btn-primary" disabled={!selected} onClick={handleContinue}>
          Continue
        </button>
      </div>
    </div>
  );
}
