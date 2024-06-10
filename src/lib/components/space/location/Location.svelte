<script lang="ts">
  let { locationName, apparentX, apparentY }: { locationName: string, apparentX: number, apparentY: number } = $props();
</script>

<span class="location-name">{locationName}</span>

<style>
  .location-name {
    position: absolute;
    color: var(--accent-color);
    text-align: center;
    font-family: var(--primary-font);
    font-size: 2.25rem;
    line-height: 2.625rem
  }
</style>