import { useState } from 'react';
import { User, Edit2, Save, X, Trash2, ShieldCheck } from 'lucide-react';
import { authStore } from '../auth/authStore';
import type { JCUser } from '../types';

interface ProfileProps {
  session: { phone: string; name: string; role: string } | null;
  navigate: (s: string) => void;
  onLogout: () => void;
}

function calcAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function maskPhone(phone: string): string {
  if (phone.length !== 10) return phone;
  return `+91 ${phone.slice(0, 2)}XXXXXX${phone.slice(-2)}`;
}

function formatDob(dob: string): string {
  if (!dob) return 'Not provided';
  try {
    return new Date(dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return dob;
  }
}

export default function Profile({ session, navigate, onLogout }: ProfileProps) {
  const user: JCUser | null = session ? authStore.findUser(session.phone) : null;

  const [editing, setEditing]       = useState(false);
  const [editName, setEditName]     = useState(user?.name ?? '');
  const [editGender, setEditGender] = useState<JCUser['gender']>(user?.gender ?? 'Male');
  const [editCity, setEditCity]     = useState(user?.city ?? '');
  const [editDob, setEditDob]       = useState(user?.dob ?? '');
  const [saveError, setSaveError]   = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const maxDob = new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0];

  if (!session || !user) {
    return (
      <div className="max-w-lg mx-auto jc-card text-center py-16">
        <User size={48} className="mx-auto mb-4 text-slate-300" />
        <p className="font-semibold text-slate-700">Not signed in</p>
        <button className="jc-btn-primary mt-4" onClick={() => navigate('login')}>Sign In</button>
      </div>
    );
  }

  function handleSave() {
    setSaveError('');
    if (!editName.trim() || editName.trim().length < 2) {
      setSaveError('Name must be at least 2 characters.');
      return;
    }
    if (editDob && calcAge(editDob) < 18) {
      setSaveError('You must be 18 or older.');
      return;
    }
    authStore.updateUser(session!.phone, {
      name: editName.trim(),
      gender: editGender,
      city: editCity.trim(),
      dob: editDob || user!.dob,
    });
    setEditing(false);
    setSaveError('');
  }

  function handleCancelEdit() {
    setEditName(user!.name);
    setEditGender(user!.gender);
    setEditCity(user!.city ?? '');
    setEditDob(user!.dob ?? '');
    setSaveError('');
    setEditing(false);
  }

  function handleDeleteAccount() {
    const ok = authStore.deleteUserData(session!.phone);
    if (ok) onLogout();
  }

  const caseCount = user.cases?.length ?? 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Banner */}
      <div className="jc-section-banner flex items-start gap-4">
        <div className="p-3 bg-white/20 rounded-xl shrink-0">
          <User size={24} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-jc-gold-300 uppercase tracking-widest mb-1">My Account</div>
          <h1 className="text-xl font-bold text-white">Profile Settings</h1>
          <p className="text-white/70 text-sm mt-1">{user.name} &middot; {caseCount} assessment{caseCount !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Profile card */}
      <div className="jc-card space-y-0">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-slate-800">Personal Information</h2>
          {!editing ? (
            <button
              className="jc-btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-3"
              onClick={() => setEditing(true)}
            >
              <Edit2 size={13} /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                className="jc-btn-ghost flex items-center gap-1.5 text-xs py-1.5 px-3"
                onClick={handleCancelEdit}
              >
                <X size={13} /> Cancel
              </button>
              <button
                className="jc-btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3"
                onClick={handleSave}
              >
                <Save size={13} /> Save
              </button>
            </div>
          )}
        </div>

        {saveError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-600">
            {saveError}
          </div>
        )}

        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Full Name</label>
            {editing ? (
              <input
                className="jc-input mt-1.5"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                placeholder="Your full name"
              />
            ) : (
              <p className="text-slate-800 font-medium mt-1">{user.name}</p>
            )}
          </div>

          {/* Phone (read-only always) */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Mobile Number</label>
            <p className="text-slate-800 font-medium mt-1 font-mono">{maskPhone(user.phone)}</p>
            <p className="text-xs text-slate-400 mt-0.5">Phone number cannot be changed</p>
          </div>

          {/* Gender */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Gender</label>
            {editing ? (
              <div className="flex gap-2 mt-1.5">
                {(['Male', 'Female', 'Other'] as const).map(g => (
                  <button
                    key={g}
                    onClick={() => setEditGender(g)}
                    className={[
                      'flex-1 py-2 rounded-xl border text-sm font-medium transition-all cursor-pointer',
                      editGender === g
                        ? 'border-jc-purple-700 bg-jc-purple-50 text-jc-purple-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300',
                    ].join(' ')}
                  >
                    {g}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-slate-800 font-medium mt-1">{user.gender}</p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">City</label>
            {editing ? (
              <input
                className="jc-input mt-1.5"
                value={editCity}
                onChange={e => setEditCity(e.target.value)}
                placeholder="Your city (optional)"
              />
            ) : (
              <p className="text-slate-800 font-medium mt-1">{user.city || 'Not provided'}</p>
            )}
          </div>

          {/* Date of birth */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Date of Birth</label>
            {editing ? (
              <>
                <input
                  className="jc-input mt-1.5"
                  type="date"
                  max={maxDob}
                  value={editDob}
                  onChange={e => setEditDob(e.target.value)}
                />
                <p className="text-xs text-slate-400 mt-0.5">Must be 18 or older</p>
              </>
            ) : (
              <p className="text-slate-800 font-medium mt-1">{formatDob(user.dob ?? '')}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Account Type</label>
            <div className="mt-1">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${user.role === 'admin' ? 'bg-jc-purple-100 text-jc-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                {user.role === 'admin' ? 'Administrator' : 'Standard User'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy & data card */}
      <div className="jc-card space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck size={16} className="text-jc-purple-600" />
          <h3 className="font-semibold text-slate-800 text-sm">Data and Privacy</h3>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Your health assessment data is stored locally on your device and never shared with third parties.
          You may view our full Privacy Policy from the sidebar.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            className="jc-btn-secondary text-xs py-1.5 px-3"
            onClick={() => navigate('privacy')}
          >
            View Privacy Policy
          </button>
        </div>
      </div>

      {/* Danger zone */}
      {user.role !== 'admin' && (
        <div className="jc-card border-red-100 bg-red-50/30 space-y-3">
          <h3 className="font-semibold text-red-700 text-sm">Danger Zone</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Deleting your account will permanently remove all your personal data and assessment history.
            This action cannot be undone.
          </p>

          {deleteConfirm ? (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-700 flex-1">Are you sure? All data will be deleted.</p>
              <button
                className="text-xs font-semibold text-red-600 border border-red-300 rounded-lg px-3 py-1.5 hover:bg-red-100 transition-colors cursor-pointer"
                onClick={handleDeleteAccount}
              >
                Yes, delete my account
              </button>
              <button
                className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer px-2"
                onClick={() => setDeleteConfirm(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="flex items-center gap-2 text-xs font-semibold text-red-600 border border-red-200 rounded-lg px-3 py-2 hover:bg-red-100 transition-colors cursor-pointer"
              onClick={() => setDeleteConfirm(true)}
            >
              <Trash2 size={13} /> Delete My Account
            </button>
          )}
        </div>
      )}
    </div>
  );
}
