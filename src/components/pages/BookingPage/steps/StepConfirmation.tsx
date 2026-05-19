import { useState } from 'react';
import { useBooking } from '../BookingContext';
import type { SessionType } from '../BookingContext';
import styles from '../BookingPage.module.css';

const SESSION_LABELS: Record<SessionType, string> = {
  photoshoot: 'Photoshoot',
  video: 'Video',
  both: 'Photoshoot + Video',
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatDateDisplay(dateStr: string): string {
  const [, m, d] = dateStr.split('-').map(Number);
  const date = new Date(dateStr + 'T12:00:00');
  const weekday = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][date.getDay()];
  return `${weekday} ${d} ${MONTH_NAMES[m - 1]}`;
}

function format12h(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h < 12 ? 'am' : 'pm';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')}${ampm}`;
}

function getPrice(_sessionType: SessionType, durationMinutes: number, isStudio: boolean): number {
  if (isStudio) return durationMinutes === 60 ? 150 : 300;
  const map: Record<number, number> = { 30: 30, 60: 50, 120: 80, 480: 150 };
  return map[durationMinutes] ?? 0;
}

function getDeliverables(sessionType: SessionType, durationMinutes: number, _isStudio: boolean): string {
  const photoMap: Record<number, string> = { 30: '50', 60: '100', 120: '200', 480: 'all' };
  const count = photoMap[durationMinutes];
  const photos = count === 'all' ? 'All edited photos' : `Minimum ${count} edited photos`;

  if (sessionType === 'video') return 'Video edit';
  if (sessionType === 'both') return `${photos} + video edit`;
  return photos;
}

function getDurationLabel(minutes: number, isStudio: boolean): string {
  const labels: Record<number, string> = { 30: '30 minutes', 60: '1 hour', 120: '2 hours', 480: 'Full day' };
  return `${isStudio ? 'Studio — ' : ''}${labels[minutes] ?? `${minutes} min`}`;
}

const CONTACT_LABELS: Record<string, string> = {
  phone: 'Phone',
  email: 'Email',
  instagram: 'Instagram',
};

interface Props {}

export function StepConfirmation(_props: Props) {
  const { state } = useBooking();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const price = getPrice(state.sessionType!, state.durationMinutes!, state.isStudio);
  const deliverables = getDeliverables(state.sessionType!, state.durationMinutes!, state.isStudio);

  async function submit() {
    setSubmitting(true);
    setSubmitError(null);
    const apiBase = (import.meta.env.VITE_API_BASE as string | undefined) ?? '';
    try {
      const res = await fetch(`${apiBase}/api/booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionType: state.sessionType,
          durationMinutes: state.durationMinutes,
          isStudio: state.isStudio,
          date: state.date,
          time: state.time,
          email: state.email,
          contactMethod: state.contactMethod,
          contactValue: state.contactValue,
          info: state.info,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Something went wrong');
      }
      setSubmitted(true);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className={styles.stepContent}>
        <div className={styles.successIcon}>🎉</div>
        <h2 className={styles.stepHeading}>You're booked!</h2>
        <p className={styles.successText}>
          Ollie will be in touch via {CONTACT_LABELS[state.contactMethod!]} to confirm.
        </p>
        <div className={styles.summaryCard}>
          <SummaryRow label="Session" value={SESSION_LABELS[state.sessionType!]} />
          <SummaryRow label="Duration" value={getDurationLabel(state.durationMinutes!, state.isStudio)} />
          <SummaryRow label="Date" value={formatDateDisplay(state.date!)} />
          <SummaryRow label="Time" value={format12h(state.time!)} />
          <SummaryRow label="Price" value={`£${price}`} />
          <SummaryRow label="Deliverables" value={`${deliverables} — within 7 days or full refund`} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.stepContent}>
      <h2 className={styles.stepHeading}>Review your booking</h2>

      <div className={styles.summaryCard}>
        <SummaryRow label="Session" value={SESSION_LABELS[state.sessionType!]} />
        <SummaryRow label="Duration" value={getDurationLabel(state.durationMinutes!, state.isStudio)} />
        <SummaryRow label="Date" value={formatDateDisplay(state.date!)} />
        <SummaryRow label="Time" value={format12h(state.time!)} />
        <SummaryRow label="Price" value={`£${price}`} />
        <SummaryRow label="Deliverables" value={`${deliverables} — within 7 days or full refund`} />
        <SummaryRow label="Email" value={state.email} />
        <SummaryRow label={CONTACT_LABELS[state.contactMethod!]} value={state.contactValue} />
        {state.info && <SummaryRow label="Info" value={state.info} />}
      </div>

      <p className={styles.reservationNote}>
        This is a reservation — no payment is taken now. Ollie will confirm and arrange payment.
      </p>

      {submitError && <p className={styles.submitError}>{submitError}</p>}

      <div className={styles.stepActions}>
        <button
          className={styles.btnPrimary}
          onClick={submit}
          disabled={submitting}
          type="button"
        >
          {submitting ? 'Booking…' : 'Book this slot'}
        </button>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.summaryRow}>
      <span className={styles.summaryLabel}>{label}</span>
      <span className={styles.summaryValue}>{value}</span>
    </div>
  );
}
