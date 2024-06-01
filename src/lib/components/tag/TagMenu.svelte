<script lang="ts">
    import { calculateCharactersCosts } from "$lib/cjk.svelte";
  import { createTranslator } from "$lib/i18n.svelte";
    import { none, type Option } from "$lib/option";
    import { err, ok, type Result } from "$lib/result";
    import { interactHandlersEffect } from "$lib/utils.svelte";
    import type { Uuid4, Uuid7 } from "$lib/uuid";

  const _ = createTranslator("tag", "menu");

  type TagRelation = "super" | "equivalent" | "sub";

  const TAG_RELATIONS: TagRelation[] = ["super", "equivalent", "sub"];
  let selectedTagRelation: TagRelation = $state("sub");
  function isSelectedTagRelation(relation: TagRelation) {
    return selectedTagRelation === relation;
  }

  function setTagRelation(relation: TagRelation) {
    selectedTagRelation = relation;
  }

  let tabsRefs: MaybeHTMLElement[] = [];
  function handleInteractToTab(event: InteractEvent) {
    const target = event.target as Element;
    for (var [index, tabRef] of tabsRefs.entries()) {
      if (tabRef?.contains(target)) {
        const relation = TAG_RELATIONS[index];
        if (selectedTagRelation !== relation) {
          setTagRelation(relation);
          console.log(relation);
        }
        break;
      }
    }
  }

  type Vote = "agree" | "agree-little" | "disagree";

  class DisplayName {
    private constructor(public readonly value: string) {}

    static from(displayName: string): Result<{}, DisplayName> {
      const costs = calculateCharactersCosts(displayName);
      return costs <= TAG_CHARACTERS_COSTS_LIMIT ? ok(new DisplayName(displayName)) : err({});
    }
  }

  class Tag {
    constructor(
      public readonly id: Uuid7,
      public readonly displayName: DisplayName,
      public readonly disambiguation: Option<DisplayName> = none()
    ) {}

    hasDisambiguation(): boolean {
      return this.disambiguation.isSome();
    }
  }

  interactHandlersEffect(handleInteractToTab)();
</script>

<div class="menu">
  <div class="tabs">
    {#each TAG_RELATIONS as relation, index}
      <div bind:this={tabsRefs[index]} class="tab">
        <span
          class="tab-label"
          class:selected-tab={isSelectedTagRelation(relation)}
          >{_(`${relation}-tags`)}</span
        >
      </div>
    {/each}
  </div>
  <div class="search-box">
    <svg class="search-icon">
      <use href="/src/lib/assets/tag/search.svg#search"></use>
    </svg>
    <input class="search-input" placeholder={_("search-and-add-tags")} />
  </div>
  <div class="tags"></div>
</div>

<style>
  .menu {
    position: fixed;
    top: 183px;
    left: 12px;

    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .tabs {
    display: flex;
    width: 11.875rem;
    max-width: 11.875rem;
    align-items: flex-start;
  }

  .tab {
    border-radius: 0.5rem;
    background-color: var(--dominant-color);
    display: flex;
    height: 2rem;
    min-width: 3.625rem;
    padding: 0.25rem 0.125rem 0.125rem 0.125rem;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }

  .tab:hover {
    background-color: var(--dominant-color-hover);
  }

  .tab-label {
    color: var(--light-gray);
    font-family: var(--primary-font);
    font-size: 0.875rem;
    line-height: 1.3125rem;
  }

  .selected-tab {
    color: var(--secondary-color);
  }

  .search-box {
    border-radius: 0.5rem;
    background: var(--dominant-color);
    display: flex;
    padding: 0.25rem;
    align-items: center;
  }

  .search-box:hover {
    background-color: var(--dominant-color-hover);
  }

  .search-icon {
    width: 1.5rem;
    height: 1.5rem;
    fill: var(--light-gray);
  }

  .search-input {
    color: var(--secondary-color);
    font-family: var(--primary-font);
    font-size: 0.875rem;
  }

  .search-input::placeholder {
    color: var(--light-gray);
    font-family: var(--primary-font);
    font-size: 0.875rem;
  }
</style>
