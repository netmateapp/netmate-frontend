export type Finalizer = () => void;

export interface LifeCycle {
  initialize(): Finalizer;
}

export function composeLifeCycles(...lifeCycles: LifeCycle[]): LifeCycle {
  return {
    initialize: () => {
      const finalizers: Finalizer[] = lifeCycles.map(lifeCycle => lifeCycle.initialize());
      return () => {
        finalizers.forEach(finalizer => finalizer());
      };
    }
  };
}
