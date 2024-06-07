import { toChunkX, toChunkY, type Chunk, type RenderChunksUpdater, type ChunksFetcher, type ChunkMap, SharesChunk, toChunkXY } from "$lib/components/space/chunk.svelte";

export class RenderChunks {
  chunks: Chunk[] = $state([]);

  updateChunks(currentPositionX: number, currentPositionY: number, map: ChunkMap) {
    this.chunks = getChunksAround(currentPositionX, currentPositionY, map);
  }

  getRenderChunks(): Chunk[] {
    return this.chunks;
  }
}

export function fetchChunks(requiredChunkIndexes: Set<number>): Chunk[] {
  const chunks: Chunk[] = [];
  for (var index of requiredChunkIndexes) {
    const xy = toChunkXY(index);
    console.log(index);
    chunks.push(new SharesChunk(xy[0], xy[1]));
  }
  return chunks;
}

const RENDER_RADIUS = 1;

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


