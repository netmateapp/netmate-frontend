import type { Scale } from "../scale";
import type { HtmlCoordinate } from "./htmlCoordinateSystem";

export class RealCoordinate {
  public readonly scale: Scale;
  public readonly coordinate: number;

  private constructor(htmlCoordinate: HtmlCoordinate, scale: Scale) {
    this.scale = scale;
    this.coordinate = htmlCoordinate.coordinate * scale.scale;
  }
}

export class RealLocation {
  public readonly x: RealCoordinate;
  public readonly y: RealCoordinate;

  private constructor(x: RealCoordinate, y: RealCoordinate) {
    if (!RealLocation.isValid(x, y)) throw new Error(`The scales of x and y coordinates must match.`);
    this.x = x;
    this.y = y;
  }

  private static isValid(x: RealCoordinate, y: RealCoordinate) {
    return x.scale.scale === y.scale.scale;
  }

  static of(x: RealCoordinate, y: RealCoordinate): RealLocation {
    return new RealLocation(x, y);
  }
}
