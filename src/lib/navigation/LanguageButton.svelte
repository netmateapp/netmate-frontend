<script lang="ts">
    import { tooltip } from "$lib/common/tooltip/useTooltip.svelte";
  import { registerInteractHandler } from "$lib/utils.svelte";
    import { createTranslator } from "../../i18n.svelte";
  import LanguageMenu from "./LanguageMenu.svelte";
  import LanguageSvg from "./svg/LanguageSvg.svelte";

  const _ = createTranslator("common", "navigation")

  function selectedLanguage() {
    return "JA";
  }

  let buttonRef: MaybeElement = $state(null);
  let isToggled: boolean = $state(false);

  let menuRef: MaybeComponent = $state(null);

  function handleInteractEvent(event: InteractEvent) {
    const element = event.target as Element;
    if (isToggled) {
      if (!menuRef.contains(element)) isToggled = false;
    } else {
      if (buttonRef?.contains(element)) isToggled = true;
    }
  }

  registerInteractHandler(handleInteractEvent);
</script>

<button
  bind:this={buttonRef}
  class="button"
  class:toggle={isToggled}
  use:tooltip={_("language-button-tooltip")}>
  <svg class="icon">
    <LanguageSvg />
  </svg>
  <span class="selected-value">{selectedLanguage()}</span>
</button>

{#if isToggled}
  <LanguageMenu bind:this={menuRef} basePoint={buttonRef.getBoundingClientRect()} />
{/if}

<style>
  .button {
    border-radius: 100vmax;
    background-color: var(--dominant-color);
    display: flex;
    padding: 0.5rem;
    justify-content: center;
    align-items: center;
    gap: 0.25rem;
  }

  .button:hover, .toggle {
    background-color: var(--dominant-color-hover);
  }

  .icon {
    width: 1.5rem;
    height: 1.5rem;
  }

  .selected-value {
    color: var(--light-gray);
    font-family: Roboto;
    font-size: 0.75rem;
  }
</style>