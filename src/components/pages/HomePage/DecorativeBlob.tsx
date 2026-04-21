interface DecorativeBlobProps {
  variant: 'blob-1' | 'blob-2' | 'blob-3' | 'chevrotain';
  color?: string;
  size?: number;
  style?: React.CSSProperties;
}

export function DecorativeBlob({ variant, color = 'currentColor', size = 200, style }: DecorativeBlobProps) {
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    pointerEvents: 'none',
    opacity: 0.18,
    color,
    width: size,
    height: size,
    ...style,
  };

  if (variant === 'blob-1') {
    return (
      <div style={baseStyle} aria-hidden="true">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M44.3,-62.7C56.5,-53.6,64.8,-39.2,68.4,-24.1C72,-9,70.9,6.9,65.3,20.7C59.7,34.6,49.6,46.4,37.3,54.5C25,62.5,10.5,66.8,-3.2,70.9C-16.9,74.9,-30,78.7,-41.4,73.1C-52.8,67.5,-62.5,52.5,-67.2,36.4C-71.9,20.3,-71.6,3.1,-67.2,-12.3C-62.8,-27.7,-54.3,-41.3,-43,-50.4C-31.7,-59.5,-17.6,-64.1,-1.8,-61.8C14,-59.5,32.1,-71.8,44.3,-62.7Z"
            fill="currentColor"
            transform="translate(100 100)"
          />
        </svg>
      </div>
    );
  }

  if (variant === 'blob-2') {
    return (
      <div style={baseStyle} aria-hidden="true">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M38.9,-52.3C51.1,-43.7,62.3,-33.2,67.1,-19.9C71.9,-6.6,70.3,9.5,64.2,23C58.1,36.5,47.5,47.4,35.3,54.4C23.1,61.4,9.2,64.5,-4.2,69.9C-17.6,75.3,-31.5,83,-42.1,78.1C-52.7,73.1,-59.9,55.6,-64.1,38.8C-68.3,22,-69.5,5.9,-66,-8.8C-62.5,-23.5,-54.3,-36.8,-43.7,-45.6C-33.1,-54.4,-20.2,-58.7,-6.8,-57.3C6.6,-55.9,26.7,-60.9,38.9,-52.3Z"
            fill="currentColor"
            transform="translate(100 100)"
          />
        </svg>
      </div>
    );
  }

  if (variant === 'blob-3') {
    return (
      <div style={baseStyle} aria-hidden="true">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M54.2,-70.1C66.4,-60.1,70.6,-42.2,72.1,-25.6C73.6,-9,72.4,6.3,67.1,19.8C61.8,33.3,52.4,45,40.8,53.8C29.2,62.6,15.4,68.5,0.7,67.7C-14,66.9,-28.1,59.3,-40.1,50.1C-52.1,40.9,-62,30.1,-66.4,17C-70.8,3.9,-69.7,-11.5,-63.3,-24C-56.9,-36.5,-45.2,-46.1,-32.5,-55.7C-19.8,-65.3,-6.2,-74.9,8.7,-76.2C23.6,-77.5,42,-80.1,54.2,-70.1Z"
            fill="currentColor"
            transform="translate(100 100)"
          />
        </svg>
      </div>
    );
  }

  if (variant === 'chevrotain') {
    return (
      <div style={baseStyle} aria-hidden="true">
        <svg viewBox="0 0 64 64" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="32" cy="38" rx="16" ry="11"/>
          <ellipse cx="44" cy="28" rx="9" ry="7"/>
          <ellipse cx="51" cy="31" rx="4" ry="3"/>
          <ellipse cx="41" cy="22" rx="3" ry="5" transform="rotate(-15 41 22)"/>
          <rect x="28" y="47" width="4" height="10" rx="2"/>
          <rect x="35" y="47" width="4" height="12" rx="2"/>
          <rect x="18" y="46" width="4" height="11" rx="2"/>
          <rect x="23" y="46" width="4" height="9" rx="2"/>
          <ellipse cx="17" cy="35" rx="3" ry="5" transform="rotate(20 17 35)"/>
        </svg>
      </div>
    );
  }

  return null;
}
