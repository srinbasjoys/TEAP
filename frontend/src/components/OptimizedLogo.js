import React from 'react';

/**
 * OptimizedLogo component with WebP support and responsive sizing
 */
const OptimizedLogo = ({ className = "h-12 w-auto", alt = "TechResona Logo" }) => {
  return (
    <picture>
      {/* WebP sources with responsive sizes */}
      <source
        type="image/webp"
        srcSet="/logo-48.webp 1x, /logo-96.webp 2x"
        media="(max-width: 768px)"
      />
      <source
        type="image/webp"
        srcSet="/logo-48.webp 1x, /logo-96.webp 2x"
      />
      {/* PNG fallback for browsers that don't support WebP */}
      <source
        type="image/png"
        srcSet="/logo-48.png 1x, /logo-96.png 2x"
      />
      <img
        src="/logo-48.png"
        alt={alt}
        className={className}
        width="48"
        height="48"
        loading="eager"
      />
    </picture>
  );
};

export default OptimizedLogo;
