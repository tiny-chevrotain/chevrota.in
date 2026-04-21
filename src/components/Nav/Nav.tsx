import styles from './Nav.module.css';

export type Tab = 'home' | 'programming' | 'filmmaking' | 'photography';

interface NavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string }[] = [
  { id: 'home',        label: 'Home'        },
  { id: 'programming', label: 'Programming' },
  { id: 'filmmaking',  label: 'Filmmaking'  },
  { id: 'photography', label: 'Photography' },
];

export function Nav({ activeTab, onTabChange }: NavProps) {
  return (
    <nav className={styles.nav} aria-label="Main navigation">
      <button
        className={styles.logo}
        onClick={() => onTabChange('home')}
        aria-label="Go to home"
      >
        {/* Chevrotain (mouse-deer) silhouette — simple geometric SVG */}
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          {/* Body */}
          <ellipse cx="32" cy="38" rx="16" ry="11" fill="currentColor" opacity="0.9"/>
          {/* Head */}
          <ellipse cx="44" cy="28" rx="9" ry="7" fill="currentColor" opacity="0.9"/>
          {/* Snout */}
          <ellipse cx="51" cy="31" rx="4" ry="3" fill="currentColor" opacity="0.85"/>
          {/* Ear */}
          <ellipse cx="41" cy="22" rx="3" ry="5" fill="currentColor" opacity="0.8" transform="rotate(-15 41 22)"/>
          {/* Front legs */}
          <rect x="28" y="47" width="4" height="10" rx="2" fill="currentColor" opacity="0.85"/>
          <rect x="35" y="47" width="4" height="12" rx="2" fill="currentColor" opacity="0.85"/>
          {/* Back legs */}
          <rect x="18" y="46" width="4" height="11" rx="2" fill="currentColor" opacity="0.85"/>
          <rect x="23" y="46" width="4" height="9" rx="2" fill="currentColor" opacity="0.85"/>
          {/* Tail */}
          <ellipse cx="17" cy="35" rx="3" ry="5" fill="currentColor" opacity="0.7" transform="rotate(20 17 35)"/>
          {/* Eye */}
          <circle cx="47" cy="27" r="1.5" fill="var(--color-cream)"/>
        </svg>
        chevrota.in
      </button>

      <ul className={styles.tabs} role="tablist">
        {tabs.map(tab => (
          <li key={tab.id}>
            <button
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
