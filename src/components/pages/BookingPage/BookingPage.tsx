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
            <nav className={styles.stepIndicator} aria-label="Booking steps">
              {STEPS.map((label, i) => (
                <span
                  key={label}
                  className={[
                    styles.stepDot,
                    i === step ? styles.stepDotActive : '',
                    i < step ? styles.stepDotDone : '',
                  ].join(' ')}
                  aria-current={i === step ? 'step' : undefined}
                >
                  <span className={styles.stepDotLabel}>{label}</span>
                </span>
              ))}
            </nav>

            {step === 0 && <StepSessionType onNext={() => setStep(1)} />}
            {step === 1 && <StepDuration onNext={() => setStep(2)} onBack={() => setStep(0)} />}
            {step === 2 && <StepCalendar onNext={() => setStep(3)} onBack={() => setStep(1)} />}
            {step === 3 && <StepContact onNext={() => setStep(4)} onBack={() => setStep(2)} />}
            {step === 4 && <StepConfirmation onBack={() => setStep(3)} />}
          </div>
        </main>
      </div>
    </BookingProvider>
  );
}
