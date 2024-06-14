import { Chunk, ChunkCoordinate, ChunkIndex, ChunkLocation, ShareNibblesSchool, SubtagSpaceCore, type ChunkRepository } from "./chunk";
import { genTestShareNibble, genTestTag } from "./mockShare";
import type { VirtualLocation } from "./coordinateSystem/virtualCoordinateSystem";
import type { Reactive, Reactivity } from "./reactivity";

export interface ChunkFetcher {
  fetchChunksBy(indexes: Set<ChunkIndex>): Set<Chunk>;
}

export class TagSpaceChunkFetcher implements ChunkFetcher {
  fetchChunksBy(indexes: Set<ChunkIndex>): Set<Chunk> {
    return this.fetchMockChunksBy(indexes);
  }
  
  fetchMockChunksBy(indexes: Set<ChunkIndex>): Set<Chunk> {
    const chunks = new Set<Chunk>();

    for (var index of indexes) {
      const location = ChunkLocation.fromIndex(index);
      const school: ShareNibblesSchool = new ShareNibblesSchool([
        genTestShareNibble(),
        genTestShareNibble()
      ]);
      if (location.chunkX.coordinate === 0 && location.chunkY.coordinate === 0) {
        chunks.add(new Chunk(location, school));
      } else {
        const max: number = 2;
        const rand: number = Math.floor(Math.random() * max);
        if (rand < max - 1) {
          chunks.add( new Chunk(location, school));
        } else {
          const core = new SubtagSpaceCore(genTestTag(), school);
          chunks.add(new Chunk(location, core));
        }
      }
    }

    return chunks;
  }
}

// forEach()以外のStream処理をメソッドチェーンで行えないSetのためのクラス
class ChunkLocationSet {
  private readonly locations: Set<ChunkLocation>

  constructor(locations: Set<ChunkLocation>) {
    this.locations = locations;
  }

  values(): ChunkLocation[] {
    return [...this.locations];
  }
}

function calculateChunkAreaLocations(center: ChunkLocation, radius: number): ChunkLocationSet {
  const locations = new Set<ChunkLocation>();
  const chunkX: number = center.chunkX.coordinate;
  const chunkY: number = center.chunkY.coordinate;
  for (var x = chunkX - radius; x <= chunkX + radius; x++) {
    for (var y = chunkY - radius; y <= chunkY + radius; y++) {
      locations.add(ChunkLocation.of(ChunkCoordinate.of(x), ChunkCoordinate.of(y)));
    }
  }
  return new ChunkLocationSet(locations);
}

export class ChunkLoader {
  private readonly repository: ChunkRepository;
  private readonly fetcher: ChunkFetcher;

  constructor(repository: ChunkRepository, fetcher: ChunkFetcher) {
    this.repository = repository;
    this.fetcher = fetcher;
  }
  
  loadChunksWithinRadius(center: VirtualLocation, radius: number) {
    this.loadChunksInMovementDirection(center, center, radius, 0);
  }

  // 現在のチャンクから移動方向の `radius + 1` チャンク先のチャンクが未ロードの場合、
  // 移動方向の `distance + radius * 2` チャンク先までチャンクを先読みする
  // `+ radius * 2` は、通常の読み込み及び最後の先読み時の読み込み範囲 `radius` のチャンクまでを含めての意である
  loadChunksInMovementDirection(from: VirtualLocation, to: VirtualLocation, radius: number, distance: number) {
    const necessaryChunkIndexes = new Set<ChunkIndex>();

    const startChunkLocation = ChunkLocation.fromVirtualLocation(from);

    this.calculateChunkIndexesToLoadInRange(startChunkLocation, radius)
      .forEach(index => necessaryChunkIndexes.add(index));

    const deltaX: number = to.x.coordinate - from.x.coordinate;
    const deltaY: number = to.y.coordinate - from.y.coordinate;
    if (ChunkLoader.isMoved(deltaX, deltaY)) {
      const nCoordinateXsAhead = ChunkCoordinate.of(startChunkLocation.chunkX.coordinate + (radius + 1) * Math.sign(deltaX));
      const nCoordinateYsAhead = ChunkCoordinate.of(startChunkLocation.chunkY.coordinate + (radius + 1) * Math.sign(deltaY));
      const nLocationsAhead = ChunkLocation.of(nCoordinateXsAhead, nCoordinateYsAhead);
      if (!this.repository.hasChunkAt(nLocationsAhead)) {
        for (var d = radius + 1; d <= distance; d++) {
          const chunkX = ChunkCoordinate.of(startChunkLocation.chunkX.coordinate + d * Math.sign(deltaX));
          const chunkY = ChunkCoordinate.of(startChunkLocation.chunkY.coordinate + d * Math.sign(deltaY));
          this.calculateChunkIndexesToLoadInRange(ChunkLocation.of(chunkX, chunkY), radius)
            .forEach(index => necessaryChunkIndexes.add(index));
        }
      }
    }

    const necessaryChunks: Set<Chunk> = this.fetcher.fetchChunksBy(necessaryChunkIndexes);
    necessaryChunks.forEach(chunk => this.loadChunk(chunk));
  }

  private calculateChunkIndexesToLoadInRange(center: ChunkLocation, radius: number): Set<ChunkIndex> {
    return new Set<ChunkIndex>(
      calculateChunkAreaLocations(center, radius)
      .values()
      .filter(location => !this.repository.hasChunkAt(location))
      .map(location => ChunkIndex.from(location))
    );
  }

  private static isMoved(deltaX: number, deltaY: number): boolean {
    return deltaX !== 0 || deltaY !== 0;
  }

  private loadChunk(chunk: Chunk) {
    this.repository.register(chunk);
  }
}

const DYNAMIC_CHUNK_LOADING_RADIUS: number = 1;
const DYNAMIC_CHUNK_LOADING_DISTANCE: number = 5;

export class DynamicChunkLoader {
  private readonly chunkLoader: ChunkLoader;
  private previousViewCenterVirtualLocation: VirtualLocation;

  constructor(chunkLoader: ChunkLoader, initialViewCenterVirtualLocation: VirtualLocation) {
    this.chunkLoader = chunkLoader;
    this.previousViewCenterVirtualLocation = initialViewCenterVirtualLocation;
  }

  startDyanmicChunkLoading(viewCenterLocation: Reactive<VirtualLocation>) {
    this.chunkLoader.loadChunksInMovementDirection(
      this.previousViewCenterVirtualLocation,
      viewCenterLocation,
      DYNAMIC_CHUNK_LOADING_RADIUS,
      DYNAMIC_CHUNK_LOADING_DISTANCE
    );
  }
}

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
