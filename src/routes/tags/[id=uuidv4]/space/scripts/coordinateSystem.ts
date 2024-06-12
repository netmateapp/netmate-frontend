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
}

export const VIRTUAL_COORDINATE_SYSTEM_ORIGIN = VirtualLocation.of(VirtualCoordinate.of(0), VirtualCoordinate.of(0));

export class ReactiveVirtualLocation {
  private location: VirtualLocation = $state(VIRTUAL_COORDINATE_SYSTEM_ORIGIN);

  constructor(initialLocation: VirtualLocation) {
    this.location = initialLocation;
  }

  reactiveX(): VirtualCoordinate {
    return this.location.x;
  }

  reactiveY(): VirtualCoordinate {
    return this.location.y;
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
