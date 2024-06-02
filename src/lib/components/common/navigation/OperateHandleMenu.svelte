<script lang="ts">
  import type { InteractEvent, MaybeComponent, MaybeHTMLElement } from "$lib/types";
  import { interactHandlersEffect } from "$lib/utils.svelte";
  import DeleteHandleDialog from "./DeleteHandleDialog.svelte";
  import { _, calculateMenuPosition } from "./nav.svelte";

  let { basePoint, handleId, onEdit }: { basePoint: DOMRect, handleId: string, onEdit: () => void } = $props();

  let menuRef: MaybeHTMLElement = $state(null);
  export function contains(element: Element): boolean {
    return (menuRef?.contains(element) ?? false) || deleteHandleDialog?.contains(element);
  }

  let deleteHandleDialog: MaybeComponent = $state(null);

  let isToggled = $state(false);
  let editButton: MaybeHTMLElement = $state(null);
  let deleteButton: MaybeHTMLElement = $state(null);
  let currentIndex = $state(0);
  function isButtonToggled(index: number) {
    return isToggled && index == currentIndex;
  }
  function handleInteractEvent(event: InteractEvent) {
    const element = event.target as Element;
    if (isToggled) {
      if (!deleteHandleDialog?.dialogRef()?.contains(element)) isToggled = false;
    } else {
      if (editButton?.contains(element)) {
        onEdit();
      } else if (deleteButton?.contains(element)) {
        currentIndex = 1;
        isToggled = true;
      }
      /*for (var [index, button] of buttons.entries()) {
        if (button && button.contains(event.target as Element)) {
          currentIndex = index;
          isToggled = true;
          return;
        }
      }*/
    }
  }
  interactHandlersEffect(handleInteractEvent)();

  function closeDeleteHandleDialog() {
    isToggled = false;
  }
</script>

<div bind:this={menuRef} class="menu" style={calculateMenuPosition(basePoint, menuRef)}>
  <button
    bind:this={editButton}
    class="item"
    class:toggled={isButtonToggled(0)}>
    <span class="label">{_("edit")}</span>
  </button>
  <button
    bind:this={deleteButton}
    class="item"
    class:toggled={isButtonToggled(1)}>
    <span class="label">{_("delete")}</span>
  </button>
</div>

{#if isToggled && currentIndex == 1}
  <DeleteHandleDialog bind:this={deleteHandleDialog} handleId={handleId} closeDialog={closeDeleteHandleDialog} />
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
    align-items: flex-start;
    z-index: 1;
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