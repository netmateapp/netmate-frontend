import { Chunk, ChunkCoordinate, ChunkIndex, ChunkLocation, type ChunkRepository } from "./chunk";
import { ShareCardsClusterData, SpaceCoreData } from "./chunkContent";
import { generateMockShareCards, generateTestTag } from "../mockShare";
import type { VirtualLocation } from "../coordinateSystem/virtualCoordinateSystem.svelte";
import type { Reactive } from "../../../../../../lib/scripts/extension/reactivity";
import { HashSet } from "$lib/scripts/extension/hashSet/hashSet";

export abstract class ChunkFetcher {
  abstract fetchChunksBy(indexes: HashSet<ChunkIndex>): HashSet<Chunk>;

  protected static hashChunk(chunk: Chunk): number {
    return ChunkIndex.from(chunk.location).index;
  }

  protected static equalsChunk(a: Chunk, b: Chunk): boolean {
    return this.hashChunk(a) === this.hashChunk(b);
  }
}

export class TagSpaceChunkFetcher extends ChunkFetcher {
  fetchChunksBy(indexes: HashSet<ChunkIndex>): HashSet<Chunk> {
    return this.fetchMockChunksBy(indexes);
  }
  
  fetchMockChunksBy(indexes: HashSet<ChunkIndex>): HashSet<Chunk> {
    const chunks = new HashSet<Chunk>(ChunkFetcher.hashChunk, ChunkFetcher.equalsChunk);

    for (var index of indexes) {
      const location = ChunkLocation.fromIndex(index);
      console.log(`${index.index}: x: ${location.chunkX.coordinate * 1024}, y: ${location.chunkY.coordinate * 1024}`);
      const shareCards: ShareCardsClusterData = new ShareCardsClusterData([
        generateMockShareCards(),
        generateMockShareCards()
      ]);
      if (location.chunkX.coordinate === 0 && location.chunkY.coordinate === 0) {
        chunks.add(new Chunk(location, shareCards));
      } else {
        const max: number = 2;
        const rand: number = Math.floor(Math.random() * max);
        if (rand < max - 1) {
          chunks.add(new Chunk(location, shareCards));
        } else {
          const core = new SpaceCoreData(generateTestTag(), shareCards);
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

export function calculateChunkAreaLocations(center: ChunkLocation, radius: number): ChunkLocationSet {
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
  // 移動方向の `directionalPreloadsCount + radius * 2` チャンク先までチャンクを先読みする
  // `+ radius * 2` は、通常の読み込み及び最後の先読み時の読み込み範囲 `radius` のチャンクまでを含めての意である
  loadChunksInMovementDirection(from: VirtualLocation, to: VirtualLocation, radius: number, directionalPreloadsCount: number) {
    const necessaryChunkIndexes = new HashSet<ChunkIndex>(ChunkLoader.hashChunkIndex, ChunkLoader.equalsChunkIndex);

    const startChunkLocation = ChunkLocation.fromVirtualLocation(from);

    this.calculateChunkIndexesToLoadInRange(startChunkLocation, radius)
      .values()
      .forEach(index => necessaryChunkIndexes.add(index));

    const deltaX: number = to.x.coordinate - from.x.coordinate;
    const deltaY: number = to.y.coordinate - from.y.coordinate;
    if (ChunkLoader.isMoved(deltaX, deltaY)) {
      const nCoordinateXsAhead = ChunkCoordinate.of(startChunkLocation.chunkX.coordinate + (radius + 1) * Math.sign(deltaX));
      const nCoordinateYsAhead = ChunkCoordinate.of(startChunkLocation.chunkY.coordinate + (radius + 1) * Math.sign(deltaY));
      const nLocationsAhead = ChunkLocation.of(nCoordinateXsAhead, nCoordinateYsAhead);
      if (!this.repository.hasChunkAt(nLocationsAhead)) {
        for (var d = radius; d <= directionalPreloadsCount; d++) {
          const chunkX = ChunkCoordinate.of(startChunkLocation.chunkX.coordinate + d * Math.sign(deltaX));
          const chunkY = ChunkCoordinate.of(startChunkLocation.chunkY.coordinate + d * Math.sign(deltaY));
          this.calculateChunkIndexesToLoadInRange(ChunkLocation.of(chunkX, chunkY), radius)
            .values()
            .forEach(index => necessaryChunkIndexes.add(index));
        }
      }
    }

    this.fetcher.fetchChunksBy(necessaryChunkIndexes)
      .values()
      .forEach(chunk => this.loadChunk(chunk));
  }

  private calculateChunkIndexesToLoadInRange(center: ChunkLocation, radius: number): HashSet<ChunkIndex> {
    const set = new HashSet<ChunkIndex>(ChunkLoader.hashChunkIndex, ChunkLoader.equalsChunkIndex);
    calculateChunkAreaLocations(center, radius)
    .values()
    .filter(location => !this.repository.hasChunkAt(location))
    .map(location => ChunkIndex.from(location))
    .forEach(index => set.add(index));
    return set;
  }

  private static hashChunkIndex(index: ChunkIndex): number {
    return index.index;
  }

  private static equalsChunkIndex(a: ChunkIndex, b: ChunkIndex): boolean {
    return a.index === b.index;
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
    this.previousViewCenterVirtualLocation = viewCenterLocation;
  }
}
