import { CameraState } from "./types";

/**
 * Aplica um estado de câmera ao mapa Mapbox
 * @param map - Instância do mapa (pode ser do react-map-gl ou Mapbox GL JS direto)
 */
export function applyCameraState(
  map: any,
  cameraState: CameraState,
  options?: {
    duration?: number;
    easing?: (t: number) => number;
  }
): void {
  if (!map) return;

  const { center, zoom, bearing, pitch } = cameraState;
  const duration = options?.duration || 0; // 0 = instantâneo

  // react-map-gl expõe flyTo diretamente, mas para setCenter/setZoom precisa do getMap()
  // Vamos usar flyTo sempre, mas com duration 0 para mudança instantânea
  if (duration > 0) {
    // Animação suave usando flyTo
    if (map.flyTo && typeof map.flyTo === "function") {
      try {
        map.flyTo({
          center: center,
          zoom: zoom,
          bearing: bearing,
          pitch: pitch,
          duration: duration,
          essential: true,
        });
      } catch (error) {
        console.warn("Error calling flyTo:", error);
      }
    } else if (map.getMap && typeof map.getMap === "function") {
      try {
        const mapInstance = map.getMap();
        if (mapInstance && mapInstance.flyTo) {
          mapInstance.flyTo({
            center: center,
            zoom: zoom,
            bearing: bearing,
            pitch: pitch,
            duration: duration,
            essential: true,
          });
        }
      } catch (error) {
        console.warn("Error calling getMap().flyTo:", error);
      }
    }
  } else {
    // Mudança instantânea - usar jumpTo ou getMap().jumpTo
    if (map.jumpTo && typeof map.jumpTo === "function") {
      try {
        map.jumpTo({
          center: center,
          zoom: zoom,
          bearing: bearing,
          pitch: pitch,
        });
      } catch (error) {
        console.warn("Error calling jumpTo:", error);
      }
    } else if (map.getMap && typeof map.getMap === "function") {
      try {
        const mapInstance = map.getMap();
        if (mapInstance && mapInstance.jumpTo) {
          mapInstance.jumpTo({
            center: center,
            zoom: zoom,
            bearing: bearing,
            pitch: pitch,
          });
        }
      } catch (error) {
        console.warn("Error calling getMap().jumpTo:", error);
      }
    } else {
      // Fallback: tentar métodos diretos
      try {
        if (map.setCenter && typeof map.setCenter === "function")
          map.setCenter(center);
        if (map.setZoom && typeof map.setZoom === "function") map.setZoom(zoom);
        if (
          bearing !== undefined &&
          map.setBearing &&
          typeof map.setBearing === "function"
        )
          map.setBearing(bearing);
        if (
          pitch !== undefined &&
          map.setPitch &&
          typeof map.setPitch === "function"
        )
          map.setPitch(pitch);
      } catch (error) {
        console.warn("Error calling direct map methods:", error);
      }
    }
  }
}

/**
 * Interpola entre dois estados de câmera
 */
export function interpolateCameraState(
  from: CameraState,
  to: CameraState,
  t: number
): CameraState {
  // Clamp t entre 0 e 1
  const clampedT = Math.max(0, Math.min(1, t));

  // Interpolação linear para center
  const center: [number, number] = [
    from.center[0] + (to.center[0] - from.center[0]) * clampedT,
    from.center[1] + (to.center[1] - from.center[1]) * clampedT,
  ];

  // Interpolação linear para zoom
  const zoom = from.zoom + (to.zoom - from.zoom) * clampedT;

  // Interpolação linear para bearing (se ambos tiverem)
  const bearing =
    from.bearing !== undefined && to.bearing !== undefined
      ? from.bearing + (to.bearing - from.bearing) * clampedT
      : to.bearing ?? from.bearing;

  // Interpolação linear para pitch (se ambos tiverem)
  const pitch =
    from.pitch !== undefined && to.pitch !== undefined
      ? from.pitch + (to.pitch - from.pitch) * clampedT
      : to.pitch ?? from.pitch;

  return {
    center,
    zoom,
    bearing,
    pitch,
  };
}

/**
 * Função de easing suave (ease-in-out)
 */
export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}
