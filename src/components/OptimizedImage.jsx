/**
 * OptimizedImage Component - Minimal WebP wrapper
 * 
 * Adds WebP support without changing layout or markup structure.
 * Simply wraps existing img with picture element for WebP fallback.
 */

import { forwardRef } from "react";

const OptimizedImage = forwardRef(function OptimizedImage({ src, ...props }, ref) {
  // Get WebP version of the image
  const webpSrc = src ? src.replace(/\.[^/.]+$/, ".webp") : "";
  
  // If no src, just render nothing
  if (!src) return null;
  
  // Use picture element for WebP with automatic fallback
  // This doesn't change any layout - same img tag, just wrapped
  return (
    <picture>
      {/* WebP source - modern browsers will use this */}
      <source srcSet={webpSrc} type="image/webp" />
      {/* Original format fallback - same img tag as before */}
      <img ref={ref} src={src} {...props} />
    </picture>
  );
});

export default OptimizedImage;
