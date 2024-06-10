import type { Option } from "$lib/option";
import type { Uuid4 } from "$lib/uuid";
import { genTestShareData, genTestTagId, getTestTagName, TestShareData } from "./mockData";

const CHUNK_SCALE = 10;

export type ChunksFetcher = (requiredChunkIndexes: Set<number>) => Chunk[];
export type ChunkMap = (chunkX: number, chunkY: number) => Option<Chunk>;
export type RenderedChunksUpdater = (chunks: Chunk[]) => void;
export type RenderChunksUpdater = (currentPositionX: number, currentPositionY: number, map: ChunkMap) => void;

const PREFETCH_RADIUS = 1;
const DIRECTIONAL_PREFETCH_RADIUS = 5;

export class DynamicChunkLoader {
  private previousChunkX: number = 0;
  private previousChunkY: number = 0;

  constructor(
    private readonly loader: ChunkLoader,
    private readonly updater: RenderChunksUpdater
  ) {}

  initialLoad(initialPositionX: number, initialPositionY: number) {
    const chunkX = toChunkX(initialPositionX);
    const chunkY = toChunkY(initialPositionY);
    this.loader.loadChunksAround(chunkX, chunkY);
    this.previousChunkX = chunkX;
    this.previousChunkY = chunkY;
    this.updater(initialPositionX, initialPositionY, (x, y) => this.loader.getChunk(x, y));
  }

  onPositionUpdate(x: number, y: number) {
    const chunkX = toChunkX(x);
    const chunkY = toChunkY(y);
    if (this.isCrossChunks(chunkX, chunkY)) {
      this.loader.loadChunksDirectionally(chunkX, chunkY, this.previousChunkX, this.previousChunkY);
      this.previousChunkX = chunkX;
      this.previousChunkY = chunkY;
      this.updater(x, y, (x, y) => this.loader.getChunk(x, y));
    }
  }

  private isCrossChunks(chunkX: number, chunkY: number): boolean {
    return chunkX !== this.previousChunkX || chunkY !== this.previousChunkY;
  }
}

export class ChunkLoader {
  private readonly keysToChunks = new Map<string, Chunk>();

  constructor(
    private readonly chunksFetcher: ChunksFetcher,
  ) {}

  private calculateRequiredChunkIndexes(chunkX: number, chunkY: number, radius: number): number[] {
    const requiredChunkIndexes: number[] = [];
    for (var cx = chunkX - radius; cx <= chunkX + radius; cx++) {
      for (var cy = chunkY - radius; cy <= chunkY + radius; cy++) {
        if (!this.isChunkLoaded(cx, cy)) requiredChunkIndexes.push(toChunkIndex(cx, cy));
      }
    }
    return requiredChunkIndexes;
  }

  private isChunkLoaded(chunkX: number, chunkY: number): boolean {
    return this.keysToChunks.has(toChunkKey(chunkX, chunkY));
  }

  private loadChunks(chunks: Chunk[]) {
    for (var chunk of chunks) {
      const key = toChunkKey(chunk.chunkX, chunk.chunkY);
      if (key) this.keysToChunks.set(key, chunk);
    }
  }

  getChunk(chunkX: number, chunkY: number): Option<Chunk> {
    return this.keysToChunks.get(toChunkKey(chunkX, chunkY));
  }

  loadChunksAround(chunkX: number, chunkY: number) {
    this.loadChunksDirectionally(chunkX, chunkY, chunkX, chunkY);
  }

  loadChunksDirectionally(chunkX: number, chunkY: number, previousChunkX: number, previousChunkY: number) {
    const requiredChunkIndexes = new Set<number>();

    // 周囲のチャンクを読み込み
    this.calculateRequiredChunkIndexes(chunkX, chunkY, PREFETCH_RADIUS)
      .forEach(i => requiredChunkIndexes.add(i));

    // 移動方向のチャンクを読み込み
    const dx = chunkX - previousChunkX;
    const dy = chunkY - previousChunkY;
    if (dx !== 0 || dy !== 0) {
      for (let i = 1; i <= DIRECTIONAL_PREFETCH_RADIUS; i++) {
        const baseChunkX = chunkX + i * Math.sign(dx);
        const baseChunkY = chunkY + i * Math.sign(dy);
        this.calculateRequiredChunkIndexes(baseChunkX, baseChunkY, PREFETCH_RADIUS)
          .forEach(i => requiredChunkIndexes.add(i));
      }
    }

    const requiredChunks = this.chunksFetcher(requiredChunkIndexes);
    this.loadChunks(requiredChunks);
  }
}

export abstract class Chunk {
  constructor(
    readonly chunkX: number,
    readonly chunkY: number
  ) {}

  getKey(): string {
    return toChunkKey(this.chunkX, this.chunkY);
  }
}

export class SharesChunk extends Chunk {
  constructor(chunkX: number, chunkY: number) {
    super(chunkX, chunkY);
  }

  getShareDataInOrder(): TestShareData[] {
    return [genTestShareData(), genTestShareData()];
  }
}

export class SpaceCoreChunk extends Chunk {
  public readonly subtagId: Uuid4 = genTestTagId();
  public readonly subtagName: string = getTestTagName();

  constructor(chunkX: number, chunkY: number) {
    super(chunkX, chunkY);
  }

  getShareDataInOrder(): TestShareData[] {
    return [genTestShareData(), genTestShareData()];
  }
}

export function toChunkX(x: number): number {
  return x >> CHUNK_SCALE;
}

export function toChunkY(y: number): number {
  return y >> CHUNK_SCALE;
}

function toChunkKey(chunkX: number, chunkY: number): string {
  return `${chunkX}${chunkY}`;
}

function toChunkIndex(chunkX: number, chunkY: number): number {
  let distanceFromOrigin = Math.max(Math.abs(chunkX), Math.abs(chunkY));

  // chunkGroupは短辺が1のチャンク列の番号、offsetはチャンク列内での位置
  let chunkGroupId: number;
  let offset: number;
  if (chunkY === distanceFromOrigin) {
    // 原点の上側
    chunkGroupId = 4 * distanceFromOrigin;
    offset = chunkX + distanceFromOrigin;
  } else if (chunkX === distanceFromOrigin) {
    // 右側
    chunkGroupId = 4 * distanceFromOrigin - 3;
    offset = distanceFromOrigin - 1 - chunkY;
  } else if (chunkY === -distanceFromOrigin) {
    // 下側
    chunkGroupId = 4 * distanceFromOrigin - 2;
    offset = distanceFromOrigin - chunkX;
  } else {
    // 左側
    chunkGroupId = 4 * distanceFromOrigin - 1;
    offset = chunkY + distanceFromOrigin;
  }

  let chunkGroupLongSideLength = 1 + Math.floor(chunkGroupId / 2);

  // チャンクグループ内の最初のチャンクのインデックスを計算
  let chunkGroupStartIndex = chunkGroupLongSideLength * chunkGroupLongSideLength + (chunkGroupId % 2 === 0 ? -chunkGroupLongSideLength : 0);

  // チャンクグループ内での位置と足し合わせ、全体におけるチャンクの番号を返す
  return chunkGroupStartIndex + offset;
}

export function toChunkXY(index: number): [number, number] {
  // 原点の場合
  if (index === 0) return [0, 0];

  // 螺旋の層を決定する
  let layer = Math.floor((Math.sqrt(index) + 1) / 2);

  // この層の開始番号を計算
  let layerStart = Math.pow(2 * layer - 1, 2);
  
  // 層内の位置を計算
  let position = index - layerStart;
  let sideLength = 2 * layer;

  // それぞれの辺の位置を計算
  if (position < sideLength) { // 右辺
      return [layer, (layer - 1) - position];
  }if (position < 2 * sideLength) { // 下辺
      return [(layer - 1) - (position - sideLength), -layer];
  } else if (position < 3 * sideLength) { // 左辺
      return [-layer, -(layer - 1) + (position - sideLength * 2)];
  } else { // 上辺
      return [-(layer - 1) + (position - sideLength * 3), layer];
  }
}
