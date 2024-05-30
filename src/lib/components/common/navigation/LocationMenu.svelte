<script lang="ts">
  import { createTranslator } from "../../i18n.svelte";
  import { calculateMenuPosition } from "./nav.svelte";

  const _ = createTranslator("common", "navigation");

  const LOCATIONS = ["japan", "korea", "taiwan", "united-states"];

  function updateLocation(location: string) {
    console.log("update location: " + location);
  }

  let { basePoint }: { basePoint:DOMRect } = $props();

  let menuRef: MaybeElement = $state(null);

  export function contains(element: Element): boolean {
    return menuRef?.contains(element) ?? false;
  }
</script>

<div
  bind:this={menuRef}
  class="menu"
  style={calculateMenuPosition(basePoint, menuRef)}>
  {#each LOCATIONS as location}
    <button class="item" onclick={() => updateLocation(location)}>
      <span class="label">{_(location)}</span>
    </button>
  {/each}
</div>

<style>
  .menu {
    position: fixed;
    border-radius: 1rem;
    background-color: var(--dominant-color);
    box-shadow: var(--soft-shadow);
    padding: 0.5rem 0rem;
    display: grid;
    width: fit-content;
    overflow: hidden;
    z-index: 1;
  }

  .item {
    display: flex;
    height: 2.5rem;
    padding: 0.5rem 1rem;
    align-items: center;
    gap: 0.5rem;
    align-self: stretch;
    cursor: pointer;
  }

  .item:hover {
    background-color: var(--dominant-color-hover);
  }

  .label {
    color: var(--secondary-color);
    font-family: var(--primary-font);
    font-size: 0.875rem;
    white-space: nowrap;
  }
</style>