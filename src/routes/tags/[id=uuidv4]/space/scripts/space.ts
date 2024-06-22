import type { Tag } from "$lib/scripts/domain/tag";
import { type ChunkRepository } from "./chunk/chunk";
import { ChunkLoader, DynamicChunkLoader, TagSpaceChunkFetcher } from "./chunk/chunkLoader";
import { ReactiveViewportHeight, ReactiveViewportWidth, ViewportHeight, ViewportRelativeCoordinate, ViewportRelativePosition, ViewportSizeUpdater, ViewportWidth } from "./coordinateSystem/viewportRelativeCoordinateSystem.svelte";
import { ReactiveVirtualLocation, type VirtualLocation } from "./coordinateSystem/virtualCoordinateSystem.svelte";
import { composeLifeCycles, type Finalizer, type LifeCycle } from "../../../../../lib/scripts/extension/lifeCycle";
import { ViewCenterVirtualLocationUpdater } from "./movement";
import { ReactiveScale, Scale, ScaleUpdater } from "./scale.svelte";
import { ChunkRenderer, DynamicChunkRenderer, ReactiveRenderedChunks } from "./chunk/chunkRender.svelte";
import { LocationTransformer } from "./coordinateSystem/locationTransformer";

export class TagSpace implements LifeCycle {
  public readonly tag: Tag;
  public readonly chunkRepository: ChunkRepository;
  public readonly viewCenterLocation: ReactiveVirtualLocation;
  public readonly renderedChunks: ReactiveRenderedChunks;
  public readonly viewportWidth: ReactiveViewportWidth;
  public readonly viewportHeight: ReactiveViewportHeight;
  public readonly scale: ReactiveScale;

  public readonly viewCenterLocationUpdater: ViewCenterVirtualLocationUpdater;
  private readonly dynamicChunkLoader: DynamicChunkLoader;
  public readonly dynamicChunkRenderer: DynamicChunkRenderer;
  private readonly viewportSizeUpdater: ViewportSizeUpdater;
  private readonly scaleUpdater: ScaleUpdater;
  public readonly locationTransformer: LocationTransformer;

  constructor(tag: Tag, chunkRepository: ChunkRepository, initialViewCenterLocation: VirtualLocation, initialScale: Scale) {
    this.tag = tag;
    this.chunkRepository = chunkRepository;
    this.viewCenterLocation = new ReactiveVirtualLocation(initialViewCenterLocation);
    this.viewCenterLocationUpdater = new ViewCenterVirtualLocationUpdater(this.viewCenterLocation);

    this.dynamicChunkLoader = new DynamicChunkLoader(
      new ChunkLoader(this.chunkRepository, new TagSpaceChunkFetcher()),
      this.viewCenterLocation.reactiveValue()
    );

    this.renderedChunks = new ReactiveRenderedChunks();
    this.dynamicChunkRenderer = new DynamicChunkRenderer(
      this.dynamicChunkLoader,
      new ChunkRenderer(this.renderedChunks, this.chunkRepository)
    );

    // SSR時にはwindowがないため初期化のタイミングで現在のサイズを設定する
    this.viewportWidth = new ReactiveViewportWidth(new ViewportWidth(0));
    this.viewportHeight = new ReactiveViewportHeight(new ViewportHeight(0));
    this.viewportSizeUpdater = new ViewportSizeUpdater(this.viewportWidth, this.viewportHeight);

    this.scale = new ReactiveScale(initialScale);
    this.scaleUpdater = new ScaleUpdater(this.scale);

    this.locationTransformer = new LocationTransformer(
      ViewportRelativePosition.of(ViewportRelativeCoordinate.of(0.5), ViewportRelativeCoordinate.of(0.5))
    );
  }

  initialize(): Finalizer {
    this.viewportWidth.update(ViewportWidth.fromCurrentViewport());
    this.viewportHeight.update(ViewportHeight.fromCurrentViewport());

    return composeLifeCycles(
      this.viewCenterLocationUpdater,
      this.viewportSizeUpdater,
      this.scaleUpdater
    ).initialize();
  }
}
