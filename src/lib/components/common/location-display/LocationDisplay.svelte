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
  <div class="centered-button">
    <button class="button">
      <span class="label">{_(buttonLabelTranslationKey())}</span>
    </button>
  </div>
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
    cursor: default;
  }

  .centered-button {
    display: flex;
    height: 2.0625rem;
    padding: 0rem 0.25rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .button {
    border-radius: 100vmax;
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
    backdrop-filter: blur(1px);
    transition: background-color 0.15s linear, backdrop-filter 0.15s linear;
  }

  .label {
    color: var(--light-gray);
    font-family: var(--primary-font);
    font-size: 0.875rem;
  }
</style>
