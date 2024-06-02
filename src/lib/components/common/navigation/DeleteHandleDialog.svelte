<script lang="ts">
  import type { MaybeHTMLElement, InteractEvent } from "$lib/types";
  import { interactHandlersEffect } from "$lib/utils.svelte";
  import Overlay from "../confirm-dialog/Overlay.svelte";
  import { _ } from "./nav.svelte";

  let { handleId, closeDialog }: { handleId: string, closeDialog: () => void } = $props();

  let dialog: MaybeHTMLElement = $state(null);
  export function dialogRef(): MaybeHTMLElement {
    return dialog;
  }

  export function contains(element: Element): boolean {
    return true;
  }

  function handleInteractEvent(event: InteractEvent) {
    if (cancelButton?.contains(event.target as Element)) closeDialog();
  }
  interactHandlersEffect(handleInteractEvent)();

  let inputStr = $state("");
  function isInputSatisfied(): boolean {
    return inputStr == "delete this handle";
  }

  let cancelButton: MaybeHTMLElement = $state(null);
</script>

<Overlay />

<div bind:this={dialog} class="dialog">
  <div class="texts">
    <span class="title">{_("delete-dialog-title")}</span>
    <div class="message">{_("delete-dialog-message")}</div>
    <input
      class="input"
      type="text"
      placeholder="delete this handle"
      bind:value={inputStr}
    />
  </div>
  <div class="buttons">
    <button class="action-button" disabled={!isInputSatisfied()}>
      <span class="action-button-label">{_("delete")}</span>
    </button>
    <button bind:this={cancelButton} class="cancel-button">
      <span class="cancel-button-label">{_("cancel")}</span>
    </button>
  </div>
</div>

<style>
  .dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 1rem;
    background-color: var(--dominant-color);
    box-shadow: var(--soft-shadow);
    display: inline-flex;
    padding: 1rem;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    z-index: 2;
  }

  .texts {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    align-self: stretch;
  }

  .title {
    color: var(--secondary-color);
    text-align: center;
    font-family: font(--primary-font);
    font-size: 1rem;
    font-weight: 700;
    align-self: stretch;
  }

  .message {
    color: var(--dark-gray);
    font-family: font(--primary-font);
    font-size: 0.875rem;
    max-width: 17.5rem;
    white-space: pre-wrap;
  }

  .input {
    border-radius: 0.5rem;
    background-color: var(--dominant-color-hover);
    color: var(--dark-gray);
    display: flex;
    padding: 0.25rem 0.5rem;
    align-items: center;
    align-self: stretch;
  }

  .input::placeholder {
    color: var(--light-gray);
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

  .action-button:disabled { 
    background-color: var(--light-gray);
    cursor: default;
  }

  .action-button:not(:disabled):hover {
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
