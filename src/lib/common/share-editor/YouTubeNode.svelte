<script lang="ts">
  let { videoId }: { videoId: string } = $props();
</script>

<iframe
  width="560"
  height="315"
  src="https://www.youtube-nocookie.com/embed/{videoId}"
  title="YouTube video player"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  referrerpolicy="strict-origin-when-cross-origin"
  allowfullscreen
></iframe>
