import { AnimationStrategy, AnimationConfig, BakedFrame } from "./types";

/**
 * Pré-calcula todos os frames de uma animação
 * @param strategy Estratégia de animação a ser usada
 * @param config Configuração da animação
 * @returns Array de frames pré-calculados
 */
export function bakeAnimation(
  strategy: AnimationStrategy,
  config: AnimationConfig
): BakedFrame[] {
  return strategy.bake(config);
}
