import { useState, useEffect } from 'react';
import { useBooking } from '../BookingContext';
import styles from '../BookingPage.module.css';

type SlotStatus = 'available' | 'location-only' | 'busy';

interface Slot {
  time: string;
  status: SlotStatus;
  location?: string;
}

type AvailabilityMap = Record<string, Slot[]>;

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function format12h(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h < 12 ? 'am' : 'pm';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')}${ampm}`;
}

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function StepCalendar({ onNext, onBack }: Props) {
  const { state, set } = useBooking();

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [availability, setAvailability] = useState<AvailabilityMap>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedDay = state.date;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(
      `/api/availability?year=${viewYear}&month=${viewMonth + 1}&durationMinutes=${state.durationMinutes}`,
    )
      .then(r => r.json())
      .then(data => {
        if (!cancelled) {
          setAvailability(data.availability ?? {});
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Could not load availability. Please try again.');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [viewYear, viewMonth, state.durationMinutes]);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
    set('date', null);
    set('time', null);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
    set('date', null);
    set('time', null);
  }

  function selectDay(dateKey: string) {
    const slots = availability[dateKey] ?? [];
    const hasAvailable = slots.some(s => s.status !== 'busy');
    if (!hasAvailable) return;
    set('date', dateKey === selectedDay ? null : dateKey);
    set('time', null);
    set('slotIsLocationOnly', false);
    set('locationName', null);
  }

  function selectSlot(slot: Slot) {
    set('time', slot.time);
    set('slotIsLocationOnly', slot.status === 'location-only');
    set('locationName', slot.location ?? null);
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDow = getFirstDayOfWeek(viewYear, viewMonth);
  const todayKey = formatDateKey(now.getFullYear(), now.getMonth(), now.getDate());

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const selectedSlots = selectedDay ? (availability[selectedDay] ?? []) : [];

  const locationOnlySelected =
    state.slotIsLocationOnly && state.isStudio;

  return (
    <div className={styles.stepContent}>
      <h2 className={styles.stepHeading}>Pick a date and time</h2>

      <div className={styles.calendarNav}>
        <button onClick={prevMonth} type="button" className={styles.calNavBtn} aria-label="Previous month">
          ‹
        </button>
        <span className={styles.calMonthLabel}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button onClick={nextMonth} type="button" className={styles.calNavBtn} aria-label="Next month">
          ›
        </button>
      </div>

      {loading && <p className={styles.calLoading}>Loading availability…</p>}
      {error && <p className={styles.calError}>{error}</p>}

      {!loading && !error && (
        <div className={styles.calendar}>
          {DAY_LABELS.map(d => (
            <span key={d} className={styles.calDayHeader}>{d}</span>
          ))}
          {cells.map((day, i) => {
            if (!day) return <span key={`empty-${i}`} />;
            const dateKey = formatDateKey(viewYear, viewMonth, day);
            const slots = availability[dateKey] ?? [];
            const hasAvailable = slots.some(s => s.status !== 'busy');
            const isPast = dateKey < todayKey;
            const isToday = dateKey === todayKey;
            const isSelected = selectedDay === dateKey;

            return (
              <button
                key={dateKey}
                type="button"
                className={[
                  styles.calDay,
                  isPast || !hasAvailable ? styles.calDayUnavailable : '',
                  isToday ? styles.calDayToday : '',
                  isSelected ? styles.calDaySelected : '',
                ].join(' ')}
                onClick={() => selectDay(dateKey)}
                disabled={isPast || !hasAvailable}
              >
                {day}
              </button>
            );
          })}
        </div>
      )}

      {selectedDay && selectedSlots.length > 0 && (
        <div className={styles.slotSection}>
          <h3 className={styles.slotHeading}>Available times</h3>
          <div className={styles.slotGrid}>
            {selectedSlots
              .filter(s => s.status !== 'busy')
              .map(slot => (
                <button
                  key={slot.time}
                  type="button"
                  className={[
                    styles.slotBtn,
                    slot.status === 'location-only' ? styles.slotLocationOnly : styles.slotAvailable,
                    state.time === slot.time ? styles.slotSelected : '',
                  ].join(' ')}
                  onClick={() => selectSlot(slot)}
                  title={
                    slot.status === 'location-only'
                      ? `Studio unavailable — Ollie will be at ${slot.location}`
                      : undefined
                  }
                >
                  {format12h(slot.time)}
                  {slot.status === 'location-only' && (
                    <span className={styles.slotLocationDot} aria-label="location only" />
                  )}
                </button>
              ))}
          </div>

          {state.time && state.slotIsLocationOnly && (
            <p className={styles.locationOnlyNote}>
              Studio shoots are not available for this slot — Ollie will be at{' '}
              <strong>{state.locationName}</strong>. Outdoor and location shoots are still available.
            </p>
          )}

          {locationOnlySelected && (
            <p className={styles.locationOnlyWarn}>
              You selected a studio session for a slot where studio is unavailable. Please go back and choose a non-studio option, or pick a different time.
            </p>
          )}
        </div>
      )}

      <div className={styles.stepActions}>
        <button className={styles.btnSecondary} onClick={onBack} type="button">
          Back
        </button>
        <button
          className={styles.btnPrimary}
          onClick={onNext}
          disabled={!state.date || !state.time || locationOnlySelected}
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  );
}
