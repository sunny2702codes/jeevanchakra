import type { ClinicalSession } from '../types';

const DRAFT_PREFIX = 'jc_draft_intake_';

export interface DraftSession {
  session: ClinicalSession;
  step: number;
  savedAt: string;
}

export const draftStore = {
  key(phone: string): string {
    return `${DRAFT_PREFIX}${phone}`;
  },
  save(phone: string, session: ClinicalSession, step: number): void {
    try {
      const draft: DraftSession = { session, step, savedAt: new Date().toISOString() };
      localStorage.setItem(this.key(phone), JSON.stringify(draft));
    } catch { /* ignore quota errors */ }
  },
  load(phone: string): DraftSession | null {
    try {
      const raw = localStorage.getItem(this.key(phone));
      if (!raw) return null;
      return JSON.parse(raw) as DraftSession;
    } catch {
      return null;
    }
  },
  clear(phone: string): void {
    localStorage.removeItem(this.key(phone));
  },
  exists(phone: string): boolean {
    return localStorage.getItem(this.key(phone)) !== null;
  },
};
