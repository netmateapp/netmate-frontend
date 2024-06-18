import type { Finalizer, LifeCycle } from "../../../../../lib/scripts/extension/lifeCycle";
import type { Reactive, Reactivity } from "../../../../../lib/scripts/extension/reactivity";

export const MAX_SCALE: number = 1.0;
export const MIN_SCALE: number = 0.5;
export const DEFAULT_SCALE: number = MAX_SCALE;

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

// 実座標はscale=1.0時のHTML座標 * scaleで決定される
export class ReactiveScale implements Reactivity<Scale> {
  private scale: Scale = $state(new Scale(DEFAULT_SCALE));

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
    if (currentScale < MAX_SCALE) {
      const newScale: number = ScaleUpdater.roundToTenth(currentScale + ScaleUpdater.INCREMENTATION);
      this.scale.update(new Scale(newScale));
    }
  }

  tryScaleDown() {
    const currentScale = this.scale.reactiveValue().scale;
    if (currentScale > MIN_SCALE) {
      const newScale: number = ScaleUpdater.roundToTenth(currentScale - ScaleUpdater.INCREMENTATION);
      this.scale.update(new Scale(newScale));
    }
  }

  initialize(): Finalizer {
    const onWheel = (event: WheelEvent) => this.onWheel(event);
    document.addEventListener("wheel", onWheel);
    return () => {
      document.removeEventListener("wheel", onWheel);
    };
  }

  private static roundToTenth(decimal: number): number {
    return Math.round(decimal * 10) / 10;
  }
}
