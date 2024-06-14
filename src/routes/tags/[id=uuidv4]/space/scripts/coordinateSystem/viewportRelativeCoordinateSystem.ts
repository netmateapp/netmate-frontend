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