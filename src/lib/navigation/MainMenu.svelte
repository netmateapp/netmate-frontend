<script lang="ts">
  import { createTranslator } from "../../i18n.svelte";
  import { calculateMenuPosition } from "./nav.svelte";
  import LanguageSvg from "./svg/LanguageSvg.svelte";
  import ChevronRightSvg from "./svg/ChevronRightSvg.svelte";
  import PublicSvg from "./svg/PublicSvg.svelte";
  import SettingsSvg from "./svg/SettingsSvg.svelte";
  import SignoutSvg from "./svg/SignoutSvg.svelte";
  import InfoSvg from "./svg/InfoSvg.svelte";
  import LanguageMenu from "./LanguageMenu.svelte";
  import LocationMenu from "./LocationMenu.svelte";

  const _ = createTranslator("common", "navigation");

  let mainMenuRef: MaybeElement = $state(null);
  let { basePoint }: { basePoint: DOMRect} = $props();

  export function contains(element: Element): boolean {
    return (mainMenuRef?.contains(element) ?? false)
    || (languageMenu.dropdownMenuRef?.contains(element) ?? false)
    || (locationMenu.dropdownMenuRef?.contains(element) ?? false);
  }

  function isSignedIn(): boolean {
    return false;
  }

  class DropdownMenuData {
    dropdownMenuRef: MaybeComponent = $state(null);
    isDropdownMenuVisible: boolean = $state(false);

    openDropdownMenu() {
      this.isDropdownMenuVisible = true;
      (mainMenuRef as HTMLElement).style.visibility = "hidden";
    }
  }

  let languageMenu = new DropdownMenuData();
  let locationMenu = new DropdownMenuData();
</script>

<div
  bind:this={mainMenuRef}
  class="menu"
  style={calculateMenuPosition(basePoint, mainMenuRef)}>
  {#if isSignedIn()}
    <button class="item" onclick={() => languageMenu.openDropdownMenu()}>
      <svg class="icon">
        <LanguageSvg />
      </svg>
      <span class="label">{_("language-item-label")}</span>
      <span class="spacer"></span>
      <svg class="icon">
        <ChevronRightSvg />
      </svg>
    </button>
    <button class="item" onclick={() => locationMenu.openDropdownMenu()}>
      <svg class="icon">
        <PublicSvg />
      </svg>
      <span class="label">{_("location-item-label")}</span>
      <span class="spacer"></span>
      <svg class="icon">
        <ChevronRightSvg />
      </svg>
    </button>
    <a href="https://netmate.app/settings" class="item">
      <svg class="icon">
        <SettingsSvg />
      </svg>
      <span class="label">{_("settings-item-label")}</span>
    </a>
    <button class="item">
      <svg class="icon">
        <SignoutSvg />
      </svg>
      <span class="label">{_("signout-item-label")}</span>
    </button>
  {:else}
    <button class="item">
      <svg class="icon">
        <InfoSvg />
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

{#if languageMenu.isDropdownMenuVisible}
  <LanguageMenu bind:this={languageMenu.dropdownMenuRef} basePoint={basePoint} />
{/if}

{#if locationMenu.isDropdownMenuVisible}
  <LocationMenu bind:this={locationMenu.dropdownMenuRef} basePoint={basePoint} />
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