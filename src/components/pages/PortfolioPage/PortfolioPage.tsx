import type { PortfolioItem as PortfolioItemType } from '../../../data/types';
import { PortfolioItem } from './PortfolioItem';
import styles from './PortfolioPage.module.css';

const headings: Record<string, string> = {
  programming:  'Programming',
  filmmaking:   'Filmmaking',
  photography:  'Photography',
};

interface PortfolioPageProps {
  category: 'programming' | 'filmmaking' | 'photography';
  items: PortfolioItemType[];
}

export function PortfolioPage({ category, items }: PortfolioPageProps) {
  return (
    <section className={styles.page}>
      <h2 className={styles.heading}>{headings[category]}</h2>
      <ul className={styles.grid}>
        {items.length === 0 && (
          <li className={styles.empty}>Nothing here yet — check back soon.</li>
        )}
        {items.map(item => (
          <li key={item.id}>
            <PortfolioItem item={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}
