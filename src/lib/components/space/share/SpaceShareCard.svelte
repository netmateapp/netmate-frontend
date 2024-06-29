<script lang="ts">
  import { createTranslator } from "$lib/i18n.svelte";
  import { ImageProcessor, elapsedTime } from "$lib/scripts/domain/share";
  import type { ShareCard } from "$lib/scripts/domain/shareCard";
  import { tooltip } from "../../common/tooltip/useTooltip.svelte";

  const _ = createTranslator("common", "share");

  type Props = {
    shareCard: ShareCard;
    isInSpaceCore?: boolean;
  };

  let { shareCard, isInSpaceCore = false }: Props = $props();

  const imageProcessor = new ImageProcessor(isInSpaceCore);

  $effect(() => {
    if (imageProcessor.imageRequireProcessing) {
      return imageProcessor.initialize();
    }
  });
</script>

<a
  href="https://netmate.app/shares/{shareCard.id.asHexadecimalRepresentation()}"
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
        <div class="media">
          {#if shareCard.shouldProcessThumbnailImage}
            <img bind:this={imageProcessor.imageRequireProcessing} src={shareCard.thumbnailMediaId.id} class="should-process"/>
          {:else}
            <img src={shareCard.thumbnailMediaId.id} />
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
