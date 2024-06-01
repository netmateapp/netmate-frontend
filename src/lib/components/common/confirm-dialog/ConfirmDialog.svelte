<script lang="ts">
  import { createTranslator } from "$lib/i18n.svelte";
  import { interactHandlersEffect } from "$lib/utils.svelte";
  import Overlay from "./Overlay.svelte";

  let {
    title,
    description,
    actionName,
    action,
    close,
  }: {
    title: string;
    description: string;
    actionName: string;
    action: () => void;
    close: () => void;
  } = $props();

  /*$effect(() => {
    document.getElementsByClassName("description")[0].innerHTML =
      description.replaceAll("\n", "<br>");
  });*/

  const _ = createTranslator("common", "confirm-dialog");

  let dialog: MaybeHTMLElement = $state(null);
  export function dialogRef(): MaybeHTMLElement {
    return dialog;
  }

  let actionButtonRef: MaybeHTMLElement = $state(null);
  let cancelButtonRef: MaybeHTMLElement = $state(null);

  function handleInteractEvent(event: InteractEvent) {
    const target = event.target as Element;
    if (actionButtonRef?.contains(target)) {
      action();
      close();
    } else if (
      cancelButtonRef?.contains(target)
    ) {
      close();
    }
  }
  interactHandlersEffect(handleInteractEvent)();
</script>

<Overlay />

<div bind:this={dialog} class="dialog">
  <div class="messages">
    <span class="title">{title}</span>
    <span class="description">{description}</span>
  </div>
  <div class="buttons">
    <div bind:this={actionButtonRef} class="action-button">
      <span class="action-button-label">{actionName}</span>
    </div>
    <div bind:this={cancelButtonRef} class="cancel-button">
      <span class="cancel-button-label">{_("cancel")}</span>
    </div>
  </div>
</div>

<style>
  .dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 1rem;
    background: var(--dominant-color);
    box-shadow: var(--soft-shadow);
    display: inline-flex;
    padding: 1rem;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    z-index: 2;
  }

  .messages {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .title {
    color: var(--secondary-color);
    font-family: var(--primary-font);
    font-size: 1rem;
    font-weight: 700;
  }

  .description {
    color: var(--dark-gray);
    font-family: var(--primary-font);
    font-size: 0.875rem;
    white-space: pre-wrap;
  }

  .buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .action-button {
    border-radius: 100vmax;
    background-color: var(--warning-color);
    display: flex;
    height: 2.25rem;
    min-width: 7.5rem;
    padding: 0.5rem;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .action-button:hover {
    background-color: var(--warning-color-hover);
  }

  .action-button-label {
    color: var(--dominant-color);
    font-family: var(--primary-font);
    font-size: 0.875rem;
  }

  .cancel-button {
    border-radius: 100vmax;
    background-color: var(--dominant-color);
    display: flex;
    height: 2.25rem;
    min-width: 7.5rem;
    padding: 0.5rem;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .cancel-button:hover {
    background-color: var(--dominant-color-hover);
  }

  .cancel-button-label {
    color: var(--secondary-color);
    font-family: var(--primary-font);
    font-size: 0.875rem;
  }
</style>
