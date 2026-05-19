import styles from './BookingConfirmationPage.module.css';

export function BookingConfirmationPage() {
  const params = new URLSearchParams(window.location.search);
  const session = params.get('session') ?? '';
  const date = params.get('date') ?? '';
  const time = params.get('time') ?? '';
  const price = params.get('price') ?? '';
  const deliverables = params.get('deliverables') ?? '';
  const studio = params.get('studio') === 'true';

  const rows = [
    { label: 'Session', value: session },
    { label: 'Date', value: date },
    { label: 'Time', value: time },
    { label: 'Location', value: studio ? 'Studio' : 'Outdoor / Location' },
    { label: 'Price', value: price ? `£${price}` : '' },
    { label: 'Deliverables', value: deliverables },
  ].filter(r => r.value);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a href="/reserve_slot" className={styles.logo}>chevrota.in</a>
        <span className={styles.headerTagline}>Booking confirmation</span>
      </header>

      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.checkmark}>✓</div>
          <h1 className={styles.heading}>You're booked in</h1>
          <p className={styles.subheading}>
            Ollie will be in touch to confirm everything. Keep this page bookmarked for your reference.
          </p>

          <div className={styles.notice}>
            <strong>Heads up:</strong> automated confirmation emails are temporarily unavailable. Ollie will manually forward your booking summary to you shortly.
          </div>

          <table className={styles.table}>
            <tbody>
              {rows.map(r => (
                <tr key={r.label} className={styles.row}>
                  <td className={styles.label}>{r.label}</td>
                  <td className={styles.value}>{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <a href="/reserve_slot" className={styles.bookAnother}>Book another session →</a>
        </div>
      </main>
    </div>
  );
}
