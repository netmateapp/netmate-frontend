export class RealCoordinate {
  public readonly coordinate: number;

  private constructor(coordinate: number) {
    this.coordinate = coordinate;
  }

  static of(coordinate: number) {
    return new RealCoordinate(coordinate);
  }
}

export class RealLocation {
  public readonly x: RealCoordinate;
  public readonly y: RealCoordinate;

  private constructor(x: RealCoordinate, y: RealCoordinate) {
    this.x = x;
    this.y = y;
  }

  static of(x: RealCoordinate, y: RealCoordinate): RealLocation {
    return new RealLocation(x, y);
  }
}
