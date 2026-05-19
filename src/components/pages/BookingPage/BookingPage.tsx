import { useState } from 'react';
import { BookingProvider } from './BookingContext';
import { StepSessionType } from './steps/StepSessionType';
import { StepDuration } from './steps/StepDuration';
import { StepCalendar } from './steps/StepCalendar';
import { StepContact } from './steps/StepContact';
import { StepConfirmation } from './steps/StepConfirmation';
import styles from './BookingPage.module.css';

const STEPS = ['Session', 'Duration', 'Date & Time', 'Contact', 'Confirm'];

export function BookingPage() {
  const [step, setStep] = useState(0);

  return (
    <BookingProvider>
      <div className={styles.page}>
        <header className={styles.header}>
          <span className={styles.logo}>chevrota.in</span>
          <span className={styles.headerTagline}>Book a session</span>
        </header>

        <main className={styles.main}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              {step === 0
                ? <a href="/" className={styles.backArrow} aria-label="Back to site">←</a>
                : <button className={styles.backArrow} onClick={() => setStep(step - 1)} type="button" aria-label="Go back">←</button>
              }
            </div>
            <nav className={styles.stepIndicator} aria-label="Booking steps">
              <span className={styles.stepCurrentLabel}>{STEPS[step]}</span>
              <div className={styles.stepDots}>
                {STEPS.map((label, i) => (
                  <span
                    key={label}
                    className={[
                      styles.stepDot,
                      i === step ? styles.stepDotActive : '',
                      i < step ? styles.stepDotDone : '',
                    ].join(' ')}
                    aria-current={i === step ? 'step' : undefined}
                  />
                ))}
              </div>
            </nav>

            {step === 0 && <StepSessionType onNext={() => setStep(1)} />}
            {step === 1 && <StepDuration onNext={() => setStep(2)} />}
            {step === 2 && <StepCalendar onNext={() => setStep(3)} />}
            {step === 3 && <StepContact onNext={() => setStep(4)} />}
            {step === 4 && <StepConfirmation />}
          </div>
        </main>
      </div>
    </BookingProvider>
  );
}
