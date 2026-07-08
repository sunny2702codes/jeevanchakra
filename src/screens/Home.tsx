import { motion } from 'framer-motion';
import { Stethoscope, ClipboardEdit, Search, BookOpen, Calendar, Activity, Lightbulb } from 'lucide-react';
import { authStore } from '../auth/authStore';
import type { JCSession } from '../types';

interface HomeProps {
  session: JCSession | null;
  navigate: (s: string) => void;
}

const TIPS = [
  'In homeopathy, the totality of symptoms guides the prescription, not a single complaint.',
  'Kent grading (1, 2, 3) weights each symptom by its clinical significance in the repertory.',
  'Causation (Ailments From) is the highest-weight field in repertorization.',
  'The constitutional remedy reflects the deepest layer of the patient, not just the acute state.',
  'Modalities that make a symptom distinctly better or worse are highly individualizing.',
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getFirstName(name: string) { return name.split(' ')[0]; }

const cardAnim = { initial: { opacity: 0, y: 16 }, animate: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 } }) };

export default function Home({ session, navigate }: HomeProps) {
  const phone = session?.phone ?? '';
  const cases = phone ? authStore.getUserCases(phone) : [];
  const now = new Date();
  const monthCases = cases.filter(c => { const d = new Date(c.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
  const uniqueRemedies = new Set(cases.flatMap(c => c.results?.slice(0,1).map(r => r.remedy_id) ?? [])).size;
  const tip = TIPS[now.getDate() % TIPS.length];
  const recent = cases.slice(0, 3);

  const stats = [
    { label: 'Cases This Month', value: monthCases.length, icon: <Calendar size={22} className="text-jc-purple-600" /> },
    { label: 'Remedies Explored', value: uniqueRemedies, icon: <Activity size={22} className="text-jc-gold-600" /> },
    { label: 'Total Sessions', value: cases.length, icon: <Stethoscope size={22} className="text-emerald-600" /> },
  ];

  const quickActions = [
    { label: 'New Assessment', desc: 'Start symptom interview', icon: <ClipboardEdit size={24} />, screen: 'safety', bg: 'bg-jc-purple-700', text: 'text-white' },
    { label: 'Search Symptoms', desc: 'Find Kent rubrics', icon: <Search size={24} />, screen: 'rubric-search', bg: 'bg-jc-gold-500', text: 'text-white' },
    { label: 'Remedy Library', desc: 'Browse 700 remedies', icon: <BookOpen size={24} />, screen: 'library', bg: 'bg-emerald-600', text: 'text-white' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800">{getGreeting()}, {getFirstName(session?.name ?? 'there')}!</h1>
        <p className="text-slate-500 mt-1">Here is your homeopathy overview for today.</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} custom={i} variants={cardAnim} initial="initial" animate="animate" className="jc-card flex items-center gap-4">
            <div className="p-3 bg-slate-50 rounded-xl">{s.icon}</div>
            <div>
              <div className="text-3xl font-bold text-slate-800">{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {quickActions.map((a, i) => (
          <motion.button key={a.label} custom={i + 3} variants={cardAnim} initial="initial" animate="animate"
            onClick={() => navigate(a.screen as any)}
            className={`${a.bg} ${a.text} rounded-xl p-5 text-left cursor-pointer hover:scale-105 transition-transform shadow-sm`}>
            <div className="mb-3 opacity-90">{a.icon}</div>
            <div className="font-semibold text-base">{a.label}</div>
            <div className="text-sm opacity-80 mt-0.5">{a.desc}</div>
          </motion.button>
        ))}
      </div>

      <div className="jc-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Recent Sessions</h3>
          <button className="text-jc-purple-700 text-sm hover:underline" onClick={() => navigate('cases')}>View All</button>
        </div>
        {recent.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <Calendar size={40} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">No sessions yet</p>
            <p className="text-sm mt-1">Start your first assessment to see it here.</p>
            <button className="jc-btn-primary mt-4" onClick={() => navigate('safety')}>Start Assessment</button>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map(c => (
              <div key={c.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-jc-purple-100 flex items-center justify-center text-jc-purple-700 text-xs font-bold">
                  {new Date(c.date).getDate()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-800 text-sm truncate">{c.complaint ?? 'General'}</div>
                  <div className="text-xs text-slate-500">{new Date(c.date).toLocaleDateString()}</div>
                </div>
                {c.topRemedy && <span className="jc-badge-probable">{c.topRemedy}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      <motion.div custom={6} variants={cardAnim} initial="initial" animate="animate" className="jc-card flex gap-4 items-start bg-jc-purple-50 border-jc-purple-100">
        <div className="p-2 bg-jc-purple-100 rounded-lg mt-0.5"><Lightbulb size={18} className="text-jc-purple-700" /></div>
        <div>
          <div className="text-xs font-semibold text-jc-purple-600 uppercase tracking-wide mb-1">Tip of the Day</div>
          <p className="text-sm text-slate-700">{tip}</p>
        </div>
      </motion.div>
    </div>
  );
}
