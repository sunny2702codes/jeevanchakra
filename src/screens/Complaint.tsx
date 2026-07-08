import { useState } from 'react';
import { ClipboardList } from 'lucide-react';

interface ComplaintProps { navigate: (s: string) => void; }

const COMPLAINTS = [
  { value: 'headache', label: 'Headache', emoji: '🤕' },
  { value: 'gi', label: 'Digestion / GI', emoji: '🫃' },
  { value: 'respiratory', label: 'Respiratory', emoji: '🫁' },
  { value: 'fever', label: 'Fever / Infection', emoji: '🌡️' },
  { value: 'mental', label: 'Mental / Emotional', emoji: '🧠' },
  { value: 'skin', label: 'Skin Conditions', emoji: '🩹' },
  { value: 'musculoskel', label: 'Joints / Muscles', emoji: '🦴' },
  { value: 'urinary', label: 'Urinary', emoji: '💧' },
  { value: 'injury', label: 'Injury / Trauma', emoji: '🩻' },
  { value: 'female', label: 'Female Health', emoji: '🌸' },
  { value: 'paediatric', label: 'Paediatric', emoji: '👶' },
  { value: 'general', label: 'General / Other', emoji: '⚕️' },
];

export default function Complaint({ navigate }: ComplaintProps) {
  const [selected, setSelected] = useState('');
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="jc-section-banner flex items-start gap-4">
        <div className="p-3 bg-jc-purple-100 rounded-xl"><ClipboardList size={24} className="text-jc-purple-700" /></div>
        <div>
          <div className="text-xs font-semibold text-jc-purple-500 uppercase tracking-widest mb-1">Step 2 of 5</div>
          <h2 className="text-xl font-bold text-slate-800">Chief Complaint</h2>
          <p className="text-slate-500 text-sm mt-1">Select the category that best describes the main problem today.</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {COMPLAINTS.map(c => (
          <button key={c.value} onClick={() => setSelected(c.value)}
            className={`jc-card text-left cursor-pointer transition-all hover:scale-105 ${selected === c.value ? 'border-2 border-jc-purple-700 bg-jc-purple-50' : 'border-2 border-transparent hover:border-slate-200'}`}>
            <div className="text-2xl mb-2">{c.emoji}</div>
            <div className={`font-medium text-sm ${selected === c.value ? 'text-jc-purple-700' : 'text-slate-700'}`}>{c.label}</div>
          </button>
        ))}
      </div>
      <div className="flex justify-between">
        <button className="jc-btn-ghost" onClick={() => navigate('safety')}>Back</button>
        <button className="jc-btn-primary" disabled={!selected} onClick={() => navigate('intake')}>Continue</button>
      </div>
    </div>
  );
}
