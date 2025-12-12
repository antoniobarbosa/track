import { useEffect, useRef, useState } from 'react';
import Map, { Marker, Popup, NavigationControl, ViewState } from 'react-map-gl';
import { Location } from '@/lib/mock-data';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin } from 'lucide-react';

interface MapViewProps {
  locations: Location[];
  selectedLocationId: string | null;
  onLocationSelect: (id: string) => void;
}

// NOTE: In a real app, this would be an env variable. 
// Using a public token for demo purposes is risky but necessary for the "Mapbox" requirement without backend config.
// If this fails, the map will just be blank tiles but markers will show.
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZGVtb21hcGJveCIsImEiOiJjbGh3emh6bnMwM3F4M21vZmJ5bTBoZ2s1In0.2j2qC0m_W_T7gZqQ9gX8gA'; 
// Fallback logic could be added here.

export function MapView({ locations, selectedLocationId, onLocationSelect }: MapViewProps) {
  const mapRef = useRef<any>(null);
  const [viewState, setViewState] = useState<ViewState>({
    latitude: 34.9671,
    longitude: 135.7727,
    zoom: 11,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 }
  });

  // Fly to location when selected
  useEffect(() => {
    if (selectedLocationId && mapRef.current) {
      const location = locations.find(l => l.id === selectedLocationId);
      if (location) {
        mapRef.current.flyTo({
          center: [location.lng, location.lat],
          zoom: 14,
          duration: 2000,
          essential: true
        });
      }
    }
  }, [selectedLocationId, locations]);

  return (
    <div className="w-full h-full bg-muted/20 relative overflow-hidden rounded-3xl border border-border/50 shadow-2xl">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        attributionControl={false}
      >
        <NavigationControl position="bottom-right" />
        
        {locations.map((loc) => (
          <Marker
            key={loc.id}
            latitude={loc.lat}
            longitude={loc.lng}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              onLocationSelect(loc.id);
            }}
          >
            <div className="group relative cursor-pointer">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: selectedLocationId === loc.id ? 0 : 0 }}
                whileHover={{ scale: 1.2 }}
                className={`
                  p-2 rounded-full shadow-lg transition-colors duration-300
                  ${selectedLocationId === loc.id 
                    ? 'bg-primary text-primary-foreground scale-125 z-50' 
                    : 'bg-card text-foreground hover:bg-primary/10'
                  }
                `}
              >
                <MapPin className="w-5 h-5 fill-current" />
              </motion.div>
              
              {/* Tooltip on hover */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs py-1 px-2 rounded whitespace-nowrap pointer-events-none z-10">
                {loc.name}
              </div>
            </div>
          </Marker>
        ))}
      </Map>
      
      {/* Decorative gradient overlay for better text readability if we had overlays */}
      <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-black/5 to-transparent h-32" />
    </div>
  );
}
