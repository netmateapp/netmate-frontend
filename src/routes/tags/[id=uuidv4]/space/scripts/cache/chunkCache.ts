import type { Option } from "$lib/option";
import type { Tag, TagId } from "$lib/scripts/domain/tag";
import { UnixTimeMillis } from "$lib/scripts/primitive/unixtime";
import type { ChunkRepository } from "../chunk/chunk";

const CACHE_VALIDITY_HOURS: number = 1;

export class ExpiringChunkCache {
  public readonly expiry: UnixTimeMillis;
  public readonly tag: Tag;
  public readonly chunkRepository: ChunkRepository;

  constructor(lastUpdated: UnixTimeMillis, tag: Tag, chunkRepository: ChunkRepository) {
    const expiryTime: number = lastUpdated.time + CACHE_VALIDITY_HOURS * 60 * 60 * 1000;
    this.expiry = new UnixTimeMillis(expiryTime);
    this.tag = tag;
    this.chunkRepository = chunkRepository;
  }
}

export class ChunkCacheStore {
  private readonly store = new Map<string, ExpiringChunkCache>();

  put(cache: ExpiringChunkCache): boolean {
    if (!ChunkCacheStore.isValidCache(cache)) return false;
    
    this.store.set(cache.tag.id.asHexadecimalRepresentation(), cache);
    return true;
  }

  get(id: TagId): Option<ExpiringChunkCache> {
    const cache = this.store.get(id.asHexadecimalRepresentation());
    if (cache !== undefined) {
      if (ChunkCacheStore.isValidCache(cache)) return cache;
      else this.remove(id);
    }
    return undefined;
  }

  cleanUp() {
    for (var [key, value] of this.store.entries()) {
      if (!ChunkCacheStore.isValidCache(value)) this.store.delete(key);
    }
  }

  private remove(id: TagId) {
    this.store.delete(id.asHexadecimalRepresentation());
  }

  private static isValidCache(cache: ExpiringChunkCache) {
    return cache.expiry.time >= UnixTimeMillis.now().time;
  }
}