import { motion, useMotionValue, useTransform, PanInfo } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import { InertialBubbleFilter } from './InertialBubbleFilter';
import { InertialDecorativeBubble } from './InertialDecorativeBubble';

interface FilterOption {
  id: string;
  label: string;
  category: string;
  color: string;
}

interface BubbleMapProps {
  filters: FilterOption[];
  selectedFilters: string[];
  onFilterToggle: (id: string) => void;
}

export function BubbleMap({ filters, selectedFilters, onFilterToggle }: BubbleMapProps) {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const staticMapX = useMotionValue(0); // Static motion value for bubbles - no individual movement
  const [mapWidth, setMapWidth] = useState(0);
  const [screenWidth, setScreenWidth] = useState(430);
  const [bubblePositions, setBubblePositions] = useState<Array<{x: number, y: number, size: number}>>([]);
  const [decorativeBubbles, setDecorativeBubbles] = useState<Array<{x: number, y: number, size: number, color: string}>>([]);
  const [scrollIndicatorData, setScrollIndicatorData] = useState({ progress: 0, thumbLeft: 0 });

  // Track screen dimensions for proper drag constraints
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const updateDimensions = () => {
      setScreenWidth(window.innerWidth);
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Generate bubble positions when filters change
  useEffect(() => {
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 932;
    
    // Look at actual Figma design span: leftmost bubble at x=30, rightmost at x=1308 out of 1338 total
    // We want to scale this to be wider than screen but not excessively so
    const figmaContentSpan = 1278; // 1308 - 30
    
    // Your exact design positions converted from Figma (1338×932 design base)
    const designedPositions = [
      { x: 669/1338, y: 466/932, size: 132 },     // Electronics (center) - cx="669" cy="466"
      { x: 438/1338, y: 559/932, size: 132 },     // Clothing  - cx="438" cy="559"
      { x: 870/1338, y: 376/932, size: 132 },     // Home & Garden - cx="870" cy="376"
      { x: 492/1338, y: 308/932, size: 108 },     // Sports - cx="492" cy="308"
      { x: 1007/1338, y: 520/932, size: 108 },    // Books - cx="1007" cy="520"
      { x: 213/1338, y: 517/932, size: 108 },     // Under $25 - cx="213" cy="517"
      { x: 789/1338, y: 645/932, size: 108 },     // $25-$50 - cx="789" cy="645"
      { x: 627/1338, y: 350/932, size: 84 },      // $50-$100 - cx="627" cy="350"
      { x: 828/1338, y: 520/932, size: 84 },      // Over $100 - cx="828" cy="520"
      { x: 1214/1338, y: 436/932, size: 84 },     // Apple - cx="1214" cy="436"
      { x: 1061/1338, y: 379/932, size: 84 },     // Nike - cx="1061" cy="379"
      { x: 406/1338, y: 418/932, size: 84 },      // Samsung - cx="406" cy="418"
      { x: 113/1338, y: 421/932, size: 84 },      // Adidas - cx="113" cy="421"
      { x: 603/1338, y: 604/932, size: 60 },      // Sony - cx="603" cy="604"
      { x: 936/1338, y: 621/932, size: 60 },      // Free Shipping - cx="936" cy="621"
      { x: 267/1338, y: 382/932, size: 60 },      // On Sale - cx="267" cy="382"
      { x: 756/1338, y: 263/932, size: 60 },      // New Items - cx="756" cy="263"
      { x: 1308/1338, y: 502/932, size: 60 },     // Best Seller - cx="1308" cy="502"
      { x: 1184/1338, y: 553/932, size: 60 },     // 4+ Stars - cx="1184" cy="553"
      { x: 30/1338, y: 493/932, size: 60 },       // 5 Stars - cx="30" cy="493"
    ];

    // In Figma design: leftmost at x=30, rightmost at x=1308, span = 1278 out of 1338 total width
    const figmaLeftEdge = 30;
    const figmaRightEdge = 1308;
    
    // We want the map to be about 3.3x screen width, but let's calculate it properly
    // Scale the Figma 1278px content span to be about 2.5x screen width (good balance)
    const targetContentWidth = screenWidth * 2.5;
    const scaleFactor = targetContentWidth / figmaContentSpan;
    
    // Padding on both sides
    const leftPadding = 30;
    const rightPadding = 30;
    
    // The actual map width is content + padding
    const targetMapWidth = targetContentWidth + leftPadding + rightPadding;
    const mapCenterX = targetMapWidth / 2;
    const screenCenterY = screenHeight / 2;
    
    // Your constraint area: 100% height at center, 50% at edges
    const maxVerticalRange = screenHeight * 1.0;
    const minVerticalRange = screenHeight * 0.5;
    
    // Function to calculate vertical range based on distance from horizontal center
    const getVerticalRange = (normalizedX: number) => {
      const actualX = normalizedX * targetMapWidth;
      const distanceFromCenter = Math.abs(actualX - mapCenterX);
      const maxDistance = targetMapWidth / 2;
      const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1);
      
      return maxVerticalRange - (normalizedDistance * (maxVerticalRange - minVerticalRange));
    };

    // Process clickable bubbles - directly map from Figma coordinates to our target width
    const positions: Array<{x: number, y: number, size: number}> = [];
    
    for (let i = 0; i < Math.min(designedPositions.length, filters.length); i++) {
      const design = designedPositions[i];
      
      // Map Figma X coordinate directly to our target width
      // Figma coordinate (design.x * 1338) minus left edge, scaled to our width, plus padding
      const figmaX = design.x * 1338;
      const relativeX = figmaX - figmaLeftEdge; // Position relative to leftmost content
      const actualX = leftPadding + (relativeX * scaleFactor);
      
      // Get dynamic vertical range for this X position
      const verticalRange = getVerticalRange(actualX / targetMapWidth);
      
      // Apply vertical range to Y position
      const minY = screenCenterY - verticalRange / 2;
      const maxY = screenCenterY + verticalRange / 2;
      const actualY = minY + design.y * (maxY - minY);
      
      // Responsive scaling
      const responsiveSize = design.size * (screenWidth / 430);
      const adjustedY = Math.max(responsiveSize/2 + 50, Math.min(screenHeight - responsiveSize/2 - 50, actualY));
      
      positions.push({
        x: actualX,
        y: adjustedY,
        size: responsiveSize
      });
    }

    // Process decorative bubbles - position them within the same content area
    const decoratives: Array<{x: number, y: number, size: number, color: string}> = [];
    const decorativePositions = [
      // Positioned across the actual content width
      { x: 0.05, y: 0.45, size: 55 },
      { x: 0.15, y: 0.35, size: 52 },
      { x: 0.25, y: 0.68, size: 48 },
      { x: 0.35, y: 0.25, size: 50 },
      { x: 0.45, y: 0.55, size: 53 },
      { x: 0.55, y: 0.72, size: 49 },
      { x: 0.65, y: 0.42, size: 51 },
      { x: 0.75, y: 0.48, size: 47 },
      { x: 0.85, y: 0.58, size: 54 },
      { x: 0.95, y: 0.38, size: 46 },
      
      // Medium decorative bubbles
      { x: 0.08, y: 0.48, size: 35 },
      { x: 0.18, y: 0.52, size: 32 },
      { x: 0.28, y: 0.35, size: 38 },
      { x: 0.38, y: 0.48, size: 34 },
      { x: 0.48, y: 0.48, size: 36 },
      { x: 0.58, y: 0.65, size: 33 },
      { x: 0.68, y: 0.62, size: 37 },
      { x: 0.78, y: 0.58, size: 31 },
      { x: 0.88, y: 0.28, size: 39 },
      { x: 0.92, y: 0.38, size: 35 },
      
      // Small decorative bubbles
      { x: 0.12, y: 0.35, size: 22 },
      { x: 0.22, y: 0.52, size: 25 },
      { x: 0.32, y: 0.38, size: 23 },
      { x: 0.42, y: 0.42, size: 24 },
      { x: 0.52, y: 0.48, size: 21 },
      { x: 0.62, y: 0.58, size: 26 },
      { x: 0.72, y: 0.28, size: 20 },
      { x: 0.82, y: 0.38, size: 25 },
      { x: 0.92, y: 0.52, size: 22 }
    ];
    
    for (let i = 0; i < decorativePositions.length; i++) {
      const decor = decorativePositions[i];
      
      // Position decorative bubbles within the actual content area
      const actualX = leftPadding + (decor.x * targetContentWidth);
      
      // Get dynamic vertical range for this X position
      const verticalRange = getVerticalRange(actualX / targetMapWidth);
      
      // Apply vertical range to Y position
      const minY = screenCenterY - verticalRange / 2;
      const maxY = screenCenterY + verticalRange / 2;
      const actualY = minY + decor.y * (maxY - minY);
      
      // Responsive sizing for decorative bubbles
      const responsiveSize = decor.size * (screenWidth / 430);
      const adjustedY = Math.max(responsiveSize/2 + 50, Math.min(screenHeight - responsiveSize/2 - 50, actualY));
      
      // Use colorful palette for decorative bubbles
      const colorIndex = i % colors.length;
      
      decoratives.push({
        x: actualX,
        y: adjustedY,
        size: responsiveSize,
        color: colors[colorIndex]
      });
    }

    // Use the targetMapWidth directly since we already calculated positions based on it
    const newMapWidth = Math.max(screenWidth, Math.ceil(targetMapWidth));
    
    console.log('Map width:', {
      targetMapWidth,
      newMapWidth,
      screenWidth,
      leftPadding,
      rightPadding
    });

    setBubblePositions(positions);
    setDecorativeBubbles(decoratives);
    setMapWidth(newMapWidth);
    
    // FIXED: Use setTimeout to ensure centering happens after state updates
    setTimeout(() => {
      // Center the map - show the middle of the map content  
      const mapCenter = newMapWidth / 2;
      const screenCenter = screenWidth / 2;
      const offsetToCenter = screenCenter - mapCenter;
      
      // Constrain the offset within drag bounds
      const maxOffset = -(newMapWidth - screenWidth);
      const constrainedOffset = Math.max(maxOffset, Math.min(0, offsetToCenter));
      
      console.log('Centering map:', {
        mapWidth: newMapWidth,
        screenWidth,
        mapCenter,
        screenCenter,
        offsetToCenter,
        constrainedOffset
      });
      
      x.set(constrainedOffset);
    }, 50); // Small delay to ensure state is updated
  }, [filters, screenWidth]);

  // Sync staticMapX with main x for bubble inertia
  useEffect(() => {
    const unsubscribe = x.on('change', (latest) => {
      staticMapX.set(latest);
    });
    return unsubscribe;
  }, [x, staticMapX]);

  // Create inertia transforms for organic movement
  const bubbleInertiaX = useTransform(x, (latest) => latest);
  const decorativeBubbleInertiaX = useTransform(x, (latest) => latest * 0.98);

  // Simple scroll indicator using transforms
  const scrollProgress = useTransform(x, 
    latest => mapWidth > screenWidth ? -latest / (mapWidth - screenWidth) : 0
  );
  const scrollThumbLeft = useTransform(scrollProgress, 
    progress => mapWidth > screenWidth ? progress * (100 - (screenWidth / mapWidth) * 100) : 0
  );

  // Handle scroll bar dragging
  const handleScrollDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const trackWidth = 256; // 16rem = 256px
    const thumbWidth = (screenWidth / mapWidth) * trackWidth;
    const maxThumbLeft = trackWidth - thumbWidth;
    
    // Calculate new thumb position based on drag delta instead of absolute position
    const currentProgress = -x.get() / (mapWidth - screenWidth);
    const currentThumbLeft = currentProgress * maxThumbLeft;
    const newThumbLeft = Math.max(0, Math.min(maxThumbLeft, currentThumbLeft + info.delta.x));
    
    // Convert thumb position to map position
    const scrollRatio = newThumbLeft / maxThumbLeft;
    const newMapX = -(mapWidth - screenWidth) * scrollRatio;
    
    x.set(newMapX);
  };

  // Background gradient that follows the drag
  const backgroundGradient = useTransform(
    x,
    [-mapWidth, 0],
    [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    ]
  );

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];

  return (
    <div className="relative w-full size-full overflow-hidden" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Background with animated gradient */}
      <motion.div 
        className="absolute inset-0"
        style={{ background: backgroundGradient }}
      />
      
      {/* Floating particles in background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            animate={{
              y: [Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 932), -50],
              x: [Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 430), Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 430)],
              opacity: [0, 0.6, 0]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Bubble container - now moves with x again */}
      <motion.div 
        ref={constraintsRef} 
        className="w-full h-full pointer-events-none relative z-20"
        drag="x"
        dragConstraints={{
          left: -(mapWidth - screenWidth),
          right: 0
        }}
        dragElastic={0}
        dragMomentum={true}
        onDragEnd={(event, info) => {
          const currentX = x.get();
          const maxOffset = -(mapWidth - screenWidth);
          const clampedX = Math.max(maxOffset, Math.min(0, currentX));
          x.set(clampedX);
        }}
        whileDrag={{ cursor: 'grabbing' }}
        style={{ touchAction: 'none', x }}
      >
        <motion.div
          className="relative h-full pointer-events-none"
          style={{ 
            width: mapWidth
          }}
        >
          {/* Render decorative bubbles */}
          {decorativeBubbles.map((bubble, index) => (
            <InertialDecorativeBubble
              key={`decorative-${index}`}
              x={bubble.x}
              y={bubble.y}
              size={bubble.size}
              color={bubble.color}
              delay={500 + index * 25} // Much faster loading - reduced delay and intervals
              mapX={staticMapX} // Use static motion value - no individual movement
            />
          ))}

          {/* Render clickable filter bubbles - re-enable pointer events */}
          {filters.map((filter, index) => {
            if (!bubblePositions[index]) return null;
            
            return (
              <div key={filter.id} className="pointer-events-auto relative z-30">
                <InertialBubbleFilter
                  id={filter.id}
                  label={filter.label}
                  category={filter.category}
                  x={bubblePositions[index].x}
                  y={bubblePositions[index].y}
                  size={bubblePositions[index].size}
                  color={colors[index % colors.length]}
                  isSelected={selectedFilters.includes(filter.id)}
                  onToggle={onFilterToggle}
                  delay={index * 50} // Much faster staggered animation - reduced from 150ms to 50ms
                  mapX={staticMapX} // Use static motion value - no individual movement
                />
              </div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-64">
        {/* Scroll track */}
        <div className="relative h-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
          {/* Scroll thumb - simplified using transforms */}
          <motion.div
            className="absolute top-0 h-full bg-white/60 rounded-full shadow-lg cursor-pointer"
            style={{
              width: `${mapWidth > 0 ? (screenWidth / mapWidth) * 100 : 0}%`,
              left: useTransform(scrollThumbLeft, (val) => `${val}%`)
            }}
            drag="x"
            dragConstraints={{
              left: 0,
              right: 256 - (mapWidth > 0 ? (screenWidth / mapWidth) * 256 : 0)
            }}
            dragElastic={0}
            dragMomentum={false}
            onDrag={handleScrollDrag}
            whileDrag={{ scale: 1.2 }}
          />
        </div>
        
        {/* Scroll label */}
        <motion.div 
          className="text-center mt-2 text-white/60 text-xs pointer-events-none"
          animate={{ 
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity 
          }}
        >
          Drag to explore • {Math.round(mapWidth / screenWidth * 10) / 10}x map
        </motion.div>
      </div>
    </div>
  );
}