<script lang="ts">
  import { createTranslator } from "$lib/i18n.svelte";
  import type { InteractEvent, MaybeHTMLElement } from "$lib/types";
  import { interactHandlersEffect } from "$lib/utils.svelte";

  const _ = createTranslator("common", "search-box");

  let searchBox: MaybeHTMLElement = $state(null);

  let isActive = $state(false);
  let query = $state("");

  function shouldTipsTickerDisplay() {
    return isActive;
  }

  function suggestions(): string[] {
    return query ? ["a", "b", "c"] : [];
  }

  function search(query: string) {
    window.location.href = `https://netmate.app/search?q=${query}`;
  }

  const TIPS_TRANSLATION_KEYS = [
    "tag-specifier-tip",
    "handle-specifier-tip",
    "exact-match-operator-tip",
    "until-operator-tip",
    "since-operator-tip",
    "op-operator-tip",
    "and-operator-tip",
    "exclude-operator-tip",
    "nest-syntax-tip",
  ];

  function tip(): string {
    return TIPS_TRANSLATION_KEYS[
      Math.floor(Math.random() * TIPS_TRANSLATION_KEYS.length)
    ];
  }

  // 相互作用関連
  function isInteractInsideSearchBox(element: Element): boolean {
    return searchBox?.contains(element) ?? false;
  }

  function handleInteractEvent(event: InteractEvent) {
    const element = event.target as Element;
    const isInside: boolean = isInteractInsideSearchBox(element);
    if (isActive && !isInside) isActive = false;
    else if (!isActive && isInside) isActive = true;
  }
  interactHandlersEffect(handleInteractEvent)();
</script>

<div
  bind:this={searchBox}
  class="search-box"
  class:active={shouldTipsTickerDisplay()}
>
  <div class="search-bar">
    <svg class="icon">
      <use href="/src/lib/assets/common/search.svg#search"></use>
    </svg>
    <input
      class="query-input"
      bind:value={query}
    />
  </div>
  {#if isActive}
    <div class="separator"></div>
    <div class="tips-ticker">
      <div class="centered-tip">
        <span class="tip">{_(tip())}</span>
      </div>
    </div>
    <div class="separator"></div>
    <div class="suggestions">
      {#each suggestions() as suggestion}
        <button class="suggestion" onclick={() => search(suggestion)}>
          <svg class="icon">
            <use href="/src/lib/assets/common/search.svg#search"></use>
          </svg>
          <span class="suggested-query">{suggestion}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .search-box {
    border-radius: 100vmax;
    background-color: var(--dominant-color);
    box-shadow: 0px 2px 8px 1px rgba(0, 0, 0, 0.12);
    display: flex;
    width: 45vw;
    padding-right: 0.5rem;
    flex-direction: column;
    align-items: center;
    overflow: hidden;
  }

  .search-box:hover {
    box-shadow: 0px 2px 8px 1px rgba(0, 0, 0, 0.2);
  }

  .active {
    border-radius: 1rem;
    box-shadow: 0px 2px 8px 1px rgba(0, 0, 0, 0.2);
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

  .query-input {
    height: 1.25rem;
    flex: 1 0 0;
    color: var(--secondary-color);
    font-family: var(--primary-font);
    font-size: 0.9375rem;
    font-weight: 400;
    line-height: 1.25rem;
  }

  .separator {
    width: 95%;
    height: 0.03125rem;
    background-color: var(--lighter-gray);
  }

  .tips-ticker {
    height: 1.875rem;
    display: flex;
    padding: 0.0625rem 0rem;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    align-self: stretch;
  }

  .centered-tip {
    display: flex;
    padding-top: 0.125rem;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    align-self: stretch;
  }

  .tip {
    color: var(--light-gray);
    font-family: var(--primary-font);
    font-size: 0.8125rem;
    line-height: 1.3125rem;
    cursor: default;
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
    cursor: pointer;
  }

  .suggestion:hover {
    background-color: var(--dominant-color-hover);
  }

  .suggested-query {
    min-height: 1.25rem;
    color: var(--secondary-color-hover);
    font-family: var(--primary-font);
    font-size: 0.9375rem;
    line-height: 1.25rem;
  }
</style>
