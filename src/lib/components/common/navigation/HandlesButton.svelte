<script lang="ts">
  import { hideTooltip, tooltip } from "$lib/components/common/tooltip/useTooltip.svelte";
  import type { InteractEvent, MaybeHTMLElement, MaybeComponent } from "$lib/types";
  import { interactHandlersEffect } from "$lib/utils.svelte";
  import HandlesMenu from "./HandlesMenu.svelte";
  import { _ } from "./nav.svelte";

  let isToggled: boolean = $state(false);
  let buttonRef: MaybeHTMLElement = $state(null);
  let menu: MaybeComponent = $state(null);
  function handleInteractEvent(event: InteractEvent) {
    const element = event.target as Element;
    if (isToggled) {
      if (!menu.contains(element)) isToggled = false;
    } else {
      if (buttonRef?.contains(element)) {
        hideTooltip();
        isToggled = true;
      }
    }
  }
  interactHandlersEffect(handleInteractEvent)();
</script>

<button
  bind:this={buttonRef}
  class="button"
  class:toggle={isToggled}
  use:tooltip={_("handles-button-tooltip")}>
  <svg class="icon">
    {#if isToggled}
      <use href="/src/lib/assets/common/person_FILL.svg#person_FILL"></use>
    {:else}
      <use href="/src/lib/assets/common/person.svg#person"></use>
    {/if}
  </svg>
</button>

{#if isToggled}
  <HandlesMenu bind:this={menu} basePoint={buttonRef.getBoundingClientRect()} />
{/if}

<style>
  .button {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }

  .button:hover, .toggle {
    background-color: var(--dominant-color-hover);
    backdrop-filter: blur(1px);
  }

  .icon {
    width: 1.5rem;
    height: 1.5rem;
    fill: var(--secondary-color);
    pointer-events: none;
  }
</style>