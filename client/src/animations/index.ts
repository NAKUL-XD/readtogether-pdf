import { Variants } from 'framer-motion'

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
}

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeIn' } },
}

export const slideDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: 20, transition: { duration: 0.2, ease: 'easeIn' } },
}

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2, ease: 'easeIn' } },
}

export const slideRight: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2, ease: 'easeIn' } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15, ease: 'easeIn' } },
}

export const pageTurn: Variants = {
  hidden: { rotateY: 0 },
  visible: {
    rotateY: 0,
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
  exit: {
    rotateY: 90,
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export const float: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 3, ease: 'easeInOut', repeat: Infinity },
  },
}

export const pulse: Variants = {
  animate: {
    opacity: [1, 0.6, 1],
    transition: { duration: 2, ease: 'easeInOut', repeat: Infinity },
  },
}

export const spin: Variants = {
  animate: {
    rotate: 360,
    transition: { duration: 1, ease: 'linear', repeat: Infinity },
  },
}

export const bounce: Variants = {
  animate: {
    y: [0, -5, 0],
    transition: { duration: 0.6, ease: 'easeInOut', repeat: Infinity },
  },
}

export function createPageTransition(direction: 'forward' | 'backward'): Variants {
  const isForward = direction === 'forward'
  return {
    initial: { opacity: 0, x: isForward ? 30 : -30, rotateY: isForward ? -15 : 15 },
    animate: { opacity: 1, x: 0, rotateY: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, x: isForward ? -30 : 30, rotateY: isForward ? 15 : -15, transition: { duration: 0.3, ease: 'easeIn' } },
  }
}

export const toolbarAnimation: Variants = {
  hidden: { opacity: 0, y: 100 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: 100, transition: { duration: 0.2, ease: 'easeIn' } },
}

export const sidebarAnimation: Variants = {
  hidden: { opacity: 0, x: -300 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, x: -300, transition: { duration: 0.2, ease: 'easeIn' } },
}

export const bottomSheetAnimation: Variants = {
  hidden: { y: '100%' },
  visible: { y: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } },
  exit: { y: '100%', transition: { duration: 0.2, ease: 'easeIn' } },
}

export const overlayAnimation: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}