import { calculateCharactersCosts } from "$lib/cjk.svelte";
import type { Option } from "$lib/option";
import type { Uuid7 } from "$lib/uuid";

export type ShareId = Uuid7;

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

export class Timestamp {
  public readonly unixTimeMillis: number;

  constructor(unixTimeMillis: number) {
    if (!Timestamp.isValid(unixTimeMillis)) throw new Error(`A unixTimeMillis must be a non-negative integer.`);
    this.unixTimeMillis = unixTimeMillis;
  }

  private static isValid(unixTimeMillis: number): boolean {
    return this.isUnixTimeMillis(unixTimeMillis);
  }

  private static isUnixTimeMillis(n: number): boolean {
    return n >= 0 && Number.isInteger(n);
  }
}

