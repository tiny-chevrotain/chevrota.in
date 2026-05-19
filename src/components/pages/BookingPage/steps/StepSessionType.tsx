import { useBooking } from '../BookingContext';
import type { SessionType } from '../BookingContext';
import styles from '../BookingPage.module.css';

const options: { type: SessionType; label: string; description: string }[] = [
  {
    type: 'photoshoot',
    label: 'Photoshoot',
    description: 'Edited photos delivered within 7 days or full refund.',
  },
  {
    type: 'video',
    label: 'Video',
    description:
      'Portrait or landscape. Showcase, music video, cinematic edit — returned within 7 days or full refund.',
  },
  {
    type: 'both',
    label: 'Photoshoot + Video',
    description:
      'Minimum 1 hour (30 min each). Full photo edit and video edit within 7 days or full refund.',
  },
];

interface Props {
  onNext: () => void;
}

export function StepSessionType({ onNext }: Props) {
  const { state, set } = useBooking();

  function choose(type: SessionType) {
    set('sessionType', type);
    set('durationMinutes', null);
    set('isStudio', false);
    setTimeout(onNext, 150);
  }

  return (
    <div className={styles.stepContent}>
      <h2 className={styles.stepHeading}>What are you booking?</h2>
      <div className={styles.optionGrid}>
        {options.map(o => (
          <button
            key={o.type}
            className={`${styles.optionCard} ${state.sessionType === o.type ? styles.selected : ''}`}
            onClick={() => choose(o.type)}
            type="button"
          >
            <span className={styles.optionLabel}>{o.label}</span>
            <span className={styles.optionDesc}>{o.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
