import { MessageSquare } from 'lucide-react';

interface IntakeProps { navigate: (s: string) => void; }

const STEPS = ['Safety Screen', 'Chief Complaint', 'Symptom Interview', 'Analysis', 'Results'];

export default function Intake({ navigate }: IntakeProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="jc-section-banner flex items-start gap-4">
        <div className="p-3 bg-jc-purple-100 rounded-xl"><MessageSquare size={24} className="text-jc-purple-700" /></div>
        <div>
          <div className="text-xs font-semibold text-jc-purple-500 uppercase tracking-widest mb-1">Step 3 of 5</div>
          <h2 className="text-xl font-bold text-slate-800">Symptom Interview</h2>
          <p className="text-slate-500 text-sm mt-1">Adaptive intake with 15 to 25 questions weighted by clinical hierarchy.</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i === 2 ? 'bg-jc-purple-700 text-white' : i < 2 ? 'bg-jc-purple-200 text-jc-purple-700' : 'bg-slate-100 text-slate-400'}`}>{i + 1}</div>
            {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 min-w-4 ${i < 2 ? 'bg-jc-purple-300' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>
      <div className="jc-card bg-blue-50 border-blue-100 text-center py-12">
        <MessageSquare size={48} className="mx-auto mb-4 text-blue-400" />
        <h3 className="font-semibold text-slate-700 mb-2">Full Engine Coming Soon</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">The adaptive intake engine (947 symptom options across 12 branches) will be ported in the next development phase.</p>
        <p className="text-xs text-slate-400 mt-3">For full clinical functionality, visit the existing HDSS at hdss.kkdtech.com</p>
      </div>
      <div className="flex justify-between">
        <button className="jc-btn-ghost" onClick={() => navigate('complaint')}>Back</button>
        <button className="jc-btn-secondary" onClick={() => navigate('results')}>Skip to Demo Results</button>
      </div>
    </div>
  );
}
