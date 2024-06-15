import { describe, expect, test } from "vitest";
import { LocationTransformer } from "./locationTransformer";
import { ViewportHeight, ViewportRelativeCoordinate, ViewportRelativePosition, ViewportWidth } from "./viewportRelativeCoordinateSystem";
import { MAX_SCALE, MIN_SCALE, Scale } from "../scale";
import { VirtualCoordinate, VirtualLocation } from "./virtualCoordinateSystem";
import type { RealLocation } from "./realCoordinateSystem";

const viewCenterRelativePosition = ViewportRelativePosition.of(
  ViewportRelativeCoordinate.of(0.5),
  ViewportRelativeCoordinate.of(0.5)
);
const viewCenterXRatio: number = viewCenterRelativePosition.x.ratio;
const viewCenterYRatio: number = viewCenterRelativePosition.y.ratio;

const transformer = new LocationTransformer(viewCenterRelativePosition);

const TRANSFORMED_COORDINATE_FLOAT_PRECISION = 2;

function testLocationTransformation(
  testName: string,
  viewCenterLocation: VirtualLocation,
  xOffset: number,
  yOffset: number,
  viewportWidth: ViewportWidth,
  viewportHeight: ViewportHeight,
  scale: Scale
) {
  test(testName, () => {
    const sourceLocation = viewCenterLocation.createOffsetLocation(
      VirtualCoordinate.of(xOffset),
      VirtualCoordinate.of(yOffset)
    );
  
    const realLocation: RealLocation = transformer.transformToRealLocation(
      viewCenterLocation,
      sourceLocation,
      viewportWidth,
      viewportHeight,
      scale
    );
    expect(realLocation.x.coordinate).toBeCloseTo(viewportWidth.width * viewCenterXRatio + xOffset * scale.scale, TRANSFORMED_COORDINATE_FLOAT_PRECISION);
    expect(realLocation.y.coordinate).toBeCloseTo(viewportHeight.height * viewCenterYRatio + yOffset * scale.scale, TRANSFORMED_COORDINATE_FLOAT_PRECISION);
  });
}

function testNonInitialViewCenterLocationTransformation(
  viewCenterLocation: VirtualLocation,
  offsetX: number,
  offsetY: number,
  viewportWidth: ViewportWidth,
  viewportHeight: ViewportHeight,
  scale: Scale
) {
  testLocationTransformation(`${viewCenterLocation.x.coordinate}, ${viewCenterLocation.y.coordinate}`, viewCenterLocation, offsetX, offsetY, viewportWidth, viewportHeight, scale);
}

function testSourceLocationTransformation(
  viewCenterLocation: VirtualLocation,
  offsetX: number,
  offsetY: number,
  viewportWidth: ViewportWidth,
  viewportHeight: ViewportHeight,
  scale: Scale
) {
  testLocationTransformation(`${offsetX}, ${offsetY}`, viewCenterLocation, offsetX, offsetY, viewportWidth, viewportHeight, scale);
}

function testLocationTransformationOnViewportResized(
  viewCenterLocation: VirtualLocation,
  offsetX: number,
  offsetY: number,
  viewportWidth: ViewportWidth,
  viewportHeight: ViewportHeight,
  scale: Scale
) {
  testLocationTransformation(`${viewportWidth.width}, ${viewportHeight.height}`, viewCenterLocation, offsetX, offsetY, viewportWidth, viewportHeight, scale);
}

function testLocationTransformationOnScaleUpdated(
  viewCenterLocation: VirtualLocation,
  offsetX: number,
  offsetY: number,
  viewportWidth: ViewportWidth,
  viewportHeight: ViewportHeight,
  scale: Scale
) {
  testLocationTransformation(`${scale.scale}`, viewCenterLocation, offsetX, offsetY, viewportWidth, viewportHeight, scale);
}

describe("LocationTransformer#transformToRealLocation(): 座標変換", () => {
  const initialViewCenterLocation = VirtualLocation.of(
    VirtualCoordinate.of(512),
    VirtualCoordinate.of(512)
  );
  const defaultViewportWidth = new ViewportWidth(1280);
  const defaultViewportHeight = new ViewportHeight(720);
  const defaultScale = new Scale(MAX_SCALE);

  testLocationTransformation(
    "ビューポートの中央とviewCenterの実座標の一致確認",
    initialViewCenterLocation,
    0,
    0,
    defaultViewportWidth,
    defaultViewportHeight,
    defaultScale
  );

  const offset: number = 512;

  describe("異なる画面中央の座標における仮想座標の変換", () => {
    const coordinates: number[] = [0, 1024, -1024, -1025, 1000000, -1000000];
    for (var x of coordinates) {
      for (var y of coordinates) {
        const viewCenterLocation = VirtualLocation.of(VirtualCoordinate.of(x), VirtualCoordinate.of(y));
        testNonInitialViewCenterLocationTransformation(viewCenterLocation, offset, offset, defaultViewportWidth, defaultViewportHeight, defaultScale);
      }
    }
  });

  describe("viewCenterではない仮想座標の変換", () => {
    testSourceLocationTransformation(initialViewCenterLocation, offset, offset, defaultViewportWidth, defaultViewportHeight, defaultScale);
    testSourceLocationTransformation(initialViewCenterLocation, offset, -offset, defaultViewportWidth, defaultViewportHeight, defaultScale);
    testSourceLocationTransformation(initialViewCenterLocation, -offset, offset, defaultViewportWidth, defaultViewportHeight, defaultScale);
    testSourceLocationTransformation(initialViewCenterLocation, -offset, -offset, defaultViewportWidth, defaultViewportHeight, defaultScale);
  });

  describe("ウィンドウリサイズ時の仮想座標の変換", () => {
    const resizedViewportWidth = new ViewportWidth(800);
    const resizedViewportHeight = new ViewportHeight(480);
    testLocationTransformationOnViewportResized(initialViewCenterLocation, offset, offset, resizedViewportWidth, defaultViewportHeight, defaultScale);
    testLocationTransformationOnViewportResized(initialViewCenterLocation, offset, offset, defaultViewportWidth, resizedViewportHeight, defaultScale);
    testLocationTransformationOnViewportResized(initialViewCenterLocation, offset, offset, resizedViewportWidth, resizedViewportHeight, defaultScale);
  });

  describe("スケール変更時の仮想座標の変換", () => {
    for (let newScale = MAX_SCALE; newScale >= MIN_SCALE; newScale -= 0.1) {
      const scale = new Scale(newScale);
      testLocationTransformationOnScaleUpdated(initialViewCenterLocation, offset, offset, defaultViewportWidth, defaultViewportHeight, scale);
    }
  });

  describe("複数の変数が非デフォルト値である場合の仮想座標の変換", () => {
    const coordinates: number[] = [0, 1024, -1024, -1025, 1000000, -1000000];
    const offsets: number[] = [512, -512];
    const viewportWidths: ViewportWidth[] = [defaultViewportWidth, new ViewportWidth(800)];
    const viewportHeights: ViewportHeight[] = [defaultViewportHeight, new ViewportHeight(480)];
    for (var x of coordinates) {
      for (var y of coordinates) {
        const viewCenterLocation = VirtualLocation.of(VirtualCoordinate.of(x), VirtualCoordinate.of(y));
        for (var xOffset of offsets) {
          for (var yOffset of offsets) {
            for (var viewportWidth of viewportWidths) {
              for (var viewportHeight of viewportHeights) {
                for (let newScale = MAX_SCALE; newScale >= MIN_SCALE; newScale -= 0.1) {
                  const scale = new Scale(newScale);
                  testLocationTransformation(
                    `viewCenter: (${x}, ${y}), source: (${x + xOffset}, ${y + yOffset}), width: ${viewportWidth.width}, height: ${viewportHeight.height}, scale: ${scale.scale}`,
                    viewCenterLocation,
                    xOffset,
                    yOffset,
                    viewportWidth,
                    viewportHeight,
                    scale
                  );
                }
              }
            }
          }
        }
      }
    }
  });
});
