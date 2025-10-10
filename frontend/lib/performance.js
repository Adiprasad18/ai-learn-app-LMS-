/**
 * Performance monitoring utilities
 */

// Measure component render time
export function measureRender(componentName, callback) {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return callback();
  }

  const startTime = performance.now();
  const result = callback();
  const endTime = performance.now();
  
  console.log(`[Performance] ${componentName} rendered in ${(endTime - startTime).toFixed(2)}ms`);
  
  return result;
}

// Debounce function for performance
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for performance
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Simple in-memory cache with TTL
class SimpleCache {
  constructor() {
    this.cache = new Map();
  }

  set(key, value, ttl = 60000) {
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { value, expiresAt });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  clear() {
    this.cache.clear();
  }

  delete(key) {
    this.cache.delete(key);
  }
}

export const cache = new SimpleCache();

// Preload critical resources
export function preloadImage(src) {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  document.head.appendChild(link);
}

// Report Web Vitals
export function reportWebVitals(metric) {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', metric);
  }
  
  // You can send to analytics here
  // Example: analytics.track('web-vital', metric);
}