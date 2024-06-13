import type { Option } from "$lib/option";

export type Finalizer = () => void;
export type RuneEffect = () => void;
export type Initializer = (() => Finalizer) | RuneEffect;

export interface LifeCycle {
  createInitializationEffect(): Initializer;
}

export function invokeInitializer(initializer: Initializer): Option<Finalizer> {
  const returnValue: Finalizer | void = initializer();
  const finalizer: Option<Finalizer> = returnValue !== undefined ? returnValue : undefined;
  return finalizer;
}

export function combineInitializers(...initializers: Initializer[]): Initializer {
  return () => {
    const finalizers: Finalizer[] = initializers
      .map(initializer => invokeInitializer(initializer))
      .filter(option => option !== undefined);

    return () => {
      finalizers.forEach(finalizer => finalizer());
    }
  }
}