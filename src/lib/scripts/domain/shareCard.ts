import { calculateCharactersCosts } from "$lib/cjk.svelte";
import type { Option } from "$lib/option";
import { type ShareId, type Timestamp, type ConversationsCount, type Title, type MediaId, NetmateImageId, YouTubeVideoId, SoundCloudTrackId } from "./share";

const MAX_LEAD_SENTENCES_CHARACTERS_COST = 1218;

export class LeadSenetences {
  public readonly sentences: string;

  constructor(sentences: string) {
    if (!LeadSenetences.isValid(sentences)) throw new Error(`A character cost of sentences must be less than or equal to ${MAX_LEAD_SENTENCES_CHARACTERS_COST}.`);
    this.sentences = sentences;
  }

  private static isValid(sentences: string): boolean {
    return calculateCharactersCosts(sentences) <= MAX_LEAD_SENTENCES_CHARACTERS_COST;
  }
}

/*
 共有IDからタイムスタンプを取得するコードを追加する必要

 function extractTimestampFromUUIDv7(uuid: string): number {
    // UUIDを16進数の数値に変換
    const hexTimeStr = uuid.replace(/-/g, '').substring(0, 12);

    // 16進数を数値に変換
    const time = parseInt(hexTimeStr, 16);

    // ナノ秒単位のタイムスタンプをミリ秒単位に変換（1秒 = 10^6ミリ秒）
    const timestamp = time / 1e6;

    return timestamp;
}

// 使用例
const uuidv7 = '018b0e34-5cc2-7fa0-89b6-5ab9bb3dc9ec';
const timestamp = extractTimestampFromUUIDv7(uuidv7);
console.log(new Date(timestamp));  // タイムスタンプを人間が読める日付に変換して表示


フィールドは保持
コンストラクタでid -> timestamp

 */

export class ShareCard {
  public readonly id: ShareId;
  public readonly timestamp: Timestamp;
  public readonly conversationsCount: ConversationsCount;
  public readonly title: Option<Title>;
  public readonly leadSentences: Option<LeadSenetences>;
  public readonly thumbnailMediaId: Option<MediaId>;
  public readonly shouldProcessThumbnailImage: boolean;

  constructor(
    id: ShareId,
    timestamp: Timestamp,
    conversationsCount: ConversationsCount,
    title?: Option<Title>,
    leadSentences?: Option<LeadSenetences>,
    thumbnailMediaId?: Option<MediaId>,
    shouldProcessThumbnailImage: boolean = false,
  ) {
    if (!ShareCard.isValid(thumbnailMediaId, shouldProcessThumbnailImage)) throw new Error(`A shouldProcessThumbnailImage cannot be set to true unless a thumbnail media is an image.`);

    this.id = id;
    this.timestamp = timestamp;
    this.conversationsCount = conversationsCount;
    this.title = title;
    this.leadSentences = leadSentences;
    this.thumbnailMediaId = thumbnailMediaId;
    this.shouldProcessThumbnailImage = shouldProcessThumbnailImage;
  }

  private static isValid(thumbnailMediaId: Option<MediaId>, shouldProcessThumbnailImage: boolean) {
    const hasImageThumbnail = thumbnailMediaId instanceof NetmateImageId;
    return hasImageThumbnail ? true : !shouldProcessThumbnailImage;
  }

  hasImage(): boolean {
    return this.thumbnailMediaId instanceof NetmateImageId;
  }

  hasYouTubeVideo(): boolean {
    return this.thumbnailMediaId instanceof YouTubeVideoId;
  }

  hasSoundCloudAudio(): boolean {
    return this.thumbnailMediaId instanceof SoundCloudTrackId;
  }
}
