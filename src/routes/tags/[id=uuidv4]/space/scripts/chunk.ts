import type { Option } from "$lib/option";
import type { ShareNibble } from "$lib/scripts/domain/shareNibble";
import type { Tag } from "$lib/scripts/domain/tag";
import { VirtualCoordinate, VirtualLocation } from "./position";

const MIN_SIZE_OF_SHARE_NIBBLES_SCHOOL = 1;
const MAX_SIZE_OF_SHARE_NIBBLES_SCHOOL = 2;

export class ShareNibblesSchool {
  public readonly shareNibbles: ShareNibble[];

  constructor(shareNibbles: ShareNibble[]) {
    if (!ShareNibblesSchool.isValid(shareNibbles)) throw new Error(`The length of shareNibbles must be between ${MIN_SIZE_OF_SHARE_NIBBLES_SCHOOL} and ${MAX_SIZE_OF_SHARE_NIBBLES_SCHOOL}.`);
    this.shareNibbles = shareNibbles;
  }

  private static isValid(shareNibbles: ShareNibble[]): boolean {
    const size = shareNibbles.length;
    return MAX_SIZE_OF_SHARE_NIBBLES_SCHOOL <= size && size <= MAX_SIZE_OF_SHARE_NIBBLES_SCHOOL;
  }
}

export class SubtagSpaceCore {
  public readonly tag: Tag;
  public readonly shareNibblesSchool: ShareNibblesSchool;

  constructor(tag: Tag, shareNibblesSchool: ShareNibblesSchool) {
    this.tag = tag;
    this.shareNibblesSchool = shareNibblesSchool;
  }
}

export class Empty {}

export type ChunkContent = ShareNibblesSchool | SubtagSpaceCore | Empty;

export class ChunkCoordinate {
  public readonly coordinate: number;

  private constructor(coordinate: number) {
    if (!ChunkCoordinate.isValid(coordinate)) throw new Error(`A coordinate must be an integer.`);
    this.coordinate = coordinate;
  }

  private static isValid(coordinate: number): boolean {
    return Number.isInteger(coordinate);
  }

  static of(coordinate: number): ChunkCoordinate {
    return new ChunkCoordinate(coordinate);
  }
}

export class ChunkLocation {
  public readonly chunkX: ChunkCoordinate;
  public readonly chunkY: ChunkCoordinate;

  private constructor(chunkX: ChunkCoordinate, chunkY: ChunkCoordinate) {
    this.chunkX = chunkX;
    this.chunkY = chunkY;
  }

  static of(chunkX: ChunkCoordinate, chunkY: ChunkCoordinate) {
    return new ChunkLocation(chunkX, chunkY);
  }
}

const CHUNK_SIDE_LENGTH = 1024;

export class Chunk {
  public readonly location: ChunkLocation;
  public readonly content: ChunkContent;

  constructor(location: ChunkLocation, content: ChunkContent) {
    this.location = location;
    this.content = content;
  }

  centerLocation(): VirtualLocation {
    const halfChunkSideLength: number = CHUNK_SIDE_LENGTH / 2;
    const virtualX: number = this.location.chunkX.coordinate * CHUNK_SIDE_LENGTH + halfChunkSideLength;
    const virtualY: number = this.location.chunkY.coordinate * CHUNK_SIDE_LENGTH + halfChunkSideLength;
    return VirtualLocation.of(VirtualCoordinate.of(virtualX), VirtualCoordinate.of(virtualY));
  }
}

export class ChunkKey {
  public readonly key: string;

  private constructor(chunkX: ChunkCoordinate, chunkY: ChunkCoordinate) {
    this.key = `${chunkX.coordinate}${chunkY.coordinate}`;
  }

  static from(chunkX: ChunkCoordinate, chunkY: ChunkCoordinate): ChunkKey {
    return new ChunkKey(chunkX, chunkY);
  }
}

export class ChunkRepository {
  private readonly map = new Map<string, Chunk>();

  chunkAt(chunkX: ChunkCoordinate, chunkY: ChunkCoordinate): Option<Chunk> {
    return this.map.get(ChunkKey.from(chunkX, chunkY).key);
  }

  hasChunkAt(chunkX: ChunkCoordinate, chunkY: ChunkCoordinate): boolean {
    return this.map.has(ChunkKey.from(chunkX, chunkY).key);
  }

  register(chunk: Chunk) {
    this.map.set(ChunkKey.from(chunk.location.chunkX, chunk.location.chunkY).key, chunk);
  }
}
