import { Location, Category, Difficulty } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import { MapPin, Clock, Calendar, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelinePanelProps {
  locations: Location[];
  selectedLocationId: string | null;
  onLocationSelect: (id: string) => void;
}

export function TimelinePanel({ locations, selectedLocationId, onLocationSelect }: TimelinePanelProps) {
  return (
    <div className="h-full overflow-y-auto pr-2 pb-20 scrollbar-hide">
      <div className="relative pl-8 border-l-2 border-dashed border-border/60 ml-4 space-y-12 py-8">
        {locations.map((location, index) => {
          const isSelected = selectedLocationId === location.id;
          
          return (
            <div key={location.id} className="relative">
              {/* Timeline Connector */}
              <div 
                className={cn(
                  "absolute -left-[41px] top-6 w-5 h-5 rounded-full border-4 transition-all duration-300 z-10 bg-background",
                  isSelected ? "border-primary scale-125 shadow-[0_0_0_4px_rgba(var(--primary),0.2)]" : "border-muted-foreground/30"
                )}
              />

              <motion.div
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onLocationSelect(location.id)}
                className={cn(
                  "group cursor-pointer rounded-2xl border transition-all duration-300 overflow-hidden",
                  isSelected 
                    ? "bg-card border-primary/20 shadow-xl ring-1 ring-primary/10 scale-[1.02]" 
                    : "bg-card/50 border-transparent hover:bg-card hover:shadow-lg hover:border-border/50"
                )}
              >
                {/* Image Section */}
                <div className="h-40 overflow-hidden relative">
                   <img 
                    src={location.photos[0]} 
                    alt={location.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                   />
                   <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {location.time}
                   </div>
                   <div className="absolute bottom-3 left-3 flex gap-2">
                      <Badge variant={location.category}>{location.category}</Badge>
                      {location.difficulty && <Badge variant="outline">{location.difficulty}</Badge>}
                   </div>
                </div>

                {/* Content Section */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={cn("text-xl font-display font-semibold", isSelected ? "text-primary" : "text-foreground")}>
                      {location.name}
                    </h3>
                  </div>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-4 group-hover:line-clamp-none transition-all">
                    {location.description}
                  </p>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                     <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Day {location.day}</span>
                     </div>
                     <button className="text-primary text-xs font-medium hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        View Details <MoreHorizontal className="w-4 h-4" />
                     </button>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Badge({ children, variant = 'default' }: { children: React.ReactNode, variant?: string }) {
  const styles = {
    default: "bg-primary/90 text-primary-foreground",
    outline: "bg-black/40 text-white border border-white/20 backdrop-blur-sm",
    culture: "bg-purple-500/90 text-white",
    food: "bg-orange-500/90 text-white",
    nature: "bg-green-500/90 text-white",
    shopping: "bg-blue-500/90 text-white",
    stay: "bg-indigo-500/90 text-white"
  };

  const selectedStyle = styles[variant as keyof typeof styles] || styles.default;

  return (
    <span className={cn("text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full shadow-xs", selectedStyle)}>
      {children}
    </span>
  );
}
