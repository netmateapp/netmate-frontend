<script lang="ts">
  import { delayTooltip, hideTooltip } from "$lib/components/common/tooltip/useTooltip.svelte";
  import type { InteractEvent, MaybeComponent, MaybeHTMLElement } from "$lib/types";
  import { interactHandlersEffect } from "$lib/utils.svelte";
  import LanguageMenu from "./LanguageMenu.svelte";
  import { _ } from "./nav.svelte";

  function selectedLanguage() {
    return "JA";
  }

  let buttonRef: MaybeHTMLElement = $state(null);
  let isToggled: boolean = $state(false);

  let menuRef: MaybeComponent = $state(null);

  function handleInteractEvent(event: InteractEvent) {
    const element = event.target as Element;
    if (isToggled) {
      if (!menuRef.contains(element)) isToggled = false;
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
  use:delayTooltip={{ tooltipText: _("language-button-tooltip"), delay: 400 }}>
  <svg class="icon">
    <use href="/src/lib/assets/common/translate.svg#translate"></use>
  </svg>
  <span class="selected-value">{selectedLanguage()}</span>
</button>

{#if isToggled}
  <LanguageMenu bind:this={menuRef} basePoint={buttonRef.getBoundingClientRect()} />
{/if}

<style>
  .button {
    border-radius: 100vmax;
    display: flex;
    padding: 0.5rem;
    justify-content: center;
    align-items: center;
    gap: 0.25rem;
    cursor: pointer;
  }

  .button:not(.toggle):hover {
    background-color: var(--dominant-color-hover);
    backdrop-filter: blur(1px);
    transition: background-color 0.25s linear 0.35s, backdrop-filter 0.25s linear 0.35s;
  }

  .toggle {
    background-color: var(--dominant-color-hover);
    backdrop-filter: blur(1px);
    transition: none;
  }

  .icon {
    width: 1.5rem;
    height: 1.5rem;
    fill: var(--secondary-color);
  }

  .selected-value {
    color: var(--light-gray);
    font-family: Roboto;
    font-size: 0.75rem;
  }
</style>