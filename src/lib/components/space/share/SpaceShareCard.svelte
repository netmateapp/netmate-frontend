<script lang="ts">
  import { createTranslator } from "$lib/i18n.svelte";
  import type { ShareCard } from "$lib/scripts/domain/shareCard";
  import type { RealLocation } from "../../../../routes/tags/[id=uuidv4]/space/scripts/coordinateSystem/realCoordinateSystem";
  import { tooltip } from "../../common/tooltip/useTooltip.svelte";

  const _ = createTranslator("common", "share");

  type Props = {
    shareCard: ShareCard;
    location: RealLocation;
  };

  let { shareCard, location }: Props = $props();

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

<div class="share-wrapper" style="top: {location.y.coordinate}px; left: {location.x.coordinate}px;">
  <a href="https://netmate.app/shares/{shareCard.sharerId.asHexadecimalRepresentation()}" class="share">
    <div class="content">
      <div class="texts">
        {#if shareCard.title !== undefined}
          <span class="title">{shareCard.title.title}</span>
        {/if}
        {#if shareCard.leadSentences !== undefined}
          <div class="text">{shareCard.leadSentences.sentences}</div>
        {/if}
      </div>
      {#if shareCard.thumbnailMediaId !== undefined}
        <div class="media">
          {#if shareCard.hasImage()}
            <img src={shareCard.thumbnailMediaId.id} />
          {:else if shareCard.hasSoundCloudAudio()}
            <iframe
              title="SoundCloud audio player"
              scrolling="no"
              frameborder="no"
              allow="autoplay"
              src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/{shareCard.thumbnailMediaId.id}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=true">
            </iframe>
          {:else if shareCard.hasYouTubeVideo()}
            <iframe
              src="https://www.youtube-nocookie.com/embed/{shareCard.thumbnailMediaId.id}"
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
        <span class="conversations-count">{_("conversations-count", { count: shareCard.conversationsCount.count })}</span>
        <span class="timestamp">{_("timestamp", { ...elapsedTime(shareCard.timestamp.unixTimeMillis.time) })}</span>
      </div>
      <div class="more-button" use:tooltip={_("more-button-tooltip")}>
        <svg class="more-button-icon">
          <use href="/src/lib/assets/common/more_horiz.svg#more_horiz"></use>
        </svg>
      </div>
    </div>
  </a>
</div>

<style>
  .share-wrapper {
    position: absolute;
    display: inline-flex;
    width: 29.25rem;
    height: 29.25rem;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .share {
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

  .share:hover {
    background-color: #f9f9f9;
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
