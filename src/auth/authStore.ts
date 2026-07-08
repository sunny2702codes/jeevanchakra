import type { JCUser, JCSession, SavedCase } from '../types';

const USERS_KEY = 'jc_users';
const SESSION_KEY = 'jc_session';
const HARDCODED_OTP = '2702';

function getUsers(): JCUser[] {
  try {
    const s = localStorage.getItem(USERS_KEY);
    if (s) return JSON.parse(s) as JCUser[];
  } catch { /* ignore */ }
  const seed: JCUser[] = [
    { phone: '9811067812', name: 'Mounik Pani', gender: 'Male', city: '', role: 'admin', cases: [] },
  ];
  localStorage.setItem(USERS_KEY, JSON.stringify(seed));
  return seed;
}

function saveUsers(users: JCUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export const authStore = {
  getSession(): JCSession | null {
    try {
      const s = localStorage.getItem(SESSION_KEY);
      return s ? (JSON.parse(s) as JCSession) : null;
    } catch { return null; }
  },

  setSession(sess: JCSession) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(sess));
  },

  clearSession() {
    localStorage.removeItem(SESSION_KEY);
  },

  findUser(phone: string): JCUser | null {
    return getUsers().find(u => u.phone === phone) ?? null;
  },

  register(phone: string, name: string, gender: JCUser['gender'], city: string, dob?: string): boolean {
    const users = getUsers();
    if (users.some(u => u.phone === phone)) return false;
    users.push({ phone, name, gender, city, dob, role: 'user', cases: [] });
    saveUsers(users);
    return true;
  },

  verifyOTP(otp: string): boolean {
    return otp === HARDCODED_OTP;
  },

  login(phone: string): JCSession | null {
    let user = this.findUser(phone);
    if (!user && phone === '9811067812') {
      const users = getUsers();
      user = { phone: '9811067812', name: 'Mounik Pani', gender: 'Male', city: '', role: 'admin', cases: [] };
      users.push(user);
      saveUsers(users);
    }
    if (!user) return null;
    const sess: JCSession = { phone: user.phone, name: user.name, role: user.role };
    this.setSession(sess);
    return sess;
  },

  addCase(phone: string, savedCase: SavedCase) {
    const users = getUsers();
    const idx = users.findIndex(u => u.phone === phone);
    if (idx < 0) return;
    if (!users[idx].cases) users[idx].cases = [];
    users[idx].cases.unshift(savedCase);
    if (users[idx].cases.length > 100) users[idx].cases = users[idx].cases.slice(0, 100);
    saveUsers(users);
  },

  getUserCases(phone: string): SavedCase[] {
    return this.findUser(phone)?.cases ?? [];
  },

  getAllUsers(): JCUser[] {
    return getUsers();
  },

  getAllCases(): { user: string; phone: string; case: SavedCase }[] {
    return getUsers().flatMap(u =>
      (u.cases ?? []).map(c => ({ user: u.name, phone: u.phone, case: c }))
    );
  },

  getTotalStats() {
    const users = getUsers();
    const totalCases = users.reduce((sum, u) => sum + (u.cases?.length ?? 0), 0);
    return { totalUsers: users.length, totalCases };
  },

  deleteUserData(phone: string): boolean {
    const users = getUsers();
    const idx = users.findIndex(u => u.phone === phone);
    if (idx < 0 || users[idx].role === 'admin') return false;
    users.splice(idx, 1);
    saveUsers(users);
    this.clearSession();
    return true;
  },

  withdrawConsent(phone: string): void {
    const users = getUsers();
    const idx = users.findIndex(u => u.phone === phone);
    if (idx >= 0) {
      (users[idx] as JCUser & { consentGiven?: boolean }).consentGiven = false;
      saveUsers(users);
    }
  },
};
