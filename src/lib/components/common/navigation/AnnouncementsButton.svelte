<script lang="ts">
  import {
    hideTooltip,
    tooltip,
  } from "$lib/components/common/tooltip/useTooltip.svelte";
  import { interactHandlersEffect } from "$lib/utils.svelte";
  import AnnouncementsMenu from "./AnnouncementsMenu.svelte";
  import { _ } from "./nav.svelte";

  function hasUnreadAnnouncements(): boolean {
    return true;
  }

  let isToggled: boolean = $state(false);
  let buttonRef: MaybeElement = $state(null);
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
  use:tooltip={_("announcements-button-tooltip")}
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
    background-color: var(--dominant-color);
    fill: var(--secondary-color);
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }

  .button:hover,
  .toggle {
    background-color: var(--dominant-color-hover);
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
