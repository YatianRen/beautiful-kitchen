import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

interface BubbleFilterProps {
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
}

export function BubbleFilter({ 
  id, 
  label, 
  category, 
  x, 
  y, 
  size, 
  color, 
  isSelected, 
  onToggle, 
  delay 
}: BubbleFilterProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Organic floating animation - disabled to prevent overlapping
  const floatingAnimation = {
    y: [0, -1, 0], // Minimal movement to maintain life
    x: [0, 0.5, 0], // Very subtle horizontal movement
    rotate: [0, 0.3, 0], // Minimal rotation
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
      x: (typeof window !== 'undefined' ? window.innerWidth : 1000) + 100 - x, // Offset from final position
      y: (typeof window !== 'undefined' ? window.innerHeight : 1000) + 100 - y, // Offset from final position
      scale: 0,
      opacity: 0
    },
    animate: isVisible ? {
      x: 0, // Return to normal position (relative to the positioned container)
      y: 0, // Return to normal position (relative to the positioned container)
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
        left: x - size/2,  // Subtract half size to center the bubble at x,y coordinates
        top: y - size/2,   // Subtract half size to center the bubble at x,y coordinates
        width: size,
        height: size
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
            border: isSelected ? '3px solid white' : 'none' // Add solid white border when selected
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

          {/* Selection indicator */}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}