import { toChunkX, toChunkY, type Chunk, type ChunksContentsRenderer, type ChunksFetcher, type ChunkMap } from "$lib/components/space/chunk.svelte";

const fetch: ChunksFetcher = (requiredChunkIndexes: Set<number>) => {
  const chunks: Chunk[] = [];
  return chunks;
};

const RENDER_RADIUS = 1;

export function getChunksAround(x: number, y: number, map: ChunkMap) {
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


