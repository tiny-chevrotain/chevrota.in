# WIP Banner

## What

A "This is a work in progress" badge rendered inside the home page bio card, above the name.

## Files

- `src/components/pages/HomePage/HomePage.tsx` — add `<span className={styles.wipBanner}>This is a work in progress</span>`
- `src/components/pages/HomePage/HomePage.module.css` — add `.wipBanner` styles

## CSS Spec

```css
.wipBanner {
  display: inline-block;
  background: var(--color-peach);
  color: var(--color-accent-coral);
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 4px 14px;
  border-radius: var(--radius-pill);
  margin-bottom: var(--space-m);
  border: 1px solid rgba(255, 107, 74, 0.25);
}
```

## Placement

Inside the `.bio` card, as the first child element (before `<h1>`).
