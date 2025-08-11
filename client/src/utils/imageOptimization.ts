/**
 * Image optimization utilities for performance
 * Handles lazy loading, progressive loading, and WebP conversion
 */

/**
 * Lazy loading image component with progressive enhancement
 */
export function createOptimizedImage(src: string, alt: string, options: {
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
} = {}) {
  const {
    width,
    height,
    className = '',
    loading = 'lazy',
    priority = false
  } = options;

  // Generate different image sizes for responsive loading
  const srcSet = generateSrcSet(src, width);
  
  return {
    src: optimizeImageUrl(src),
    srcSet,
    alt,
    width,
    height,
    className: `optimized-image ${className}`.trim(),
    loading: priority ? 'eager' : loading,
    decoding: 'async' as const,
    style: {
      aspectRatio: width && height ? `${width}/${height}` : undefined,
    },
  };
}

/**
 * Generate responsive image src sets
 */
function generateSrcSet(src: string, baseWidth?: number): string {
  if (!baseWidth) return '';
  
  const widths = [320, 640, 768, 1024, 1280, 1920];
  const relevantWidths = widths.filter(w => w <= baseWidth * 2);
  
  return relevantWidths
    .map(width => `${optimizeImageUrl(src, { width })} ${width}w`)
    .join(', ');
}

/**
 * Optimize image URL with query parameters
 */
function optimizeImageUrl(src: string, params: {
  width?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'png';
} = {}): string {
  const { width, quality = 85, format = 'webp' } = params;
  
  // If it's a relative URL, return as is
  if (!src.startsWith('http') && !src.startsWith('//')) {
    return src;
  }
  
  // For external images or when optimization service is available
  const url = new URL(src);
  
  if (width) url.searchParams.set('w', width.toString());
  if (quality !== 85) url.searchParams.set('q', quality.toString());
  if (format) url.searchParams.set('f', format);
  
  return url.toString();
}

/**
 * Preload critical images
 */
export function preloadImage(src: string, priority: 'high' | 'low' = 'low') {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = optimizeImageUrl(src);
  link.fetchPriority = priority;
  
  document.head.appendChild(link);
}

/**
 * Lazy loading observer for images
 */
export class ImageLazyLoader {
  private observer: IntersectionObserver;
  private images = new Set<HTMLImageElement>();

  constructor(options: IntersectionObserverInit = {}) {
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        rootMargin: '50px 0px',
        threshold: 0.01,
        ...options,
      }
    );
  }

  observe(img: HTMLImageElement) {
    if (this.images.has(img)) return;
    
    this.images.add(img);
    this.observer.observe(img);
  }

  unobserve(img: HTMLImageElement) {
    this.images.delete(img);
    this.observer.unobserve(img);
  }

  private handleIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        this.loadImage(img);
        this.unobserve(img);
      }
    });
  }

  private loadImage(img: HTMLImageElement) {
    const src = img.dataset.src;
    const srcSet = img.dataset.srcset;
    
    if (src) {
      img.src = src;
      img.removeAttribute('data-src');
    }
    
    if (srcSet) {
      img.srcset = srcSet;
      img.removeAttribute('data-srcset');
    }
    
    img.classList.remove('lazy-loading');
    img.classList.add('lazy-loaded');
  }

  disconnect() {
    this.observer.disconnect();
    this.images.clear();
  }
}

/**
 * Progressive image loading with blur-up effect
 */
export function createProgressiveImage(src: string, placeholder?: string) {
  // Generate a tiny placeholder if none provided
  const defaultPlaceholder = `data:image/svg+xml;base64,${btoa(`
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#f3f4f6"/>
      <text x="200" y="150" text-anchor="middle" fill="#9ca3af" font-family="system-ui">
        Loading...
      </text>
    </svg>
  `)}`;

  return {
    placeholder: placeholder || defaultPlaceholder,
    src: optimizeImageUrl(src),
    onLoad: (img: HTMLImageElement) => {
      img.style.opacity = '1';
      img.style.filter = 'blur(0)';
    },
    style: {
      transition: 'opacity 0.3s ease, filter 0.3s ease',
      filter: 'blur(10px)',
      opacity: '0',
    },
  };
}

/**
 * Image compression utility (client-side)
 */
export async function compressImage(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: string;
  } = {}
): Promise<Blob> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    format = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          format,
          quality
        );
      } else {
        reject(new Error('Failed to get canvas context'));
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * WebP support detection
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

/**
 * AVIF support detection
 */
export function supportsAVIF(): Promise<boolean> {
  return new Promise((resolve) => {
    const avif = new Image();
    avif.onload = avif.onerror = () => {
      resolve(avif.height === 2);
    };
    avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=';
  });
}

/**
 * Get optimal image format based on browser support
 */
export async function getOptimalImageFormat(): Promise<'avif' | 'webp' | 'jpg'> {
  if (await supportsAVIF()) return 'avif';
  if (await supportsWebP()) return 'webp';
  return 'jpg';
}

// Global lazy loader instance
export const globalImageLazyLoader = new ImageLazyLoader();

// Initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Auto-detect and setup lazy loading for images with data-src
      const lazyImages = document.querySelectorAll('img[data-src]');
      lazyImages.forEach((img) => {
        globalImageLazyLoader.observe(img as HTMLImageElement);
      });
    });
  }
}