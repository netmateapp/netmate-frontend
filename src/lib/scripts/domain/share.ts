import { calculateCharactersCosts } from "$lib/cjk.svelte";
import type { Option } from "$lib/option";
import type { Uuid7 } from "$lib/uuid";
import type { Reactive, Reactivity } from "../extension/reactivity";
import type { UnixTimeMillis } from "../primitive/unixtime";
import type { HandleId } from "./handle";
import type { Tag } from "./tagging.svelte";
import type { Rating } from "./vote";

export type ShareId = Uuid7;

export class Timestamp {
  public readonly unixTimeMillis: UnixTimeMillis;

  constructor(unixTimeMillis: UnixTimeMillis) {
    this.unixTimeMillis = unixTimeMillis;
  }
}

export class ConversationsCount {
  public readonly count: number;

  constructor(count: number) {
    if (!ConversationsCount.isValid(count)) throw new Error("A count must be a non-negative integer.");
    this.count = count;
  }

  private static isValid(count: number): boolean {
    return this.isNonNegativeInteger(count);
  }

  private static isNonNegativeInteger(n: number): boolean {
    return n >= 0 && Number.isInteger(n);
  }
}

const MAX_TITLE_CHARACTERS_COST = 48;

export class Title {
  public readonly title: string;
  
  constructor(title: string) {
    if (!Title.isValid(title)) throw new Error(`The characters cost of title must be less than or equal to ${MAX_TITLE_CHARACTERS_COST}.`);
    this.title = title;
  }

  private static isValid(title: string): boolean {
    return calculateCharactersCosts(title) <= MAX_TITLE_CHARACTERS_COST;
  }
}

const MAX_TEXT_CHARACTERS_COST = 20000;

export class Text {
  public readonly text: string;

  constructor(text: string) {
    if (!Text.isValid(text)) throw new Error(`The characters cost of text must be less than or equal to ${MAX_TEXT_CHARACTERS_COST}.`);
    this.text = text;
  }

  private static isValid(text: string): boolean {
    return calculateCharactersCosts(text) <= MAX_TEXT_CHARACTERS_COST;
  }
}

export class NetmateImageId {
  public readonly id: string;

  constructor(id: string) {
    this.id = id;
  }

  private static isValid(id: string): boolean {
    // 本番環境ではUuid7
    return true;
  }
}

const SOUNDCLOUD_TRACK_ID_REGEX = /^\d+$/;

export class SoundCloudTrackId {
  public readonly id: string;

  constructor(id: string) {
    if (!SoundCloudTrackId.isValid(id)) throw new Error(`An id must be a string consisting of numeric characters.`);
    this.id = id;
  }

  private static isValid(id: string): boolean {
    return this.isSoundCloudTrackId(id);
  }

  private static isSoundCloudTrackId(s: string): boolean {
    return SOUNDCLOUD_TRACK_ID_REGEX.test(s);
  }
}

const YOUTUBE_VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

export class YouTubeVideoId {
  public readonly id: string;

  constructor(id: string) {
    if (!YouTubeVideoId.isValid(id)) throw new Error(`An id must be an 11-character string consisting of alphanumeric characters, underscores, and hyphens only.`);
    this.id = id;
  }

  private static isValid(id: string): boolean {
    return this.isYouTubeVideoId(id);
  }

  private static isYouTubeVideoId(s: string): boolean {
    return YOUTUBE_VIDEO_ID_REGEX.test(s);
  }
}

export type MediaId = NetmateImageId | SoundCloudTrackId | YouTubeVideoId;

export class ShareData {
  public readonly id: ShareId;
  public readonly sharerId: HandleId;
  public readonly timestamp: Timestamp;
  public readonly conversationsCount: ConversationsCount;
  public readonly tags: Tag[];
  public readonly rating: Option<Rating>;
  public readonly title: Option<Title>;
  public readonly text: Option<Text>;
  public readonly thumbnailMediaId: Option<MediaId>;
  public readonly shouldProcessThumbnailImage: boolean;

  constructor(
    id: ShareId,
    sharerId: HandleId,
    timestamp: Timestamp,
    conversationsCount: ConversationsCount,
    tags: Tag[],
    rating: Option<Rating>,
    title?: Option<Title>,
    text?: Option<Text>,
    thumbnailMediaId?: Option<MediaId>,
    shouldProcessThumbnailImage: boolean = false,
  ) {
    if (!ShareData.isValid(thumbnailMediaId, shouldProcessThumbnailImage)) throw new Error(`A shouldProcessThumbnailImage cannot be set to true unless a thumbnail media is an image.`);

    this.id = id;
    this.sharerId = sharerId;
    this.timestamp = timestamp;
    this.conversationsCount = conversationsCount;
    this.tags = tags;
    this.rating = rating;
    this.title = title;
    this.text = text;
    this.thumbnailMediaId = thumbnailMediaId;
    this.shouldProcessThumbnailImage = shouldProcessThumbnailImage;
  }

  private static isValid(thumbnailMediaId: Option<MediaId>, shouldProcessThumbnailImage: boolean) {
    const hasImageThumbnail = thumbnailMediaId instanceof NetmateImageId;
    return hasImageThumbnail ? true : !shouldProcessThumbnailImage;
  }

  isSharer(id: HandleId): boolean {
    return this.sharerId.asHexadecimalRepresentation() === id.asHexadecimalRepresentation();
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

type ClassProperties<T> = {
  [K in keyof T]: T[K] extends Function ? never : K
}[keyof T];

type ShareDataFields = Pick<ShareData, ClassProperties<ShareData>>;

export class ReactiveShareData implements Reactivity<ShareData> {
  private shareData = $state() as ShareData;

  constructor(shareData: ShareData) {
    this.shareData = shareData;
  }

  reactiveValue(): Reactive<ShareData> {
    return this.shareData;
  }

  updateTags(newTags: Tag[]) {
    this.update({ tags: newTags });
  }

  updateRating(newRating: Option<Rating>) {
    this.update({ rating: newRating });
  }

  incrementConversationsCount() {
    this.update({ conversationsCount: new ConversationsCount(this.shareData.conversationsCount.count + 1) });
  }

  decrementConversationsCount() {
    this.update({ conversationsCount: new ConversationsCount(this.shareData.conversationsCount.count - 1) });
  }

  private update(updates: Partial<ShareData>) {
    this.shareData = ReactiveShareData.constructShareData({ ...this.shareData, ...updates });
  }

  private static constructShareData({ id, sharerId, timestamp, conversationsCount, tags, rating, title, text, thumbnailMediaId, shouldProcessThumbnailImage }: ShareDataFields): ShareData {
    return new ShareData(id, sharerId, timestamp, conversationsCount, tags, rating, title, text, thumbnailMediaId, shouldProcessThumbnailImage);
  }
}
