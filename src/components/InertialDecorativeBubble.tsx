import { motion, useSpring, MotionValue } from 'motion/react';
import { useState, useEffect } from 'react';

interface InertialDecorativeBubbleProps {
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  mapX: MotionValue<number>;
}

export function InertialDecorativeBubble({ 
  x, 
  y, 
  size, 
  color, 
  delay, 
  mapX 
}: InertialDecorativeBubbleProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Create varied inertial movement - decorative bubbles have more lag
  const inertialFactor = 0.7 - (size / 100) * 0.5; // DRAMATIC lag differences - tiny bubbles are super bouncy
  const springConfig = {
    stiffness: Math.max(15, 100 - (size / 1.2)), // Even softer springs, more dramatic range
    damping: 6 + (size / 6), // Lower base damping, more range
    mass: 0.2 + (size / 40) // Lighter base mass, more variance
  };

  const springX = useSpring(0, springConfig);
  
  // Update spring position when map moves with extra lag
  useEffect(() => {
    const unsubscribe = mapX.on('change', (latest) => {
      springX.set(latest * inertialFactor);
    });
    return unsubscribe;
  }, [mapX, springX, inertialFactor]);

  // More subtle floating animation for decorative bubbles
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

  // Entrance animation from bottom-right corner with varied directions
  const entranceAnimation = {
    initial: {
      x: Math.max(150, (typeof window !== 'undefined' ? window.innerWidth : 1000) - x + 100 + (Math.random() - 0.5) * 100),
      y: Math.max(150, (typeof window !== 'undefined' ? window.innerHeight : 1000) - y + 100 + (Math.random() - 0.5) * 100),
      scale: 0,
      opacity: 0
    },
    animate: isVisible ? {
      x: 0,
      y: 0,
      scale: 1,
      opacity: 0.7,
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
      className="absolute pointer-events-none"
      style={{ 
        left: x - size/2,
        top: y - size/2,
        width: size,
        height: size,
        x: springX // Apply inertial movement
      }}
      {...entranceAnimation}
    >
      <motion.div
        animate={floatingAnimation}
        className="relative w-full h-full"
      >
        {/* Colorful bubble shape */}
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
          whileHover={{
            scale: 1.1,
            transition: { type: "spring", stiffness: 400, damping: 15 }
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