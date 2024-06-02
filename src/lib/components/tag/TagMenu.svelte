<script lang="ts">
    import { calculateCharactersCosts } from "$lib/cjk.svelte";
    import { TAG_CHARACTERS_COSTS_LIMIT } from "$lib/constan";
    import { createTranslator } from "$lib/i18n.svelte";
    import { none, type Option } from "$lib/option";
    import { Ok, err, ok, type Result } from "$lib/result";
    import type { MaybeHTMLElement, InteractEvent } from "$lib/types";
    import { interactHandlersEffect } from "$lib/utils.svelte";
    import { Uuid4 } from "$lib/uuid";

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
  function handleInteractToTagTab(event: InteractEvent) {
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

  class DisplayName {
    private constructor(public readonly value: string) {}

    static from(displayName: string): Result<{}, DisplayName> {
      const costs = calculateCharactersCosts(displayName);
      return costs <= TAG_CHARACTERS_COSTS_LIMIT ? ok(new DisplayName(displayName)) : err({});
    }
  }

  class Tag {
    constructor(
      public readonly id: Uuid4,
      public readonly displayName: DisplayName,
      public readonly disambiguation: Option<DisplayName> = none()
    ) {}

    hasDisambiguation(): boolean {
      return this.disambiguation.isSome();
    }
  }

  type Progress = "unrelated" | "suggested" | "related";
  type Vote = "agree" | "agree-little" | "disagree";

  class ItemTagData {
    constructor(
      public readonly tag: Tag,
      public progress: Progress,
      public isMeProposer: boolean = false,
      public vote: Option<Vote> = none()
    ) {}
  }

  function genUuid44Test(): Uuid4 {
    let maybeUuid = Uuid4.from("018fd2cc-7e27-7dfa-8424-87f58f98bfcc");
    let testUuid: Uuid4;
    if (maybeUuid.isOk()) {
      testUuid = maybeUuid.value;
    }
    return testUuid!;
  }

  function getRandomInt(max: number): number {
    return Math.floor(Math.random() * max);
  }

  function randomlyGenItemTagData4Test(): ItemTagData[] {
    const tagsNames = ["早瀬ユウカ", "陸八魔アル", "一之瀬アスナ", "天雨アコ", "夏の特殊作戦！RABBIT小隊と消えたエビの謎"];
    const items = tagsNames
      .map(name => DisplayName.from(name))
      .filter(res => res.isOk())
      .map(res => (res as Ok<{}, DisplayName>).value)
      .map(displayName => new Tag(
        genUuid44Test(),
        displayName
      )).map(tag => new ItemTagData(
        tag,
        getRandomInt(2) === 1 ? "suggested" : "related"
      ));
    return items;
  }

  const relationsToItemTagData = new Map<TagRelation, ItemTagData[]>([
    ["super", []],
    ["equivalent", []],
    ["sub", randomlyGenItemTagData4Test()]
  ]);

  function currentItemTagData(): ItemTagData[] {
    return isSearchResultVisible ? searchResult : relationsToItemTagData.get(selectedTagRelation)!;
  }

  let isSearchResultVisible = $state(false);
  let searchResult: ItemTagData[] = [];

  interactHandlersEffect(handleInteractToTagTab)();
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
  <div class="tags">
    {#each currentItemTagData() as item}
      <div class="tag">
        <a
          href="https://netmate.app/tags/{item.tag.id.asHexadecimalRepresentation()}/space"
          class="tag-name"
        >{item.tag.displayName}</a>
      </div>
    {/each}
  </div>
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
