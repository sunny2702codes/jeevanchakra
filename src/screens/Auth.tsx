import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Check, ShieldCheck } from 'lucide-react';
import Logo from '../components/Logo';
import Modal from '../components/Modal';
import { authStore } from '../auth/authStore';

interface AuthProps {
  screen: 'login' | 'register' | 'otp';
  onSuccess: (sess: { phone: string; name: string; role: 'admin' | 'user' }) => void;
  navigate?: (s: string) => void;
}

function calcAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function AuthScreens({ screen: initialScreen, onSuccess }: AuthProps) {
  const [localScreen, setLocalScreen] = useState<'login' | 'register' | 'otp'>(
    initialScreen === 'otp' ? 'login' : initialScreen as 'login' | 'register'
  );
  const [phone, setPhone]         = useState('');
  const [name, setName]           = useState('');
  const [dob, setDob]             = useState('');
  const [gender, setGender]       = useState<'Male' | 'Female' | 'Other'>('Male');
  const [city, setCity]           = useState('');
  const [showPhone, setShowPhone] = useState(false);
  const [error, setError]         = useState('');
  const [consent1, setConsent1]   = useState(false);
  const [consent2, setConsent2]   = useState(false);
  const [consent3, setConsent3]   = useState(false);
  const [otpInput, setOtpInput]   = useState('');
  const [pendingPhone, setPendingPhone] = useState('');
  const [showPrivacy, setShowPrivacy]   = useState(false);

  const cardVariants = {
    initial: { opacity: 0, y: 16, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit:    { opacity: 0, y: -8, scale: 0.97 },
  };

  function handleLogin() {
    setError('');
    if (!/^[6-9][0-9]{9}$/.test(phone)) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    const existing = authStore.findUser(phone);
    if (!existing && phone !== '9811067812') {
      setError('No account found. Please register first.');
      return;
    }
    setPendingPhone(phone);
    setOtpInput('');
    setLocalScreen('otp');
  }

  function handleRegister() {
    setError('');
    if (!name.trim() || name.trim().length < 2) { setError('Enter your full name.'); return; }
    if (!dob) { setError('Date of birth is required.'); return; }
    if (calcAge(dob) < 18) { setError('You must be 18 or older to register.'); return; }
    if (!/^[6-9][0-9]{9}$/.test(phone)) { setError('Enter a valid 10-digit mobile number.'); return; }
    if (authStore.findUser(phone)) { setError('This number is already registered. Please sign in.'); return; }
    if (!consent1 || !consent2 || !consent3) { setError('Please accept all required consents to continue.'); return; }
    authStore.register(phone, name.trim(), gender, city, dob);
    setPendingPhone(phone);
    setOtpInput('');
    setLocalScreen('otp');
  }

  function handleVerifyOTP() {
    setError('');
    if (!authStore.verifyOTP(otpInput)) {
      setError('Incorrect OTP. Please try again.');
      setOtpInput('');
      return;
    }
    const sess = authStore.login(pendingPhone);
    if (sess) onSuccess(sess);
    else setError('Authentication failed. Please try again.');
  }

  const maxDob = new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #1e0a3c 0%, #3b1162 55%, #4C1D95 100%)' }}
    >
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(108,43,217,0.3) 0%, transparent 70%)' }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={localScreen}
          variants={cardVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.22 }}
          className="bg-white rounded-2xl shadow-jc-lg p-8 w-full max-w-md relative z-10"
        >
          <div className="flex justify-center mb-6">
            <Logo size="auth" showText />
          </div>

          {/* ---- OTP ---- */}
          {localScreen === 'otp' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-jc-purple-100 flex items-center justify-center">
                  <ShieldCheck size={28} className="text-jc-purple-700" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-slate-800 mb-1 text-center">Verify Identity</h2>
              <p className="text-slate-500 text-sm mb-6 text-center">
                Enter the 4-digit OTP sent to +91 {pendingPhone.slice(0, 3)}XXXXXXX{pendingPhone.slice(-2)}
              </p>

              <label className="jc-label">One-Time Password</label>
              <input
                className="jc-input text-center text-2xl tracking-[0.5em] font-bold mb-4"
                type="text"
                maxLength={4}
                inputMode="numeric"
                placeholder="----"
                value={otpInput}
                onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                onKeyDown={e => e.key === 'Enter' && handleVerifyOTP()}
                autoFocus
                aria-label="OTP"
              />

              {error && (
                <p className="text-red-600 text-sm mb-3 bg-red-50 px-3 py-2 rounded-lg" role="alert">{error}</p>
              )}

              <button className="jc-btn-primary w-full" onClick={handleVerifyOTP}>
                Verify and Continue
              </button>

              <button
                className="jc-btn-ghost w-full mt-3"
                onClick={() => {
                  setLocalScreen('login');
                  setOtpInput('');
                  setError('');
                }}
              >
                Back
              </button>

              <p className="text-center text-xs text-slate-400 mt-4">
                Use OTP: 2702 (prototype)
              </p>
            </>
          )}

          {/* ---- LOGIN ---- */}
          {localScreen === 'login' && (
            <>
              <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome Back</h2>
              <p className="text-slate-500 text-sm mb-6">Enter your registered mobile number</p>

              <label className="jc-label">Mobile Number</label>
              <div className="flex mb-4">
                <span className="flex items-center px-3 py-2.5 bg-slate-50 border border-r-0 border-slate-200 rounded-l-xl text-sm text-slate-500 font-medium">
                  +91
                </span>
                <div className="relative flex-1">
                  <input
                    className="jc-input rounded-l-none border-l-0 pr-10"
                    type={showPhone ? 'text' : 'tel'}
                    maxLength={10}
                    inputMode="numeric"
                    placeholder="9876543210"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    aria-label="Mobile number"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    onClick={() => setShowPhone(v => !v)}
                    aria-label={showPhone ? 'Hide number' : 'Show number'}
                  >
                    {showPhone ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-600 text-sm mb-3 bg-red-50 px-3 py-2 rounded-lg" role="alert">{error}</p>
              )}

              <button className="jc-btn-primary w-full" onClick={handleLogin}>Continue</button>

              <p className="text-center text-sm text-slate-500 mt-5">
                New here?{' '}
                <button
                  className="text-jc-purple-700 font-semibold hover:underline cursor-pointer"
                  onClick={() => { setError(''); setLocalScreen('register'); }}
                >
                  Create Account
                </button>
              </p>

              <p className="text-center text-xs text-slate-400 mt-4 leading-relaxed">
                By signing in, you agree to our{' '}
                <button
                  className="text-jc-purple-600 hover:underline cursor-pointer"
                  onClick={() => setShowPrivacy(true)}
                >
                  Privacy Policy
                </button>
                {' '}and{' '}
                <button
                  className="text-jc-purple-600 hover:underline cursor-pointer"
                  onClick={() => setShowPrivacy(true)}
                >
                  Terms of Use
                </button>.
              </p>
            </>
          )}

          {/* ---- REGISTER ---- */}
          {localScreen === 'register' && (
            <>
              <h2 className="text-2xl font-bold text-slate-800 mb-1">Create Account</h2>
              <p className="text-slate-500 text-sm mb-5">Create your account to get started</p>

              <div className="space-y-4">
                <div>
                  <label className="jc-label" htmlFor="reg-name">Full Name</label>
                  <input
                    id="reg-name"
                    className="jc-input"
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label className="jc-label" htmlFor="reg-dob">
                    Date of Birth{' '}
                    <span className="text-slate-400 font-normal">(must be 18 or older)</span>
                  </label>
                  <input
                    id="reg-dob"
                    className="jc-input"
                    type="date"
                    max={maxDob}
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                  />
                </div>

                <div>
                  <label className="jc-label">Gender</label>
                  <div className="flex gap-2">
                    {(['Male', 'Female', 'Other'] as const).map(g => (
                      <button
                        key={g}
                        onClick={() => setGender(g)}
                        className={[
                          'flex-1 py-2 rounded-xl border text-sm font-medium transition-all cursor-pointer',
                          gender === g
                            ? 'border-jc-purple-700 bg-jc-purple-50 text-jc-purple-700'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300',
                        ].join(' ')}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="jc-label" htmlFor="reg-city">
                    City{' '}
                    <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    id="reg-city"
                    className="jc-input"
                    type="text"
                    placeholder="Your city"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    autoComplete="address-level2"
                  />
                </div>

                <div>
                  <label className="jc-label" htmlFor="reg-phone">Mobile Number</label>
                  <div className="flex">
                    <span className="flex items-center px-3 py-2.5 bg-slate-50 border border-r-0 border-slate-200 rounded-l-xl text-sm text-slate-500 font-medium">
                      +91
                    </span>
                    <input
                      id="reg-phone"
                      className="jc-input rounded-l-none border-l-0"
                      type="tel"
                      maxLength={10}
                      inputMode="numeric"
                      placeholder="9876543210"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                      autoComplete="tel-national"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Required Consents (DPDP Act 2023)
                  </p>

                  {[
                    {
                      key: 'c1',
                      checked: consent1,
                      set: setConsent1,
                      text: 'I have read and agree to the Privacy Policy and Terms of Use.',
                    },
                    {
                      key: 'c2',
                      checked: consent2,
                      set: setConsent2,
                      text: 'I consent to JeevanChakra processing my health information (medical complaints, constitutional traits, emotional profile, lifestyle data) to provide classical homeopathy decision support. I understand this data is stored on servers located in India.',
                    },
                    {
                      key: 'c3',
                      checked: consent3,
                      set: setConsent3,
                      text: 'I acknowledge that JeevanChakra provides decision support only, not medical diagnosis or treatment. I will consult a qualified homeopathic practitioner before taking any remedy.',
                    },
                  ].map(c => (
                    <label key={c.key} className="flex items-start gap-3 cursor-pointer group">
                      <div
                        onClick={() => c.set(v => !v)}
                        className={[
                          'mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition-all cursor-pointer',
                          c.checked
                            ? 'bg-jc-purple-700 border-jc-purple-700'
                            : 'border-slate-300 group-hover:border-jc-purple-400',
                        ].join(' ')}
                        role="checkbox"
                        aria-checked={c.checked}
                        tabIndex={0}
                        onKeyDown={e => e.key === ' ' && c.set(v => !v)}
                      >
                        {c.checked && <Check size={12} className="text-white" strokeWidth={3} />}
                      </div>
                      <span
                        className="text-xs text-slate-600 leading-relaxed"
                        onClick={() => c.set(v => !v)}
                      >
                        {c.text}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-red-600 text-sm mt-3 mb-1 bg-red-50 px-3 py-2 rounded-lg" role="alert">{error}</p>
              )}

              <button className="jc-btn-primary w-full mt-5" onClick={handleRegister}>
                Continue
              </button>

              <p className="text-center text-sm text-slate-500 mt-4">
                Already have an account?{' '}
                <button
                  className="text-jc-purple-700 font-semibold hover:underline cursor-pointer"
                  onClick={() => { setError(''); setLocalScreen('login'); }}
                >
                  Sign In
                </button>
              </p>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Privacy Policy modal */}
      <Modal open={showPrivacy} onClose={() => setShowPrivacy(false)} title="Privacy Policy" maxWidth="max-w-3xl">
        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <p>
            JeevanChakra is a classical homeopathy decision support tool compliant with the
            Digital Personal Data Protection Act 2023 (DPDP Act).
          </p>
          <div>
            <p className="font-semibold text-slate-800 mb-1">What we collect</p>
            <p>Name, mobile number, date of birth, city, health complaints, emotional state, constitutional traits, and lifestyle preferences.</p>
          </div>
          <div>
            <p className="font-semibold text-slate-800 mb-1">Purpose</p>
            <p>
              To match your symptom patterns against 700 Boericke remedies for classical homeopathy decision support.
              This is a reference tool, not a diagnostic or treatment service.
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-800 mb-1">Your rights under DPDP Act 2023</p>
            <ul className="space-y-1 pl-4 list-disc text-slate-600">
              <li>Right to access your personal data</li>
              <li>Right to correct inaccurate data</li>
              <li>Right to erase your account and all associated data</li>
              <li>Right to withdraw consent at any time</li>
              <li>Right to grievance redressal</li>
            </ul>
          </div>
          <div className="bg-jc-purple-50 border border-jc-purple-100 rounded-xl p-4">
            <p className="font-semibold text-slate-800 text-xs mb-1">Grievance Officer</p>
            <p className="text-xs text-slate-600">Mounik Pani, grievance@jeevanchakra.in</p>
            <p className="text-xs text-slate-500">Response within 48 hours</p>
          </div>
          <p className="text-slate-400 text-xs">
            For the full Privacy Policy, view it from the sidebar navigation after signing in.
          </p>
        </div>
      </Modal>
    </div>
  );
}
