<script lang="ts">
  import { createTranslator } from "$lib/i18n.svelte";
  import { registerInteractHandler } from "$lib/utils.svelte";

  let { title, description, actionName, action, close }: { title: string, description: string, actionName: string, action: () => void, close: () => void } = $props();

  $effect(() => {
    document.getElementsByClassName("description")[0].innerHTML = description.replaceAll("\n", "<br>");
  });

  const _ = createTranslator("common", "confirm-dialog");

  let actionButtonRef: MaybeHTMLElement = $state(null);
  let cancelButtonRef: MaybeHTMLElement = $state(null);

  function handleInteractEvent(event: InteractEvent) {
    const target = event.target as Element;
    if (actionButtonRef?.contains(target)) {
      action();
      close();
    } else if (cancelButtonRef?.contains(target)) {
      close();
    }
  }
  registerInteractHandler(handleInteractEvent);
</script>

<div class="dialog">
  <div class="messages">
    <span class="title">{title}</span>
    <span class="description">{description}</span>
  </div>
  <div class="button">
    <div class="action-button">
      <span class="action-button-label">{actionName}</span>
    </div>
    <div class="cancel-button">
      <span class="cancel-button-label">{_("cancel")}</span>
    </div>
  </div>
</div>

<style>
  .dialog {
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
  }

  .action-button:hover {
    background-color: var(--warning-color-hover);
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
</style>
