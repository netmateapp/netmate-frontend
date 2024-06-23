<script lang="ts">
  import { makeKeydownHandler } from "$lib/utils.svelte";
  import { Vote } from "$lib/scripts/domain/vote";
  import { CandidateTag, NewTag, OtherSuggestedTag, ReactiveShareTags, StabilizedTag, UserSuggestedTag, _ } from "./menu.svelte";
  import ConfirmDialog from "$lib/components/common/confirm-dialog/ConfirmDialog.svelte";
  import { tooltip } from "$lib/components/common/tooltip/useTooltip.svelte";
  import { Tag } from "$lib/scripts/domain/tag";

  type Props = {
    tags: ReactiveShareTags;
  };

  let { tags }: Props = $props();

  // スペースにおけるスケールとの干渉を回避する
  function onWheel(event: WheelEvent) {
    event.stopPropagation();
  }

  // 提案関連
  function onSuggest(tag: CandidateTag | string, index: number) {
    //share.tags[index] = new UserSuggestedTag(tag.tag);

    // タグとIDのないタグの両方を受け付ける必要がある
  }

  // 投票関連
  function onVoteButtonClick(tag: OtherSuggestedTag, vote: Vote) {
    if (tag.userVote === vote) tag.userVote = undefined;
    else tag.userVote = vote;
  }

  // 撤回関連
  let isConfirmationDialogVisible: boolean = $state(false);

  function onWithdrawButtonClick() {
    isConfirmationDialogVisible = true;
  }

  function onWithdraw(tag: UserSuggestedTag) {
    const newTags = tags.reactiveValue().filter(t => t !== tag);
    tags.update(newTags);

    // 削除処理
  }

  function closeConfirmationDialog() {
    isConfirmationDialogVisible = false;
  }
</script>

<div class="list" onwheel={onWheel}>
  {#each tags.reactiveValue() as tag, index}
    <div class="item" class:stabilized={tag instanceof StabilizedTag}>
      <div class="tag">
        <span
          class="tag-name"
          class:candidate={tag instanceof CandidateTag}
          class:suggested={tag instanceof OtherSuggestedTag || tag instanceof UserSuggestedTag}>
          {#if tag instanceof UserSuggestedTag && tag.tag instanceof NewTag}
            {tag.tag.name.name}
          {:else}
            <a href="https://netmate.app/tags/{(tag.tag as Tag).id.asHexadecimalRepresentation()}/database">
              {tag.tag.name.name}
            </a>
          {/if}
        </span>
      </div>
      {#if !(tag instanceof StabilizedTag)}
        <div class="centered-buttons">
          {#if tag instanceof CandidateTag}
            <button
              class="tag-button"
              onclick={() => onSuggest(tag, index)}
              onkeydown={makeKeydownHandler(() => onSuggest(tag, index))}
              use:tooltip={_("add")}>
                <svg class="tag-button-icon">
                  <use href="/src/lib/assets/tag/add.svg#add"></use>
                </svg>
            </button>
          {:else if tag instanceof OtherSuggestedTag}
            {#each ([[Vote.Agree, "exposure_plus_1"], [Vote.SomewhatAgree, "exposure_zero"], [Vote.Disagree, "exposure_neg_1"]] as [Vote, string][]) as data}
              <button
                class="tag-button"
                class:toggled={tag.userVote === data[0]}
                onclick={() => onVoteButtonClick(tag, data[0] as Vote)}
                onkeydown={makeKeydownHandler(() => onVoteButtonClick(tag, data[0] as Vote))}
                use:tooltip={_(data[0])}>
                  <svg class="tag-button-icon">
                    <use href="/src/lib/assets/tag/{data[1]}.svg#{data[1]}"></use>
                  </svg>
              </button>
            {/each}
          {:else}
            <button
              class="tag-button tag-withdraw-button"
              onclick={() => onWithdrawButtonClick()}
              onkeydown={makeKeydownHandler(() => onWithdrawButtonClick())}
              use:tooltip={_("withdraw")}>
                <svg class="tag-button-icon">
                  <use href="/src/lib/assets/tag/remove.svg#remove"></use>
                </svg>
            </button>
            {#if isConfirmationDialogVisible}
              <ConfirmDialog
                title={_("withdraw-dialog-title")}
                description={_("withdraw-dialog-description")}
                actionName={_("withdraw-dialog-action-name")}
                action={() => onWithdraw(tag)}
                close={closeConfirmationDialog} />
            {/if}
          {/if}
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .list {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    overflow-y: auto;
    gap: 0.5rem;
  }

  .list::-webkit-scrollbar {
    display: none;
  }

  .item {
    max-width: 12.25rem;
    display: flex;
    padding: 0.25rem 0.5rem 0.125rem 0.5rem;
    align-items: flex-start;
  }

  .item:not(.stabilized):hover {
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

  .tag-name.candidate {
    color: var(--light-gray);
  }

  .tag-name.suggested {
    color: var(--light-gray);
    font-weight: 700;
  }

  .item.stabilized:hover .tag-name {
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

  .item:hover .centered-buttons {
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