import { motion, useSpring, useTransform, MotionValue } from 'motion/react';
import { useState, useEffect } from 'react';

interface InertialBubbleFilterProps {
  id: string;
  label: string;
  category: string;
  x: number;
  y: number;
  size: number;
  color: string;
  isSelected: boolean;
  onToggle: (id: string) => void;
  delay: number;
  mapX: MotionValue<number>;
}

export function InertialBubbleFilter({ 
  id, 
  label, 
  category, 
  x, 
  y, 
  size, 
  color, 
  isSelected, 
  onToggle, 
  delay,
  mapX
}: InertialBubbleFilterProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Create inertial movement with springs based on bubble size and position
  const inertialFactor = 1 - (size / 200) * 0.4; // MUCH larger difference - bigger bubbles lag significantly more
  const springConfig = {
    stiffness: Math.max(20, 120 - (size / 2)), // Dramatic stiffness range: small=120, large=20
    damping: 8 + (size / 8), // More dramatic damping difference
    mass: 0.3 + (size / 50) // Much more mass difference
  };

  const springX = useSpring(0, springConfig);
  
  // Update spring position when map moves
  useEffect(() => {
    const unsubscribe = mapX.on('change', (latest) => {
      springX.set(latest * inertialFactor);
    });
    return unsubscribe;
  }, [mapX, springX, inertialFactor]);

  // Organic floating animation
  const floatingAnimation = {
    y: [0, -1, 0],
    x: [0, 0.5, 0],
    rotate: [0, 0.3, 0],
    transition: {
      duration: 4 + Math.random() * 2,
      repeat: Infinity,
      ease: "easeInOut",
      delay: Math.random() * 2
    }
  };

  // Entrance animation from bottom-right
  const entranceAnimation = {
    initial: {
      x: Math.max(200, (typeof window !== 'undefined' ? window.innerWidth : 1000) - x + 100),
      y: Math.max(200, (typeof window !== 'undefined' ? window.innerHeight : 1000) - y + 100),
      scale: 0,
      opacity: 0
    },
    animate: isVisible ? {
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.8
      }
    } : {}
  };

  return (
    <motion.div
      className="absolute"
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
        whileTap={{ scale: 0.95 }}
        className="relative w-full h-full cursor-pointer"
        onClick={() => onToggle(id)}
      >
        {/* Bubble shape with organic blob effect */}
        <motion.div
          className={`w-full h-full rounded-full flex items-center justify-center text-white relative overflow-hidden ${
            isSelected ? 'ring-4 ring-white/30' : ''
          }`}
          style={{ 
            backgroundColor: color,
            boxShadow: isSelected 
              ? `0 0 20px ${color}40` 
              : '0 4px 20px rgba(0,0,0,0.1)',
            border: isSelected ? '3px solid white' : 'none'
          }}
          animate={{
            borderRadius: [
              "60% 40% 30% 70% / 60% 30% 70% 40%",
              "30% 60% 70% 40% / 50% 60% 30% 60%",
              "60% 40% 30% 70% / 60% 30% 70% 40%"
            ]
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          whileHover={{
            scale: 1.05,
            transition: { type: "spring", stiffness: 300, damping: 20 }
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              borderRadius: 'inherit'
            }}
          />
          
          {/* Content */}
          <div className="relative z-10 text-center p-2">
            <div className="text-xs opacity-70 mb-1">{category}</div>
            <div className="font-medium text-sm leading-tight">{label}</div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}