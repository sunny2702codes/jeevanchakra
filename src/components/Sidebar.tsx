import { motion } from 'framer-motion';
import {
  House,
  ClipboardEdit,
  Search,
  BookOpen,
  Calendar,
  GitCompare,
  User,
  HelpCircle,
  Settings,
  ShieldCheck,
  Crown,
  LogOut,
} from 'lucide-react';
import Logo from './Logo';

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
  { label: 'Homeopathy Library', icon: <BookOpen size={18} />,      screen: 'library' },
  { label: 'My Health Journey',  icon: <Calendar size={18} />,      screen: 'cases' },
  { label: 'Compare Remedies',   icon: <GitCompare size={18} />,    screen: 'compare' },
  { label: 'Constitutional',     icon: <User size={18} />,          screen: 'constitutional' },
];

export default function Sidebar({ currentScreen, navigate, session, onLogout }: SidebarProps) {
  const isAdmin = session?.role === 'admin';

  const itemBase =
    'flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer transition-colors rounded-lg';
  const activeClass =
    'bg-jc-purple-100 text-jc-purple-700 font-semibold';
  const inactiveClass =
    'text-slate-600 hover:bg-slate-50';

  function navClass(screen: string) {
    return `${itemBase} ${currentScreen === screen ? activeClass : inactiveClass}`;
  }

  return (
    <aside
      className="flex flex-col border-r border-slate-100 bg-white h-full overflow-hidden"
      style={{ width: 220, minWidth: 220, maxWidth: 220 }}
    >
      {/* Logo */}
      <div className="px-4 pt-5 pb-4 shrink-0">
        <Logo size="sidebar" showText={true} />
      </div>

      {/* Scrollable nav area */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {/* Main menu label */}
        <p className="px-3 mb-2 text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
          Main Menu
        </p>

        {/* Primary nav */}
        <nav className="space-y-0.5">
          {PRIMARY_NAV.map((item) => (
            <motion.div
              key={item.screen}
              className={navClass(item.screen)}
              onClick={() => navigate(item.screen)}
              whileTap={{ scale: 0.97 }}
            >
              {item.icon}
              <span>{item.label}</span>
            </motion.div>
          ))}
        </nav>

        {/* Divider */}
        <hr className="my-3 border-slate-100" />

        {/* Secondary nav */}
        <nav className="space-y-0.5">
          <motion.div
            className={`${itemBase} text-slate-400 hover:bg-slate-50`}
            onClick={() => alert('Help and Support coming soon.')}
            whileTap={{ scale: 0.97 }}
          >
            <HelpCircle size={16} />
            <span className="text-xs">Help and Support</span>
          </motion.div>

          <motion.div
            className={`${itemBase} text-slate-400 hover:bg-slate-50`}
            onClick={() => alert('Settings coming soon.')}
            whileTap={{ scale: 0.97 }}
          >
            <Settings size={16} />
            <span className="text-xs">Settings</span>
          </motion.div>
        </nav>

        {/* Admin Panel (admin only) */}
        {isAdmin && (
          <>
            <hr className="my-3 border-slate-100" />
            <nav>
              <motion.div
                className={navClass('admin')}
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

      {/* Bottom section */}
      <div className="shrink-0 px-3 pb-4 space-y-3">
        {/* Go Premium widget OR Admin badge */}
        {!isAdmin ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Crown size={16} className="text-jc-gold-500" />
              <span className="text-sm font-bold text-jc-purple-700">Go Premium</span>
            </div>
            <p className="text-xs text-slate-400 leading-snug">
              Unlock advanced features and personalized insights.
            </p>
            <button
              className="w-full rounded-lg bg-jc-purple-600 py-1.5 text-xs font-semibold text-white hover:bg-jc-purple-700 transition-colors"
              onClick={() => alert('Coming soon.')}
            >
              Upgrade Now
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-lg bg-jc-purple-50 px-3 py-2">
            <ShieldCheck size={14} className="text-jc-purple-600" />
            <span className="text-xs font-semibold text-jc-purple-700">Admin Mode</span>
          </div>
        )}

        {/* Logout */}
        <motion.button
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
          onClick={onLogout}
          whileTap={{ scale: 0.97 }}
        >
          <LogOut size={18} />
          <span>Log Out</span>
        </motion.button>
      </div>
    </aside>
  );
}
