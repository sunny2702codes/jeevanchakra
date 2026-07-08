import { useState } from 'react';
import { Pill, ChevronDown, ChevronUp } from 'lucide-react';

interface ResultsProps { navigate: (s: string) => void; session: any; }

const DEMO_RESULTS = [
  { name: 'Bryonia alba', abbr: 'Bry', score: 72, tier: 'Strong' as const, matches: ['Worse from motion', 'Better from rest and pressure', 'Dryness of mucous membranes', 'Irritability when disturbed'] },
  { name: 'Arsenicum album', abbr: 'Ars', score: 48, tier: 'Probable' as const, matches: ['Restlessness with anxiety', 'Burning pains better heat', 'Thirst for small sips'] },
  { name: 'Pulsatilla', abbr: 'Puls', score: 31, tier: 'Possible' as const, matches: ['Chilly but craves open air', 'Symptoms shifting'] },
];

const tierBadge = { Strong: 'jc-badge-strong', Probable: 'jc-badge-probable', Possible: 'jc-badge-possible' };

export default function Results({ navigate }: ResultsProps) {
  const [expanded, setExpanded] = useState<string | null>('Bry');
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="jc-section-banner flex items-start gap-4">
        <div className="p-3 bg-jc-purple-100 rounded-xl"><Pill size={24} className="text-jc-purple-700" /></div>
        <div>
          <div className="text-xs font-semibold text-jc-purple-500 uppercase tracking-widest mb-1">Step 5 of 5</div>
          <h2 className="text-xl font-bold text-slate-800">Remedy Considerations</h2>
          <p className="text-slate-500 text-sm mt-1">Ranked by weighted repertorization score. Clinical reasoning shown for each candidate.</p>
        </div>
      </div>
      <div className="jc-card bg-blue-50 border-blue-100 text-sm text-slate-600">
        <strong>Demo mode:</strong> showing sample results. The full scoring engine (700 remedies, Kent grading) will be ported in the next phase.
      </div>
      <div className="space-y-3">
        {DEMO_RESULTS.map(r => (
          <div key={r.abbr} className="jc-card cursor-pointer" onClick={() => setExpanded(expanded === r.abbr ? null : r.abbr)}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-jc-purple-700 text-white flex items-center justify-center font-bold text-sm">{r.abbr.slice(0,3)}</div>
              <div className="flex-1">
                <div className="font-semibold text-slate-800">{r.name}</div>
                <div className="text-xs text-slate-500">Repertorization score</div>
              </div>
              <span className={tierBadge[r.tier]}>{r.tier}</span>
              <span className="text-xl font-bold text-jc-purple-700">{r.score}%</span>
              {expanded === r.abbr ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </div>
            {expanded === r.abbr && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Matched Indicators</div>
                <ul className="space-y-1">
                  {r.matches.map(m => <li key={m} className="text-sm text-slate-700 flex gap-2"><span className="text-jc-purple-400">&#x2713;</span>{m}</li>)}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        <button className="jc-btn-ghost" onClick={() => navigate('intake')}>Back</button>
        <div className="flex gap-3">
          <button className="jc-btn-secondary" disabled title="Available after engine port">Save Case</button>
          <button className="jc-btn-primary" onClick={() => navigate('safety')}>New Assessment</button>
        </div>
      </div>
    </div>
  );
}
