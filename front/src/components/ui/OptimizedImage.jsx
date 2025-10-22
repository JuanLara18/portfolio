import { useState, useEffect, useRef } from 'react';

/**
 * OptimizedImage Component
 * 
 * Features:
 * - Lazy loading with Intersection Observer
 * - WebP format with fallback to original
 * - Blur placeholder while loading
 * - Error handling with fallback
 * - Responsive sizing
 * - SEO-friendly with proper alt text
 * 
 * Usage:
 * <OptimizedImage 
 *   src="/images/project-previews/textinsight.png"
 *   alt="TextInsight Project"
 *   className="w-full h-64"
 * />
 */

export const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  fallback,
  onLoad,
  onError,
  eager = false, // Skip lazy loading for above-the-fold images
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(eager);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Get WebP version of the image
  const getWebPSrc = (originalSrc) => {
    if (!originalSrc) return '';
    const ext = originalSrc.match(/\.(jpg|jpeg|png)$/i);
    if (ext) {
      return originalSrc.replace(ext[0], '.webp');
    }
    return originalSrc;
  };

  const webpSrc = getWebPSrc(src);
  const finalSrc = shouldLoad ? src : '';
  const finalWebpSrc = shouldLoad ? webpSrc : '';

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (eager || shouldLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            if (observerRef.current) {
              observerRef.current.disconnect();
            }
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before visible
        threshold: 0.01
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
      observerRef.current = observer;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [eager, shouldLoad]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    setHasError(false);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    setHasError(true);
    if (onError) onError(e);
  };

  // Get public URL helper
  const withPublicUrl = (path) => {
    if (!path) return '';
    const base = process.env.PUBLIC_URL || '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/')) return `${base}${path}`;
    return `${base}/${path}`;
  };

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Blur placeholder while loading */}
      {!isLoaded && shouldLoad && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse" />
      )}
      
      {/* Actual image with WebP support */}
      {shouldLoad && !hasError && (
        <picture>
          {/* WebP source for modern browsers */}
          <source 
            srcSet={withPublicUrl(finalWebpSrc)} 
            type="image/webp"
          />
          
          {/* Fallback to original format */}
          <img
            src={withPublicUrl(finalSrc)}
            alt={alt}
            width={width}
            height={height}
            loading={eager ? 'eager' : 'lazy'}
            onLoad={handleLoad}
            onError={handleError}
            className={`
              w-full h-full object-cover
              transition-opacity duration-500
              ${isLoaded ? 'opacity-100' : 'opacity-0'}
            `}
            {...props}
          />
        </picture>
      )}
      
      {/* Fallback image on error */}
      {hasError && fallback && (
        <img
          src={withPublicUrl(fallback)}
          alt={alt}
          className="w-full h-full object-cover opacity-50"
        />
      )}
      
      {/* Error state without fallback */}
      {hasError && !fallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800">
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            Image not available
          </span>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
