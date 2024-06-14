import type { Option } from "$lib/option";
import { VirtualCoordinate, VirtualLocation } from "../coordinateSystem/virtualCoordinateSystem";
import type { ChunkContent } from "./chunkContent";

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

const CHUNK_SIDE_LENGTH = 1024;
export const BASE_2_CHUNK_SIDE_LENGTH_LOGARITHM = Math.log(CHUNK_SIDE_LENGTH) / Math.log(2);

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

  static fromIndex(chunkIndex: ChunkIndex): ChunkLocation {
    const index: number = chunkIndex.index;

    // インデックス0は原点に対応する
    if (index === 0) return CHUNK_COORDINATE_SYSTEM_ORIGIN;

    // 螺旋の層を決定する
    const layer: number = Math.floor((Math.sqrt(index) + 1) / 2);

    // この層の開始番号を計算
    const layerStart: number = Math.pow(2 * layer - 1, 2);

    // 層内の位置を計算
    const position: number = index - layerStart;
    const sideLength: number = 2 * layer;

    // それぞれの辺の位置を計算
    let chunkX: number;
    let chunkY: number;
    if (position < sideLength) { // 右辺
      chunkX = layer;
      chunkY = (layer - 1) - position;
    } if (position < 2 * sideLength) { // 下辺
      chunkX = (layer - 1) - (position - sideLength);
      chunkY = -layer;
    } else if (position < 3 * sideLength) { // 左辺
      chunkX = -layer;
      chunkY = -(layer - 1) + (position - sideLength * 2);
    } else { // 上辺
      chunkX = -(layer - 1) + (position - sideLength * 3);
      chunkY = layer;
    }

    return ChunkLocation.of(ChunkCoordinate.of(chunkX), ChunkCoordinate.of(chunkY));
  }

  static fromVirtualLocation(virtualLocation: VirtualLocation): ChunkLocation {
    const chunkX = ChunkCoordinate.of(virtualLocation.x.coordinate >> BASE_2_CHUNK_SIDE_LENGTH_LOGARITHM);
    const chunkY = ChunkCoordinate.of(virtualLocation.y.coordinate >> BASE_2_CHUNK_SIDE_LENGTH_LOGARITHM);
    return ChunkLocation.of(chunkX, chunkY);
  }
}

const CHUNK_COORDINATE_SYSTEM_ORIGIN = ChunkLocation.of(ChunkCoordinate.of(0), ChunkCoordinate.of(0));

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

  static from(location: ChunkLocation): ChunkKey {
    return new ChunkKey(location.chunkX, location.chunkY);
  }
}

export class ChunkRepository {
  private readonly map = new Map<string, Chunk>();

  chunkAt(location: ChunkLocation): Option<Chunk> {
    return this.map.get(ChunkKey.from(location).key);
  }

  hasChunkAt(location: ChunkLocation): boolean {
    return this.map.has(ChunkKey.from(location).key);
  }

  register(chunk: Chunk) {
    this.map.set(ChunkKey.from(chunk.location).key, chunk);
  }
}

export class ChunkIndex {
  public readonly index: number;

  constructor(index: number) {
    if (!ChunkIndex.isValid(index)) throw new Error(`An index must be non-negative integer.`);
    this.index = index;
  }

  private static isValid(index: number) {
    return index >= 0 && Number.isInteger(index);
  }

  static from(location: ChunkLocation): ChunkIndex {
    const chunkX: number = location.chunkX.coordinate;
    const chunkY: number = location.chunkY.coordinate;

    const distanceFromOrigin: number = Math.max(Math.abs(chunkX), Math.abs(chunkY));

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

    const chunkGroupLongSideLength: number = 1 + Math.floor(chunkGroupId / 2);

    // チャンクグループ内の最初のチャンクのインデックスを計算
    const chunkGroupStartIndex: number = chunkGroupLongSideLength * chunkGroupLongSideLength + (chunkGroupId % 2 === 0 ? -chunkGroupLongSideLength : 0);

    // チャンクグループ内での位置と足し合わせ、全体におけるチャンクの番号を返す
    const index: number = chunkGroupStartIndex + offset;

    return new ChunkIndex(index);
  }
}
