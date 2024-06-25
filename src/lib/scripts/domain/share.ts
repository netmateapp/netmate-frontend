import { calculateCharactersCosts } from "$lib/cjk.svelte";
import type { Uuid7 } from "$lib/uuid";
import type { Finalizer, LifeCycle } from "../extension/lifeCycle";
import type { UnixTimeMillis } from "../primitive/unixtime";

export type ShareId = Uuid7;

type WithinWeek = { unit: string; amount: number; };

type ThisYear = { unit: string; month: number; date: number; hours: string; minutes: string; };

type PreviousYear = ThisYear & { year: number; };

export function elapsedTime(timestamp: number): WithinWeek | ThisYear | PreviousYear {
  const now: number = Date.now();
  const elapsedMillis: number = now - timestamp;

  const minutes: number = Math.floor(elapsedMillis / (1000 * 60));
  const hours: number = Math.floor(elapsedMillis / (1000 * 60 * 60));
  const days: number = Math.floor(elapsedMillis / (1000 * 60 * 60 * 24));
  const weeks: number = Math.floor(elapsedMillis / (1000 * 60 * 60 * 24 * 7));

  if (weeks > 0) { // 1週間以上の場合は絶対表記
    const time = new Date(timestamp);

    const month: number = time.getMonth() + 1; // 月は0始まりなので1を足す
    const date: number = time.getDate();
    const hours: string = ("0" + time.getHours()).slice(-2);
    const minutes: string = ("0" + time.getMinutes()).slice(-2);

    if (new Date(now).getFullYear() === time.getFullYear()) return { unit: "thisYear", month, date, hours, minutes };
    else return { unit: "previousYear", year: time.getFullYear(), month, date, hours, minutes };
  }
  else if (days > 0) return { unit: "days", amount: days };
  else if (hours > 0) return { unit: "hours", amount: hours };
  else return { unit: "minutes", amount: minutes };
}

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

export class ImageProcessor implements LifeCycle {
  private static readonly MAX_BLUR: number = 14; // ぼかしの最大値
  private static readonly MAX_GRAYSCALE: number = 0.3; // グレースケールの最大値
  private static readonly DURATION: number = 500;
  private static readonly INTERVAL: number = 100; // 100msごとのインターバル
  private static readonly STEPS: number = ImageProcessor.DURATION / ImageProcessor.INTERVAL;
  private static readonly BLUR_STEP: number = ImageProcessor.MAX_BLUR / ImageProcessor.STEPS;
  private static readonly GRAYSCALE_STEP: number = ImageProcessor.MAX_GRAYSCALE / ImageProcessor.STEPS;
  private intervalId: any;
  private blurValue: number = ImageProcessor.MAX_BLUR;
  private grayscaleValue: number = ImageProcessor.MAX_GRAYSCALE;
  private isMouseDown: boolean = false;
  private step: number = 0;

  private readonly isInSpaceCore: boolean;
  imageRequireProcessing: HTMLImageElement | null = null;

  constructor(isInSpaceCore: boolean) {
    this.isInSpaceCore = isInSpaceCore;
  }

  resetFilter() {
    if (!this.isMouseDown) return;
    this.isMouseDown = false;
    clearInterval(this.intervalId); // 既存のインターバルをクリア
    this.intervalId = setInterval(() => {
      this.blurValue = Math.min(ImageProcessor.MAX_BLUR, this.blurValue + ImageProcessor.BLUR_STEP * 5); // 回復速度はぼかしを取る速度の5倍
      this.grayscaleValue = Math.min(
        ImageProcessor.MAX_GRAYSCALE,
        this.grayscaleValue + ImageProcessor.GRAYSCALE_STEP * 5,
      ); // 回復速度はぼかしを取る速度の5倍

      // 移動で消失した場合
      if (this.imageRequireProcessing === null) {
        clearInterval(this.intervalId);
        this.step = 0;
        return;
      }

      this.imageRequireProcessing!.style.filter = `blur(${this.blurValue}px) grayscale(${this.grayscaleValue})`;
      if (this.blurValue === ImageProcessor.MAX_BLUR && this.grayscaleValue === ImageProcessor.MAX_GRAYSCALE) {
        clearInterval(this.intervalId);
        this.step = 0;
      }
    }, ImageProcessor.INTERVAL); // INTERVALごとにぼかしとグレースケールを増やす
  }

  onMouseDown() {
    if (this.isInSpaceCore) return;

    this.isMouseDown = true;
    clearInterval(this.intervalId); // 既存のインターバルをクリア
    this.intervalId = setInterval(() => {
      this.step++;
      this.blurValue = Math.max(0, this.blurValue - ImageProcessor.BLUR_STEP);
      this.grayscaleValue = Math.max(0, this.grayscaleValue - ImageProcessor.GRAYSCALE_STEP);

      if (this.imageRequireProcessing === null) {
        clearInterval(this.intervalId);
        this.step = 0;
        return;
      }

      this.imageRequireProcessing!.style.filter = `blur(${this.blurValue}px) grayscale(${this.grayscaleValue})`;
      if (this.blurValue === 0 && this.grayscaleValue === 0) {
        clearInterval(this.intervalId);
      }
    }, ImageProcessor.INTERVAL); // INTERVALごとにぼかしとグレースケールを減らす
  }

  onImageClick(event: MouseEvent) {
    if (this.step > 1 && !this.isInSpaceCore) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  initialize(): Finalizer {
    if (this.imageRequireProcessing === null) throw new Error(`imageRequireProcessing must be non-null.`);

    const mouseDown = () => this.onMouseDown();
    const reset = () => this.resetFilter();
    const mouseMove = (event: MouseEvent) => {
      if (event.buttons === 0) this.resetFilter();
    };
    const drag = (event: DragEvent) => event.preventDefault();
    const click = (event: MouseEvent) => this.onImageClick(event);


    this.imageRequireProcessing.addEventListener("mousedown", mouseDown);
    this.imageRequireProcessing.addEventListener("mouseup", reset);
    this.imageRequireProcessing.addEventListener("mouseleave", reset);
    this.imageRequireProcessing.addEventListener("mousemove", mouseMove);
    this.imageRequireProcessing.addEventListener("dragstart", drag);
    this.imageRequireProcessing.addEventListener("click", click);

    return () => {
      if (this.imageRequireProcessing !== null) {
        this.imageRequireProcessing.removeEventListener("mousedown", mouseDown);
        this.imageRequireProcessing.removeEventListener("mouseup", reset);
        this.imageRequireProcessing.removeEventListener("mouseleave", reset);
        this.imageRequireProcessing.removeEventListener("mousemove", mouseMove);
        this.imageRequireProcessing.removeEventListener("dragstart", drag);
        this.imageRequireProcessing.removeEventListener("click", click);
      }
    };
  }
}
