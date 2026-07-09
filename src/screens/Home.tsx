import { useState } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, ClipboardEdit, Search, BookOpen, Calendar, Activity, Lightbulb, GitCompare, Users } from 'lucide-react';
import { authStore } from '../auth/authStore';
import { patientStore } from '../data/patientStore';
import { humanize } from '../utils/humanize';
import type { JCSession, ClinicalSession } from '../types';

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
  safety:          'linear-gradient(135deg, #5B21B6 0%, #3b1162 100%)',
  'rubric-search': 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
  library:         'linear-gradient(135deg, #059669 0%, #047857 100%)',
  compare:         'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
};

interface DraftData {
  session: ClinicalSession;
  step: number;
  savedAt: string;
}

export default function Home({ session, navigate }: HomeProps) {
  const [showAnalytics, setShowAnalytics] = useState(false);
  const phone = session?.phone ?? '';
  const cases = phone ? authStore.getUserCases(phone) : [];
  const patientCount = phone ? patientStore.getForUser(phone).length : 0;
  const now = new Date();
  const monthCases = cases.filter(c => {
    const d = new Date(c.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const uniqueRemedies = new Set(cases.flatMap(c => c.results?.slice(0, 1).map(r => r.remedy_id) ?? [])).size;
  const tip = TIPS[now.getDate() % TIPS.length];
  const recent = cases.slice(0, 3);

  // Draft detection
  const DRAFT_KEY = `jc_draft_intake_${phone}`;
  const hasDraft = phone ? !!localStorage.getItem(DRAFT_KEY) : false;
  const draftData: DraftData | null = hasDraft ? (() => {
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY)!) as DraftData; } catch { return null; }
  })() : null;

  // Top prescribed remedies
  const remedyCount = new Map<string, number>();
  for (const c of cases) {
    const top = c.topRemedy ?? c.results?.[0]?.remedy_id;
    if (top) remedyCount.set(top, (remedyCount.get(top) ?? 0) + 1);
  }
  const topRemedies = Array.from(remedyCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Due for review (Feature 9)
  const today = new Date();
  const in7Days = new Date(today);
  in7Days.setDate(today.getDate() + 7);
  const dueForReview = cases.filter(c => {
    if (!c.reviewDate) return false;
    const d = new Date(c.reviewDate);
    return d >= today && d <= in7Days;
  }).sort((a, b) => new Date(a.reviewDate!).getTime() - new Date(b.reviewDate!).getTime());

  // Analytics (Feature 6)
  const complaintCount = new Map<string, number>();
  for (const c of cases) {
    if (c.complaint) complaintCount.set(c.complaint, (complaintCount.get(c.complaint) ?? 0) + 1);
  }
  const topComplaints = Array.from(complaintCount.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const outcomeCount = { amelioration: 0, aggravation: 0, no_change: 0, partial: 0 };
  for (const c of cases) {
    if (c.followUpResponse) outcomeCount[c.followUpResponse]++;
  }
  const totalOutcomes = Object.values(outcomeCount).reduce((a, b) => a + b, 0);

  const stats = [
    { label: 'Cases This Month', value: monthCases.length, icon: <Calendar size={22} className="text-jc-purple-600" /> },
    { label: 'Remedies Explored', value: uniqueRemedies, icon: <Activity size={22} className="text-jc-gold-600" /> },
    { label: 'Total Sessions', value: cases.length, icon: <Stethoscope size={22} className="text-emerald-600" /> },
    { label: 'Patients', value: patientCount, icon: <Users size={22} className="text-blue-500" /> },
  ];

  const quickActions = [
    { label: 'New Assessment', desc: 'Begin a guided symptom interview', icon: <ClipboardEdit size={22} />, screen: 'safety' },
    { label: 'Symptom Search', desc: 'Search across 700 remedies', icon: <Search size={22} />, screen: 'rubric-search' },
    { label: 'Remedy Library', desc: 'Browse full Boericke database', icon: <BookOpen size={22} />, screen: 'library' },
    { label: 'Compare Remedies', desc: 'Side-by-side remedy analysis', icon: <GitCompare size={22} />, screen: 'compare' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Draft resume card */}
      {hasDraft && draftData && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="jc-card border border-jc-purple-200 bg-gradient-to-r from-jc-purple-50 to-white"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-jc-purple-600 uppercase tracking-widest mb-1">Incomplete Assessment</div>
              <p className="text-sm font-semibold text-slate-800">
                {draftData.session?.complaint ? humanize(draftData.session.complaint) : 'Assessment in progress'}
              </p>
              {draftData.savedAt && (
                <p className="text-xs text-slate-400 mt-0.5">
                  Started {new Date(draftData.savedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                className="jc-btn-primary text-sm"
                onClick={() => navigate('intake')}
              >
                Resume
              </button>
              <button
                className="jc-btn-ghost text-sm"
                onClick={() => {
                  localStorage.removeItem(DRAFT_KEY);
                  window.location.reload();
                }}
              >
                Discard
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Due for review card - Feature 9 */}
      {dueForReview.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="jc-card border border-amber-200 bg-amber-50"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold text-amber-700 uppercase tracking-widest">Due for Review</div>
            <span className="text-xs text-amber-600 bg-amber-100 border border-amber-200 rounded-full px-2 py-0.5">
              {dueForReview.length} patient{dueForReview.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-2">
            {dueForReview.slice(0, 3).map(c => (
              <div
                key={c.id}
                className="flex items-center gap-3 cursor-pointer hover:bg-amber-100 rounded-lg px-2 py-1.5 transition-colors"
                onClick={() => navigate('cases')}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">
                    {c.patientName ?? humanize(c.complaint)}
                  </div>
                  <div className="text-xs text-amber-700">
                    Review: {new Date(c.reviewDate!).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
                {c.topRemedy && <span className="text-xs text-slate-500 shrink-0 font-mono">{c.topRemedy}</span>}
              </div>
            ))}
          </div>
        </motion.div>
      )}

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
      <div className="grid grid-cols-4 gap-4">
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

      {/* Top prescribed remedies */}
      {topRemedies.length > 0 && (
        <motion.div custom={5} variants={cardAnim} initial="initial" animate="animate" className="jc-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Top Considerations</h3>
            <span className="text-xs text-slate-400">by frequency across all cases</span>
          </div>
          <div className="space-y-2.5">
            {topRemedies.map(([remedyId, count], i) => {
              const pct = Math.round((count / (topRemedies[0][1])) * 100);
              return (
                <div key={remedyId} className="flex items-center gap-3">
                  <div className="w-5 text-xs text-slate-400 text-right shrink-0">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-medium text-slate-700 truncate capitalize">{remedyId.replace(/-/g, ' ')}</span>
                      <span className="text-xs text-slate-400 ml-2 shrink-0">{count}x</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-jc-purple-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Practice analytics - Feature 6 */}
      {cases.length >= 3 && (
        <motion.div custom={6} variants={cardAnim} initial="initial" animate="animate" className="jc-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800">Practice Analytics</h3>
            <button
              className="text-xs text-jc-purple-600 font-semibold hover:underline cursor-pointer"
              onClick={() => setShowAnalytics(a => !a)}
            >
              {showAnalytics ? 'Hide' : 'Show'}
            </button>
          </div>
          {showAnalytics && (
            <div className="space-y-5">
              {topComplaints.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Complaint Distribution</div>
                  <div className="space-y-2">
                    {topComplaints.map(([complaint, count]) => {
                      const pct = Math.round((count / topComplaints[0][1]) * 100);
                      return (
                        <div key={complaint} className="flex items-center gap-3">
                          <div className="w-28 text-xs text-slate-600 truncate shrink-0">{humanize(complaint)}</div>
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-jc-purple-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="text-xs text-slate-400 tabular-nums w-5 text-right shrink-0">{count}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {totalOutcomes > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Follow-up Outcomes</div>
                  <div className="grid grid-cols-4 gap-2">
                    {([
                      ['amelioration', 'Improved', 'text-emerald-700 bg-emerald-50 border-emerald-200'],
                      ['partial', 'Partial', 'text-blue-700 bg-blue-50 border-blue-200'],
                      ['no_change', 'No change', 'text-slate-600 bg-slate-50 border-slate-200'],
                      ['aggravation', 'Aggravated', 'text-orange-700 bg-orange-50 border-orange-200'],
                    ] as const).map(([key, label, cls]) => (
                      <div key={key} className={`border rounded-xl px-3 py-2 text-center ${cls}`}>
                        <div className="text-lg font-bold">{outcomeCount[key]}</div>
                        <div className="text-xs font-medium">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

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
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400">
                      {new Date(c.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                    {c.patientName && (
                      <span className="text-xs text-jc-purple-500 truncate">{c.patientName}</span>
                    )}
                  </div>
                </div>
                {c.topRemedy && (
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    <span className="jc-badge-probable">{c.topRemedy}</span>
                    {c.results?.[0]?.normalised_score && (
                      <span className="text-[10px] text-slate-400">{Math.round(c.results[0].normalised_score)}%</span>
                    )}
                  </div>
                )}
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
