<script lang="ts">
  import type { InteractEvent, MaybeHTMLElement } from "$lib/types";
  import { interactHandlersEffect } from "$lib/utils.svelte";
  import type { Uuid4 } from "$lib/uuid";

  let { tagId, apparentX, apparentY, jump2Center, shouldCancelClick }: { tagId: Uuid4, apparentX: number, apparentY: number, jump2Center: () => void, shouldCancelClick: () => boolean } = $props();

  function isShare(element: Element): HTMLElement | undefined {
    if (element instanceof HTMLElement) {
      if (element.classList.contains("share")) {
        return element;
      } else if (element.parentElement !== null) {
        return isShare(element.parentElement);
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }

  function handleClick(event: InteractEvent) {
    if (!(ref?.contains(event.target as Element) ?? false)
      || shouldCancelClick()) return;

    const maybeShare = isShare(event.target as Element);
    if (maybeShare !== undefined) {
      event.preventDefault();
      ref?.click();
      return;
    }

    const core = (event.target as HTMLElement);
    const coreStyle = core.style;
    coreStyle.borderRadius = "0";
    coreStyle.width = "64rem";
    coreStyle.height = "64rem";
    coreStyle.backgroundColor = "unset";

    const overlay = (core.children[0] as HTMLElement);
    const overlayStyle = overlay.style;
    overlayStyle.borderRadius = "0";
    overlayStyle.boxShadow = "initial";
    overlayStyle.opacity = "0";

    setTimeout(() => {
      jump2Center();
    }, 500);
  }

  let ref: MaybeHTMLElement = $state(null);
</script>

<a
  bind:this={ref}
  href="../../tags/{tagId.asHexadecimalRepresentation()}/space"
  class="space-core"
  style="top: {apparentY}px; left: {apparentX}px;"
  on:click={handleClick}>
  <div class="shadow-overlay"></div>
  <slot></slot>
</a>

<style>
  .space-core {
    position: absolute;
    width: 61rem;
    height: 61rem;
    flex-shrink: 0;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.01);
    overflow: hidden;
    cursor: pointer;
    transition: border-radius 0.5s, width 0.5s, height 0.5s, background-color 0.5s;
  }

  .shadow-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    box-shadow: 1px 2px 8px 0px rgba(0, 0, 0, 0.16) inset;
    z-index: 1;
    pointer-events: none;
    transition: border-radius 0.5s;
    opacity: 1;
    transition: border-radius 0.5s, box-shadow 0.5s, opacity 0.5s;
  }

  @keyframes animateSpaceCore {
    from {
      border-radius: 50%;
      width: 61rem;
      height: 61rem;
      background-color: rgba(0, 0, 0, 0.01);
    }
    to {
      border-radius: 0%;
      width: 64rem;
      height: 64rem;
      background-color: unset;
    }
  }

  @keyframes animateShadowOverlay {
    from {
      border-radius: 50%;
      box-shadow: 1px 2px 8px 0px rgba(0, 0, 0, 0.16) inset;
      opacity: 1;
    }
    to {
      border-radius: 0%;
      box-shadow: initial;
      opacity: 0;
    }
  }
</style>