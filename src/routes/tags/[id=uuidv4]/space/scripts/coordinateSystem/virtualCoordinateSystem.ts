import type { Reactive, Reactivity } from "../reactivity";

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

export class ReactiveVirtualLocation implements Reactivity<VirtualLocation> {
  private location: VirtualLocation = $state(VIRTUAL_COORDINATE_SYSTEM_ORIGIN);

  constructor(initialLocation: VirtualLocation) {
    this.location = initialLocation;
  }

  reactiveValue(): Reactive<VirtualLocation> {
    return this.location;
  }

  update(newLocation: VirtualLocation) {
    this.location = newLocation;
  }
}
