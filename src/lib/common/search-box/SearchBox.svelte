<script lang="ts">
  import { createTranslator } from "$lib/i18n.svelte";
  const _ = createTranslator("common", "search-box");

  let isFocused = $state(false);
  let query = $state("");

  function shouldTipsTickerDisplay() {
    return isFocused || query;
  }

  function suggestions(): string[] {
    return query ? ["a", "b", "c"] : [];
  }
</script>

<div class="search-box">
  <div class="search-bar">
    <svg class="icon">
      <use href="/src/lib/assets/common/search.svg#search"></use>
    </svg>
    <input
      class="search-input"
      onfocus={() => (isFocused = true)}
      onblur={() => (isFocused = false)}
      bind:value={query}
    />
  </div>
  {#if shouldTipsTickerDisplay()}
    <div class="tips-ticker">
      <div class="button-collision-left">
        <svg class="icon">
          <use href="/src/lib/assets/common/chevron_left.svg#chevron_left"
          ></use>
        </svg>
      </div>
      <span class="tip">tip</span>
      <div class="button-collision-right">
        <svg class="icon">
          <use href="/src/lib/assets/common/chevron_right.svg#chevron_right"
          ></use>
        </svg>
      </div>
    </div>
  {/if}
  <div class="suggestions">
    {#each suggestions() as suggestion}
      <div class="suggestion">
        <svg class="icon">
          <use href="/src/lib/assets/common/search.svg#search"></use>
        </svg>
        <span class="suggested-query">{suggestion}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .search-box {
    position: fixed;
    top: 8px;
    left: 50%;
    transform: translate(-50%, 0%);
    border-radius: 2rem;
    background-color: var(--dominant-color);
    box-shadow: 0px 2px 8px 1px rgba(0, 0, 0, 0.12);
    display: flex;
width: 45%;
flex-direction: column;
align-items: flex-start;
    z-index: 1;
  }

  .search-bar {
    display: flex;
padding: 0.5rem 0.5rem 0.4375rem 0.5rem;
align-items: center;
gap: 0.5rem;
align-self: stretch;
  }

  .icon {
    width: 1.5rem;
    height: 1.5rem;
    fill: var(--light-gray);
  }

  .search-input {
    color: var(--secondary-color);
  }

  .tips-ticker {
    display: flex;
    padding: 0.0625rem 0rem;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    align-self: stretch;
  }

  .button-collision-left {
    display: flex;
    padding-left: 0.5rem;
    align-items: flex-start;
    gap: 0.5rem;
    flex: 1 0 0;
    align-self: stretch;
  }

  .button-collision-right {
    display: flex;
    padding-left: 0.5rem;
    align-items: flex-start;
    gap: 0.5rem;
    flex: 1 0 0;
    align-self: stretch;
  }

  .button-collision-left {
    display: flex;
    padding-right: 0.5rem;
    justify-content: flex-end;
    align-items: flex-start;
    gap: 0.5rem;
    flex: 1 0 0;
    align-self: stretch;
  }

  .tip {
    color: var(--light-gray);
    font-family: var(--primary-font);
    font-size: 0.8125rem;
    line-height: 1.3125rem;
  }

  .suggestions {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    align-self: stretch;
  }

  .suggestion {
    display: flex;
    padding: 0.25rem 0.5rem 0.1875rem 0.5rem;
    align-items: center;
    gap: 0.5rem;
    align-self: stretch;
  }

  .suggested-query {
    min-height: 1.25rem;
    color: var(--secondary-color-hover);
    font-family: var(--primary-font);
    font-size: 0.9375rem;
    line-height: 1.25rem;
  }
</style>
