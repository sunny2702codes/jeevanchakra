import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  House,
  ClipboardEdit,
  Search,
  BookOpen,
  Calendar,
  GitCompare,
  User,
  UserCircle,
  Users,
  HelpCircle,
  ShieldCheck,
  Crown,
  LogOut,
  FileText,
  Plus,
  Check,
} from 'lucide-react';
import Logo from './Logo';
import Modal from './Modal';
import { useApp } from '../App';

interface SidebarProps {
  currentScreen: string;
  navigate: (s: string) => void;
  session: { name: string; role: string } | null;
  onLogout: () => void;
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  screen: string;
}

type RubricEntry = [string, string, string]; // [id, text, category]

const PRIMARY_NAV: NavItem[] = [
  { label: 'Home',               icon: <House size={18} />,         screen: 'home' },
  { label: 'New Assessment',     icon: <ClipboardEdit size={18} />, screen: 'safety' },
  { label: 'Search Symptoms',    icon: <Search size={18} />,        screen: 'rubric-search' },
  { label: 'Remedy Library',     icon: <BookOpen size={18} />,      screen: 'library' },
  { label: 'My Health Journey',  icon: <Calendar size={18} />,      screen: 'cases' },
  { label: 'Patients',           icon: <Users size={18} />,         screen: 'patients' },
  { label: 'Compare Remedies',   icon: <GitCompare size={18} />,    screen: 'compare' },
  { label: 'Constitutional',     icon: <User size={18} />,          screen: 'constitutional' },
  { label: 'My Profile',         icon: <UserCircle size={18} />,    screen: 'profile' },
];

const SECONDARY_NAV: NavItem[] = [
  { label: 'Privacy Policy',     icon: <FileText size={16} />,      screen: 'privacy' },
  { label: 'Help and Support',   icon: <HelpCircle size={16} />,    screen: '__help' },
];

export default function Sidebar({ currentScreen, navigate, session, onLogout }: SidebarProps) {
  const isAdmin = session?.role === 'admin';
  const [helpOpen, setHelpOpen]       = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);

  const { addedRubricIds, setAddedRubricIds } = useApp();

  const [rubricQuery, setRubricQuery]     = useState('');
  const [rubricData, setRubricData]       = useState<RubricEntry[] | null>(null);
  const [rubricLoading, setRubricLoading] = useState(false);

  async function loadRubrics() {
    if (rubricData !== null || rubricLoading) return;
    setRubricLoading(true);
    try {
      const res = await fetch('/data/kent_rubric_texts.json');
      const data: RubricEntry[] = await res.json();
      setRubricData(data);
    } catch {
      setRubricData([]);
    }
    setRubricLoading(false);
  }

  const rubricResults = useMemo(() => {
    if (!rubricData || !rubricQuery.trim()) return [];
    const q = rubricQuery.toLowerCase();
    return rubricData
      .filter(([, text]) => text.toLowerCase().includes(q))
      .slice(0, 8);
  }, [rubricData, rubricQuery]);

  function itemClass(screen: string) {
    const isActive = currentScreen === screen;
    const base = 'flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer transition-all rounded-lg';
    if (isActive) {
      return `${base} bg-white/15 text-white font-semibold border-l-2 border-jc-gold-500 pl-[10px]`;
    }
    return `${base} text-white/65 hover:bg-white/10 hover:text-white`;
  }

  return (
    <aside
      className="flex flex-col h-full overflow-hidden"
      style={{
        width: 224, minWidth: 224, maxWidth: 224,
        background: 'linear-gradient(170deg, #1e0a3c 0%, #3b1162 55%, #2d1461 100%)',
      }}
    >
      {/* Logo */}
      <div className="px-4 pt-5 pb-4 shrink-0">
        <Logo size="sidebar" showText dark />
      </div>

      {/* Divider */}
      <div className="mx-4 mb-3" style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} />

      {/* Scrollable nav */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <p className="px-3 mb-2 text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#FCD34D' }}>
          Main Menu
        </p>

        <nav className="space-y-0.5">
          {PRIMARY_NAV.map((item) => (
            <motion.div
              key={item.screen}
              className={itemClass(item.screen)}
              onClick={() => navigate(item.screen)}
              whileTap={{ scale: 0.97 }}
            >
              {item.icon}
              <span>{item.label}</span>
            </motion.div>
          ))}
        </nav>

        {/* Rubric search panel - only visible during intake */}
        {currentScreen === 'intake' && (
          <div className="px-0 mt-3 mb-1">
            <p className="px-1 mb-1.5 text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#FCD34D' }}>
              Add Rubric
            </p>
            <div className="rounded-xl p-2.5 space-y-2" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {addedRubricIds.length > 0 && (
                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {addedRubricIds.length} rubric{addedRubricIds.length !== 1 ? 's' : ''} added
                </p>
              )}
              <div className="relative">
                <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.4)' }} />
                <input
                  className="w-full rounded-lg py-1.5 pl-6 pr-2 text-xs text-white outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                  placeholder="Search rubric..."
                  value={rubricQuery}
                  onChange={e => { setRubricQuery(e.target.value); void loadRubrics(); }}
                  onFocus={() => void loadRubrics()}
                />
              </div>
              {rubricLoading && (
                <p className="text-[10px] text-center py-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Loading...</p>
              )}
              {rubricQuery.trim() && rubricResults.length === 0 && !rubricLoading && (
                <p className="text-[10px] text-center py-1" style={{ color: 'rgba(255,255,255,0.4)' }}>No matches</p>
              )}
              {rubricResults.map(([id, text, cat]) => {
                const isAdded = addedRubricIds.includes(id);
                return (
                  <div key={id} className="flex items-start gap-1.5 rounded-lg px-1.5 py-1" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] leading-snug text-white/80 truncate">{text}</p>
                      <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{cat}</p>
                    </div>
                    <button
                      className="shrink-0 rounded p-0.5 transition-colors cursor-pointer"
                      style={{ background: isAdded ? 'rgba(167,139,250,0.3)' : 'rgba(255,255,255,0.1)' }}
                      onClick={() => {
                        if (!isAdded) {
                          setAddedRubricIds([...addedRubricIds, id]);
                        }
                      }}
                      title={isAdded ? 'Added' : 'Add to session'}
                    >
                      {isAdded
                        ? <Check size={11} className="text-jc-purple-300" />
                        : <Plus size={11} style={{ color: 'rgba(255,255,255,0.6)' }} />
                      }
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mx-3 my-3" style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} />

        <nav className="space-y-0.5">
          {SECONDARY_NAV.map((item) => (
            <motion.div
              key={item.screen}
              className={itemClass(item.screen)}
              onClick={() => {
                if (item.screen === '__help') {
                  setHelpOpen(true);
                } else {
                  navigate(item.screen);
                }
              }}
              whileTap={{ scale: 0.97 }}
            >
              {item.icon}
              <span>{item.label}</span>
            </motion.div>
          ))}
        </nav>

        {isAdmin && (
          <>
            <div className="mx-3 my-3" style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} />
            <nav>
              <motion.div
                className={itemClass('admin')}
                onClick={() => navigate('admin')}
                whileTap={{ scale: 0.97 }}
              >
                <ShieldCheck size={18} />
                <span>Admin Panel</span>
              </motion.div>
            </nav>
          </>
        )}
      </div>

      {/* Bottom */}
      <div className="shrink-0 px-3 pb-4 space-y-2">
        {!isAdmin ? (
          <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center gap-2">
              <Crown size={15} className="text-jc-gold-400" />
              <span className="text-sm font-bold text-jc-gold-400">Go Premium</span>
            </div>
            <p className="text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Unlock advanced features and personalized insights.
            </p>
            <button
              className="w-full rounded-lg py-1.5 text-xs font-semibold text-jc-purple-900 transition-colors cursor-pointer"
              style={{ background: 'linear-gradient(90deg, #FCD34D, #F59E0B)' }}
              onClick={() => setPremiumOpen(true)}
            >
              Upgrade Now
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <ShieldCheck size={14} className="text-jc-gold-400" />
            <span className="text-xs font-semibold text-jc-gold-400">Admin Mode</span>
          </div>
        )}

        <motion.button
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm cursor-pointer transition-colors"
          style={{ color: 'rgba(255,255,255,0.6)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)'; (e.currentTarget as HTMLButtonElement).style.background = ''; }}
          onClick={onLogout}
          whileTap={{ scale: 0.97 }}
        >
          <LogOut size={18} />
          <span>Log Out</span>
        </motion.button>
      </div>

      {/* Modals */}
      <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title="Help and Support">
        <div className="space-y-4 text-sm text-slate-700">
          <p>For support or data-related queries, contact our Grievance Officer:</p>
          <div className="bg-slate-50 rounded-xl p-4 space-y-1.5 text-sm">
            <p><span className="font-semibold text-slate-700">Name:</span> Mounik Pani</p>
            <p><span className="font-semibold text-slate-700">Email:</span> grievance@jeevanchakra.in</p>
            <p><span className="font-semibold text-slate-700">Response time:</span> Within 48 hours</p>
          </div>
          <p className="text-slate-500 text-xs">
            You can also view our Privacy Policy from the sidebar navigation.
          </p>
        </div>
      </Modal>

      <Modal open={premiumOpen} onClose={() => setPremiumOpen(false)} title="Premium Features">
        <div className="space-y-4 text-sm text-slate-700">
          <p>Premium features are in development. They will include:</p>
          <ul className="space-y-2 pl-4 list-disc text-slate-600">
            <li>Advanced constitutional analysis with detailed profiles</li>
            <li>Case history export and practitioner sharing</li>
            <li>Extended remedy database with clinical notes</li>
            <li>Priority grievance support</li>
          </ul>
          <p className="text-slate-400 text-xs mt-2">Stay tuned for updates.</p>
        </div>
      </Modal>
    </aside>
  );
}
