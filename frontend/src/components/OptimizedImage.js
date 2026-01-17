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
    
    // Optimize based on actual expected display sizes
    // For hero image: mobile ~400px, tablet ~500px, desktop ~500px
    const sizes = width > 500 
      ? '(max-width: 640px) 400px, (max-width: 1024px) 500px, 500px'
      : `(max-width: 640px) ${Math.round(defaultWidth * 0.5)}px, ${defaultWidth}px`;
    
    // Generate appropriate srcset based on actual display sizes
    const smallWidth = Math.round(defaultWidth * 0.5);
    const mediumWidth = Math.round(defaultWidth * 0.85);
    
    return (
      <picture>
        {/* WebP sources for different screen sizes */}
        <source
          type="image/webp"
          srcSet={`
            ${createUnsplashUrl(smallWidth, 80)} ${smallWidth}w,
            ${createUnsplashUrl(mediumWidth, 75)} ${mediumWidth}w,
            ${createUnsplashUrl(defaultWidth, 75)} ${defaultWidth}w
          `}
          sizes={sizes}
        />
        {/* Fallback */}
        <img
          src={createUnsplashUrl(mediumWidth, 75)}
          alt={alt}
          className={className}
          loading={!priority && lazy ? 'lazy' : 'eager'}
          fetchpriority={priority ? 'high' : 'auto'}
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
