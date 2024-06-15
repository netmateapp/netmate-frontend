import { expect, test } from "vitest";
import { VirtualCoordinate, VirtualLocation } from "../coordinateSystem/virtualCoordinateSystem.svelte";
import { ChunkLoader, TagSpaceChunkFetcher } from "./chunkLoader";
import { ChunkCoordinate, ChunkLocation, ChunkRepository } from "./chunk";

test("ChunkLoader#loadChunksInMovementDirection(): 方向性チャンク読み込み", () => {
  const from = VirtualLocation.of(VirtualCoordinate.of(0), VirtualCoordinate.of(0));
  const to = VirtualLocation.of(VirtualCoordinate.of(1), VirtualCoordinate.of(1));
  const repository = new ChunkRepository();
  const loader = new ChunkLoader(repository, new TagSpaceChunkFetcher());
  loader.loadChunksInMovementDirection(from, to, 1, 1);
  const hasEdgeChunk = repository.hasChunkAt(ChunkLocation.of(ChunkCoordinate.of(2), ChunkCoordinate.of(2)));
  expect(hasEdgeChunk).toBe(true);
});