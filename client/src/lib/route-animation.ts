import { BakedFrame } from "./animations/types";

export interface Checkpoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface RouteAnimationCallbacks {
  onProgressUpdate?: (progress: number) => void;
  onCursorPositionUpdate?: (position: [number, number] | null) => void;
  onRouteUpdate?: (partialRoute: GeoJSON.FeatureCollection | null) => void;
  onCameraUpdate?: (cameraState: {
    center: [number, number];
    zoom: number;
    bearing?: number;
    pitch?: number;
  }) => void;
  onComplete?: () => void;
  onStart?: () => void;
  onUpdate?: () => void;
}

export interface RouteAnimationConfig {
  callbacks?: RouteAnimationCallbacks;
}

/**
 * Controlador de animação baseado em frames baked (pré-calculados)
 * Remove dependência do GSAP Timeline automático
 */
export class RouteAnimationController {
  private bakedFrames: BakedFrame[] = [];
  private currentProgress: number = 0;
  private isPlaying: boolean = false;
  private animationFrameId: number | null = null;
  private startTime: number = 0;
  private duration: number = 3000; // ms
  private config: RouteAnimationConfig;
  private callbacks: RouteAnimationCallbacks;

  constructor(config: RouteAnimationConfig = {}) {
    this.config = config;
    this.callbacks = config.callbacks || {};
  }

  /**
   * Inicializa a animação com frames baked
   */
  initialize(frames: BakedFrame[], duration: number = 3000) {
    this.bakedFrames = frames;
    this.duration = duration;
    this.currentProgress = 0;
    this.isPlaying = false;
    this.stop();
  }

  /**
   * Vai para um progresso específico (0 a 1)
   */
  seek(progress: number) {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    this.currentProgress = clampedProgress;
    this.updateFromProgress(clampedProgress);
  }

  /**
   * Retorna o progresso atual (0 a 1)
   */
  getProgress(): number {
    return this.currentProgress;
  }

  /**
   * Retorna o frame atual
   */
  getCurrentFrame(): BakedFrame | null {
    if (this.bakedFrames.length === 0) return null;
    const frameIndex = Math.round(
      this.currentProgress * (this.bakedFrames.length - 1)
    );
    return this.bakedFrames[frameIndex] || null;
  }

  /**
   * Retorna um frame específico baseado no progresso
   */
  getFrame(progress: number): BakedFrame | null {
    if (this.bakedFrames.length === 0) return null;
    const clampedProgress = Math.max(0, Math.min(1, progress));
    const frameIndex = Math.round(
      clampedProgress * (this.bakedFrames.length - 1)
    );
    return this.bakedFrames[frameIndex] || null;
  }

  /**
   * Reproduz a animação
   */
  play() {
    if (this.isPlaying || this.bakedFrames.length === 0) return;

    this.isPlaying = true;
    this.startTime = performance.now() - this.currentProgress * this.duration;
    this.callbacks.onStart?.();
    this.animate();
  }

  /**
   * Pausa a animação
   */
  pause() {
    this.isPlaying = false;
    this.stop();
  }

  /**
   * Reinicia a animação do início
   */
  restart() {
    this.currentProgress = 0;
    this.startTime = performance.now();
    if (this.isPlaying) {
      this.animate();
    } else {
      this.updateFromProgress(0);
    }
  }

  /**
   * Rebobina a animação (volta ao início)
   */
  rewind() {
    this.pause();
    this.currentProgress = 0;
    this.updateFromProgress(0);
  }

  /**
   * Verifica se a animação está reproduzindo
   */
  isActive(): boolean {
    return this.isPlaying;
  }

  /**
   * Verifica se a animação está pausada
   */
  paused(): boolean {
    return !this.isPlaying;
  }

  /**
   * Retorna a posição atual do cursor
   */
  getCursorPosition(): [number, number] | null {
    const frame = this.getCurrentFrame();
    return frame?.cursorPosition || null;
  }

  /**
   * Retorna o estado atual da câmera
   */
  getCameraState(): {
    center: [number, number];
    zoom: number;
    bearing?: number;
    pitch?: number;
  } | null {
    const frame = this.getCurrentFrame();
    return frame?.cameraState || null;
  }

  /**
   * Retorna a rota parcial atual
   */
  getRouteData(): GeoJSON.FeatureCollection | null {
    const frame = this.getCurrentFrame();
    return frame?.routeData || null;
  }

  /**
   * Loop de animação usando requestAnimationFrame
   */
  private animate() {
    if (!this.isPlaying) return;

    const now = performance.now();
    const elapsed = now - this.startTime;
    const progress = Math.min(1, elapsed / this.duration);

    this.currentProgress = progress;
    this.updateFromProgress(progress);

    if (progress >= 1) {
      // Animação completa
      this.isPlaying = false;
      this.callbacks.onComplete?.();
    } else {
      // Continuar animação
      this.animationFrameId = requestAnimationFrame(() => this.animate());
    }
  }

  /**
   * Para a animação
   */
  private stop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Atualiza visualização baseado no progresso
   */
  private updateFromProgress(progress: number) {
    const frame = this.getFrame(progress);
    if (!frame) return;

    // Atualizar callbacks
    this.callbacks.onProgressUpdate?.(progress);
    this.callbacks.onCursorPositionUpdate?.(frame.cursorPosition);
    this.callbacks.onRouteUpdate?.(frame.routeData || null);
    this.callbacks.onCameraUpdate?.(frame.cameraState);
    this.callbacks.onUpdate?.();
  }

  /**
   * Destrói o controlador e limpa recursos
   */
  destroy() {
    this.stop();
    this.bakedFrames = [];
    this.currentProgress = 0;
    this.isPlaying = false;
  }

  /**
   * Atualiza os callbacks
   */
  updateCallbacks(callbacks: RouteAnimationCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }
}
