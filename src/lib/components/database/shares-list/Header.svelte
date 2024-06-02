<script lang="ts" context="module">
  export type Sort = "history" | "newest" | "oldest";
</script>

<script lang="ts">
  import { makeKeydownHandler } from "$lib/utils.svelte";
  import { _ } from "../database.svelte";

  let { resultsCount, initialSort }: { resultsCount: number; initialSort: Sort } =
    $props();

  const SORTS: Sort[] = ["history", "newest", "oldest"];
  let selectedSort: Sort = $state(initialSort);

  function isSelected(sort: Sort) {
    return sort === selectedSort;
  }

  function handleInteractToButton(sort: Sort) {
    if (!isSelected(sort)) selectedSort = sort;
  }
</script>

<div class="header">
  <span class="total-hits">{_("total-hits", { count: resultsCount })}</span>
  <div class="buttons">
    {#each SORTS as sort}
      <button
        class="button"
        class:selected={isSelected(sort)}
        onclick={() => handleInteractToButton(sort)}
        onkeydown={makeKeydownHandler(() => handleInteractToButton(sort))}
      >
        <span class="label">{_(sort)}</span>
      </button>
    {/each}
  </div>
</div>

<style>
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    align-self: stretch;
  }

  .total-hits {
    color: var(--dark-gray);
    font-family: var(--primary-font);
    font-size: 0.875rem;
  }

  .buttons {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .button {
    border-radius: 100vmax;
    display: flex;
    height: 2.25rem;
    padding: 0.5625rem 0.5rem 0.375rem 0.5rem;
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

  .button.selected .label {
    color: var(--dark-gray);
  }
</style>
