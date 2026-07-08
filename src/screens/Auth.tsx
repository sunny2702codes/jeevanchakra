import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../components/Logo';
import { authStore } from '../auth/authStore';

interface AuthProps {
  screen: 'login' | 'register' | 'otp';
  onSuccess: (sess: { phone: string; name: string; role: 'admin' | 'user' }) => void;
}

export default function AuthScreens({ screen: initialScreen, onSuccess }: AuthProps) {
  const [localScreen, setLocalScreen] = useState<'login' | 'register' | 'otp'>(initialScreen);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [city, setCity] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(120);
  const [timerActive, setTimerActive] = useState(false);
  const [pendingPhone, setPendingPhone] = useState('');
  const [pendingName, setPendingName] = useState('');
  const [pendingIsNew, setPendingIsNew] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null]);

  useEffect(() => {
    if (!timerActive) return;
    if (timer <= 0) { setTimerActive(false); return; }
    const t = setTimeout(() => setTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, timerActive]);

  function startTimer() { setTimer(120); setTimerActive(true); }

  function sendLogin() {
    setError('');
    if (!/^[6-9][0-9]{9}$/.test(phone)) { setError('Enter a valid 10-digit mobile number.'); return; }
    const existing = authStore.findUser(phone);
    if (!existing && phone !== '9811067812') { setError('No account found. Please register first.'); return; }
    setPendingPhone(phone);
    setPendingName(existing ? existing.name : 'Mounik Pani');
    setPendingIsNew(false);
    setLocalScreen('otp');
    startTimer();
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  }

  function sendRegister() {
    setError('');
    if (!name.trim() || name.trim().length < 2) { setError('Enter your full name.'); return; }
    if (!/^[6-9][0-9]{9}$/.test(phone)) { setError('Enter a valid 10-digit mobile number.'); return; }
    if (authStore.findUser(phone)) { setError('This number is already registered. Please log in.'); return; }
    setPendingPhone(phone);
    setPendingName(name.trim());
    setPendingIsNew(true);
    setLocalScreen('otp');
    startTimer();
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  }

  function handleOtpChange(idx: number, val: string) {
    const d = val.replace(/[^0-9]/g, '').slice(-1);
    const next = [...otp]; next[idx] = d; setOtp(next);
    if (d && idx < 3) otpRefs.current[idx + 1]?.focus();
    if (idx === 3 && d) {
      const code = [...next.slice(0, 3), d].join('');
      if (code.length === 4) setTimeout(() => verifyOtp(code), 80);
    }
  }

  function handleOtpKey(idx: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  }

  function verifyOtp(code?: string) {
    const c = code ?? otp.join('');
    setError('');
    if (!authStore.verifyOTP(c)) {
      setError('Incorrect OTP. Hint: try 2702.');
      setOtp(['', '', '', '']);
      otpRefs.current[0]?.focus();
      return;
    }
    if (pendingIsNew) authStore.register(pendingPhone, pendingName, gender, city);
    const sess = authStore.login(pendingPhone);
    if (sess) onSuccess(sess);
  }

  const timerStr = `${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, '0')}`;

  const cardVariants = { initial: { opacity: 0, scale: 0.96 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.96 } };

  return (
    <div className="min-h-screen bg-gradient-to-br from-jc-purple-50 via-white to-jc-purple-50 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        <motion.div key={localScreen} variants={cardVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-jc-lg p-8 w-full max-w-md">
          <div className="flex justify-center mb-6">
            <Logo size="auth" showText />
          </div>

          {localScreen === 'login' && (
            <>
              <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome Back</h2>
              <p className="text-slate-500 text-sm mb-6">Enter your mobile number to continue</p>
              <label className="jc-label">Mobile Number</label>
              <div className="flex mb-4">
                <span className="flex items-center px-3 py-2.5 bg-slate-50 border border-r-0 border-slate-200 rounded-l-lg text-sm text-slate-500">+91</span>
                <input className="jc-input rounded-l-none border-l-0" type="tel" maxLength={10} inputMode="numeric" placeholder="9876543210"
                  value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} onKeyDown={e => e.key === 'Enter' && sendLogin()} />
              </div>
              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
              <button className="jc-btn-primary w-full" onClick={sendLogin}>Send OTP</button>
              <p className="text-center text-sm text-slate-500 mt-4">New here?{' '}
                <button className="text-jc-purple-700 font-medium hover:underline" onClick={() => { setError(''); setLocalScreen('register'); }}>Register</button>
              </p>
            </>
          )}

          {localScreen === 'register' && (
            <>
              <h2 className="text-2xl font-bold text-slate-800 mb-1">Create Account</h2>
              <p className="text-slate-500 text-sm mb-6">Join JeevanChakra today</p>
              <div className="space-y-4">
                <div>
                  <label className="jc-label">Full Name</label>
                  <input className="jc-input" type="text" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                  <label className="jc-label">Gender</label>
                  <div className="flex gap-2">
                    {(['Male', 'Female', 'Other'] as const).map(g => (
                      <button key={g} onClick={() => setGender(g)}
                        className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${gender === g ? 'border-jc-purple-700 bg-jc-purple-50 text-jc-purple-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="jc-label">City (optional)</label>
                  <input className="jc-input" type="text" placeholder="Your city" value={city} onChange={e => setCity(e.target.value)} />
                </div>
                <div>
                  <label className="jc-label">Mobile Number</label>
                  <div className="flex">
                    <span className="flex items-center px-3 py-2.5 bg-slate-50 border border-r-0 border-slate-200 rounded-l-lg text-sm text-slate-500">+91</span>
                    <input className="jc-input rounded-l-none border-l-0" type="tel" maxLength={10} inputMode="numeric" placeholder="9876543210"
                      value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} />
                  </div>
                </div>
              </div>
              {error && <p className="text-red-500 text-sm mt-2 mb-1">{error}</p>}
              <button className="jc-btn-primary w-full mt-5" onClick={sendRegister}>Send OTP</button>
              <p className="text-center text-sm text-slate-500 mt-4">Already have an account?{' '}
                <button className="text-jc-purple-700 font-medium hover:underline" onClick={() => { setError(''); setLocalScreen('login'); }}>Log in</button>
              </p>
            </>
          )}

          {localScreen === 'otp' && (
            <>
              <h2 className="text-2xl font-bold text-slate-800 mb-1">Verify OTP</h2>
              <p className="text-slate-500 text-sm mb-6">Sent to +91 {pendingPhone}</p>
              <div className="flex gap-3 justify-center mb-6">
                {otp.map((d, i) => (
                  <input key={i} ref={el => { otpRefs.current[i] = el; }} type="text" maxLength={1} inputMode="numeric"
                    value={d} onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => handleOtpKey(i, e)}
                    className="w-14 h-14 text-center text-2xl font-bold border-2 rounded-xl focus:border-jc-purple-700 focus:outline-none transition-colors"
                  />
                ))}
              </div>
              {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}
              <p className="text-xs text-slate-400 text-center italic mb-4">Hint: OTP is 2702</p>
              <button className="jc-btn-primary w-full" onClick={() => verifyOtp()}>Verify and Continue</button>
              <p className="text-center text-sm mt-4">
                {timerActive
                  ? <span className="text-slate-400">Resend OTP in {timerStr}</span>
                  : <button className="text-jc-purple-700 font-medium hover:underline" onClick={startTimer}>Resend OTP</button>
                }
              </p>
              <button className="jc-btn-ghost w-full mt-3 text-xs" onClick={() => { setLocalScreen(pendingIsNew ? 'register' : 'login'); setOtp(['','','','']); setError(''); }}>
                Change number
              </button>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
