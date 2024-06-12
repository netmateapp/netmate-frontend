import { Chunk, ChunkCoordinate, ChunkIndex, ChunkLocation, ShareNibblesSchool, SubtagSpaceCore, type ChunkRepository } from "./chunk";
import { genTestShareNibble, genTestTag } from "./mockShare";
import type { VirtualLocation } from "./coordinateSystem";

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

    this.getNecessaryChunkIndexesInRange(startChunkLocation, radius)
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
          this.getNecessaryChunkIndexesInRange(ChunkLocation.of(chunkX, chunkY), radius)
            .forEach(index => necessaryChunkIndexes.add(index));
        }
      }
    }

    const necessaryChunks: Set<Chunk> = this.fetcher.fetchChunksBy(necessaryChunkIndexes);
    necessaryChunks.forEach(chunk => this.loadChunk(chunk));
  }

  private getNecessaryChunkIndexesInRange(center: ChunkLocation, radius: number): Set<ChunkIndex> {
    const indexes = new Set<ChunkIndex>();
    const chunkX: number = center.chunkX.coordinate;
    const chunkY: number = center.chunkY.coordinate;
    for (var x = chunkX - radius; x <= chunkX + radius; x++) {
      for (var y = chunkY - radius; y <= chunkY + radius; y++) {
        const location = ChunkLocation.of(ChunkCoordinate.of(x), ChunkCoordinate.of(y));
        if (this.repository.hasChunkAt(location)) {
          const index = ChunkIndex.from(location);
          indexes.add(index);
        }
      }
    }
    return indexes;
  }

  private static isMoved(deltaX: number, deltaY: number): boolean {
    return deltaX !== 0 || deltaY !== 0;
  }

  private loadChunk(chunk: Chunk) {
    this.repository.register(chunk);
  }
}
