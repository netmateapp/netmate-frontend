<script lang="ts">
  import { makeKeydownHandler } from "$lib/utils.svelte";
  import { Vote } from "$lib/scripts/domain/vote";
  import { toast } from "../common/toast/useToast.svelte";
  import { tooltip } from "../common/tooltip/useTooltip.svelte";
  import ConfirmDialog from "../common/confirm-dialog/ConfirmDialog.svelte";
  import { CandidateRelationship, OtherSuggestedRelationship, ReactiveRelationships, StabilizedRelationship, UserSuggestedRelationship, _, type TagHierarchy } from "./tag.svelte";

  type Props = {
    isSpace: boolean;
    hierarchy: TagHierarchy;
    relationships: ReactiveRelationships;
  };

  let { isSpace, hierarchy, relationships }: Props = $props();

  // スペースにおけるスケールとの干渉を回避する
  function onWheel(event: WheelEvent) {
    event.stopPropagation();
  }

  // 提案関連
  function onSuggest(relationship: CandidateRelationship, index: number) {
    relationships.relationships[index] = new UserSuggestedRelationship(relationship.tag);

    const toastProps = {
      tagName: relationship.tag.name.name,
      hierarchicalRelationship: _(`${hierarchy}-tags`)
    };

    toast(_("add-new-relation", toastProps));
  }

  // 投票関連
  function onVoteButtonClick(relationship: OtherSuggestedRelationship, vote: Vote) {
    if (relationship.userVote === vote) relationship.userVote = undefined;
    else relationship.userVote = vote;
  }

  // 撤回関連
  let isConfirmationDialogVisible: boolean = $state(false);

  function onWithdrawButtonClick() {
    isConfirmationDialogVisible = true;
  }

  function onWithdraw(relationship: UserSuggestedRelationship, index: number) {
    relationships.relationships[index] = new CandidateRelationship(relationship.tag);

    toast(_("withdraw-new-relation"));
  }

  function closeConfirmationDialog() {
    isConfirmationDialogVisible = false;
  }
</script>

<div class="list" onwheel={onWheel}>
  {#each relationships.relationships as relationship, index}
    <div class="item" class:stabilized={relationship instanceof StabilizedRelationship}>
      <div class="tag">
        <a
          href="https://netmate.app/tags/{relationship.tag.id.asHexadecimalRepresentation()}/{isSpace ? "space" : "database"}"
          class="tag-name"
          class:candidate={relationship instanceof CandidateRelationship}
          class:suggested={relationship instanceof OtherSuggestedRelationship || relationship instanceof UserSuggestedRelationship}>
          {relationship.tag.name.name}
        </a>
        {#if relationship.tag.disambiguation !== undefined}
          <span class="disambiguation">{relationship.tag.disambiguation!.name}</span>
        {/if}
      </div>
      {#if !(relationship instanceof StabilizedRelationship)}
        <div class="centered-buttons">
          {#if relationship instanceof CandidateRelationship}
            <button
              class="tag-button"
              onclick={() => onSuggest(relationship, index)}
              onkeydown={makeKeydownHandler(() => onSuggest(relationship, index))}
              use:tooltip={_("add")}>
                <svg class="tag-button-icon">
                  <use href="/src/lib/assets/tag/add.svg#add"></use>
                </svg>
            </button>
          {:else if relationship instanceof OtherSuggestedRelationship}
            {#each ([[Vote.Agree, "exposure_plus_1"], [Vote.SomewhatAgree, "exposure_zero"], [Vote.Disagree, "exposure_neg_1"]] as [Vote, string][]) as data}
              <button
                class="tag-button"
                class:toggled={relationship.userVote === data[0]}
                onclick={() => onVoteButtonClick(relationship, data[0] as Vote)}
                onkeydown={makeKeydownHandler(() => onVoteButtonClick(relationship, data[0] as Vote))}
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
                action={() => onWithdraw(relationship, index)}
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