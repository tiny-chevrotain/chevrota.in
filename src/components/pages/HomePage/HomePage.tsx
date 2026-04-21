import { homeData } from '../../../data/home';
import { ScatteredPhoto } from './ScatteredPhoto';
import { DecorativeBlob } from './DecorativeBlob';
import styles from './HomePage.module.css';

export function HomePage() {
  return (
    <section className={styles.homePage}>

      <DecorativeBlob
        variant="blob-1"
        color="var(--color-accent-violet)"
        size={380}
        style={{ top: '-80px', left: '-100px', zIndex: 0 }}
      />
      <DecorativeBlob
        variant="blob-2"
        color="var(--color-accent-coral)"
        size={300}
        style={{ bottom: '-60px', right: '-80px', zIndex: 0 }}
      />
      <DecorativeBlob
        variant="blob-3"
        color="var(--color-accent-mint)"
        size={240}
        style={{ top: '40%', left: '35%', zIndex: 0 }}
      />
      <DecorativeBlob
        variant="chevrotain"
        color="var(--color-accent-yellow)"
        size={120}
        style={{ bottom: '15%', left: '10%', zIndex: 0 }}
      />
      <DecorativeBlob
        variant="chevrotain"
        color="var(--color-accent-pink)"
        size={90}
        style={{ top: '12%', right: '8%', zIndex: 0 }}
      />

      <div className={styles.collageLayer} aria-hidden="true">
        {homeData.photos.map(photo => (
          <ScatteredPhoto key={photo.src} {...photo} />
        ))}
      </div>

      <div className={styles.bio}>
        <h1 className={styles.name}>{homeData.name}</h1>
        <p className={styles.tagline}>{homeData.tagline}</p>
        {homeData.bio.map((para, i) => (
          <p key={i} className={styles.bioParagraph}>{para}</p>
        ))}
      </div>

    </section>
  );
}
