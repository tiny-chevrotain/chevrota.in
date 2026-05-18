import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type SessionType = 'photoshoot' | 'video' | 'both';
export type ContactMethod = 'phone' | 'email' | 'instagram';

export interface BookingState {
  sessionType: SessionType | null;
  durationMinutes: number | null;
  isStudio: boolean;
  date: string | null;
  time: string | null;
  slotIsLocationOnly: boolean;
  locationName: string | null;
  contactMethod: ContactMethod | null;
  contactValue: string;
  info: string;
}

interface BookingContextValue {
  state: BookingState;
  set: <K extends keyof BookingState>(key: K, value: BookingState[K]) => void;
  reset: () => void;
}

const initial: BookingState = {
  sessionType: null,
  durationMinutes: null,
  isStudio: false,
  date: null,
  time: null,
  slotIsLocationOnly: false,
  locationName: null,
  contactMethod: null,
  contactValue: '',
  info: '',
};

const Ctx = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BookingState>(initial);

  function set<K extends keyof BookingState>(key: K, value: BookingState[K]) {
    setState(s => ({ ...s, [key]: value }));
  }

  function reset() {
    setState(initial);
  }

  return <Ctx.Provider value={{ state, set, reset }}>{children}</Ctx.Provider>;
}

export function useBooking() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useBooking must be used inside BookingProvider');
  return ctx;
}
