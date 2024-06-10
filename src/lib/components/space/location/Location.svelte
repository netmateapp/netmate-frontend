<script lang="ts">
  import type { MaybeHTMLElement } from "$lib/types";
    import type { Uuid4 } from "$lib/uuid";

  let { locationName, isTag, id, apparentX, apparentY }: { locationName: string, isTag: boolean, id: Uuid4, apparentX: number, apparentY: number } = $props();

  let ref: MaybeHTMLElement = $state(null);
  export function getHeight(): number {
    return ref?.getBoundingClientRect().height ?? 42;
  }
</script>

<div class="location-wrapper" style="top: {apparentY}px; left: {apparentX}px;">
  <a href="https://netmate.app/{isTag ? "tags" : "handles"}/{id.asHexadecimalRepresentation()}/space" bind:this={ref} class="location-name">
    {locationName}
  </a>
</div>

<style>
  .location-wrapper {
    position: absolute;
    transform: translate(-50%, 0);
    width: 45rem;
    display: flex;
    justify-content: center;
  }

  .location-name {
    max-width: 45rem;
    color: var(--accent-color);
    text-align: center;
    font-family: var(--primary-font);
    font-size: 2.25rem;
    line-height: 2.625rem;
    word-break: break-all;
    z-index: 1;
    cursor: pointer;
  }

  .location-name:hover {
    text-decoration: underline 2px;
  }
</style>