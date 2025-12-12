import {
  AnimationStrategy,
  AnimationConfig,
  BakedFrame,
  CameraState,
} from "./types";

/**
 * Classe base abstrata para animações
 * Implementa o padrão Strategy
 */
export abstract class BaseAnimation implements AnimationStrategy {
  protected frames: BakedFrame[] = [];
  protected config: AnimationConfig | null = null;

  /**
   * Pré-calcula todos os frames da animação
   */
  bake(config: AnimationConfig): BakedFrame[] {
    this.config = config;
    const resolution = config.resolution || 60; // frames por segundo
    const duration = config.duration || 3000; // ms
    const totalFrames = Math.ceil((duration / 1000) * resolution);

    this.frames = [];

    for (let i = 0; i <= totalFrames; i++) {
      const progress = i / totalFrames;
      const frame = this.calculateFrame(progress);
      this.frames.push(frame);
    }

    return this.frames;
  }

  /**
   * Retorna um frame específico baseado no progresso (0-1)
   */
  getFrame(progress: number): BakedFrame | null {
    if (this.frames.length === 0) return null;

    // Garantir que progress está entre 0 e 1
    const clampedProgress = Math.max(0, Math.min(1, progress));

    // Encontrar o frame mais próximo
    const frameIndex = Math.round(clampedProgress * (this.frames.length - 1));
    return this.frames[frameIndex] || null;
  }

  /**
   * Retorna o estado da câmera para um progresso específico
   */
  getCameraState(progress: number): CameraState | null {
    const frame = this.getFrame(progress);
    return frame?.cameraState || null;
  }

  /**
   * Método abstrato que cada implementação deve definir
   * Calcula um frame específico baseado no progresso
   */
  protected abstract calculateFrame(progress: number): BakedFrame;

  /**
   * Retorna todos os frames baked
   */
  getFrames(): BakedFrame[] {
    return [...this.frames];
  }

  /**
   * Retorna a configuração atual
   */
  getConfig(): AnimationConfig | null {
    return this.config;
  }
}
