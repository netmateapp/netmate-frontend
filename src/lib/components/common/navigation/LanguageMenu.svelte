<script lang="ts">
  import type { MaybeHTMLElement } from "$lib/types";
  import { _, calculateMenuPosition } from "./nav.svelte";

  const LANGUAGES = ["japanese", "korean", "traditional-chinese", "us-english"];

  function updateLanguage(language: string) {
    console.log("update language: " + language);
  }

  let { basePoint }: { basePoint:DOMRect } = $props();

  let menuRef: MaybeHTMLElement = $state(null);

  export function contains(element: Element): boolean {
    return menuRef?.contains(element) ?? false;
  }
</script>

<div
  bind:this={menuRef}
  class="menu"
  style={calculateMenuPosition(basePoint, menuRef)}>
  {#each LANGUAGES as language}
    <button class="item" onclick={() => updateLanguage(language)}>
      <span class="label">{_(language)}</span>
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