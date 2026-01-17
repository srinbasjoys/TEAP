/**
 * Optimized Framer Motion configuration to reduce forced reflows
 * These settings use GPU-accelerated transforms and reduce layout calculations
 */

import { prefersReducedMotion } from './performance';

// Check if motion should be reduced
const shouldReduce = typeof window !== 'undefined' ? prefersReducedMotion() : false;

/**
 * Base animation configuration optimized for performance
 */
export const motionConfig = {
  // Use layout projection sparingly to avoid forced reflows
  layoutRoot: false,
  
  // Reduce animation when user prefers
  reducedMotion: shouldReduce ? 'always' : 'user',
};

/**
 * Optimized transition settings using GPU acceleration
 */
export const optimizedTransition = {
  type: 'tween',
  ease: [0.25, 0.1, 0.25, 1], // Custom cubic-bezier for smooth animations
  duration: shouldReduce ? 0.01 : 0.6,
};

export const fastTransition = {
  type: 'tween',
  ease: [0.25, 0.1, 0.25, 1],
  duration: shouldReduce ? 0.01 : 0.3,
};

export const slowTransition = {
  type: 'tween',
  ease: [0.25, 0.1, 0.25, 1],
  duration: shouldReduce ? 0.01 : 0.9,
};

/**
 * Fade in from bottom - uses transform for GPU acceleration
 */
export const fadeInUp = {
  initial: { 
    opacity: 0, 
    y: shouldReduce ? 0 : 30,
    // Force GPU acceleration
    transform: 'translate3d(0, 30px, 0)',
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transform: 'translate3d(0, 0, 0)',
  },
  exit: {
    opacity: 0,
    y: shouldReduce ? 0 : -30,
    transform: 'translate3d(0, -30px, 0)',
  },
  transition: optimizedTransition,
};

/**
 * Fade in with scale - GPU accelerated
 */
export const fadeInScale = {
  initial: { 
    opacity: 0, 
    scale: shouldReduce ? 1 : 0.95,
    // Force GPU acceleration
    transform: 'scale3d(0.95, 0.95, 1)',
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    transform: 'scale3d(1, 1, 1)',
  },
  exit: {
    opacity: 0,
    scale: shouldReduce ? 1 : 0.95,
    transform: 'scale3d(0.95, 0.95, 1)',
  },
  transition: optimizedTransition,
};

/**
 * Slide in from left - GPU accelerated
 */
export const slideInLeft = {
  initial: { 
    opacity: 0, 
    x: shouldReduce ? 0 : -50,
    transform: 'translate3d(-50px, 0, 0)',
  },
  animate: { 
    opacity: 1, 
    x: 0,
    transform: 'translate3d(0, 0, 0)',
  },
  transition: optimizedTransition,
};

/**
 * Slide in from right - GPU accelerated
 */
export const slideInRight = {
  initial: { 
    opacity: 0, 
    x: shouldReduce ? 0 : 50,
    transform: 'translate3d(50px, 0, 0)',
  },
  animate: { 
    opacity: 1, 
    x: 0,
    transform: 'translate3d(0, 0, 0)',
  },
  transition: optimizedTransition,
};

/**
 * Stagger children animation - optimized timing
 */
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: shouldReduce ? 0 : 0.1,
      delayChildren: shouldReduce ? 0 : 0.2,
    }
  }
};

/**
 * Stagger item - works with staggerContainer
 */
export const staggerItem = {
  initial: { opacity: 0, y: shouldReduce ? 0 : 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: fastTransition,
  },
};

/**
 * Hover animation - optimized for interaction
 */
export const hoverScale = {
  whileHover: { 
    scale: shouldReduce ? 1 : 1.05,
    transition: fastTransition,
  },
  whileTap: { 
    scale: shouldReduce ? 1 : 0.95,
    transition: { duration: 0.1 },
  },
};

/**
 * Viewport animation - triggers when element enters viewport
 * Uses IntersectionObserver under the hood (efficient)
 */
export const viewportAnimation = {
  initial: 'initial',
  whileInView: 'animate',
  viewport: { 
    once: true, // Only animate once when entering viewport
    margin: '-100px', // Trigger animation slightly before element is visible
    amount: 0.3, // Trigger when 30% of element is visible
  },
};

/**
 * Export all variants as a collection
 */
export const motionVariants = {
  fadeInUp,
  fadeInScale,
  slideInLeft,
  slideInRight,
  staggerContainer,
  staggerItem,
  hoverScale,
};
