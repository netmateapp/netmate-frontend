const CHUNK_SIZE = 1024;
const CHUNK_SCALE = 10;

function toChunkX(x: number): number {
  return x >> CHUNK_SCALE;
}

function toChunkY(y: number): number {
  return y >> CHUNK_SCALE;
}

function toChunkKey(chunkX: number, chunkY: number): number {
  return (chunkX << 32) & chunkY;
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

  let chunkGroupLongSideLength = 1 + chunkGroupId / 2;

  // チャンクグループ内の最初のチャンクのインデックスを計算
  let chunkGroupStartIndex = chunkGroupLongSideLength * chunkGroupLongSideLength + (chunkGroupId % 2 === 0 ? -chunkGroupLongSideLength : 0);

  // チャンクグループ内での位置と足し合わせ、全体におけるチャンクの番号を返す
  return chunkGroupStartIndex + offset;
}

function fetchChunks(chunkIndexes: number[]): Chunk[] {
  return [];
}

class ChunkSystem {
  private keysToChunks = new Map<number, Chunk>();

  surroundingChunks9x9(chunkX: number, chunkY: number): Chunk[] {
    const chunks: Chunk[] = [];
    const chunkIndexesToLoad: number[] = [];
    for (var cx = chunkX - 1; cx <= chunkX + 1; cx++) {
      for (var cy = chunkY - 1; cy <= chunkY + 1; cy++) {
        const chunkKey = toChunkKey(cx, cy);
        const chunk = this.keysToChunks.get(chunkKey);
        if (chunk) chunks.push(chunk);
        else chunkIndexesToLoad.push(toChunkIndex(cx, cy));
      }
    }

    return chunks;
  }


}

class Chunk {
  constructor(
    public readonly chunkX: number,
    public readonly chunkY: number,
    public readonly chunkObject : ChunkContent,
  ) {}
}

type ChunkContent = Shares | SpaceCore;

class Shares {
  constructor(public readonly sharesIds: string[]) {}
}

class SpaceCore {
  constructor(public readonly tagId: string) {}
}
