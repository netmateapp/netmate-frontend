export class HtmlCoordinate {
  public readonly coordinate: number;

  private constructor(coordinate: number) {
    if (!HtmlCoordinate.isValid(coordinate)) throw new Error(`A coordinate must be an integer.`);
    this.coordinate = coordinate;
  }

  private static isValid(coordinate: number): boolean {
    return Number.isInteger(coordinate);
  }

  static of(coordinate: number): HtmlCoordinate {
    return new HtmlCoordinate(coordinate);
  }
}

export class HtmlLocation {
  public readonly x: HtmlCoordinate;
  public readonly y: HtmlCoordinate;

  private constructor(x: HtmlCoordinate, y: HtmlCoordinate) {
    this.x = x;
    this.y = y;
  }

  static of(x: HtmlCoordinate, y: HtmlCoordinate): HtmlLocation {
    return new HtmlLocation(x, y);
  }
}
