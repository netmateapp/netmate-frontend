<script lang="ts">
  import type { InteractEvent, MaybeHTMLElement } from "$lib/types";
  import type { Uuid4 } from "$lib/uuid";

  let {
    tagId,
    apparentX,
    apparentY,
    shouldCancelClick,
  }: {
    tagId: Uuid4;
    apparentX: number;
    apparentY: number;
    shouldCancelClick: () => boolean;
  } = $props();

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
    // スペースを移動するためのクリックならキャンセル
    if (shouldCancelClick()) {
      event.preventDefault();
      return;
    }

    // スペースコア内の共有をクリックした場合でも、コアを共有したものとして扱う
    const maybeShare = isShare(event.target as Element);
    if (maybeShare !== undefined) {
      event.preventDefault();
      ref?.click();
      return;
    }

    const core = ref as HTMLElement;
    const coreStyle = core.style;
    coreStyle.backgroundColor = "unset";
    coreStyle.overflow = "visible";

    (core.parentElement as HTMLElement).style.zIndex = "1";

    const overlay = overlayRef as HTMLElement;
    const overlayStyle = overlay.style;
    overlayStyle.scale = "3";

    const back = backRef as HTMLElement;
    const backStyle = back.style;
    backStyle.scale = "3";
  }

  let ref: MaybeHTMLElement = $state(null);
  let overlayRef: MaybeHTMLElement = $state(null);
  let backRef: MaybeHTMLElement = $state(null);
</script>

<a
  bind:this={ref}
  href="../../tags/{tagId.asHexadecimalRepresentation()}/space"
  class="space-core"
  style="top: {apparentY}px; left: {apparentX}px;"
  on:click={handleClick}
>
  <div bind:this={overlayRef} class="shadow-overlay"></div>
  <slot></slot>
  <div bind:this={backRef} class="back"></div>
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
    transform-origin: center;
    transition: background-color 1s, overflow 1s;
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
    transform-origin: center;
    transition: scale 1s;
  }

  .back {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: white;
    transform-origin: center;
    z-index: -1;
    transition: scale 1s;
  }

  @keyframes core {
    to {
      background-color: rgba(0, 0, 0, 0.01);
      overflow: hidden;
    }
    from {
      background-color: unset;
      overflow: visible;
    }
  }

  @keyframes expand {
    0% {
      transform: scale(1);
    }
    100% {
      transform: scale(3);
    }
  }
</style>
