/**
 * Performance utilities to reduce forced reflows and layout thrashing
 */

/**
 * Batch DOM reads and writes to prevent layout thrashing
 * Usage: batchDOMOperations(readCallback, writeCallback)
 */
export const batchDOMOperations = (() => {
  let readQueue = [];
  let writeQueue = [];
  let scheduled = false;

  function flush() {
    // Execute all reads first
    readQueue.forEach(read => read());
    // Then execute all writes
    writeQueue.forEach(write => write());
    
    readQueue = [];
    writeQueue = [];
    scheduled = false;
  }

  return (read, write) => {
    if (read) readQueue.push(read);
    if (write) writeQueue.push(write);
    
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(flush);
    }
  };
})();

/**
 * Debounce function for expensive operations
 */
export const debounce = (func, wait = 100) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function for scroll and resize handlers
 */
export const throttle = (func, limit = 100) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Use Intersection Observer for lazy effects instead of scroll listeners
 */
export const createLazyObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };

  return new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry);
      }
    });
  }, defaultOptions);
};

/**
 * Prefers reduced motion check for accessibility
 */
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Optimized scroll position getter that batches reads
 */
export const getScrollPosition = (callback) => {
  batchDOMOperations(
    () => {
      const position = {
        x: window.pageXOffset || document.documentElement.scrollLeft,
        y: window.pageYOffset || document.documentElement.scrollTop,
      };
      callback(position);
    },
    null
  );
};

/**
 * Request Idle Callback wrapper with fallback
 */
export const requestIdleCallback = window.requestIdleCallback || 
  ((cb) => setTimeout(cb, 1));

export const cancelIdleCallback = window.cancelIdleCallback || 
  ((id) => clearTimeout(id));

/**
 * Use GPU-accelerated transforms instead of top/left
 */
export const optimizeTransform = (element, x = 0, y = 0) => {
  if (!element) return;
  
  batchDOMOperations(
    null,
    () => {
      element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      element.style.willChange = 'transform';
    }
  );
};

/**
 * Clean up will-change after animation
 */
export const cleanupWillChange = (element, delay = 1000) => {
  if (!element) return;
  
  setTimeout(() => {
    batchDOMOperations(
      null,
      () => {
        element.style.willChange = 'auto';
      }
    );
  }, delay);
};
