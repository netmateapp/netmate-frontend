<script lang="ts" context="module">
  export class ImageUrl {
    constructor(public readonly url: string) {}
  }

  export class YouTubeId {
    constructor(public readonly videoId: string) {}
  }

  export class SoundCloudId {
    constructor(public readonly trackId: string) {}
  }

  export type MediaKey = ImageUrl | YouTubeId | SoundCloudId;
</script>

<script lang="ts">
  import { createTranslator } from "$lib/i18n.svelte";
  import type { Option } from "$lib/option";
  import { Uuid7 } from "$lib/uuid";
  import { tooltip } from "../../common/tooltip/useTooltip.svelte";
  import { getCurrentX, getCurrentY } from "../coordinateSystem.svelte";

  const _ = createTranslator("common", "share");

  let {
    absoluteX,
    absoluteY,
    id,
    title,
    text,
    mediaKey,
    conversationsCount,
    timestamp,
  }: {
    absoluteX: number;
    absoluteY: number;
    id: Uuid7;
    title: Option<string>;
    text: Option<string>;
    mediaKey: Option<MediaKey>;
    conversationsCount: number;
    timestamp: number;
  } = $props();

  let apparentX: number = $derived(absoluteX + getCurrentX());
  let apparentY: number = $derived(absoluteY + getCurrentY());

  function hasTitle(): boolean {
    return title !== undefined;
  }

  function hasText(): boolean {
    return text !== undefined;
  }

  function hasMedia(): boolean {
    return mediaKey !== undefined;
  }

  function hasImage(key: Option<MediaKey> = mediaKey): key is ImageUrl {
    return key instanceof ImageUrl;
  }

  function imageUrl(): string {
    return hasImage(mediaKey) ? mediaKey.url : "";
  }

  function hasSoundCloudAudio(key: Option<MediaKey> = mediaKey): key is SoundCloudId {
    return key instanceof SoundCloudId;
  }

  function soundCloudId(): string {
    return hasSoundCloudAudio(mediaKey) ? mediaKey.trackId : "";
  }

  function hasYouTubeVideo(key: Option<MediaKey> = mediaKey): key is YouTubeId {
    return key instanceof YouTubeId;
  }

  function youtubeVideoId(): string {
    return hasYouTubeVideo(mediaKey) ? mediaKey.videoId : "";
  }

  type WithinOneWeek = { unit: string; t: number };
  type ThisYear = {
    unit: string;
    month: number;
    day: number;
    hours: string;
    minutes: string;
  };
  type BeforeThisYear = {
    unit: string;
    year: number;
    month: number;
    day: number;
    hours: string;
    minutes: string;
  };

  export function elapsedTime(
    timestamp: number,
  ): WithinOneWeek | ThisYear | BeforeThisYear {
    const now: number = Date.now();
    const elapsedMillis: number = now - timestamp;

    const minutes: number = Math.floor(elapsedMillis / (1000 * 60));
    const hours: number = Math.floor(elapsedMillis / (1000 * 60 * 60));
    const days: number = Math.floor(elapsedMillis / (1000 * 60 * 60 * 24));
    const weeks: number = Math.floor(elapsedMillis / (1000 * 60 * 60 * 24 * 7));

    if (weeks > 0) {
      // 1週間以上の場合は絶対表記
      const date = new Date(timestamp);

      const month: number = date.getMonth() + 1; // 月は0始まりなので1を足す
      const day: number = date.getDate();
      const hours: string = ("0" + date.getHours()).slice(-2);
      const minutes: string = ("0" + date.getMinutes()).slice(-2);

      const nowDate = new Date(now);
      if (nowDate.getFullYear() === date.getFullYear()) {
        return {
          unit: "thisYear",
          month: month,
          day: day,
          hours: hours,
          minutes: minutes,
        };
      } else {
        const year: number = date.getFullYear();
        return {
          unit: "beforeThisYear",
          year: year,
          month: month,
          day: day,
          hours: hours,
          minutes: minutes,
        };
      }
    } else if (days > 0) {
      return { unit: "days", t: days };
    } else if (hours > 0) {
      return { unit: "hours", t: hours };
    } else {
      return { unit: "minutes", t: minutes };
    }
  }
</script>

<a href="https://netmate.app/shares/{id.asHexadecimalRepresentation()}" class="share" style="top: {apparentY}px; left: {apparentX}px;">
  <div class="content">
    <div class="texts">
      {#if hasTitle()}
        <span class="title">{title}</span>
      {/if}
      {#if hasText()}
        <div class="text">{text!}</div>
      {/if}
    </div>
    {#if hasMedia()}
      <div class="media">
        {#if hasImage()}
          <img src={imageUrl()} />
        {:else if hasSoundCloudAudio()}
          <iframe
            title="SoundCloud audio player"
            scrolling="no"
            frameborder="no"
            allow="autoplay"
            src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/{soundCloudId()}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=true">
          </iframe>
        {:else if hasYouTubeVideo()}
          <iframe
            src="https://www.youtube-nocookie.com/embed/{youtubeVideoId()}"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen>
          </iframe>
        {/if}
      </div>
    {/if}
  </div>
  <div class="footer">
    <div class="information">
      <span class="conversations-count"
        >{_("conversations-count", { count: conversationsCount })}</span
      >
      <span class="timestamp"
        >{_("timestamp", { ...elapsedTime(timestamp) })}</span
      >
    </div>
    <div class="more-button" use:tooltip={_("more-button-tooltip")}>
      <svg class="more-button-icon">
        <use href="/src/lib/assets/common/more_horiz.svg#more_horiz"></use>
      </svg>
    </div>
  </div>
</a>

<style>
  .share {
    position: fixed;
    width: 29.25rem;
    max-height: 29.25rem;
    padding: 1rem 1rem 0.125rem 1rem;
    border-radius: 0.75rem;
    background-color: var(--dominant-color);
    box-shadow: var(--soft-shadow);
    display: flex;
    gap: 0.125rem;
    flex-direction: column;
  }

  .content {
    width: 100%;
    max-height: 25.875rem;
    display: grid;
    grid-template-rows: auto 1fr;
    overflow: hidden;
  }
  
  .texts {
    width: 100%;
    display: grid;
    grid-template-rows: auto 1fr;
    overflow: hidden;
  }

  .title {
    color: var(--accent-color);
    font-family: var(--primary-font);
    font-size: 1.125rem;
    line-height: 1.625rem;
    word-break: break-all;
  }

  .text {
    color: var(--secondary-color);
    font-family: var(--primary-font);
    font-size: 0.9375rem;
    line-height: 1.25rem;
    word-break: break-all;
    white-space: pre-wrap;
  }

  .media {
    width: 100%;
    height: 100%;
    min-height: 15.625rem;
    text-align: center;
  }

  .media img {
    max-width: 100%;
    height: 100%;
    border-radius: 1rem;
  }

  .media iframe {
    width: 100%;
    height: 100%;
    border-radius: 1rem;
  }

  .footer {
    width: 27.625rem;
    display: flex;
    align-items: center;
    gap: 0.125rem;
  }

  .information {
    display: flex;
    width: 25.375rem;
    justify-content: space-between;
    align-items: center;
  }

  .conversations-count {
    color: var(--dark-gray);
    font-family: var(--primary-font);
    font-size: 0.9375rem;
    line-height: 1.375rem;
  }

  .timestamp {
    color: var(--dark-gray);
    font-family: var(--primary-font);
    font-size: 0.9375rem;
    line-height: 1.375rem;
  }

  .more-button {
    width: 2.125rem;
    height: 2.125rem;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }

  .more-button:hover,
  .toggled {
    background-color: var(--dominant-color-hover);
  }

  .more-button-icon {
    width: 1.5rem;
    height: 1.5rem;
    fill: var(--dark-gray);
  }
</style>
