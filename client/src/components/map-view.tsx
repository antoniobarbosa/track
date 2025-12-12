"use client";

import {
  useEffect,
  useRef,
  useState,
  useMemo,
  useImperativeHandle,
  forwardRef,
} from "react";
import Map, {
  Marker,
  NavigationControl,
  ViewState,
  Source,
  Layer,
} from "react-map-gl";
import { Location } from "@/lib/mock-data";
import { motion } from "framer-motion";
import {
  MapPin,
  AlertCircle,
  Landmark,
  UtensilsCrossed,
  TreePine,
  ShoppingBag,
  Hotel,
  Calendar,
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { Category } from "@/lib/mock-data";
import {
  RouteAnimationController,
  type Checkpoint,
} from "@/lib/route-animation";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { AnimationConfig } from "@/lib/animations/types";
import { StraightAnimation } from "@/lib/animations/straight-animation";
import { TeleportAnimation } from "@/lib/animations/teleport-animation";
import { bakeAnimation } from "@/lib/animations/baker";
import { applyCameraState } from "@/lib/animations/camera-controller";

interface MapViewProps {
  locations: Location[];
  selectedLocationId: string | null;
  onLocationSelect: (id: string) => void;
  animationPointA?: string | null;
  animationPointB?: string | null;
}

export interface MapViewRef {
  createAnimation: (config: AnimationConfig) => void;
}

// Get Mapbox token from environment variable
// In Next.js, client-side env variables must be prefixed with NEXT_PUBLIC_
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

// Função para obter o ícone e cor baseado na categoria
function getCategoryIcon(category: Category) {
  switch (category) {
    case "culture":
      return {
        Icon: Landmark,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
      };
    case "food":
      return {
        Icon: UtensilsCrossed,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
      };
    case "nature":
      return {
        Icon: TreePine,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      };
    case "shopping":
      return {
        Icon: ShoppingBag,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
      };
    case "stay":
      return {
        Icon: Hotel,
        color: "text-indigo-600",
        bgColor: "bg-indigo-50",
        borderColor: "border-indigo-200",
      };
    case "event":
      return {
        Icon: Calendar,
        color: "text-pink-600",
        bgColor: "bg-pink-50",
        borderColor: "border-pink-200",
      };
    default:
      return {
        Icon: MapPin,
        color: "text-gray-600",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
      };
  }
}

export const MapView = forwardRef<MapViewRef, MapViewProps>(
  (
    {
      locations,
      selectedLocationId,
      onLocationSelect,
      animationPointA,
      animationPointB,
    },
    ref
  ) => {
    const mapRef = useRef<any>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const animationControllerRef = useRef<RouteAnimationController | null>(
      null
    );
    const [viewState, setViewState] = useState<ViewState>({
      latitude: 34.9671,
      longitude: 135.7727,
      zoom: 11,
      bearing: 0,
      pitch: 0,
      padding: { top: 0, bottom: 0, left: 0, right: 0 },
    });
    const [routeData, setRouteData] =
      useState<GeoJSON.FeatureCollection | null>(null);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [animationProgress, setAnimationProgress] = useState(0);
    const [cursorPosition, setCursorPosition] = useState<
      [number, number] | null
    >(null);
    const [partialRoute, setPartialRoute] =
      useState<GeoJSON.FeatureCollection | null>(null);
    const [isSeeking, setIsSeeking] = useState(false);

    // Expor método createAnimation via ref
    useImperativeHandle(ref, () => ({
      createAnimation: (config: AnimationConfig) => {
        // Criar estratégia apropriada baseada no tipo
        let strategy;
        switch (config.type) {
          case "straight":
            strategy = new StraightAnimation();
            break;
          case "route":
            // TODO: Implementar RouteAnimation
            strategy = new StraightAnimation(); // Fallback temporário
            break;
          case "teleport":
            strategy = new TeleportAnimation();
            break;
          default:
            strategy = new StraightAnimation();
        }

        // Fazer bake da animação
        const frames = bakeAnimation(strategy, config);

        // Criar ou atualizar controlador
        if (!animationControllerRef.current) {
          animationControllerRef.current = new RouteAnimationController({
            callbacks: {
              onProgressUpdate: (progress) => {
                setAnimationProgress(progress);
              },
              onCursorPositionUpdate: (position) => {
                setCursorPosition(position);
              },
              onRouteUpdate: (partial) => {
                setPartialRoute(partial);
              },
              onCameraUpdate: (cameraState) => {
                if (mapRef.current && isMapLoaded) {
                  try {
                    applyCameraState(mapRef.current, cameraState, {
                      duration: 0,
                    });
                  } catch (error) {
                    console.warn("Error updating camera:", error);
                  }
                }
              },
              onComplete: () => {
                setTimeout(() => setIsPreviewMode(false), 1500);
              },
            },
          });
        } else {
          animationControllerRef.current.updateCallbacks({
            onProgressUpdate: (progress) => {
              setAnimationProgress(progress);
            },
            onCursorPositionUpdate: (position) => {
              setCursorPosition(position);
            },
            onRouteUpdate: (partial) => {
              setPartialRoute(partial);
            },
            onCameraUpdate: (cameraState) => {
              console.log("cameraState", cameraState);
              if (mapRef.current && isMapLoaded) {
                try {
                  applyCameraState(mapRef.current, cameraState, {
                    duration: 0,
                  });
                } catch (error) {
                  console.warn("Error updating camera:", error);
                }
              }
            },
            onComplete: () => {
              setTimeout(() => setIsPreviewMode(false), 1500);
            },
          });
        }

        // Inicializar com frames baked
        animationControllerRef.current.initialize(
          frames,
          config.duration || 3000
        );

        // Ir para posição inicial (primeiro frame) - ponto A
        // Aguardar um pouco para garantir que o mapa está pronto
        setTimeout(() => {
          if (frames.length > 0 && mapRef.current && isMapLoaded) {
            console.log("frames", frames);
            const firstFrame = frames[0];
            try {
              applyCameraState(mapRef.current, firstFrame.cameraState, {
                duration: 500, // Animação suave para posição inicial
              });
            } catch (error) {
              console.warn("Error setting initial camera position:", error);
            }

            // Definir rota inicial (se houver)
            if (firstFrame.routeData) {
              setRouteData(firstFrame.routeData);
            } else {
              setRouteData(null);
            }
          }
        }, 100);

        // Ativar modo preview
        setIsPreviewMode(true);

        // Resetar progresso para 0
        setAnimationProgress(0);
      },
    }));

    // Fly to location when selected
    useEffect(() => {
      if (selectedLocationId && mapRef.current && !isPreviewMode) {
        const location = locations.find((l) => l.id === selectedLocationId);
        if (location) {
          mapRef.current.flyTo({
            center: [location.lng, location.lat],
            zoom: 14,
            duration: 2000,
            essential: true,
          });
        }
      }
    }, [selectedLocationId, locations, isPreviewMode]);

    // Show error if token is not configured
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN.trim() === "") {
      return (
        <div className="w-full h-full bg-muted/20 relative overflow-hidden rounded-3xl border border-border/50 shadow-2xl flex items-center justify-center">
          <div className="text-center p-6">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive font-medium">
              Mapbox token não configurado
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Configure NEXT_PUBLIC_MAPBOX_TOKEN no arquivo .env
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full bg-muted/20 relative overflow-hidden rounded-3xl border border-border/50 shadow-2xl">
        <Map
          ref={mapRef}
          {...viewState}
          onLoad={() => setIsMapLoaded(true)}
          onMove={(evt) => {
            // Bloquear movimento do mapa durante preview mode
            if (!isPreviewMode) {
              setViewState(evt.viewState);
            }
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/light-v11"
          mapboxAccessToken={MAPBOX_TOKEN}
          attributionControl={false}
        >
          <NavigationControl position="bottom-right" />

          {/* Renderizar rota completa (quando não está em preview) */}
          {routeData && !isPreviewMode && (
            <Source id="route" type="geojson" data={routeData}>
              <Layer
                id="route"
                type="line"
                layout={{
                  "line-join": "round",
                  "line-cap": "round",
                }}
                paint={{
                  "line-color": "hsl(199, 89%, 48%)",
                  "line-width": 4,
                  "line-opacity": 0.7,
                }}
              />
            </Source>
          )}

          {/* Renderizar rota parcial animada */}
          {isPreviewMode && partialRoute && (
            <Source id="route-animated" type="geojson" data={partialRoute}>
              <Layer
                id="route-animated"
                type="line"
                layout={{
                  "line-join": "round",
                  "line-cap": "round",
                }}
                paint={{
                  "line-color": "hsl(199, 89%, 48%)",
                  "line-width": 5,
                  "line-opacity": 0.9,
                }}
              />
            </Source>
          )}

          {/* Cursor animado */}
          {isPreviewMode && cursorPosition && (
            <Marker
              latitude={cursorPosition[1]}
              longitude={cursorPosition[0]}
              anchor="center"
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: 1,
                }}
                transition={{
                  scale: {
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                  opacity: {
                    duration: 0.3,
                  },
                }}
                className="relative"
              >
                <div className="w-5 h-5 bg-primary rounded-full border-2 border-white shadow-xl z-10 relative" />
                <motion.div
                  className="absolute inset-0 w-5 h-5 bg-primary/40 rounded-full"
                  animate={{
                    scale: [1, 2, 1],
                    opacity: [0.6, 0, 0.6],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-black/20 rounded-full blur-sm" />
              </motion.div>
            </Marker>
          )}

          {locations.map((loc) => {
            const { Icon, color, bgColor, borderColor } = getCategoryIcon(
              loc.category
            );
            const isSelected = selectedLocationId === loc.id;
            const isPointA = animationPointA === loc.id;
            const isPointB = animationPointB === loc.id;

            return (
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
                    animate={{
                      scale: 1,
                      rotate: isSelected ? 0 : 0,
                    }}
                    whileHover={{ scale: 1.2 }}
                    className={`
                    p-2 rounded-full shadow-lg transition-all duration-300 border-2
                    ${
                      isPointA
                        ? "bg-green-500 text-white scale-125 z-50 border-green-600"
                        : isPointB
                        ? "bg-blue-500 text-white scale-125 z-50 border-blue-600"
                        : isSelected
                        ? "bg-primary text-primary-foreground scale-125 z-50 border-primary"
                        : `${bgColor} ${color} ${borderColor} hover:scale-110`
                    }
                  `}
                  >
                    <Icon
                      className={`w-5 h-5 ${isSelected ? "fill-current" : ""}`}
                    />
                  </motion.div>

                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs py-1 px-2 rounded whitespace-nowrap pointer-events-none z-10">
                    {loc.name}
                    {isPointA && " (A)"}
                    {isPointB && " (B)"}
                  </div>
                </div>
              </Marker>
            );
          })}
        </Map>

        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-black/5 to-transparent h-32" />

        {/* Controles de visualização da rota - Estilo player de vídeo */}
        {isPreviewMode && animationControllerRef.current && (
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="bg-white/95 backdrop-blur-md shadow-2xl border border-border/50 rounded-xl p-4 space-y-3">
              {/* Barra de progresso (Slider) */}
              <div className="flex items-center gap-3">
                <Slider
                  value={[animationProgress * 100]}
                  max={100}
                  step={0.1}
                  className="flex-1"
                  onValueChange={(value) => {
                    if (!animationControllerRef.current) return;
                    const progress = value[0] / 100;
                    setIsSeeking(true);
                    animationControllerRef.current.seek(progress);
                    setAnimationProgress(progress);
                  }}
                  onValueCommit={(value) => {
                    if (!animationControllerRef.current) return;
                    const progress = value[0] / 100;
                    animationControllerRef.current.seek(progress);
                    setIsSeeking(false);
                  }}
                />
                <div className="text-xs text-muted-foreground min-w-[3rem] text-right">
                  {Math.round(animationProgress * 100)}%
                </div>
              </div>

              {/* Controles de reprodução */}
              <div className="flex items-center justify-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    if (!animationControllerRef.current) return;
                    animationControllerRef.current.seek(0);
                    setAnimationProgress(0);
                  }}
                  className="h-9 w-9"
                >
                  <SkipBack className="w-4 h-4" />
                </Button>

                <Button
                  size="icon"
                  variant={isPreviewMode ? "default" : "outline"}
                  onClick={() => {
                    if (!animationControllerRef.current) return;

                    if (animationControllerRef.current.isActive()) {
                      animationControllerRef.current.pause();
                    } else {
                      animationControllerRef.current.play();
                    }
                  }}
                  className="h-10 w-10"
                >
                  {animationControllerRef.current?.isActive() ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </Button>

                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    if (!animationControllerRef.current) return;
                    animationControllerRef.current.seek(1);
                    setAnimationProgress(1);
                  }}
                  className="h-9 w-9"
                >
                  <SkipForward className="w-4 h-4" />
                </Button>

                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    if (!animationControllerRef.current) return;
                    animationControllerRef.current.rewind();
                    setAnimationProgress(0);
                  }}
                  className="h-9 w-9"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

MapView.displayName = "MapView";
