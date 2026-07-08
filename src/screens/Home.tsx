import { motion } from 'framer-motion';
import { Stethoscope, ClipboardEdit, Search, BookOpen, Calendar, Activity, Lightbulb, GitCompare } from 'lucide-react';
import { authStore } from '../auth/authStore';
import { humanize } from '../utils/humanize';
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
  'Thermal state (chilly vs warm) is a major differentiating general symptom in classical repertorization.',
  'Compare top remedies side-by-side to distinguish closely scoring differentials.',
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getFirstName(name: string) { return name.split(' ')[0]; }

const cardAnim = { initial: { opacity: 0, y: 16 }, animate: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07 } }) };

const QUICK_ACTION_GRADIENTS: Record<string, string> = {
  safety:        'linear-gradient(135deg, #5B21B6 0%, #3b1162 100%)',
  'rubric-search': 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
  library:       'linear-gradient(135deg, #059669 0%, #047857 100%)',
  compare:       'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
};

export default function Home({ session, navigate }: HomeProps) {
  const phone = session?.phone ?? '';
  const cases = phone ? authStore.getUserCases(phone) : [];
  const now = new Date();
  const monthCases = cases.filter(c => {
    const d = new Date(c.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const uniqueRemedies = new Set(cases.flatMap(c => c.results?.slice(0, 1).map(r => r.remedy_id) ?? [])).size;
  const tip = TIPS[now.getDate() % TIPS.length];
  const recent = cases.slice(0, 3);

  const stats = [
    { label: 'Cases This Month', value: monthCases.length, icon: <Calendar size={22} className="text-jc-purple-600" /> },
    { label: 'Remedies Explored', value: uniqueRemedies, icon: <Activity size={22} className="text-jc-gold-600" /> },
    { label: 'Total Sessions', value: cases.length, icon: <Stethoscope size={22} className="text-emerald-600" /> },
  ];

  const quickActions = [
    { label: 'New Assessment', desc: 'Begin a guided symptom interview', icon: <ClipboardEdit size={22} />, screen: 'safety' },
    { label: 'Symptom Search', desc: 'Search across 700 remedies', icon: <Search size={22} />, screen: 'rubric-search' },
    { label: 'Remedy Library', desc: 'Browse full Boericke database', icon: <BookOpen size={22} />, screen: 'library' },
    { label: 'Compare Remedies', desc: 'Side-by-side remedy analysis', icon: <GitCompare size={22} />, screen: 'compare' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Welcome header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800">{getGreeting()}, {getFirstName(session?.name ?? 'there')}.</h1>
        <p className="text-slate-500 mt-1">Classical homeopathy reference and symptom analysis dashboard.</p>
        {cases.length > 0 && (
          <p className="text-xs text-slate-400 mt-0.5">
            Last session: {new Date(cases[0].date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        )}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            custom={i}
            variants={cardAnim}
            initial="initial"
            animate="animate"
            className="jc-card flex items-center gap-4"
          >
            <div className="p-3 bg-slate-50 rounded-xl shrink-0">{s.icon}</div>
            <div>
              <div className="text-3xl font-bold text-slate-800">{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-4">
        {quickActions.map((a, i) => (
          <motion.button
            key={a.label}
            custom={i + 3}
            variants={cardAnim}
            initial="initial"
            animate="animate"
            onClick={() => navigate(a.screen)}
            className="rounded-2xl p-5 text-left cursor-pointer hover:scale-105 transition-transform shadow-md hover:shadow-lg text-white"
            style={{ background: QUICK_ACTION_GRADIENTS[a.screen] ?? QUICK_ACTION_GRADIENTS.safety }}
          >
            <div className="mb-3 opacity-90">{a.icon}</div>
            <div className="font-semibold text-sm">{a.label}</div>
            <div className="text-xs opacity-75 mt-0.5 leading-snug">{a.desc}</div>
          </motion.button>
        ))}
      </div>

      {/* Recent sessions */}
      <div className="jc-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Recent Sessions</h3>
          {cases.length > 0 && (
            <button className="text-jc-purple-700 text-sm hover:underline cursor-pointer" onClick={() => navigate('cases')}>
              View All
            </button>
          )}
        </div>
        {recent.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <div className="w-12 h-12 rounded-xl bg-jc-purple-50 flex items-center justify-center mx-auto mb-3">
              <Calendar size={24} className="text-jc-purple-300" />
            </div>
            <p className="font-medium text-slate-500">No sessions yet</p>
            <p className="text-sm mt-1">Start your first assessment to see it here.</p>
            <button className="jc-btn-primary mt-4" onClick={() => navigate('safety')}>
              Start Assessment
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map(c => (
              <div
                key={c.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                onClick={() => navigate('cases')}
              >
                <div className="w-10 h-10 rounded-xl bg-jc-purple-100 flex items-center justify-center text-jc-purple-700 font-bold text-sm shrink-0">
                  {new Date(c.date).getDate()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-800 text-sm truncate">
                    {c.complaint ? humanize(c.complaint) : 'General assessment'}
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(c.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
                {c.topRemedy && <span className="jc-badge-probable shrink-0">{c.topRemedy}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tip of the day */}
      <motion.div
        custom={6}
        variants={cardAnim}
        initial="initial"
        animate="animate"
        className="jc-card flex gap-4 items-start border-l-4 border-l-jc-purple-300"
      >
        <div className="p-2 bg-jc-purple-100 rounded-lg mt-0.5 shrink-0">
          <Lightbulb size={16} className="text-jc-purple-700" />
        </div>
        <div>
          <div className="text-xs font-semibold text-jc-purple-600 uppercase tracking-wide mb-1">Principle of the Day</div>
          <p className="text-sm text-slate-700 leading-relaxed">{tip}</p>
        </div>
      </motion.div>
    </div>
  );
}
