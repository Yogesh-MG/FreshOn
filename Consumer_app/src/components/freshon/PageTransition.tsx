import { motion } from "framer-motion";
import { ReactNode, useMemo } from "react";

export const PageTransition = ({ children }: { children: ReactNode }) => {
  // Detect if on mobile - reduce animations for better performance
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  }, []);

  // Lighter animations on mobile
  const pageVariants = isMobile ? {
    initial: { opacity: 1 },
    enter: { opacity: 1, transition: { duration: 0 } },
    exit: { opacity: 1, transition: { duration: 0 } },
  } : {
    initial: {
      opacity: 0,
      x: 20,
    },
    enter: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: [0.61, 1, 0.88, 1],
      },
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2,
        ease: [0.61, 1, 0.88, 1],
      },
    },
  };

  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={pageVariants}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

