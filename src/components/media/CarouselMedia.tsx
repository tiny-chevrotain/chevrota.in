import { useState } from 'react';
import styles from './CarouselMedia.module.css';

interface CarouselMediaProps {
  photos: Array<{ src: string; alt: string }>;
}

export function CarouselMedia({ photos }: CarouselMediaProps) {
  const [index, setIndex] = useState(0);

  const prev = () => setIndex(i => (i - 1 + photos.length) % photos.length);
  const next = () => setIndex(i => (i + 1) % photos.length);

  if (photos.length === 0) return null;
  if (photos.length === 1) {
    return (
      <div className={styles.carousel}>
        <div className={styles.imageWrapper}>
          <img src={photos[0].src} alt={photos[0].alt} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.carousel}>
      <div className={styles.imageWrapper}>
        <img src={photos[index].src} alt={photos[index].alt} key={index} />
      </div>

      <div className={styles.controls}>
        <button className={styles.btn} onClick={prev} aria-label="Previous photo">
          ←
        </button>
        <span className={styles.counter}>{index + 1} / {photos.length}</span>
        <button className={styles.btn} onClick={next} aria-label="Next photo">
          →
        </button>
      </div>

      <div className={styles.dots} aria-hidden="true">
        {photos.map((_, i) => (
          <span
            key={i}
            className={i === index ? styles.dotActive : styles.dot}
          />
        ))}
      </div>
    </div>
  );
}
