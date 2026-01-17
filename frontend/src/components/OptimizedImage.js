import React from 'react';

/**
 * OptimizedImage component for responsive, optimized image loading
 * Supports both Unsplash images and local images
 */
const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  testId,
  width,
  height,
  lazy = true,
  priority = false 
}) => {
  // Check if it's an Unsplash image
  const isUnsplash = src?.includes('unsplash.com');
  
  if (isUnsplash) {
    // Extract the photo ID from Unsplash URL
    const photoIdMatch = src.match(/photo-([^?]+)/);
    const baseUrl = src.split('?')[0];
    
    // Create optimized srcset for different screen sizes
    const createUnsplashUrl = (w, q = 75) => {
      return `${baseUrl}?w=${w}&h=${Math.round(w * (height/width || 0.75))}&fit=crop&fm=webp&q=${q}`;
    };
    
    // Default sizes if not provided
    const defaultWidth = width || 800;
    
    return (
      <picture>
        {/* WebP sources for different screen sizes */}
        <source
          type="image/webp"
          srcSet={`
            ${createUnsplashUrl(defaultWidth * 0.5)} ${defaultWidth * 0.5}w,
            ${createUnsplashUrl(defaultWidth)} ${defaultWidth}w,
            ${createUnsplashUrl(defaultWidth * 1.5)} ${defaultWidth * 1.5}w
          `}
          sizes={`(max-width: 768px) ${defaultWidth * 0.5}px, (max-width: 1024px) ${defaultWidth}px, ${defaultWidth * 1.5}px`}
        />
        {/* Fallback */}
        <img
          src={createUnsplashUrl(defaultWidth)}
          alt={alt}
          className={className}
          loading={!priority && lazy ? 'lazy' : 'eager'}
          data-testid={testId}
          width={width}
          height={height}
        />
      </picture>
    );
  }
  
  // For local images (like logo)
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={!priority && lazy ? 'lazy' : 'eager'}
      data-testid={testId}
      width={width}
      height={height}
    />
  );
};

export default OptimizedImage;
