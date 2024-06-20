import type { Reactive } from "../../../../../../lib/scripts/extension/reactivity";
import type { Scale } from "../scale.svelte";
import { RealCoordinate, RealLocation } from "./realCoordinateSystem";
import type { ViewportHeight, ViewportRelativePosition, ViewportWidth } from "./viewportRelativeCoordinateSystem.svelte";
import type { VirtualLocation } from "./virtualCoordinateSystem.svelte";

export class LocationTransformer {
  private readonly viewCenterPosition: ViewportRelativePosition;

  constructor(viewCenterPosition: ViewportRelativePosition) {
    this.viewCenterPosition = viewCenterPosition;
  }

  transformToRealLocation(
    viewCenterLocation: Reactive<VirtualLocation>,
    sourceLocation: VirtualLocation,
    viewportWidth: Reactive<ViewportWidth>,
    viewportHeight: Reactive<ViewportHeight>,
    scale: Reactive<Scale>
  ): RealLocation {
    const scaledViewCenterLocation: RealLocation = LocationTransformer.scaleToRealLocation(viewCenterLocation, scale);
    const scaledSourceLocation: RealLocation = LocationTransformer.scaleToRealLocation(sourceLocation, scale);
    const distanceX: number = scaledSourceLocation.x.coordinate - scaledViewCenterLocation.x.coordinate;
    const distanceY: number = scaledSourceLocation.y.coordinate - scaledViewCenterLocation.y.coordinate;

    const viewCenterRealLocationX = RealCoordinate.of(viewportWidth.width * scale.scale * this.viewCenterPosition.x.ratio);
    const viewCenterRealLocationY = RealCoordinate.of(viewportHeight.height * scale.scale * this.viewCenterPosition.y.ratio);

    const sourceRealLocationX = RealCoordinate.of(viewCenterRealLocationX.coordinate + distanceX);
    const sourceRealLocationY = RealCoordinate.of(viewCenterRealLocationY.coordinate + distanceY);
    return RealLocation.of(sourceRealLocationX, sourceRealLocationY);
  }

  private static scaleToRealLocation(location: VirtualLocation, scale: Scale) {
    const scaledLocationX = RealCoordinate.of(location.x.coordinate * scale.scale);
    const scaledLocationY = RealCoordinate.of(location.y.coordinate * scale.scale);
    return RealLocation.of(scaledLocationX, scaledLocationY);
  }
}