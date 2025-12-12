import { useState } from 'react';
import { Category, Difficulty, MOCK_TRIP } from '@/lib/mock-data';
import { MapView } from '@/components/map-view';
import { TimelinePanel } from '@/components/timeline-panel';
import { Search, SlidersHorizontal, Map as MapIcon, CalendarRange, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function TripDetails() {
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');

  const filteredLocations = activeCategory === 'all' 
    ? MOCK_TRIP.locations 
    : MOCK_TRIP.locations.filter(l => l.category === activeCategory);

  return (
    <div className="h-screen w-full bg-background flex flex-col md:flex-row overflow-hidden font-sans text-foreground selection:bg-primary/20">
      
      {/* Left Panel - Timeline & Content */}
      <div className="w-full md:w-[480px] flex flex-col h-[50vh] md:h-full border-r border-border bg-background/50 backdrop-blur-3xl z-10 shadow-2xl relative">
        
        {/* Header */}
        <div className="p-6 md:p-8 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-primary font-bold tracking-tight">
               <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                 <MapIcon className="w-5 h-5" />
               </div>
               WanderFlow
            </div>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
              <Menu className="w-5 h-5" />
            </Button>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h1 className="text-3xl font-display font-bold leading-tight">{MOCK_TRIP.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full">
                <CalendarRange className="w-4 h-4" />
                {MOCK_TRIP.dates}
              </span>
              <span>{MOCK_TRIP.stats.places} Places</span>
            </div>
          </motion.div>

          {/* Filters */}
          <div className="mt-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide mask-fade-right">
             <FilterChip active={activeCategory === 'all'} onClick={() => setActiveCategory('all')}>All</FilterChip>
             <FilterChip active={activeCategory === 'culture'} onClick={() => setActiveCategory('culture')}>Culture</FilterChip>
             <FilterChip active={activeCategory === 'nature'} onClick={() => setActiveCategory('nature')}>Nature</FilterChip>
             <FilterChip active={activeCategory === 'food'} onClick={() => setActiveCategory('food')}>Food</FilterChip>
          </div>
        </div>

        {/* Timeline Scroll Area */}
        <div className="flex-1 overflow-hidden relative">
          <TimelinePanel 
            locations={filteredLocations} 
            selectedLocationId={selectedLocationId}
            onLocationSelect={setSelectedLocationId}
          />
          
          {/* Gradient Fade at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-background to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Right Panel - Map */}
      <div className="flex-1 relative bg-muted h-[50vh] md:h-full">
        <div className="absolute inset-4 md:inset-6 rounded-3xl overflow-hidden shadow-inner border border-white/10 ring-4 ring-black/5">
           <MapView 
             locations={filteredLocations} 
             selectedLocationId={selectedLocationId}
             onLocationSelect={setSelectedLocationId}
           />
           
           {/* Floating Map Controls Overlay */}
           <div className="absolute top-6 left-6 right-6 flex justify-between pointer-events-none">
             <div className="bg-white/90 backdrop-blur-md shadow-sm border border-border/50 rounded-full px-4 py-2 flex items-center gap-2 pointer-events-auto">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search locations..." 
                  className="bg-transparent border-none outline-hidden text-sm w-48 placeholder:text-muted-foreground/70" 
                />
             </div>
             
             <Button size="icon" variant="secondary" className="rounded-full shadow-lg pointer-events-auto bg-white/90 backdrop-blur-md">
                <SlidersHorizontal className="w-4 h-4" />
             </Button>
           </div>
        </div>
      </div>
    </div>
  );
}

function FilterChip({ active, children, onClick }: { active: boolean, children: React.ReactNode, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap",
        active 
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105" 
          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
