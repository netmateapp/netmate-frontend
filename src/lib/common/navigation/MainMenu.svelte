<script lang="ts">
  import { createTranslator } from "../../i18n.svelte";
  import { calculateMenuPosition } from "./nav.svelte";
  import LanguageMenu from "./LanguageMenu.svelte";
  import LocationMenu from "./LocationMenu.svelte";
    import { registerInteractHandler } from "$lib/utils.svelte";
    import AnnouncementsMenu from "./AnnouncementsMenu.svelte";

  const _ = createTranslator("common", "navigation");

  let mainMenuRef: MaybeElement = $state(null);
  let { basePoint }: { basePoint: DOMRect} = $props();

  export function contains(element: Element): boolean {
    return (mainMenuRef?.contains(element) ?? false)
    || (languageMenu.menu?.contains(element) ?? false)
    || (locationMenu.menu?.contains(element) ?? false)
    || (announcementMenu.menu?.contains(element) ?? false);
  }

  function isSignedIn(): boolean {
    return false;
  }

  class ChildMenuData {
    itemRef: MaybeElement = $state(null);
    menu: MaybeComponent = $state(null);
    isVisible: boolean = $state(false);

    openMenu() {
      this.isVisible = true;
      (mainMenuRef as HTMLElement).style.visibility = "hidden";
    }
  }

  let languageMenu = new ChildMenuData();
  let locationMenu = new ChildMenuData();
  let announcementMenu = new ChildMenuData();

  function handleInteractEvent(event: InteractEvent) {
    [languageMenu, locationMenu, announcementMenu].forEach(menuData => {
      if (menuData.itemRef?.contains(event.target as Element)) menuData.openMenu();
    });
  }
  registerInteractHandler(handleInteractEvent);
</script>

<div
  bind:this={mainMenuRef}
  class="menu"
  style={calculateMenuPosition(basePoint, mainMenuRef)}>
  {#if isSignedIn()}
    <button class="item" bind:this={languageMenu.itemRef}>
        <svg class="icon">
          <use href="/src/lib/assets/common/translate.svg#translate"></use>
        </svg>
      <span class="label">{_("language-item-label")}</span>
      <span class="spacer"></span>
      <svg class="icon">
        <use href="/src/lib/assets/common/chevron_right.svg#chevron_right"></use>
      </svg>
    </button>
    <button class="item" bind:this={locationMenu.itemRef}>
      <svg class="icon">
        <use href="/src/lib/assets/common/public.svg#public"></use>
      </svg>
      <span class="label">{_("location-item-label")}</span>
      <span class="spacer"></span>
      <svg class="icon">
        <use href="/src/lib/assets/common/chevron_right.svg#chevron_right"></use>
      </svg>
    </button>
    <a href="https://netmate.app/settings" class="item">
      <svg class="icon">
        <use href="/src/lib/assets/common/settings.svg#settings"></use>
      </svg>
      <span class="label">{_("settings-item-label")}</span>
    </a>
    <button class="item">
      <svg class="icon">
        <use href="/src/lib/assets/common/logout.svg#logout"></use>
      </svg>
      <span class="label">{_("signout-item-label")}</span>
    </button>
  {:else}
    <button class="item" bind:this={announcementMenu.itemRef}>
      <svg class="icon">
        <use href="/src/lib/assets/common/info.svg#info"></use>
      </svg>
      <span class="label">{_("announcements-item-label")}</span>
    </button>
  {/if}
  <div class="links">
    {#each ["terms", "privacy", "contact"] as itemName}
      <a href="https://netmate.app/{itemName}" class="link">{_(itemName + "-link-label")}</a>
    {/each}
  </div>
</div>

{#if languageMenu.isVisible}
  <LanguageMenu bind:this={languageMenu.menu} basePoint={basePoint} />
{/if}

{#if locationMenu.isVisible}
  <LocationMenu bind:this={locationMenu.menu} basePoint={basePoint} />
{/if}

{#if announcementMenu.isVisible}
  <AnnouncementsMenu bind:this={announcementMenu.menu} basePoint={basePoint} />
{/if}

<style>
  .menu {
    position: fixed;
    border-radius: 1rem;
    background-color: var(--dominant-color);
    box-shadow: var(--soft-shadow);
    display: inline-flex;
    padding: 0.5rem 0rem;
    flex-direction: column;
    align-items: center;
    z-index: 1;
  }

  .item {
    display: flex;
    width: 12.875rem;
    padding: 0.5rem;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .item:hover {
    background-color: var(--dominant-color-hover);
  }

  .icon {
    width: 1.5rem;
    height: 1.5rem;
    fill: var(--secondary-color);
  }

  .label {
    color: var(--secondary-color);
    font-family: var(--primary-font);
    font-size: 0.875rem;
    line-height: 1.3125rem;
  }

  .spacer {
    flex: 1 0 0;
    align-self: stretch;
  }

  .links {
    display: flex;
    width: 11.3125rem;
    padding-top: 0.25rem;
    justify-content: center;
    align-items: flex-start;
    align-content: flex-start;
    gap: 0rem 0.5rem;
    flex-wrap: wrap;
  }

  .link {
    color: var(--light-gray);
    font-family: var(--primary-font);
    font-size: 0.75rem;
  }

  .link:hover {
    text-decoration: underline;
  }
</style>