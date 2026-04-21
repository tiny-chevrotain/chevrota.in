interface PhotoMediaProps {
  src: string;
  alt: string;
}

export function PhotoMedia({ src, alt }: PhotoMediaProps) {
  return (
    <div style={{
      width: '100%',
      aspectRatio: '4 / 3',
      borderRadius: 'var(--radius-card)',
      overflow: 'hidden',
      background: 'var(--color-border)',
    }}>
      <img
        src={src}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
    </div>
  );
}
