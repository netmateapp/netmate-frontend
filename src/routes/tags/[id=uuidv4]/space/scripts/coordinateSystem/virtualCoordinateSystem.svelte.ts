import type { Reactive, Reactivity } from "../../../../../../lib/scripts/extension/reactivity";
import { CHUNK_SIDE_LENGTH, type ChunkLocation } from "../chunk/chunk";

export class VirtualCoordinate {
  public readonly coordinate: number;

  private constructor(coordinate: number) {
    this.coordinate = coordinate;
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

  static fromChunkLocation(location: ChunkLocation): VirtualLocation {
    return VirtualLocation.of(
      VirtualCoordinate.of(location.chunkX.coordinate * CHUNK_SIDE_LENGTH),
      VirtualCoordinate.of(location.chunkY.coordinate * CHUNK_SIDE_LENGTH)
    );
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
