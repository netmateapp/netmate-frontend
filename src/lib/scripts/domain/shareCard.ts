import { calculateCharactersCosts } from "$lib/cjk.svelte";
import type { Option } from "$lib/option";
import type { HandleId } from "./handle";
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

export class ShareCard {
  public readonly id: ShareId;
  public readonly sharerId: HandleId;
  public readonly timestamp: Timestamp;
  public readonly conversationsCount: ConversationsCount;
  public readonly title: Option<Title>;
  public readonly leadSentences: Option<LeadSenetences>;
  public readonly thumbnailMediaId: Option<MediaId>;
  public readonly shouldProcessThumbnailImage: boolean;

  constructor(
    id: ShareId,
    sharerId: HandleId,
    timestamp: Timestamp,
    conversationsCount: ConversationsCount,
    title?: Option<Title>,
    leadSentences?: Option<LeadSenetences>,
    thumbnailMediaId?: Option<MediaId>,
    shouldProcessThumbnailImage: boolean = false,
  ) {
    if (!ShareCard.isValid(thumbnailMediaId, shouldProcessThumbnailImage)) throw new Error(`A shouldProcessThumbnailImage cannot be set to true unless a thumbnail media is an image.`);

    this.id = id;
    this.sharerId = sharerId;
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
