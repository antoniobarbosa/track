import { BaseAnimation } from "./base-animation";
import { BakedFrame, CameraState } from "./types";
import { easeInOut } from "./camera-controller";

/**
 * Animação de linha reta entre ponto A e B
 * - Zoom in no início (ponto A)
 * - Zoom out durante trajeto
 * - Zoom in no final (ponto B)
 */
export class StraightAnimation extends BaseAnimation {
  protected calculateFrame(progress: number): BakedFrame {
    if (!this.config) {
      throw new Error("Animation not initialized. Call bake() first.");
    }

    const { pointA, pointB } = this.config;

    // Interpolação linear da posição do cursor
    const cursorLng = pointA.lng + (pointB.lng - pointA.lng) * progress;
    const cursorLat = pointA.lat + (pointB.lat - pointA.lat) * progress;
    const cursorPosition: [number, number] = [cursorLng, cursorLat];

    // Cálculo do zoom baseado no progresso
    // 0-20%: zoom in (11 → 15) no ponto A
    // 20-80%: zoom out (15 → 11) durante trajeto
    // 80-100%: zoom in (11 → 15) no ponto B
    let zoom: number;
    if (progress <= 0.2) {
      // Primeiros 20%: zoom in no ponto A
      const t = progress / 0.2;
      zoom = 11 + (15 - 11) * easeInOut(t);
    } else if (progress <= 0.8) {
      // 20% a 80%: zoom out durante trajeto
      const t = (progress - 0.2) / 0.6;
      zoom = 15 - (15 - 11) * easeInOut(t);
    } else {
      // Últimos 20%: zoom in no ponto B
      const t = (progress - 0.8) / 0.2;
      zoom = 11 + (15 - 11) * easeInOut(t);
    }

    // Cálculo do centro da câmera
    // Durante zoom in, foca no ponto correspondente
    // Durante zoom out, segue o cursor
    let center: [number, number];
    if (progress <= 0.2) {
      // Foca no ponto A durante zoom in inicial
      center = [pointA.lng, pointA.lat];
    } else if (progress <= 0.8) {
      // Segue o cursor durante zoom out
      center = cursorPosition;
    } else {
      // Foca no ponto B durante zoom in final
      center = [pointB.lng, pointB.lat];
    }

    const cameraState: CameraState = {
      center,
      zoom,
    };

    // Criar rota como linha reta
    const routeData: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [
              [pointA.lng, pointA.lat],
              [pointB.lng, pointB.lat],
            ],
          },
        },
      ],
    };

    return {
      progress,
      cursorPosition,
      cameraState,
      routeData,
    };
  }
}
