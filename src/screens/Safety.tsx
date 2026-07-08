import { useState } from 'react';
import { Shield, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import type { RedFlag, FlagSeverity } from '../types';
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
  const [declared, setDeclared] = useState(false);

  const grouped: Record<FlagSeverity, RedFlag[]> = { emergency: [], urgent: [], caution: [] };
  for (const f of RED_FLAGS) grouped[f.severity].push(f);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="jc-section-banner flex items-start gap-4">
        <div className="p-3 bg-jc-purple-100 rounded-xl">
          <Shield size={24} className="text-jc-purple-700" />
        </div>
        <div>
          <div className="text-xs font-semibold text-jc-purple-500 uppercase tracking-widest mb-1">Step 1 of 5</div>
          <h2 className="text-xl font-bold text-slate-800">Safety Screen</h2>
          <p className="text-slate-500 text-sm mt-1">
            Review all {RED_FLAGS.length} patterns. If any apply to this patient, refer for emergency care immediately.
          </p>
        </div>
      </div>

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
        <button className="jc-btn-primary" disabled={!declared} onClick={() => navigate('complaint')}>
          Confirmed - Continue
        </button>
      </div>
    </div>
  );
}
