<script lang="ts">
  import type { Reactive } from "$lib/scripts/extension/reactivity";
  import { makeKeydownHandler } from "$lib/utils.svelte";
  import { TagHierarchy, _ } from "./tag.svelte";

  // 状態に関する処理
  let currentlySelectedHierarchy: TagHierarchy = $state(TagHierarchy.Sub);

  export function getCurrentlySelectedHierarchy(): Reactive<TagHierarchy> {
    return currentlySelectedHierarchy;
  }

  function isCurrentlySelected(hierarchy: TagHierarchy): boolean {
    return hierarchy === currentlySelectedHierarchy;
  }

  // 制御に関する処理
  function onInteract(hierarchy: TagHierarchy) {
    if (!isCurrentlySelected(hierarchy)) currentlySelectedHierarchy = hierarchy;
  }
</script>

<div class="tabs">
  {#each [TagHierarchy.Super, TagHierarchy.Equivalent, TagHierarchy.Sub] as hierarchy, index}
    <div class="tab" onclick={() => onInteract(hierarchy)} onkeydown={makeKeydownHandler(() => onInteract(hierarchy))}>
      <span class="label" class:selected={isCurrentlySelected(hierarchy)}>{_(`${hierarchy}-tags`)}</span>
    </div>
    {#if index < 2}
      <div class="spacer"></div>
    {/if}
  {/each}
</div>

<style>
  .tabs {
    display: flex;
    width: 11.875rem;
    max-width: 11.875rem;
    align-items: flex-start;
  }

  .tab {
    border-radius: 0.5rem;
    display: flex;
    height: 2rem;
    min-width: 3.625rem;
    padding: 0.25rem 0.125rem 0.125rem 0.125rem;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }

  .tab:hover {
    background-color: var(--dominant-color-hover);
    backdrop-filter: blur(1px);
  }

  .label {
    color: var(--light-gray);
    font-family: var(--primary-font);
    font-size: 0.875rem;
    line-height: 1.3125rem;
  }

  .selected {
    color: var(--secondary-color);
  }

  .spacer {
    max-width: 0.5rem;
    flex: 1 0 0;
    align-self: stretch;
  }
</style>