import { Checkpoint } from "../route-animation";

/**
 * Tipos de animação disponíveis
 */
export type AnimationType = "straight" | "route" | "teleport";

/**
 * Estado da câmera em um frame
 */
export interface CameraState {
  center: [number, number]; // [lng, lat]
  zoom: number;
  bearing?: number;
  pitch?: number;
}

/**
 * Frame pré-calculado (baked) da animação
 */
export interface BakedFrame {
  progress: number; // 0-1
  cursorPosition: [number, number] | null; // [lng, lat]
  cameraState: CameraState;
  routeData?: GeoJSON.FeatureCollection | null; // Para route animation
}

/**
 * Configuração da animação fornecida pelo usuário
 */
export interface AnimationConfig {
  pointA: Checkpoint;
  pointB: Checkpoint;
  type: AnimationType;
  duration?: number; // Duração em ms (padrão: 3000)
  resolution?: number; // Frames por segundo (padrão: 60)
}

/**
 * Estratégia de animação (contrato base)
 */
export interface AnimationStrategy {
  /**
   * Pré-calcula todos os frames da animação
   */
  bake(config: AnimationConfig): BakedFrame[];

  /**
   * Retorna um frame específico baseado no progresso (0-1)
   */
  getFrame(progress: number): BakedFrame | null;

  /**
   * Retorna o estado da câmera para um progresso específico
   */
  getCameraState(progress: number): CameraState | null;
}
