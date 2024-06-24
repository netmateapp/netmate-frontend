<script lang="ts">
  import { createTranslator } from "$lib/i18n.svelte";
  import { elapsedTime } from "$lib/scripts/domain/share";
  import type { ShareCard } from "$lib/scripts/domain/shareCard";
  import { tooltip } from "../../common/tooltip/useTooltip.svelte";

  const _ = createTranslator("common", "share");

  type Props = {
    shareCard: ShareCard;
    isInSpaceCore?: boolean;
  };

  let { shareCard, isInSpaceCore = false }: Props = $props();

  const MAX_BLUR = 14; // ぼかしの最大値
  const MAX_GRAYSCALE = 0.3; // グレースケールの最大値
  const DURATION = 500;
  const INTERVAL = 100; // 100msごとのインターバル
  const STEPS = DURATION / INTERVAL;
  const BLUR_STEP = MAX_BLUR / STEPS;
  const GRAYSCALE_STEP = MAX_GRAYSCALE / STEPS;

  let intervalId: any;
  let blurValue = MAX_BLUR;
  let grayscaleValue = MAX_GRAYSCALE;
  let isMouseDown = false;
  let step = 0;

  let imageRequireProcessing: HTMLImageElement;

  function resetFilter() {
    if (!isMouseDown) return;
    isMouseDown = false;
    clearInterval(intervalId); // 既存のインターバルをクリア
    intervalId = setInterval(() => {
      blurValue = Math.min(MAX_BLUR, blurValue + BLUR_STEP * 5); // 回復速度はぼかしを取る速度の5倍
      grayscaleValue = Math.min(
        MAX_GRAYSCALE,
        grayscaleValue + GRAYSCALE_STEP * 5,
      ); // 回復速度はぼかしを取る速度の5倍

      // 移動で消失した場合
      if (imageRequireProcessing === null) {
        clearInterval(intervalId);
        step = 0;
        return;
      }

      imageRequireProcessing!.style.filter = `blur(${blurValue}px) grayscale(${grayscaleValue})`;
      if (blurValue === MAX_BLUR && grayscaleValue === MAX_GRAYSCALE) {
        clearInterval(intervalId);
        step = 0;
      }
    }, INTERVAL); // INTERVALごとにぼかしとグレースケールを増やす
  }

  function onMouseDown() {
    if (isInSpaceCore) return;

    isMouseDown = true;
    clearInterval(intervalId); // 既存のインターバルをクリア
    intervalId = setInterval(() => {
      step++;
      blurValue = Math.max(0, blurValue - BLUR_STEP);
      grayscaleValue = Math.max(0, grayscaleValue - GRAYSCALE_STEP);

      if (imageRequireProcessing === null) {
        clearInterval(intervalId);
        step = 0;
        return;
      }

      imageRequireProcessing!.style.filter = `blur(${blurValue}px) grayscale(${grayscaleValue})`;
      if (blurValue === 0 && grayscaleValue === 0) {
        clearInterval(intervalId);
      }
    }, INTERVAL); // INTERVALごとにぼかしとグレースケールを減らす
  }

  function onImageClick(event: MouseEvent) {
    if (step > 1 && !isInSpaceCore) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
</script>

<a
  href="https://netmate.app/shares/{shareCard.sharerId.asHexadecimalRepresentation()}"
  class="share"
>
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
      {#if shareCard.hasImage()}
        <div
          class="media">
          {#if shareCard.shouldProcessThumbnailImage}
            <div
              class="media"
              onmousedown={() => onMouseDown()}
              onmouseup={() => resetFilter()}
              onmouseleave={() => resetFilter()}
              onmousemove={(event) => {
                if (event.buttons === 0) resetFilter();
              }}
              ondragstart={(event) => event.preventDefault()}
              onclick={(event) => onImageClick(event)}>
                <img
                bind:this={imageRequireProcessing}
                src={shareCard.thumbnailMediaId.id}
                class="should-process"/>
            </div>
          {:else}
            <div class="media">
              <img src={shareCard.thumbnailMediaId.id} />
            </div>
          {/if}
        </div>
      {:else}
      <div class="media">
        {#if shareCard.hasSoundCloudAudio()}
          <iframe
            title="SoundCloud audio player"
            scrolling="no"
            frameborder="no"
            allow="autoplay"
            src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/{shareCard
              .thumbnailMediaId
              .id}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=true"
          >
          </iframe>
        {:else if shareCard.hasYouTubeVideo()}
          <iframe
            src="https://www.youtube-nocookie.com/embed/{shareCard
              .thumbnailMediaId.id}"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          >
          </iframe>
        {/if}
      </div>
      {/if}
    {/if}
  </div>
  <div class="footer">
    <div class="information">
      <span class="conversations-count" >{_("conversations-count", { count: shareCard.conversationsCount.count })}</span >
      <span class="timestamp" >{_("timestamp", { ...elapsedTime(shareCard.timestamp.unixTimeMillis.time) })}</span >
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
    overflow: hidden;
    border-radius: 1rem;
  }

  .media img {
    max-width: 100%;
    height: 100%;
    border-radius: 1rem;
  }

  .should-process {
    filter: blur(14px) grayscale(0.3);
    transition: filter 0.1s linear;
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
