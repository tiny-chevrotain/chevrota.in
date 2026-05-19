import { useBooking } from '../BookingContext';
import type { ContactMethod } from '../BookingContext';
import styles from '../BookingPage.module.css';

const contactMethods: { value: ContactMethod; label: string; placeholder: string }[] = [
  { value: 'phone', label: 'Phone', placeholder: '+44 7700 000000' },
  { value: 'email', label: 'Email', placeholder: 'you@example.com' },
  { value: 'instagram', label: 'Instagram', placeholder: '@yourhandle' },
];

interface Props {
  onNext: () => void;
}

export function StepContact({ onNext }: Props) {
  const { state, set } = useBooking();

  const selectedMethod = contactMethods.find(m => m.value === state.contactMethod);

  const isValid =
    state.email.includes('@') &&
    state.contactMethod !== null &&
    state.contactValue.trim().length > 0;

  return (
    <div className={styles.stepContent}>
      <h2 className={styles.stepHeading}>How can we reach you?</h2>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Email <span className={styles.required}>*</span></label>
        <input
          className={styles.input}
          type="email"
          placeholder="you@example.com"
          value={state.email}
          onChange={e => set('email', e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Preferred contact <span className={styles.required}>*</span></label>
        <div className={styles.contactRow}>
          <select
            className={styles.select}
            value={state.contactMethod ?? ''}
            onChange={e => {
              set('contactMethod', e.target.value as ContactMethod);
              set('contactValue', '');
            }}
          >
            <option value="" disabled>Select…</option>
            {contactMethods.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <input
            className={styles.input}
            type="text"
            placeholder={selectedMethod?.placeholder ?? 'Your contact…'}
            value={state.contactValue}
            onChange={e => set('contactValue', e.target.value)}
            disabled={!state.contactMethod}
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Anything you'd like Ollie to know? <span className={styles.optional}>(optional)</span></label>
        <textarea
          className={styles.textarea}
          placeholder="Tell me what you're after — location, vibe, anything useful."
          value={state.info}
          onChange={e => set('info', e.target.value)}
          rows={4}
        />
      </div>

      <div className={styles.stepActions}>
        <button
          className={styles.btnPrimary}
          onClick={onNext}
          disabled={!isValid}
          type="button"
        >
          Review booking
        </button>
      </div>
    </div>
  );
}
