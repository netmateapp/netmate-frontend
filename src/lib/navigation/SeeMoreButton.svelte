<script lang="ts">
  import { tooltip } from "$lib/common/tooltip/useTooltip.svelte";
  import { createTranslator } from "../../i18n.svelte";
  import MainMenu from "./MainMenu.svelte";
  import { registerInteractHandler } from "$lib/utils.svelte";
  import MoreHorizSvg from "./svg/MoreHorizSvg.svelte";

  const _ = createTranslator("common", "navigation");

  let isToggled = $state(false);

  let seeMoreButtonRef: MaybeElement = $state(null);
  let mainMenu: MaybeComponent = $state(null);

  function handleInteract(event: InteractEvent) {
    let element = event.target as Element;
    if (isToggled) {
      if (!mainMenu?.contains(element)) isToggled = false;
    } else {
      if (seeMoreButtonRef?.contains(element)) isToggled = true;
    }
  }

  registerInteractHandler(handleInteract);
</script>

<svg
  bind:this={seeMoreButtonRef}
  class="see-more-button"
  class:toggled={isToggled}
  role="button"
  tabindex="0"
  use:tooltip={_("see-more-button-tooltip")}>
  <MoreHorizSvg />
</svg>

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
  }

  .see-more-button:hover, .toggled {
    background-color: var(--dominant-color-hover);
  }
</style>
