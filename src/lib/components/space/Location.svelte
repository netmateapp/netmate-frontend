<script lang="ts">
  let { locationName }: { locationName: string } = $props();
</script>

<span class="location-name">{locationName}</span>

<style>
  .location-name {
    color: var(--accent-color);
    text-align: center;
    font-family: var(--primary-font);
    font-size: 2.25rem;
    line-height: 2.625rem
  }
</style>