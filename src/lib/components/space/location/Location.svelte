<script lang="ts">
  let { locationName, apparentX, apparentY }: { locationName: string, apparentX: number, apparentY: number } = $props();
</script>

<span class="location-name" style="top: {apparentY}px; left: {apparentX}px;">
  {locationName}
</span>

<style>
  .location-name {
    position: absolute;
    transform: translate(-50%, 0);
    width: 100%;
    max-width: 45rem;
    color: var(--accent-color);
    text-align: center;
    font-family: var(--primary-font);
    font-size: 2.25rem;
    line-height: 2.625rem;
    word-break: break-all;
    z-index: 1;
  }
</style>