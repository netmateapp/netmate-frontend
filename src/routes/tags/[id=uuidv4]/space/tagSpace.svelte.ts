import { toChunkX, toChunkY, type Chunk, type ChunkMap, SharesChunk, toChunkXY, SpaceCoreChunk } from "$lib/components/space/chunkLoader.svelte";

export class RenderChunks {
  chunks: Chunk[] = $state([]);

  updateChunks(currentX: number, currentY: number, map: ChunkMap) {
    this.chunks = getChunksAround(currentX, currentY, map);
  }

  getRenderChunks(): Chunk[] {
    return this.chunks;
  }

  clearChunks() {
    this.chunks = [];
  }
}

export function fetchChunks(requiredChunkIndexes: Set<number>): Chunk[] {
  return fetchTestChunks(requiredChunkIndexes);
}

function fetchTestChunks(requiredChunkIndexes: Set<number>): Chunk[] {
  const chunks: Chunk[] = [];
  for (var index of requiredChunkIndexes) {
    const xy = toChunkXY(index);
    if (xy[0] === 0 && xy[1] === 0) {
      chunks.push(new SharesChunk(xy[0], xy[1]));
    } else {
      const max = 8;
      const rand = Math.floor(Math.random() * max);
      if (rand < max - 1) {
        chunks.push(new SharesChunk(xy[0], xy[1]));
      } else {
        chunks.push(new SpaceCoreChunk(xy[0], xy[1]));
      }
    }
  }
  return chunks;
}

const RENDER_RADIUS = 2;

function getChunksAround(x: number, y: number, map: ChunkMap) {
  const chunkX = toChunkX(x);
  const chunkY = toChunkY(y);
  const chunks: Chunk[] = [];
  for (var cx = chunkX - RENDER_RADIUS; cx <= chunkX + RENDER_RADIUS; cx++) {
    for (var cy = chunkY - RENDER_RADIUS; cy <= chunkY + RENDER_RADIUS; cy++) {
      const chunk = map(cx, cy);
      if (chunk) chunks.push(chunk);
    }
  }
  return chunks;
}


