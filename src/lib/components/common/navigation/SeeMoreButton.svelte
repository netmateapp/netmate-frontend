<script lang="ts">
  import { hideTooltip, tooltip } from "$lib/components/common/tooltip/useTooltip.svelte";
  import MainMenu from "./MainMenu.svelte";
  import { interactHandlersEffect } from "$lib/utils.svelte";
  import { _ } from "./nav.svelte";
  import type { InteractEvent, MaybeHTMLElement, MaybeComponent } from "$lib/types";

  let isToggled = $state(false);

  let seeMoreButtonRef: MaybeHTMLElement = $state(null);
  let mainMenu: MaybeComponent = $state(null);

  function handleInteract(event: InteractEvent) {
    let element = event.target as Element;
    if (isToggled) {
      if (!mainMenu?.contains(element)) isToggled = false;
    } else {
      if (seeMoreButtonRef?.contains(element)) {
        hideTooltip();
        isToggled = true;
      }
    }
  }

  interactHandlersEffect(handleInteract)();
</script>

<button
  bind:this={seeMoreButtonRef}
  class="see-more-button"
  class:toggled={isToggled}
  use:tooltip={_("see-more-button-tooltip")}>
  <svg class="icon">
    <use href="/src/lib/assets/common/more_horiz.svg#more_horiz"></use>
  </svg>
</button>

{#if isToggled}
  <MainMenu bind:this={mainMenu} basePoint={seeMoreButtonRef.getBoundingClientRect()} />
{/if}

<style>
  .see-more-button {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background-color: var(--dominant-color);
    fill: var(--secondary-color);
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }

  .see-more-button:hover, .toggled {
    background-color: var(--dominant-color-hover);
  }

  .icon {
    width: 1.5rem;
    height: 1.5rem;
    fill: var(--secondary-color);
  }
</style>
