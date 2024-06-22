<script lang="ts">
  import {
    delayTooltip,
    hideTooltip,
  } from "$lib/components/common/tooltip/useTooltip.svelte";
  import type {
    InteractEvent,
    MaybeComponent,
    MaybeHTMLElement,
  } from "$lib/types";
  import { interactHandlersEffect } from "$lib/utils.svelte";
  import AnnouncementsMenu from "./AnnouncementsMenu.svelte";
  import { _ } from "./nav.svelte";

  function hasUnreadAnnouncements(): boolean {
    return true;
  }

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
  use:delayTooltip={{
    tooltipText: _("announcements-button-tooltip"),
    delay: 400,
  }}
>
  <svg class="icon" class:unread={hasUnreadAnnouncements()}>
    {#if isToggled}
      <use href="/src/lib/assets/common/info_FILL.svg#info_FILL"></use>
    {:else}
      <use href="/src/lib/assets/common/info.svg#info"></use>
    {/if}
  </svg>
</button>

{#if isToggled}
  <AnnouncementsMenu
    bind:this={menu}
    basePoint={buttonRef.getBoundingClientRect()}
  />
{/if}

<style>
  .button {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    fill: var(--secondary-color);
    display: flex;
    justify-content: center;
    align-items: center;
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

  .unread {
    fill: var(--accent-color);
  }
</style>
