<script lang="ts">
  import type { InteractEvent } from "$lib/types";
  import { interactHandlersEffect } from "$lib/utils.svelte";
  import { _ } from "./tag.svelte";

  let boxRef: HTMLElement;
  let isActive: boolean = $state(false);

  function isInsideSearchBox(target: Element): boolean {
    return boxRef?.contains(target) ?? false;
  }

  function onInteract(event: InteractEvent) {
    if (event.target instanceof Element) {
      const isInside: boolean = isInsideSearchBox(event.target);
      if (isActive && !isInside) isActive = false;
      else if (!isActive && isInside) isActive = true;
    }
  }

  interactHandlersEffect(onInteract)();
</script>

<div bind:this={boxRef} class="box" class:active={isActive}>
  <svg class="icon">
    <use href="/src/lib/assets/tag/search.svg#search"></use>
  </svg>
  <input class="input" placeholder={_("search-and-add-tags")} />
</div>

<style>
  .box {
    border-radius: 0.5rem;
    display: flex;
    max-width: 11.875rem;
    padding: 0.25rem;
    align-items: center;
  }

  .box:hover, .active {
    background-color: var(--dominant-color-hover);
    backdrop-filter: blur(1px);
  }

  .icon {
    width: 1.5rem;
    height: 1.5rem;
    fill: var(--light-gray);
  }

  .input {
    color: var(--secondary-color);
    font-family: var(--primary-font);
    font-size: 0.875rem;
  }

  .input::placeholder {
    color: var(--light-gray);
    font-family: var(--primary-font);
    font-size: 0.875rem;
  }
</style>