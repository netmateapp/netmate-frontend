import type { Finalizer, LifeCycle } from "../../../../../../lib/scripts/extension/lifeCycle";
import type { Reactive, Reactivity } from "../../../../../../lib/scripts/extension/reactivity";

export class ViewportWidth {
  public readonly width: number;

  constructor(width: number) {
    if (!ViewportWidth.isValid(width)) throw new Error(`A width must be non-negative number.`);
    this.width = width;
  }

  static isValid(width: number): boolean {
    return width >= 0;
  }

  static fromCurrentViewport(): ViewportWidth {
    return new ViewportWidth(window.innerWidth);
  }
}

export class ViewportHeight {
  public readonly height: number;

  constructor(height: number) {
    if (!ViewportHeight.isValid(height)) throw new Error(`A height must be non-negative number.`);
    this.height = height;
  }

  static isValid(height: number): boolean {
    return height >= 0;
  }

  static fromCurrentViewport(): ViewportHeight {
    return new ViewportHeight(window.innerHeight);
  }
}

export class ReactiveViewportWidth implements Reactivity<ViewportWidth> {
  private width: ViewportWidth = $state(new ViewportWidth(0));

  constructor(width: ViewportWidth) {
    this.width = width;
  }

  reactiveValue(): Reactive<ViewportWidth> {
    return this.width;
  }

  update(width: ViewportWidth) {
    this.width = width;
  }
}

export class ReactiveViewportHeight implements Reactivity<ViewportHeight> {
  private height: ViewportHeight = $state(new ViewportHeight(0));

  constructor(height: ViewportHeight) {
    this.height = height;
  }

  reactiveValue(): Reactive<ViewportHeight> {
    return this.height;
  }

  update(height: ViewportHeight) {
    this.height = height;
  }
}

export class ViewportSizeUpdater implements LifeCycle {
  private readonly width: ReactiveViewportWidth;
  private readonly height: ReactiveViewportHeight;

  constructor(width: ReactiveViewportWidth, height: ReactiveViewportHeight) {
    this.width = width;
    this.height = height;
  }

  onResize() {
    this.width.update(ViewportWidth.fromCurrentViewport());
    this.height.update(ViewportHeight.fromCurrentViewport());
  }

  initialize(): Finalizer {
    const onResize = () => this.onResize();
    document.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("resize", onResize);
    }
  }
}

export class ViewportRelativeCoordinate {
  public readonly ratio;

  private constructor(ratio: number) {
    this.ratio = ratio;
  }

  static of(ratio: number): ViewportRelativeCoordinate {
    return new ViewportRelativeCoordinate(ratio);
  }
}

export class ViewportRelativePosition {
  public readonly x: ViewportRelativeCoordinate;
  public readonly y: ViewportRelativeCoordinate;

  private constructor(x: ViewportRelativeCoordinate, y: ViewportRelativeCoordinate) {
    this.x = x;
    this.y = y;
  }

  static of(x: ViewportRelativeCoordinate, y: ViewportRelativeCoordinate): ViewportRelativePosition {
    return new ViewportRelativePosition(x, y);
  }
}
