interface VideoMediaProps {
  src: string;
  poster?: string;
}

export function VideoMedia({ src, poster }: VideoMediaProps) {
  return (
    <div style={{
      width: '100%',
      borderRadius: 'var(--radius-card)',
      overflow: 'hidden',
      background: '#000',
      aspectRatio: '16 / 9',
    }}>
      <video
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
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
