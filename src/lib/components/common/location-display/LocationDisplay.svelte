<script lang="ts">
  import { createTranslator } from "$lib/i18n.svelte";

  let { locationName, isSpace }: { locationName: string; isSpace: boolean } =
    $props();

  const _ = createTranslator("common", "navigation");

  function buttonLabelTranslationKey(): string {
    return isSpace ? "go-to-database" : "go-to-space";
  }
</script>

<div class="current-location">
  <div class="location-name-display">
    <div class="spacer"></div>
    <span class="location-name">{locationName}</span>
  </div>
  <button class="button">
    <span class="label">{_(buttonLabelTranslationKey())}</span>
  </button>
</div>

<style>
  .current-location {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .location-name-display {
    display: flex;
    align-items: flex-start;
  }

  .spacer {
    width: 0.5rem;
    max-width: 0.5rem;
    align-self: stretch;
  }

  .location-name {
    max-width: 12.375rem;
    color: var(--secondary-color);
    font-family: var(--primary-font);
    font-size: 1.375rem;
    line-height: 1.875rem;
  }

  .button {
    border-radius: 100vmax;
    background-color: var(--dominant-color);
    border: 1px solid var(--light-gray);
    display: flex;
    width: 11.375rem;
    padding: 0.375rem 0.5rem;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .button:hover {
    background-color: var(--dominant-color-hover);
  }

  .label {
    color: var(--light-gray);
    font-family: var(--primary-font);
    font-size: 0.875rem;
  }
</style>
