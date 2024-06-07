import type { Position } from "./move.svelte";

const CHUNK_SCALE = 10;

class ChunkKey {
  constructor(public readonly key: string) {}
}

class ChunkIndex {
  constructor(public readonly index: number) {}
}

class ChunkLocation {
  constructor(
    public readonly chunkX: number,
    public readonly chunkY: number
  ) {}
}

type Fetcher = (chunkIndexes: ChunkIndex[]) => Chunk[];

const PREFETCH_RADIUS = 1;
const DIRECTIONAL_PREFETCH_RADIUS = 5;

export class ChunkSystem {
  private readonly keysToChunks = new Map<ChunkKey, Chunk>();
  private previousChunkX = 0;
  private previousChunkY = 0;
  private visibleChunks: Chunk[] = $state([]);

  constructor(
    private readonly fetcher: Fetcher,
    private readonly position: Position
  ) {}

  loadInitialChunks(initialX: number, initialY: number) {
    const chunkX = toChunkX(initialX);
    const chunkY = toChunkY(initialY);

    const chunkIndexesToLoad: number[] = [];
    const chunkIndexesToKeys = new Map<number, string>();

    // 周囲のチャンクを読み込み
    for (var cx = chunkX - PREFETCH_RADIUS; cx <= chunkX + PREFETCH_RADIUS; cx++) {
      for (var cy = chunkY - PREFETCH_RADIUS; cy <= chunkY + PREFETCH_RADIUS; cy++) {
        const key = toChunkKey(cx, cy);
        if (!this.keysToChunks.has(key)) {
          const index = toChunkIndex(cx, cy);
          chunkIndexesToKeys.set(index, key);
          chunkIndexesToLoad.push(index);
        }
      }
    }

    const fetchedChunks: Map<number, Chunk> = fetchChunks(this.type, this.id, chunkIndexesToLoad);
    for (var [index, chunk] of fetchedChunks.entries()) {
      const key = chunkIndexesToKeys.get(index);
      if (key) this.keysToChunks.set(key, chunk);
    }

    //test

    for (var x = -1; x < 2; x++) {
      for (var y = -1; y < 2; y++) {
        const chX = toChunkX(x * 1024);
        const chY = toChunkY(y * 1024);
        const key = toChunkKey(chX, chY);
        this.keysToChunks.set(key, new SharesChunk(chX, chY));
      }
    }

    const newVisibleChunks: Chunk[] = [];
    for (var cax = chunkX - PREFETCH_RADIUS; cax <= chunkX + PREFETCH_RADIUS; cax++) {
      for (var cay = chunkY - PREFETCH_RADIUS; cay <= chunkY + PREFETCH_RADIUS; cay++) {
        const key = toChunkKey(cax, cay);
        console.log(key);
        const chunk = this.keysToChunks.get(key);
        if (chunk) newVisibleChunks.push(chunk);
      }
    }

    this.visibleChunks = newVisibleChunks;
    console.log(this.visibleChunks.length);
  }

  onMove() {
    // debounce必要?
    const chunkX = toChunkX(getCurrentX());
    const chunkY = toChunkY(getCurrentY());
    if (chunkX !== this.previousChunkX || chunkY !== this.previousChunkY) {
      this.onCrossChunks(chunkX, chunkY);

      const newVisibleChunks: Chunk[] = [];
      for (var cx = chunkX - PREFETCH_RADIUS; cx <= chunkX + PREFETCH_RADIUS; cx++) {
        for (var cy = chunkY - PREFETCH_RADIUS; cy <= chunkY + PREFETCH_RADIUS; cy++) {
          const key = toChunkKey(cx, cy);
          const chunk = this.keysToChunks.get(key);
          if (chunk) newVisibleChunks.push(chunk);
        }
      }

      this.visibleChunks = newVisibleChunks;
    }
  }

  private onCrossChunks(chunkX: number, chunkY: number) {
    const chunkIndexesToLoad: number[] = [];
    const chunkIndexesToKeys = new Map<number, string>();

    // 周囲のチャンクを読み込み
    for (var chx = chunkX - PREFETCH_RADIUS; chx <= chunkX + PREFETCH_RADIUS; chx++) {
      for (var chy = chunkY - PREFETCH_RADIUS; chy <= chunkY + PREFETCH_RADIUS; chy++) {
        const key = toChunkKey(chx, chy);
        if (!this.keysToChunks.has(key)) {
          const index = toChunkIndex(chx, chy);
          chunkIndexesToKeys.set(index, key);
          chunkIndexesToLoad.push(index);
        }
      }
    }

    // 移動方向のチャンクを読み込み
    const dx = chunkX - this.previousChunkX;
    const dy = chunkY - this.previousChunkY;
    for (let i = 1; i <= this.directionalPrefetchRedius; i++) {
      const baseChunkX = chunkX + i * Math.sign(dx);
      const baseChunkY = chunkY + i * Math.sign(dy);
      for (var cx = baseChunkX - PREFETCH_RADIUS; cx <= baseChunkX + PREFETCH_RADIUS; cx++) {
        for (var cy = baseChunkY - PREFETCH_RADIUS; cy <= baseChunkY + PREFETCH_RADIUS; cy++) {
          const key = toChunkKey(cx, cy);
          if (!this.keysToChunks.has(key)) {
            const index = toChunkIndex(cx, cy);
            chunkIndexesToKeys.set(index, key);
            chunkIndexesToLoad.push(index);
          }
        }
      }
    }

    const fetchedChunks: Map<number, Chunk> = fetchChunks(this.type, this.id, chunkIndexesToLoad);
    for (var [index, chunk] of fetchedChunks.entries()) {
      const key = chunkIndexesToKeys.get(index);
      if (key) this.keysToChunks.set(key, chunk);
    }
  }
}

export interface Chunk {
  readonly chunkX: number;
  readonly chunkY: number;
}

export class SharesChunk implements Chunk {
  readonly chunkX: number;
  readonly chunkY: number;
  
  constructor(chunkX: number, chunkY: number) {
    this.chunkX = chunkX;
    this.chunkY = chunkY;
  }

  getShares(): [number, number][] {
    return [[0, 0], [528, 0], [0, 528], [528, 528]];
  }
}

export class SpaceCoreChunk implements Chunk {
  readonly chunkX: number;
  readonly chunkY: number;
  
  constructor(chunkX: number, chunkY: number) {
    this.chunkX = chunkX;
    this.chunkY = chunkY;
  }
}


function toChunkX(x: number): number {
  return x >> CHUNK_SCALE;
}

function toChunkY(y: number): number {
  return y >> CHUNK_SCALE;
}

function toChunkKey(chunkX: number, chunkY: number): string {
  return `${chunkX}${chunkY}`;
}

function toChunkIndex(chunkX: number, chunkY: number): ChunkIndex {
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

  let chunkGroupLongSideLength = 1 + chunkGroupId / 2;

  // チャンクグループ内の最初のチャンクのインデックスを計算
  let chunkGroupStartIndex = chunkGroupLongSideLength * chunkGroupLongSideLength + (chunkGroupId % 2 === 0 ? -chunkGroupLongSideLength : 0);

  // チャンクグループ内での位置と足し合わせ、全体におけるチャンクの番号を返す
  return new ChunkIndex(chunkGroupStartIndex + offset);
}

function toChunkLocation(index: ChunkIndex): ChunkLocation {
  let n = index.index;

  if (n === 0) return new ChunkLocation(0, 0); // 原点の場合

  // 螺旋の層を決定する
  let layer = Math.floor((Math.sqrt(n) + 1) / 2);

  // この層の開始番号を計算
  let layerStart = Math.pow(2 * layer - 1, 2);
  
  // 層内の位置を計算
  let position = n - layerStart;
  let sideLength = 2 * layer;

  // それぞれの辺の位置を計算
  if (position < sideLength) { // 右辺
      return new ChunkLocation(layer, (layer - 1) - position);
  }if (position < 2 * sideLength) { // 下辺
      return new ChunkLocation((layer - 1) - (position - sideLength), -layer);
  } else if (position < 3 * sideLength) { // 左辺
      return new ChunkLocation(-layer, -(layer - 1) + (position - sideLength * 2));
  } else { // 上辺
      return new ChunkLocation(-(layer - 1) + (position - sideLength * 3), layer);
  }
}
