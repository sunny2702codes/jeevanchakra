import { useState } from 'react';
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
  HelpCircle,
  ShieldCheck,
  Crown,
  LogOut,
  FileText,
} from 'lucide-react';
import Logo from './Logo';
import Modal from './Modal';

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

const PRIMARY_NAV: NavItem[] = [
  { label: 'Home',               icon: <House size={18} />,         screen: 'home' },
  { label: 'New Assessment',     icon: <ClipboardEdit size={18} />, screen: 'safety' },
  { label: 'Search Symptoms',    icon: <Search size={18} />,        screen: 'rubric-search' },
  { label: 'Remedy Library',     icon: <BookOpen size={18} />,      screen: 'library' },
  { label: 'My Health Journey',  icon: <Calendar size={18} />,      screen: 'cases' },
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
