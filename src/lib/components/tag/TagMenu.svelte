<script lang="ts">
  import { none, some, type Option, type Optional } from "$lib/option";
  import type { InteractEvent } from "$lib/types";
  import { makeKeydownHandler } from "$lib/utils.svelte";
  import { Uuid4 } from "$lib/uuid";
  import type { SvelteComponent } from "svelte";
  import ConfirmDialog from "../common/confirm-dialog/ConfirmDialog.svelte";
  import { toast } from "../common/toast/useToast.svelte";
  import { tooltip } from "../common/tooltip/useTooltip.svelte";
  import Tabs from "./Tabs.svelte";
  import { TagHierarchy, _ } from "./tag.svelte";
  import { TagName, UnambiguousTag } from "$lib/scripts/domain/tag";
  import TagSearchBox from "./TagSearchBox.svelte";

  let tabs = $state() as SvelteComponent;

  // 投票関連
  type Progress = "unrelated" | "suggested" | "related";
  type Vote = "agree" | "agree-little" | "disagree";

  class ItemTagData {
    public progress: Progress = $state("unrelated");
    public isMeProposer: boolean = $state(false);
    public vote: Optional<Vote> = $state(none());
    constructor(
      public readonly tag: UnambiguousTag,
      progress: Progress,
      isMeProposer: boolean = false,
      vote: Optional<Vote> = none()
    ) {
      this.progress = progress;
      if (isMeProposer) this.isMeProposer = isMeProposer;
      if (vote.isSome()) this.vote = vote;
    }

    hasVote(vote: Vote): boolean {
      return this.vote.isSome() ? this.vote.value === vote : false;
    }
  }

  function genUuid44Test(): Uuid4 {
    let maybeUuid = Uuid4.from("5ca36600-53dc-402b-8bee-0c6f1680b6fd");
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
    const tagsNames = ["早瀬ユウカ", "早瀬ユウカイラスト", "陸八魔アル", "一之瀬アスナ", "天雨アコ", "アロナ", "シッテムの箱","夏の特殊作戦！RABBIT小隊と消えたエビの謎", "古関ウイ", "羽川ハスミ", "空崎ヒナ"];
    const items = tagsNames
      .map(name => new TagName(name))
      .map(displayName => new UnambiguousTag(
        genUuid44Test(),
        displayName
      )).map(tag => new ItemTagData(
        tag,
        getRandomInt(9) === 1 ? "suggested" : "related",
        false,
        some("agree")
      ));
    return items;
  }

  const relationsToItemTagData = new Map<TagHierarchy, ItemTagData[]>([
    [TagHierarchy.Super, []],
    [TagHierarchy.Equivalent, []],
    [TagHierarchy.Sub, randomlyGenItemTagData4Test()]
  ]);

  function currentItemTagData(): ItemTagData[] {
    return isSearchResultVisible ? searchResult : relationsToItemTagData.get(tabs?.getCurrentlySelectedHierarchy() ?? TagHierarchy.Sub)!;
  }

  let isSearchResultVisible = $state(false);
  let searchResult: ItemTagData[] = [];

  function handleInteractToSuggestTagButton(item: ItemTagData) {
    item.progress = "suggested";
    item.isMeProposer = true;
    toast(_("add-new-relation", { tagName: item.tag.name.name, xxxTags: _(`${tabs!.getCurrentlySelectedHierarchy()}-tags`) }));
  }

  const RATING_BUTTONS_DATA: [Vote, string][] = [
    ["agree", "exposure_plus_1"],
    ["agree-little", "exposure_zero"],
    ["disagree", "exposure_neg_1"]
  ];

  function handleInteractToRatingButton(item: ItemTagData, vote: Vote) {
    if (item.hasVote(vote)) item.vote = none();
    else item.vote = some(vote);
  }

  let isConfirmDialogVisible = $state(false);
  function handleInteractToWithdrawButton(event: InteractEvent) {
    isConfirmDialogVisible = true;
  }

  function withdrawTagRelationSuggestion(item: ItemTagData) {
    item.progress = "unrelated";
    toast(_("withdraw-new-relation"));
  }

  function closeConfirmDialog() {
    isConfirmDialogVisible = false;
  }
</script>

<div class="menu">
  <Tabs bind:this={tabs} />
  <TagSearchBox />
  <div class="tags" onwheel={(event) => event.stopPropagation()}>
    {#each currentItemTagData() as item}
      <div class="tag-item" class:related={item.progress === "related"}>
        <div class="tag">
          <a
            href="https://netmate.app/tags/{item.tag.id.asHexadecimalRepresentation()}/space"
            class="tag-name"
            class:unrelated={item.progress === "unrelated"}
            class:suggested={item.progress === "suggested"}
          >{item.tag.name.name}</a>
          {#if item.tag.disambiguation !== undefined}
            <span class="disambiguation">{item.tag.disambiguation?.name}</span>
          {/if}
        </div>
        {#if item.progress !== "related"}
          <div class="centered-buttons">
            {#if item.progress === "unrelated"}
              <button
                class="tag-button"
                onclick={() => handleInteractToSuggestTagButton(item)}
                onkeydown={makeKeydownHandler(() => handleInteractToSuggestTagButton(item))}
                use:tooltip={_("add")}>
                <svg class="tag-button-icon">
                  <use href="/src/lib/assets/tag/add.svg#add"></use>
                </svg>
              </button>
            {:else}
              {#if item.isMeProposer}
                <button
                  class="tag-button tag-withdraw-button"
                  onclick={handleInteractToWithdrawButton}
                  onkeydown={makeKeydownHandler((e) => handleInteractToWithdrawButton(e))}
                  use:tooltip={_("withdraw")}>
                  <svg class="tag-button-icon">
                    <use href="/src/lib/assets/tag/remove.svg#remove"></use>
                  </svg>
                </button>
                {#if isConfirmDialogVisible}
                  <ConfirmDialog title={_("withdraw-dialog-title")} description={_("withdraw-dialog-description")} actionName={_("withdraw-dialog-action-name")} action={() => withdrawTagRelationSuggestion(item)} close={closeConfirmDialog} />
                {/if}
              {:else}
                {#each RATING_BUTTONS_DATA as ratingButtonData}
                  <button
                    class="tag-button"
                    class:toggled={item.hasVote(ratingButtonData[0])}
                    onclick={() => handleInteractToRatingButton(item, ratingButtonData[0])}
                    onkeydown={makeKeydownHandler(() => handleInteractToRatingButton(item, ratingButtonData[0]))}
                    use:tooltip={_(ratingButtonData[0])}>
                    <svg class="tag-button-icon">
                      <use href="/src/lib/assets/tag/{ratingButtonData[1]}.svg#{ratingButtonData[1]}"></use>
                    </svg>
                  </button>
                {/each}
              {/if}
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .menu {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    overflow: hidden;
    gap: 0.5rem;
  }

  .tags {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    overflow-y: auto;
    gap: 0.5rem;
  }

  .tags::-webkit-scrollbar {
    display: none;
  }

  .tag-item {
    max-width: 12.25rem;
    display: flex;
    padding: 0.25rem 0.5rem 0.125rem 0.5rem;
    align-items: flex-start;
  }

  .tag-item:not(.related):hover {
    border-radius: 1rem;
    background: var(--dominant-color);
    box-shadow: var(--soft-shadow);
    display: flex;
    padding: 0.75rem 0.5rem 0.125rem 0.5rem;
    flex-direction: column;
    align-items: flex-start;
  }

  .tag-name {
    color: var(--secondary-color);
    font-family: var(--primary-font);
    font-size: 0.9375rem;
    line-height: 0.9375rem;
    align-self: stretch;
  }

  .tag-name.unrelated {
    color: var(--light-gray);
  }

  .tag-name.suggested {
    color: var(--light-gray);
    font-weight: 700;
  }

  .tag-item.related:hover .tag-name {
    color: var(--accent-color);
  }

  .disambiguation {
    color: var(--light-gray);
    font-family: var(--primary-font);
    font-size: 0.75rem;
    line-height: 1.25rem;
  }

  .centered-buttons {
    display: none;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    align-self: stretch;
  }

  .tag-item:hover .centered-buttons {
    display: flex;
  }

  .tag-button {
    width: 2.125rem;
    height: 2.125rem;
    border-radius: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }

  .tag-button:hover {
    background-color: rgba(22, 122, 198, 0.10);
  }

  .tag-withdraw-button:hover {
    background-color: rgba(198, 22, 22, 0.10);
  }

  .tag-button-icon {
    width: 1.5rem;
    height: 1.5rem;
    fill: var(--light-gray);
  }

  .tag-button:hover .tag-button-icon {
    fill: var(--accent-color);
  }

  .tag-button.toggled .tag-button-icon {
    fill: var(--accent-color);
  }

  .tag-withdraw-button:hover .tag-button-icon {
    fill: var(--warning-color);
  }
</style>
