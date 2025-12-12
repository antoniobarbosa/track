import { BaseAnimation } from "./base-animation";
import { BakedFrame, CameraState } from "./types";
import { easeInOut } from "./camera-controller";

/**
 * Animação de teleporte entre ponto A e B
 * - Não renderiza linha
 * - Zoom in no ponto A
 * - Zoom out
 * - Translate rápido até o ponto B
 * - Zoom in no ponto B
 */
export class TeleportAnimation extends BaseAnimation {
  protected calculateFrame(progress: number): BakedFrame {
    if (!this.config) {
      throw new Error("Animation not initialized. Call bake() first.");
    }

    const { pointA, pointB } = this.config;

    // Teleporte não tem cursor visível durante a transição
    const cursorPosition: [number, number] | null = null;

    // Cálculo do zoom e posição baseado no progresso
    // 0-25%: zoom in no ponto A (11 → 15)
    // 25-50%: zoom out (15 → 11) enquanto ainda no ponto A
    // 50-75%: translate rápido para ponto B (zoom 11)
    // 75-100%: zoom in no ponto B (11 → 15)
    let zoom: number;
    let center: [number, number];

    if (progress <= 0.25) {
      // Primeiros 25%: zoom in no ponto A
      const t = progress / 0.25;
      zoom = 11 + (15 - 11) * easeInOut(t);
      center = [pointA.lng, pointA.lat];
    } else if (progress <= 0.5) {
      // 25% a 50%: zoom out no ponto A
      const t = (progress - 0.25) / 0.25;
      zoom = 15 - (15 - 11) * easeInOut(t);
      center = [pointA.lng, pointA.lat];
    } else if (progress <= 0.75) {
      // 50% a 75%: translate rápido para ponto B (mantém zoom 11)
      const t = (progress - 0.5) / 0.25;
      // Easing mais rápido para o translate
      const easedT = t * t; // ease-in para movimento rápido
      const lng = pointA.lng + (pointB.lng - pointA.lng) * easedT;
      const lat = pointA.lat + (pointB.lat - pointA.lat) * easedT;
      zoom = 11;
      center = [lng, lat];
    } else {
      // Últimos 25%: zoom in no ponto B
      const t = (progress - 0.75) / 0.25;
      zoom = 11 + (15 - 11) * easeInOut(t);
      center = [pointB.lng, pointB.lat];
    }

    const cameraState: CameraState = {
      center,
      zoom,
    };

    // Teleporte não renderiza linha
    const routeData: GeoJSON.FeatureCollection | null = null;

    return {
      progress,
      cursorPosition,
      cameraState,
      routeData,
    };
  }
}

