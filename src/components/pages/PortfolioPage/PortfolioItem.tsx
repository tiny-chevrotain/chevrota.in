import type { PortfolioItem as PortfolioItemType, MediaType } from '../../../data/types';
import { PhotoMedia, CarouselMedia, VideoMedia } from '../../media';
import styles from './PortfolioItem.module.css';

function MediaSlot({ media }: { media?: MediaType }) {
  if (!media) return null;
  if (media.kind === 'photo')    return <PhotoMedia src={media.src} alt={media.alt} />;
  if (media.kind === 'carousel') return <CarouselMedia photos={media.photos} />;
  if (media.kind === 'video')    return <VideoMedia src={media.src} poster={media.poster} />;
  return null;
}

function formatDate(dateStr: string): string {
  // Accepts "YYYY-MM" or "YYYY"
  const parts = dateStr.split('-');
  if (parts.length === 2) {
    const date = new Date(`${dateStr}-01`);
    return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  }
  return parts[0]; // just the year
}

interface PortfolioItemProps {
  item: PortfolioItemType;
}

export function PortfolioItem({ item }: PortfolioItemProps) {
  return (
    <article className={styles.card}>
      {item.media && (
        <div className={styles.mediaWrapper}>
          <MediaSlot media={item.media} />
        </div>
      )}
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{item.title}</h3>
          <time className={styles.date} dateTime={item.date}>
            {formatDate(item.date)}
          </time>
        </div>
        <p className={styles.description}>{item.description}</p>
        {item.tags && item.tags.length > 0 && (
          <ul className={styles.tags} aria-label="Tags">
            {item.tags.map(tag => (
              <li key={tag} className={styles.tag}>{tag}</li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
