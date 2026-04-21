import type { HomePhoto } from '../../../data/types';

export function ScatteredPhoto({ src, alt, rotate, top, left, width }: HomePhoto) {
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left,
        width,
        transform: `rotate(${rotate}deg)`,
        boxShadow: 'var(--shadow-photo)',
        borderRadius: 'var(--radius-s)',
        overflow: 'hidden',
        border: '5px solid var(--color-white)',
        backgroundColor: 'var(--color-white)',
        transition: 'transform var(--transition-normal)',
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{
          width: '100%',
          display: 'block',
          aspectRatio: '4 / 3',
          objectFit: 'cover',
        }}
      />
    </div>
  );
}
