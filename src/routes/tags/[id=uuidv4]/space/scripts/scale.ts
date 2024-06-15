import type { Finalizer, LifeCycle } from "../../../../../lib/scripts/extension/lifeCycle";
import type { Reactive, Reactivity } from "../../../../../lib/scripts/extension/reactivity";

export const MAX_SCALE = 1.0;
export const MIN_SCALE = 0.5;

export class Scale {
  public readonly scale: number;

  constructor(scale: number) {
    if (!Scale.isValid(scale)) throw new Error(`A scale must be between ${MIN_SCALE} and ${MAX_SCALE}.`);
    this.scale = scale;
  }

  private static isValid(scale: number): boolean {
    return MIN_SCALE <= scale && scale <= MAX_SCALE;
  }
}

const DEFAULT_SCALE = new Scale(MAX_SCALE);

// 実座標はscale=1.0時のHTML座標 * scaleで決定される
export class ReactiveScale implements Reactivity<Scale> {
  private scale: Scale = $state(DEFAULT_SCALE);

  constructor(scale: Scale) {
    this.scale = scale;
  }

  reactiveValue(): Reactive<Scale> {
    return this.scale;
  }

  update(scale: Scale) {
    this.scale = scale;
  }
}

export class ScaleUpdater implements LifeCycle {
  private readonly scale: ReactiveScale;
  private static INCREMENTATION: number = 0.1;

  constructor(scale: ReactiveScale) {
    this.scale = scale;
  }

  onWheel(event: WheelEvent) {
    if (event.deltaY > 0) this.tryScaleDown();
    else this.tryScaleUp();
  }

  tryScaleUp() {
    const currentScale = this.scale.reactiveValue().scale;
    if (currentScale < MAX_SCALE) this.scale.update(new Scale(currentScale + ScaleUpdater.INCREMENTATION));
  }

  tryScaleDown() {
    const currentScale = this.scale.reactiveValue().scale;
    if (currentScale > MIN_SCALE) this.scale.update(new Scale(currentScale - ScaleUpdater.INCREMENTATION));
  }

  initialize(): Finalizer {
    const onWheel = (event: WheelEvent) => this.onWheel(event);
    document.addEventListener("wheel", onWheel);
    return () => {
      document.removeEventListener("wheel", onWheel);
    };
  }
}
