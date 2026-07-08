import { useState } from 'react';
import { Users, Plus, ChevronRight, X, Save, Trash2 } from 'lucide-react';
import { patientStore } from '../data/patientStore';
import { authStore } from '../auth/authStore';
import { useApp } from '../App';
import type { Patient } from '../types';

interface PatientsProps {
  session: { phone: string; name: string; role: string } | null;
  navigate: (s: string) => void;
}

export default function PatientsScreen({ session, navigate }: PatientsProps) {
  const { setCurrentPatientId } = useApp();

  const [patients, setPatients] = useState<Patient[]>(() =>
    session ? patientStore.getForUser(session.phone) : []
  );

  const [showForm, setShowForm]           = useState(false);
  const [editingId, setEditingId]         = useState<string | null>(null);
  const [name, setName]                   = useState('');
  const [gender, setGender]               = useState<Patient['gender']>('Male');
  const [ageStr, setAgeStr]               = useState('');
  const [phone, setPhone]                 = useState('');
  const [notes, setNotes]                 = useState('');
  const [formErr, setFormErr]             = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!session) {
    return (
      <div className="max-w-lg mx-auto jc-card text-center py-16">
        <Users size={48} className="mx-auto mb-4 text-slate-300" />
        <p className="font-semibold text-slate-700">Not signed in</p>
        <button className="jc-btn-primary mt-4" onClick={() => navigate('login')}>Sign In</button>
      </div>
    );
  }

  function openNewForm() {
    setEditingId(null);
    setName('');
    setGender('Male');
    setAgeStr('');
    setPhone('');
    setNotes('');
    setFormErr('');
    setShowForm(true);
  }

  function openEditForm(p: Patient) {
    setEditingId(p.id);
    setName(p.name);
    setGender(p.gender);
    setAgeStr(p.age ? String(p.age) : '');
    setPhone(p.phone ?? '');
    setNotes(p.notes ?? '');
    setFormErr('');
    setShowForm(true);
  }

  function handleFormCancel() {
    setShowForm(false);
    setEditingId(null);
    setFormErr('');
  }

  function handleFormSave() {
    setFormErr('');
    if (!name.trim() || name.trim().length < 2) {
      setFormErr('Patient name must be at least 2 characters.');
      return;
    }
    const age = ageStr ? parseInt(ageStr, 10) : undefined;
    if (ageStr && (isNaN(age!) || age! < 0 || age! > 150)) {
      setFormErr('Enter a valid age (0-150).');
      return;
    }
    if (editingId) {
      patientStore.update(editingId, {
        name: name.trim(),
        gender,
        age,
        phone: phone.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      patientStore.create(session!.phone, {
        name: name.trim(),
        gender,
        age,
        phone: phone.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    }
    setPatients(patientStore.getForUser(session!.phone));
    setShowForm(false);
    setEditingId(null);
  }

  function handleDelete(id: string) {
    patientStore.delete(id);
    setPatients(patientStore.getForUser(session!.phone));
    setDeleteConfirmId(null);
  }

  function handleStartAssessment(p: Patient) {
    setCurrentPatientId(p.id);
    navigate('safety');
  }

  function getCaseCount(patientId: string): number {
    return authStore.getUserCases(session!.phone).filter(c => c.patientId === patientId).length;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Banner */}
      <div className="jc-section-banner flex items-start gap-4">
        <div className="p-3 bg-white/20 rounded-xl shrink-0">
          <Users size={24} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-jc-gold-300 uppercase tracking-widest mb-1">Practice</div>
          <h1 className="text-xl font-bold text-white">My Patients</h1>
          <p className="text-white/70 text-sm mt-1">
            {patients.length} patient{patients.length !== 1 ? 's' : ''} on record
          </p>
        </div>
        <button
          className="flex items-center gap-1.5 text-xs font-semibold text-jc-gold-300 border border-jc-gold-300/40 rounded-lg px-3 py-2 hover:bg-white/10 transition-colors cursor-pointer"
          onClick={openNewForm}
        >
          <Plus size={13} /> Add Patient
        </button>
      </div>

      {/* New/Edit patient form */}
      {showForm && (
        <div className="jc-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">{editingId ? 'Edit Patient' : 'New Patient'}</h3>
            <button className="jc-btn-ghost p-1" onClick={handleFormCancel}>
              <X size={16} />
            </button>
          </div>

          {formErr && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {formErr}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="jc-label">Full Name</label>
              <input
                className="jc-input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Patient name"
              />
            </div>
            <div>
              <label className="jc-label">Age (optional)</label>
              <input
                className="jc-input"
                type="number"
                min="0"
                max="150"
                value={ageStr}
                onChange={e => setAgeStr(e.target.value)}
                placeholder="Years"
              />
            </div>
            <div>
              <label className="jc-label">Contact (optional)</label>
              <input
                className="jc-input"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Phone or ID"
              />
            </div>
            <div className="col-span-2">
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
            <div className="col-span-2">
              <label className="jc-label">Clinical Notes (optional)</label>
              <textarea
                className="jc-input resize-none h-20"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Allergies, chronic conditions, past remedies..."
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button className="jc-btn-primary flex items-center gap-2" onClick={handleFormSave}>
              <Save size={14} /> Save Patient
            </button>
            <button className="jc-btn-ghost" onClick={handleFormCancel}>Cancel</button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {patients.length === 0 && !showForm && (
        <div className="jc-card flex flex-col items-center gap-4 py-14 text-center">
          <div className="w-14 h-14 rounded-2xl bg-jc-purple-100 flex items-center justify-center">
            <Users size={28} className="text-jc-purple-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">No patients yet</p>
            <p className="text-sm text-slate-400 mt-1 max-w-xs">
              Add a patient to start managing assessments per individual.
            </p>
          </div>
          <button className="jc-btn-primary" onClick={openNewForm}>Add First Patient</button>
        </div>
      )}

      {/* Patient list */}
      {patients.length > 0 && (
        <div className="space-y-3">
          {patients.map(p => {
            const caseCount = getCaseCount(p.id);
            const isConfirmingDelete = deleteConfirmId === p.id;
            return (
              <div key={p.id} className="jc-card p-0 overflow-hidden">
                <div className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 rounded-full bg-jc-purple-100 flex items-center justify-center shrink-0">
                    <span className="text-jc-purple-700 font-bold text-sm">
                      {p.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm">{p.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {p.gender}{p.age ? `, ${p.age} yrs` : ''} &middot; {caseCount} assessment{caseCount !== 1 ? 's' : ''}
                    </p>
                    {p.notes && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{p.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      className="text-xs font-semibold text-jc-purple-600 border border-jc-purple-200 rounded-lg px-3 py-1.5 hover:bg-jc-purple-50 transition-colors cursor-pointer"
                      onClick={() => handleStartAssessment(p)}
                    >
                      Assess
                    </button>
                    <button className="jc-btn-ghost p-1.5" onClick={() => openEditForm(p)}>
                      <ChevronRight size={15} className="text-slate-400" />
                    </button>
                  </div>
                </div>

                {isConfirmingDelete ? (
                  <div className="flex items-center gap-2 px-4 pb-3">
                    <span className="text-xs text-slate-500 flex-1">
                      Delete {p.name}? This cannot be undone.
                    </span>
                    <button
                      className="text-xs font-semibold text-red-600 border border-red-200 rounded px-2 py-1 hover:bg-red-50 cursor-pointer"
                      onClick={() => handleDelete(p.id)}
                    >
                      Yes, delete
                    </button>
                    <button
                      className="jc-btn-ghost text-xs px-2 py-1"
                      onClick={() => setDeleteConfirmId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-end px-4 pb-2">
                    <button
                      className="text-xs text-slate-300 hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50"
                      onClick={() => setDeleteConfirmId(p.id)}
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
