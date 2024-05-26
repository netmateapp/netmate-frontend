<svelte:options customElement={{
  tag: "youtube-embed",
  shadow: "none",
  props: {
    videoId: { attribute: "video-id" }
  }
}}/>

<script lang="ts">
  let { videoId }: { videoId: string } = $props();
</script>

<div class="youtube-container">
  <iframe
    class="youtube-iframe"
    src="https://www.youtube-nocookie.com/embed/{videoId}"
    title="YouTube video player"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrerpolicy="strict-origin-when-cross-origin"
    allowfullscreen>
  </iframe>
</div>

<style>
  .youtube-container {
    position: relative;
    width: 100%;
    height: 80vh;
    max-height: 400px;
    display: flex;
    align-items: center;
    flex-direction: column;
  }

  .youtube-iframe {
    height: 100%;
    aspect-ratio: 16 / 9;
    border: 0;
  }

  :global(.selected iframe) {
    outline: 2px solid var(--accent-color);
  }
</style>