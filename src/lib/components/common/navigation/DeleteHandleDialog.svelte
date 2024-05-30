<script lang="ts">
  import { registerInteractHandler } from "$lib/utils.svelte";
  import { _ } from "./nav.svelte";

  let { handleId, closeDialog }: { handleId: string, closeDialog: () => void } = $props();

  let dialog: MaybeElement = $state(null);
  export function dialogRef(): MaybeElement {
    return dialog;
  }

  export function contains(element: Element): boolean {
    return true;
  }

  $effect(() => {
    document.getElementsByClassName("message")[0].innerHTML = _(
      "delete-dialog-message",
    ).replaceAll("\n", "<br>");
  });

  function handleInteractEvent(event: InteractEvent) {
    if (cancelButton?.contains(event.target as Element)) closeDialog();
  }
  registerInteractHandler(handleInteractEvent);

  let inputStr = $state("");
  function isInputSatisfied(): boolean {
    return inputStr == "delete this handle";
  }

  let cancelButton: MaybeElement = $state(null);
</script>

<div class="overlay"></div>

<div bind:this={dialog} class="dialog">
  <div class="texts">
    <span class="title">{_("delete-dialog-title")}</span>
    <div class="message"></div>
    <input
      class="input"
      type="text"
      placeholder="delete this handle"
      bind:value={inputStr}
    />
  </div>
  <div class="buttons">
    <button class="action-button" class:active={isInputSatisfied()}>
      <span class="action-button-label">{_("delete")}</span>
    </button>
    <button bind:this={cancelButton} class="cancel-button">
      <span class="cancel-button-label">{_("cancel")}</span>
    </button>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.1);
    z-index: 1;
  }

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
    z-index: 1;
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

  .action-button {
    border-radius: 100vmax;
    background-color: var(--light-gray);
    display: flex;
    height: 2.25rem;
    min-width: 7.5rem;
    padding: 0.5rem;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
  }

  .active {
    background-color: var(--warning-color);
  }

  .active:hover {
    background-color: var(--warning-color-hover);
  }

  .action-button-label {
    color: var(--dominant-color);
    font-family: var(--primary-font);
    font-size: 0.875rem;
  }

  .buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
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
