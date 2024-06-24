<script lang="ts">
  import { ImageSliderController } from "$lib/scripts/domain/imageSlide.svelte";
  import { ImageProcessor, NetmateImageId, SoundCloudTrackId, YouTubeVideoId, elapsedTime, type SessionShareData } from "$lib/scripts/domain/share";

  type Props = {
    number: number,
    share: SessionShareData;
  };

  let { number, share }: Props = $props();

  // 画像を持つ場合の関連処理
  const imageProcessor = new ImageProcessor(false);
  const imageSliderController = new ImageSliderController();
  if (share.hasImage()) {
    imageSliderController.imagePaths = (share.thumbnailMediaId as NetmateImageId[]);
  }

  $effect(() => {
    if (imageProcessor.imageRequireProcessing) {
      return imageProcessor.initialize();
    }
  });
</script>

<div bind:this={imageSliderController.sliderEditorRef} class="share">
  <div class="content">
    <div class="texts">
      {#if share.title !== undefined}
        <span class="title">{share.title}</span>
      {/if}
      {#if share.text !== undefined}
        <div class="text">{share.text}</div>
      {/if}
    </div>
    {#if share.thumbnailMediaId !== undefined}
      {#if share.hasImage()}
        <div bind:this={imageSliderController.sliderRef} class="slider">
          {#each (share.thumbnailMediaId as NetmateImageId[]) as imagePath, index}
            <div class="slide">
              <img
                src={imagePath.id}
                ondragstart={(e) => e.preventDefault()}
                ontouchstart={(event) => imageSliderController.touchStart(event, index)}
                ontouchend={() => imageSliderController.touchEnd()}
                ontouchmove={(event) => imageSliderController.touchMove(event)}
                onmousedown={(event) => imageSliderController.touchStart(event, index)}
                onmouseup={() => imageSliderController.touchEnd()}
                onmouseleave={() => imageSliderController.touchEnd()}
                onmousemove={(event) => imageSliderController.touchMove(event)}
              />
            </div>
          {/each}
        </div>
        {#if imageSliderController.shouldDisplayDotsIndicator()}
          <div class="dots-indicator">
            {#each (share.thumbnailMediaId as NetmateImageId[]) as _, pageNumber}
              <div
                class="dot"
                class:current-page={imageSliderController.isCurrentPageNumber(pageNumber)}
              ></div>
            {/each}
          </div>
        {/if}
      {:else}
        <div class="media">
          {#if share.hasSoundCloudAudio()}
            <iframe
              title="SoundCloud audio player"
              scrolling="no"
              frameborder="no"
              allow="autoplay"
              src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/{(share.thumbnailMediaId as SoundCloudTrackId).id}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=true">
            </iframe>
          {:else if share.hasYouTubeVideo()}
            <iframe
              src="https://www.youtube-nocookie.com/embed/{(share.thumbnailMediaId as YouTubeVideoId).id}"
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
    <div class="footer">
      <span class="number">{number}</span>
      <div class="footer-right">
        <span class="handle">{share.sharer.name.name}</span>
        <span class="dot-separator">·</span>
        <span class="timestamp">{elapsedTime(share.timestamp.unixTimeMillis.time)}</span>
      </div>
    </div>
  </div>
</div>

<style>
  .share {
    display: flex;
    width: 63.125rem;
    padding: 1rem 1rem 0.125rem 1rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.125rem;
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
    align-self: stretch;
  }

  .texts {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    align-self: stretch;
  }

  .title {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    align-self: stretch;
  }

  .text {
    color: var(--secondary-color);
    font-family: var(--primary-font);
    font-size: 0.9375rem;
    line-height: 1.25rem;
    align-self: stretch;
  }

  .link {
    color: var(--accent-color);
  }

  .slider {
    height: 85vh;
    display: flex;
    flex-direction: row;
    align-items: center;
    align-self: stretch;
    transition: transform 0.5s ease;
  }

  .slider:hover {
    cursor: pointer;
  }

  .slide {
    width: 61.625rem;
    height: 85vh;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    align-self: stretch;
  }

  .slide img {
    height: 100%;
    max-height: 85vh;
    border-radius: 1rem;
    object-fit: contain;
  }

  .dots-indicator {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }

  .dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background-color: var(--light-gray);
  }

  .current-page {
    background-color: var(--dark-gray);
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    align-self: stretch;
  }

  .number {
    color: var(--dark-gray);
    font-family: Roboto;
    font-size: 0.9375rem;
    line-height: 1.375rem;
  }

  .footer-right {
    display: flex;
    align-items: center;
  }

  .handle {
    color: var(--dark-gray);
    font-family: var(--primary-font);
    font-size: 0.9375rem;
    line-height: 1.375rem;
  }

  .dot-separator {
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
</style>