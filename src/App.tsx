import { createContext, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { authStore } from './auth/authStore';
import type { JCScreen, JCSession, ClinicalSession, ScoringResult } from './types';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

import SplashScreen from './screens/Splash';
import AuthScreens from './screens/Auth';
import HomeScreen from './screens/Home';
import SafetyScreen from './screens/Safety';
import ComplaintScreen from './screens/Complaint';
import IntakeScreen from './screens/Intake';
import ResultsScreen from './screens/Results';
import CasesScreen from './screens/Cases';
import LibraryScreen from './screens/Library';
import AdminScreen from './screens/Admin';
import CompareScreen from './screens/CompareRemedies';
import ConstitutionalScreen from './screens/ConstitutionalType';
import RubricSearchScreen from './screens/RubricSearch';
import PrivacyPolicyScreen from './screens/PrivacyPolicy';
import ProfileScreen from './screens/Profile';

function HaltScreen({ navigate }: { navigate: (s: string) => void }) {
  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center gap-6 py-16 text-center">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-red-700">Emergency - Stop Here</h2>
        <p className="text-slate-600 mt-3 leading-relaxed max-w-lg">
          An emergency pattern has been identified. Please call emergency services or go to the nearest hospital immediately.
          Homeopathy cannot substitute for emergency medical care.
        </p>
      </div>
      <a href="tel:112" className="jc-btn-primary bg-red-600 hover:bg-red-700 text-white">
        Call Emergency (112)
      </a>
      <button className="jc-btn-ghost text-slate-400 text-sm" onClick={() => navigate('safety')}>
        Back to safety screen
      </button>
    </div>
  );
}

// ── App Context ──────────────────────────────────────────────────────────────

interface AppContextValue {
  navigate: (screen: string) => void;
  clinicalSession: ClinicalSession | null;
  setClinicalSession: (s: ClinicalSession | null) => void;
  clinicalResults: ScoringResult[] | null;
  setClinicalResults: (r: ScoringResult[] | null) => void;
  session: JCSession | null;
}

export const AppContext = createContext<AppContextValue>({
  navigate: () => {},
  clinicalSession: null,
  setClinicalSession: () => {},
  clinicalResults: null,
  setClinicalResults: () => {},
  session: null,
});

export function useApp() {
  return useContext(AppContext);
}

// ── Auth screen set ───────────────────────────────────────────────────────────

const AUTH_SCREENS = new Set<JCScreen>(['login', 'register', 'otp']);

// ── Screen motion variants ────────────────────────────────────────────────────

const screenVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22 } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<JCScreen>('splash');
  // Session starts null: always requires OTP before gaining access
  const [session, setSession] = useState<JCSession | null>(null);
  const [clinicalSession, setClinicalSession] = useState<ClinicalSession | null>(null);
  const [clinicalResults, setClinicalResults] = useState<ScoringResult[] | null>(null);

  // ── Navigation ──────────────────────────────────────────────────────────────

  function navigate(target: string) {
    setScreen(target as JCScreen);
  }

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleSplashDone() {
    // Always go to login: OTP is required every session
    authStore.clearSession();
    navigate('login');
  }

  function handleLogin(sess: JCSession) {
    setSession(sess);
    navigate('home');
  }

  function handleLogout() {
    authStore.clearSession();
    setSession(null);
    setClinicalSession(null);
    setClinicalResults(null);
    navigate('login');
  }

  // ── Render current main-app screen ──────────────────────────────────────────

  function renderScreen() {
    switch (screen) {
      case 'home':       return <HomeScreen session={session} navigate={navigate} />;
      case 'safety':     return <SafetyScreen navigate={navigate} session={session} />;
      case 'halt':       return <HaltScreen navigate={navigate} />;
      case 'complaint':  return <ComplaintScreen navigate={navigate} />;
      case 'intake':     return <IntakeScreen navigate={navigate} />;
      case 'results':    return <ResultsScreen navigate={navigate} session={session} />;
      case 'cases':          return <CasesScreen session={session} navigate={navigate} />;
      case 'library':        return <LibraryScreen navigate={navigate} />;
      case 'admin':          return <AdminScreen session={session} navigate={navigate} />;
      case 'compare':        return <CompareScreen navigate={navigate} />;
      case 'constitutional': return <ConstitutionalScreen navigate={navigate} session={clinicalSession} />;
      case 'rubric-search':  return <RubricSearchScreen navigate={navigate} />;
      case 'privacy':        return <PrivacyPolicyScreen navigate={navigate} />;
      case 'profile':        return <ProfileScreen session={session} navigate={navigate} onLogout={handleLogout} />;
      default:               return <HomeScreen session={session} navigate={navigate} />;
    }
  }

  // ── Context value ───────────────────────────────────────────────────────────

  const contextValue: AppContextValue = {
    navigate,
    clinicalSession,
    setClinicalSession,
    clinicalResults,
    setClinicalResults,
    session,
  };

  // ── Splash ──────────────────────────────────────────────────────────────────

  if (screen === 'splash') {
    return (
      <AppContext.Provider value={contextValue}>
        <SplashScreen onDone={handleSplashDone} />
      </AppContext.Provider>
    );
  }

  // ── Auth screens ────────────────────────────────────────────────────────────

  if (AUTH_SCREENS.has(screen)) {
    return (
      <AppContext.Provider value={contextValue}>
        <AuthScreens
          screen={screen as 'login' | 'register' | 'otp'}
          onSuccess={handleLogin}
          navigate={navigate}
        />
      </AppContext.Provider>
    );
  }

  // ── Main app layout ─────────────────────────────────────────────────────────

  return (
    <AppContext.Provider value={contextValue}>
      <div className="flex h-screen bg-jc-purple-50 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentScreen={screen}
          navigate={navigate}
          session={session}
          onLogout={handleLogout}
        />

        {/* Content column */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Navbar session={session} navigate={navigate} />

          <main className="flex-1 overflow-y-auto p-6 bg-jc-purple-50/40 print:p-0 print:bg-white">
            <AnimatePresence mode="wait">
              <motion.div
                key={screen}
                variants={screenVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="h-full"
              >
                {renderScreen()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </AppContext.Provider>
  );
}
