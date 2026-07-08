import { useState } from 'react';
import { Shield, AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface SafetyProps { navigate: (s: string) => void; session: any; }

const EMERGENCY = ['Chest pain with sweating, jaw pain or left arm pain', 'Sudden severe headache (worst ever)', 'Signs of stroke: face drooping, arm weakness, speech difficulty', 'Difficulty breathing at rest', 'Anaphylaxis: throat swelling after allergen'];
const URGENT = ['Fever above 40C or febrile convulsion in child', 'Blood in stool or vomit', 'Sudden vision loss', 'Severe abdominal pain with rigidity', 'Head injury with confusion or loss of consciousness'];
const CAUTION = ['Symptoms lasting more than 4 weeks without diagnosis', 'Unexplained weight loss over 10%', 'Night sweats with fatigue', 'New onset of seizures', 'Persistent hoarseness or difficulty swallowing'];

export default function Safety({ navigate }: SafetyProps) {
  const [declared, setDeclared] = useState(false);
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="jc-section-banner flex items-start gap-4">
        <div className="p-3 bg-jc-purple-100 rounded-xl"><Shield size={24} className="text-jc-purple-700" /></div>
        <div>
          <div className="text-xs font-semibold text-jc-purple-500 uppercase tracking-widest mb-1">Step 1 of 5</div>
          <h2 className="text-xl font-bold text-slate-800">Safety Screen</h2>
          <p className="text-slate-500 text-sm mt-1">Before any remedy assessment, please review the following. Emergencies require emergency care, not homeopathy.</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="jc-card border-red-100">
          <div className="flex items-center gap-2 mb-3"><AlertTriangle size={16} className="text-red-600" /><h3 className="font-semibold text-red-700 text-sm uppercase tracking-wide">Emergency Patterns</h3></div>
          <ul className="space-y-2">{EMERGENCY.map(e => <li key={e} className="text-xs text-slate-600 flex gap-2"><span className="text-red-500 mt-0.5">&#x25A0;</span>{e}</li>)}</ul>
        </div>
        <div className="jc-card border-orange-100">
          <div className="flex items-center gap-2 mb-3"><AlertCircle size={16} className="text-orange-500" /><h3 className="font-semibold text-orange-600 text-sm uppercase tracking-wide">Urgent Concerns</h3></div>
          <ul className="space-y-2">{URGENT.map(u => <li key={u} className="text-xs text-slate-600 flex gap-2"><span className="text-orange-400 mt-0.5">&#x25A0;</span>{u}</li>)}</ul>
        </div>
        <div className="jc-card border-yellow-100">
          <div className="flex items-center gap-2 mb-3"><Info size={16} className="text-yellow-600" /><h3 className="font-semibold text-yellow-700 text-sm uppercase tracking-wide">Cautions</h3></div>
          <ul className="space-y-2">{CAUTION.map(c => <li key={c} className="text-xs text-slate-600 flex gap-2"><span className="text-yellow-500 mt-0.5">&#x25A0;</span>{c}</li>)}</ul>
        </div>
      </div>
      <div className="jc-card">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" className="mt-1 accent-jc-purple-700" checked={declared} onChange={e => setDeclared(e.target.checked)} />
          <span className="text-sm text-slate-700">I confirm that none of the above emergency or urgent patterns apply, or have already been addressed by appropriate medical care. I understand this tool matches symptom pictures to remedy pictures and does not diagnose disease.</span>
        </label>
      </div>
      <div className="flex justify-between">
        <button className="jc-btn-ghost" onClick={() => navigate('home')}>Back to Home</button>
        <button className="jc-btn-primary" disabled={!declared} onClick={() => navigate('complaint')}>I Confirm and Continue</button>
      </div>
    </div>
  );
}
