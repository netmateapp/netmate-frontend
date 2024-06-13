import type { Scale } from "./scale";

export class VirtualCoordinate {
  public readonly coordinate: number;

  private constructor(coordinate: number) {
    if (!VirtualCoordinate.isValid(coordinate)) throw new Error(`A coordinate must be an integer.`);
    this.coordinate = coordinate;
  }

  private static isValid(coordinate: number): boolean {
    return Number.isInteger(coordinate);
  }

  static of(coordinate: number): VirtualCoordinate {
    return new VirtualCoordinate(coordinate);
  }

  createOffsetCordinate(offset: VirtualCoordinate): VirtualCoordinate {
    return VirtualCoordinate.of(this.coordinate + offset.coordinate);
  }
}

export class VirtualLocation {
  public readonly x: VirtualCoordinate;
  public readonly y: VirtualCoordinate;

  private constructor(x: VirtualCoordinate, y: VirtualCoordinate) {
    this.x = x;
    this.y = y;
  }

  static of(x: VirtualCoordinate, y: VirtualCoordinate): VirtualLocation {
    return new VirtualLocation(x, y);
  }

  createOffsetLocation(offsetX: VirtualCoordinate, offsetY: VirtualCoordinate): VirtualLocation {
    return VirtualLocation.of(this.x.createOffsetCordinate(offsetX), this.y.createOffsetCordinate(offsetY));
  }
}

export const VIRTUAL_COORDINATE_SYSTEM_ORIGIN = VirtualLocation.of(VirtualCoordinate.of(0), VirtualCoordinate.of(0));

export class ReactiveVirtualLocation {
  private location: VirtualLocation = $state(VIRTUAL_COORDINATE_SYSTEM_ORIGIN);

  constructor(initialLocation: VirtualLocation) {
    this.location = initialLocation;
  }

  reactiveLocation(): VirtualLocation {
    return this.location;
  }

  update(newLocation: VirtualLocation) {
    this.location = newLocation;
  }
}

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
