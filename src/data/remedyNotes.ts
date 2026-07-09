const KEY = (phone: string, remedyId: string) => `jc_remedy_note_${phone}_${remedyId}`;

export const remedyNotes = {
  get(phone: string, remedyId: string): string {
    return localStorage.getItem(KEY(phone, remedyId)) ?? '';
  },
  set(phone: string, remedyId: string, note: string): void {
    if (note.trim()) {
      localStorage.setItem(KEY(phone, remedyId), note);
    } else {
      localStorage.removeItem(KEY(phone, remedyId));
    }
  },
};
