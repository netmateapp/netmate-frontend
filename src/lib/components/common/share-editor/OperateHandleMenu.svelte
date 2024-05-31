<script lang="ts">
  import { interactHandlersEffect } from "$lib/utils.svelte";
  import { _, calculateMenuPosition } from "./editor.svelte";

  let { basePoint, onEdit }: { basePoint: DOMRect, handleId: string, onEdit: () => void } = $props();

  let menuRef: MaybeElement = $state(null);
  export function contains(element: Element): boolean {
    return menuRef?.contains(element) ?? false;
  }

  let isToggled = $state(false);
  let editButton: MaybeElement = $state(null);
  let currentIndex = $state(0);
  function isButtonToggled(index: number) {
    return isToggled && index == currentIndex;
  }
  function handleInteractEvent(event: InteractEvent) {
    const element = event.target as Element;
    if (!isToggled) {
      if (editButton?.contains(element)) {
        onEdit();
      }
    }
  }
  interactHandlersEffect(handleInteractEvent)();
</script>

<div bind:this={menuRef} class="menu" style={calculateMenuPosition(basePoint, menuRef)}>
  <button
    bind:this={editButton}
    class="item"
    class:toggled={isButtonToggled(0)}>
    <span class="label">{_("edit")}</span>
  </button>
</div>

<style>
  .menu {
    position: fixed;
    border-radius: 1rem;
    background-color: var(--dominant-color);
    box-shadow: var(--soft-shadow);
    display: inline-flex;
    padding: 0.5rem 0rem;
    flex-direction: column;
    align-items: flex-start;
    z-index: 2;
  }

  .item {
    display: flex;
    padding: 0.5rem 1rem;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
  }

  .item:hover, .toggled {
    background-color: var(--dominant-color-hover);
  }

  .label {
    color: var(--secondary-color);
    font-family: font(--primary-font);
    font-size: 0.875rem;
  }
</style>