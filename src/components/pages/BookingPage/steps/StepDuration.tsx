import { useBooking } from '../BookingContext';
import type { SessionType } from '../BookingContext';
import styles from '../BookingPage.module.css';

interface DurationOption {
  minutes: number;
  label: string;
  price: number;
  studioPrice?: number;
  deliverables: (sessionType: SessionType) => string;
  forTypes: SessionType[];
  studioAvailable: boolean;
}

const options: DurationOption[] = [
  {
    minutes: 30,
    label: '30 minutes',
    price: 30,
    deliverables: () => 'Minimum 50 edited photos',
    forTypes: ['photoshoot'],
    studioAvailable: false,
  },
  {
    minutes: 60,
    label: '1 hour',
    price: 50,
    studioPrice: 150,
    deliverables: (t) =>
      t === 'video'
        ? 'Video edit'
        : t === 'both'
        ? 'Minimum 100 edited photos + video edit (30 min each)'
        : 'Minimum 100 edited photos',
    forTypes: ['photoshoot', 'video', 'both'],
    studioAvailable: true,
  },
  {
    minutes: 120,
    label: '2 hours',
    price: 80,
    studioPrice: 300,
    deliverables: (t) =>
      t === 'video'
        ? 'Video edit'
        : t === 'both'
        ? 'Minimum 200 edited photos + video edit'
        : 'Minimum 200 edited photos',
    forTypes: ['photoshoot', 'video', 'both'],
    studioAvailable: true,
  },
  {
    minutes: 480,
    label: 'Full day',
    price: 150,
    deliverables: (t) =>
      t === 'video'
        ? 'Video edit'
        : t === 'both'
        ? 'All edited photos + video edit'
        : 'All edited photos',
    forTypes: ['photoshoot', 'video', 'both'],
    studioAvailable: false,
  },
];

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function StepDuration({ onNext, onBack }: Props) {
  const { state, set } = useBooking();
  const sessionType = state.sessionType!;

  const available = options.filter(o => o.forTypes.includes(sessionType));

  function choose(minutes: number, isStudio: boolean) {
    set('durationMinutes', minutes);
    set('isStudio', isStudio);
    set('date', null);
    set('time', null);
  }

  const isSelected = (o: DurationOption, studio: boolean) =>
    state.durationMinutes === o.minutes && state.isStudio === studio;

  return (
    <div className={styles.stepContent}>
      <h2 className={styles.stepHeading}>How long do you need?</h2>
      <p className={styles.stepSubheading}>All sessions delivered within 7 days or full refund.</p>

      <div className={styles.durationGrid}>
        {available.map(o => (
          <button
            key={`${o.minutes}-standard`}
            className={`${styles.durationCard} ${isSelected(o, false) ? styles.selected : ''}`}
            onClick={() => choose(o.minutes, false)}
            type="button"
          >
            <span className={styles.durationLabel}>{o.label}</span>
            <span className={styles.durationPrice}>£{o.price}</span>
            <span className={styles.durationDeliverables}>{o.deliverables(sessionType)}</span>
          </button>
        ))}

        {sessionType === 'photoshoot' &&
          available
            .filter(o => o.studioAvailable && o.studioPrice)
            .map(o => (
              <button
                key={`${o.minutes}-studio`}
                className={`${styles.durationCard} ${styles.studioCard} ${isSelected(o, true) ? styles.selected : ''}`}
                onClick={() => choose(o.minutes, true)}
                type="button"
              >
                <span className={styles.studioTag}>Studio</span>
                <span className={styles.durationLabel}>{o.label}</span>
                <span className={styles.durationPrice}>£{o.studioPrice}</span>
                <span className={styles.durationDeliverables}>{o.deliverables(sessionType)}</span>
              </button>
            ))}
      </div>

      <div className={styles.stepActions}>
        <button className={styles.btnSecondary} onClick={onBack} type="button">
          Back
        </button>
        <button
          className={styles.btnPrimary}
          onClick={onNext}
          disabled={state.durationMinutes === null}
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  );
}
