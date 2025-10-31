import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

interface DecorativeBubbleProps {
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
}

export function DecorativeBubble({ x, y, size, color, delay }: DecorativeBubbleProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Subtle floating animation for decorative bubbles
  const floatingAnimation = {
    y: [0, -0.5, 0],
    x: [0, 0.3, 0],
    rotate: [0, 0.2, 0],
    transition: {
      duration: 5 + Math.random() * 3,
      repeat: Infinity,
      ease: "easeInOut",
      delay: Math.random() * 3
    }
  };

  // Entrance animation from random directions
  const entranceAnimation = {
    initial: {
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 200,
      scale: 0,
      opacity: 0
    },
    animate: isVisible ? {
      x: 0,
      y: 0,
      scale: 1,
      opacity: 0.7, // Slightly higher opacity for colorful bubbles
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 20,
        duration: 1
      }
    } : {}
  };

  return (
    <motion.div
      className="absolute pointer-events-none" // Make non-clickable
      style={{ 
        left: x - size/2,  // Subtract half size to center the bubble at x,y coordinates
        top: y - size/2,   // Subtract half size to center the bubble at x,y coordinates
        width: size,
        height: size
      }}
      {...entranceAnimation}
    >
      <motion.div
        animate={floatingAnimation}
        className="relative w-full h-full"
      >
        {/* Colorful bubble shape like clickable bubbles */}
        <motion.div
          className="w-full h-full rounded-full"
          style={{ 
            backgroundColor: color,
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}
          animate={{
            borderRadius: [
              "50% 60% 70% 40% / 60% 30% 70% 40%",
              "70% 40% 30% 60% / 40% 60% 50% 60%",
              "50% 60% 70% 40% / 60% 30% 70% 40%"
            ]
          }}
          transition={{
            duration: 6 + Math.random() * 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Subtle shimmer for decorative bubbles */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"
            animate={{
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}