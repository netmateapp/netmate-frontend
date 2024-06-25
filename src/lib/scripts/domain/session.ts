import type { Option } from "$lib/option";
import type { Reactivity, Reactive } from "../extension/reactivity";
import type { Handle, HandleId } from "./handle";
import { NetmateImageId, SoundCloudTrackId, YouTubeVideoId, type ShareId, Timestamp, Title, Text } from "./share";
import type { Rating } from "./vote";


export type SessionMediaId = NetmateImageId[] | SoundCloudTrackId | YouTubeVideoId;
// セッションに表示するための共有データ

export class SessionShareData {
  public readonly id: ShareId;
  public readonly sharer: Handle;
  public readonly timestamp: Timestamp;
  public readonly rating: Option<Rating>;
  public readonly title: Option<Title>;
  public readonly text: Option<Text>;
  public readonly thumbnailMediaId: Option<SessionMediaId>;
  public readonly shouldProcessThumbnailImage: boolean;
  public readonly shouldHide: boolean;

  constructor(
    id: ShareId,
    sharer: Handle,
    timestamp: Timestamp,
    rating: Option<Rating>,
    title?: Option<Title>,
    text?: Option<Text>,
    thumbnailMediaId?: Option<SessionMediaId>,
    shouldProcessThumbnailImage: boolean = false,
    shouldHide: boolean = false
  ) {
    if (!SessionShareData.isValid(thumbnailMediaId, shouldProcessThumbnailImage)) throw new Error(`A shouldProcessThumbnailImage cannot be set to true unless a thumbnail media is an image.`);

    this.id = id;
    this.sharer = sharer;
    this.timestamp = timestamp;
    this.rating = rating;
    this.title = title;
    this.text = text;
    this.thumbnailMediaId = thumbnailMediaId;
    this.shouldProcessThumbnailImage = shouldProcessThumbnailImage;
    this.shouldHide = shouldHide;
  }

  private static isValid(thumbnailMediaId: Option<SessionMediaId>, shouldProcessThumbnailImage: boolean) {
    const hasImageThumbnail = thumbnailMediaId !== undefined && !(thumbnailMediaId instanceof SoundCloudTrackId) && !(thumbnailMediaId instanceof YouTubeVideoId);
    return hasImageThumbnail ? true : !shouldProcessThumbnailImage;
  }

  isSharer(id: HandleId): boolean {
    return this.sharer.id.asHexadecimalRepresentation() === id.asHexadecimalRepresentation();
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
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
type ShareDataFields = Pick<SessionShareData, ClassProperties<SessionShareData>>;

export class ReactiveShareData implements Reactivity<SessionShareData> {
  private shareData = $state() as SessionShareData;

  constructor(shareData: SessionShareData) {
    this.shareData = shareData;
  }

  reactiveValue(): Reactive<SessionShareData> {
    return this.shareData;
  }

  updateRating(newRating: Option<Rating>) {
    this.update({ rating: newRating });
  }
  private update(updates: Partial<SessionShareData>) {
    this.shareData = ReactiveShareData.constructShareData({ ...this.shareData, ...updates });
  }

  private static constructShareData({ id, sharer: sharerId, timestamp, rating, title, text, thumbnailMediaId, shouldProcessThumbnailImage }: ShareDataFields): SessionShareData {
    return new SessionShareData(id, sharerId, timestamp, rating, title, text, thumbnailMediaId, shouldProcessThumbnailImage);
  }
}
