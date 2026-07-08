import type { Patient } from '../types';

const PATIENTS_KEY = 'jc_patients';

function getAll(): Patient[] {
  try {
    const s = localStorage.getItem(PATIENTS_KEY);
    return s ? (JSON.parse(s) as Patient[]) : [];
  } catch {
    return [];
  }
}

function save(patients: Patient[]) {
  localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
}

export const patientStore = {
  getForUser(ownerPhone: string): Patient[] {
    return getAll().filter(p => p.ownerPhone === ownerPhone);
  },

  create(
    ownerPhone: string,
    data: Omit<Patient, 'id' | 'createdAt' | 'ownerPhone'>
  ): Patient {
    const patients = getAll();
    const patient: Patient = {
      ...data,
      id: `pat_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ownerPhone,
    };
    patients.push(patient);
    save(patients);
    return patient;
  },

  update(
    id: string,
    data: Partial<Omit<Patient, 'id' | 'createdAt' | 'ownerPhone'>>
  ): boolean {
    const patients = getAll();
    const idx = patients.findIndex(p => p.id === id);
    if (idx < 0) return false;
    patients[idx] = { ...patients[idx], ...data };
    save(patients);
    return true;
  },

  delete(id: string): boolean {
    const patients = getAll();
    const filtered = patients.filter(p => p.id !== id);
    if (filtered.length === patients.length) return false;
    save(filtered);
    return true;
  },

  findById(id: string): Patient | null {
    return getAll().find(p => p.id === id) ?? null;
  },
};
