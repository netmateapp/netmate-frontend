import type { Scale } from "../scale";
import { RealCoordinate, RealLocation } from "./realCoordinateSystem";
import type { ViewportHeight, ViewportRelativePosition, ViewportWidth } from "./viewportRelativeCoordinateSystem";
import type { VirtualLocation } from "./virtualCoordinateSystem";

export class LocationTransformer {
  private readonly viewCenterPosition: ViewportRelativePosition;

  constructor(viewCenterPosition: ViewportRelativePosition) {
    this.viewCenterPosition = viewCenterPosition;
  }

  transformToRealLocation(
    reactiveViewCenterLocation: VirtualLocation,
    sourceLocation: VirtualLocation,
    reactiveViewportWidth: ViewportWidth,
    reactiveViewportHeight: ViewportHeight,
    reactiveScale: Scale
  ): RealLocation {
    const scaledViewCenterLocation: RealLocation = LocationTransformer.scaleToRealLocation(reactiveViewCenterLocation, reactiveScale);
    const scaledSourceLocation: RealLocation = LocationTransformer.scaleToRealLocation(sourceLocation, reactiveScale);
    const distanceX: number = scaledSourceLocation.x.coordinate - scaledViewCenterLocation.x.coordinate;
    const distanceY: number = scaledSourceLocation.y.coordinate - scaledViewCenterLocation.y.coordinate;

    const viewCenterRealLocationX = RealCoordinate.of(reactiveViewportWidth.width * this.viewCenterPosition.x.ratio);
    const viewCenterRealLocationY = RealCoordinate.of(reactiveViewportHeight.height * this.viewCenterPosition.y.ratio);

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