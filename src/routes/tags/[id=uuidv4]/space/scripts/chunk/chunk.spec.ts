import { describe, expect, test } from "vitest";
import { BASE_2_CHUNK_SIDE_LENGTH_LOGARITHM, Chunk, CHUNK_SIDE_LENGTH, ChunkCoordinate, ChunkIndex, ChunkLocation } from "./chunk";
import { VirtualCoordinate, VirtualLocation } from "../coordinateSystem/virtualCoordinateSystem.svelte";

test("チャンクの辺長に関する定数", () => {
  expect(Math.pow(2, BASE_2_CHUNK_SIDE_LENGTH_LOGARITHM)).toBe(CHUNK_SIDE_LENGTH);
});

function testIndexToChunkLocation(index: number, chunkX: number, chunkY: number) {
  test(`${index} -> (${chunkX}, ${chunkY})`, () => {
    const origin = ChunkLocation.fromIndex(new ChunkIndex(index));
    expect(origin.chunkX.coordinate).toBe(chunkX);
    expect(origin.chunkY.coordinate).toBe(chunkY);
  });
}

describe("ChunkLocation.fromIndex(): チャンク番号からチャンク座標への変換", () => {
  testIndexToChunkLocation(0, 0, 0);
  testIndexToChunkLocation(9, 2, 1);
});

function testVirtualToChunkLocation(x: number, y: number, chunkX: number, chunkY: number) {
  test(`(${x}, ${y}) -> (${chunkX}, ${chunkY})`, () => {
    const location = VirtualLocation.of(VirtualCoordinate.of(x), VirtualCoordinate.of(y));
    const chunkLocation = ChunkLocation.fromVirtualLocation(location);
    expect(chunkLocation.chunkX.coordinate).toBe(chunkX);
    expect(chunkLocation.chunkY.coordinate).toBe(chunkY);
  });
}

describe("ChunkLocation.fromVirtualLocation(): 仮想座標からチャンク座標への変換", () => {
  testVirtualToChunkLocation(0, 0, 0, 0);
  testVirtualToChunkLocation(CHUNK_SIDE_LENGTH - 1, CHUNK_SIDE_LENGTH - 1, 0, 0);
  testVirtualToChunkLocation(CHUNK_SIDE_LENGTH, CHUNK_SIDE_LENGTH, 1, 1);
  testVirtualToChunkLocation(-CHUNK_SIDE_LENGTH, -CHUNK_SIDE_LENGTH, -1, -1);
  testVirtualToChunkLocation(-CHUNK_SIDE_LENGTH - 1, -CHUNK_SIDE_LENGTH - 1, -2, -2);
});

function testChunkCenterLocation(chunkX: number, chunkY: number, x: number, y: number) {
  test(`Chunk(${chunkX}, ${chunkY})`, () => {
    const centerLocation = new Chunk(
      ChunkLocation.of(ChunkCoordinate.of(chunkX), ChunkCoordinate.of(chunkY)),
      undefined
    ).centerLocation();
    expect(centerLocation.x.coordinate).toBe(x);
    expect(centerLocation.y.coordinate).toBe(y);
  });
}

describe("Chunk#centerLocation(): チャンクの中央の仮想座標", () => {
  const halfChunkSideLength: number = CHUNK_SIDE_LENGTH / 2;
  testChunkCenterLocation(0, 0, halfChunkSideLength, halfChunkSideLength);
  testChunkCenterLocation(1, 1, CHUNK_SIDE_LENGTH + halfChunkSideLength, CHUNK_SIDE_LENGTH + halfChunkSideLength);
  testChunkCenterLocation(-1, -1, -halfChunkSideLength, -halfChunkSideLength);
  testChunkCenterLocation(-2, -2, -(CHUNK_SIDE_LENGTH + halfChunkSideLength), -(CHUNK_SIDE_LENGTH + halfChunkSideLength));
});

function testChunkLocationToIndex(chunkX: number, chunkY: number, index: number) {
  test(`(${chunkX}, ${chunkY}) -> ${index}`, () => {
    const locaiton = ChunkLocation.of(ChunkCoordinate.of(chunkX), ChunkCoordinate.of(chunkY));
    expect(ChunkIndex.from(locaiton).index).toBe(index);
  });
}

describe("ChunkIndex#from(): チャンク座標からチャンク番号への変換", () => {
  testChunkLocationToIndex(0, 0, 0);
  testChunkLocationToIndex(2, 1, 9);
});
