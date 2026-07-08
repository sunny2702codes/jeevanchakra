import { RED_FLAGS } from '../data/redflags.js';
import type { RedFlag, FlagSeverity } from '../types';

export interface SafetyEvalResult {
  halt: boolean;
  proceed: boolean;
  emergencies: RedFlag[];
  urgents: RedFlag[];
  cautions: RedFlag[];
  message: string;
}

export function evaluate(confirmedFlagIds: string[]): SafetyEvalResult {
  const all = RED_FLAGS as unknown as RedFlag[];
  const flags = all.filter(f => confirmedFlagIds.includes(f.id));
  const emergencies = flags.filter(f => f.severity === 'emergency');
  const urgents     = flags.filter(f => f.severity === 'urgent');
  const cautions    = flags.filter(f => f.severity === 'caution');

  if (emergencies.length > 0) {
    return {
      halt: true,
      proceed: false,
      emergencies,
      urgents,
      cautions,
      message: 'Emergency pattern detected. Do not use this app as a substitute for emergency care.',
    };
  }

  return {
    halt: false,
    proceed: true,
    emergencies: [],
    urgents,
    cautions,
    message: urgents.length > 0
      ? 'Some symptoms here warrant same-day medical attention. The remedy suggestions below are educational only and do not replace that.'
      : cautions.length > 0
        ? 'Suggestions below are educational. Read the cautions before acting.'
        : 'No safety flags detected. Continue with remedy assessment.',
  };
}

export function questionsBySeverity(): Record<FlagSeverity, RedFlag[]> {
  const out: Record<FlagSeverity, RedFlag[]> = { emergency: [], urgent: [], caution: [] };
  (RED_FLAGS as unknown as RedFlag[]).forEach(f => out[f.severity].push(f));
  return out;
}
