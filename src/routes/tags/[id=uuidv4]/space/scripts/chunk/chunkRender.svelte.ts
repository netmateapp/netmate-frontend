import type { Reactivity, Reactive } from "$lib/scripts/extension/reactivity";
import type { VirtualLocation } from "../coordinateSystem/virtualCoordinateSystem.svelte";
import { Chunk, type ChunkRepository, ChunkLocation } from "./chunk";
import { calculateChunkAreaLocations, DynamicChunkLoader } from "./chunkLoader";

type RenderedChunks = Set<Chunk>;

export class ReactiveRenderedChunks implements Reactivity<RenderedChunks> {
  private renderedChunks: RenderedChunks = $state(new Set<Chunk>());

  reactiveValue(): Reactive<RenderedChunks> {
    return this.renderedChunks;
  }

  update(renderedChunks: RenderedChunks) {
    this.renderedChunks = renderedChunks;
  }
}

export class ChunkRenderer {
  private readonly renderedChunks: ReactiveRenderedChunks;
  private readonly chunkRepository: ChunkRepository;

  constructor(renderedChunks: ReactiveRenderedChunks, repository: ChunkRepository) {
    this.renderedChunks = renderedChunks;
    this.chunkRepository = repository;
  }

  renderChunksWithinRadius(viewCenterLocation: VirtualLocation, radius: number) {
    const newRenderChunks: RenderedChunks = new Set<Chunk>(
      calculateChunkAreaLocations(ChunkLocation.fromVirtualLocation(viewCenterLocation), radius)
        .values()
        .map(chunkLocation => this.chunkRepository.chunkAt(chunkLocation))
        .filter(chunk => chunk !== undefined)
    );
    this.renderedChunks.update(newRenderChunks);
  }
}
const DYNAMIC_CHUNK_RENDERING_RADIUS: number = 1;

export class DynamicChunkRenderer {
  private readonly dynamicChunkLoader: DynamicChunkLoader;
  private readonly chunkRenderer: ChunkRenderer;

  constructor(dynamicChunkLoader: DynamicChunkLoader, chunkRenderer: ChunkRenderer) {
    this.dynamicChunkLoader = dynamicChunkLoader;
    this.chunkRenderer = chunkRenderer;
  }

  startDynamicChunkRendering(viewCenterLocation: Reactive<VirtualLocation>) {
    this.dynamicChunkLoader.startDyanmicChunkLoading(viewCenterLocation);
    this.chunkRenderer.renderChunksWithinRadius(viewCenterLocation, DYNAMIC_CHUNK_RENDERING_RADIUS);
  }
}
