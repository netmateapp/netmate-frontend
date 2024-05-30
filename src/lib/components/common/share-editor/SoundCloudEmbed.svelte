<svelte:options customElement={{
  tag: "soundcloud-embed",
  shadow: "none",
  props: {
    trackId: { attribute: "track-id" }
  }
}}/>

<script lang="ts">
  let { trackId }: { trackId: string } = $props();
</script>

<div class="soundcloud-container">
  <iframe
    class="soundcloud-iframe"
    scrolling="no"
    frameborder="no"
    allow="autoplay"
    src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/{trackId}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=true">
  </iframe>
</div>

<style>
  .soundcloud-container {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
  }

  .soundcloud-iframe {
    width: 100%;
    height: 300px;
    border-radius: 1rem;
  }

  :global(.selected iframe) {
    outline: 2px solid var(--accent-color);
  }
</style>