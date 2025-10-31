import { useState } from 'react';
import { motion } from 'motion/react';
import { BubbleMap } from './BubbleMap';
import { Button } from './ui/button';
import { ArrowLeft, Check } from 'lucide-react';

interface FilterOption {
  id: string;
  label: string;
  category: string;
  color: string;
}

// Sample filter data
const sampleFilters: FilterOption[] = [
  // Categories
  { id: 'electronics', label: 'Electronics', category: 'Category', color: '#FF6B6B' },
  { id: 'clothing', label: 'Clothing', category: 'Category', color: '#4ECDC4' },
  { id: 'home', label: 'Home & Garden', category: 'Category', color: '#45B7D1' },
  { id: 'sports', label: 'Sports', category: 'Category', color: '#96CEB4' },
  { id: 'books', label: 'Books', category: 'Category', color: '#FFEAA7' },
  
  // Price ranges
  { id: 'under25', label: 'Under $25', category: 'Price', color: '#DDA0DD' },
  { id: '25to50', label: '$25 - $50', category: 'Price', color: '#98D8C8' },
  { id: '50to100', label: '$50 - $100', category: 'Price', color: '#F7DC6F' },
  { id: 'over100', label: 'Over $100', category: 'Price', color: '#BB8FCE' },
  
  // Brands
  { id: 'apple', label: 'Apple', category: 'Brand', color: '#85C1E9' },
  { id: 'nike', label: 'Nike', category: 'Brand', color: '#FF8A80' },
  { id: 'samsung', label: 'Samsung', category: 'Brand', color: '#A5D6A7' },
  { id: 'adidas', label: 'Adidas', category: 'Brand', color: '#FFCC80' },
  { id: 'sony', label: 'Sony', category: 'Brand', color: '#81C784' },
  
  // Features
  { id: 'freeshipping', label: 'Free Shipping', category: 'Feature', color: '#CE93D8' },
  { id: 'onsale', label: 'On Sale', category: 'Feature', color: '#90CAF9' },
  { id: 'newitem', label: 'New Items', category: 'Feature', color: '#FFAB91' },
  { id: 'bestseller', label: 'Best Seller', category: 'Feature', color: '#C8E6C9' },
  
  // Ratings
  { id: '4stars', label: '4+ Stars', category: 'Rating', color: '#F8BBD9' },
  { id: '5stars', label: '5 Stars', category: 'Rating', color: '#B39DDB' },
];

export function FilterScreen() {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleFilterToggle = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId)
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const handleApplyFilters = () => {
    setShowResults(true);
    // Here you would typically navigate to results or update the parent component
    console.log('Applied filters:', selectedFilters);
  };

  const handleClearAll = () => {
    setSelectedFilters([]);
  };

  if (showResults) {
    return (
      <div className="w-full size-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
        <motion.div
          className="text-center text-white"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <Check className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl mb-2">Filters Applied!</h2>
          <p className="text-lg opacity-90">{selectedFilters.length} filters selected</p>
          <Button 
            onClick={() => setShowResults(false)}
            className="mt-6 bg-white text-blue-600 hover:bg-gray-100"
          >
            Back to Filters
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative w-full size-full">
      {/* Header */}
      <motion.div 
        className="absolute top-0 left-0 right-0 z-20 bg-white/10 backdrop-blur-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 20 }}
      >
        <div className="flex items-center justify-between p-4 pt-12">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-white text-lg">Set Filters</h1>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-white/20 shadow-none"
            onClick={handleClearAll}
            disabled={selectedFilters.length === 0}
          >
            Clear All
          </Button>
        </div>
      </motion.div>

      {/* Bubble Map */}
      <BubbleMap 
        filters={sampleFilters}
        selectedFilters={selectedFilters}
        onFilterToggle={handleFilterToggle}
      />

      {/* Bottom Action Bar */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 z-20 bg-white/10 backdrop-blur-sm p-4 pb-8"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.7, type: "spring", stiffness: 200, damping: 20 }}
      >
        <div className="flex gap-3">
          <Button 
            onClick={handleApplyFilters}
            className="flex-1 bg-white text-purple-600 hover:bg-gray-100 py-3"
            disabled={selectedFilters.length === 0}
          >
            Apply Filters {selectedFilters.length > 0 && `(${selectedFilters.length})`}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}