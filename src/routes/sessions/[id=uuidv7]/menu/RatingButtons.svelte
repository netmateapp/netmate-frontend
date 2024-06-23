<script lang="ts">
  import type { ReactiveShareData } from "$lib/scripts/domain/share";
  import { Rating } from "$lib/scripts/domain/vote";
  import { makeKeydownHandler } from "$lib/utils.svelte";
  import { _ } from "./menu.svelte";

  type Props = {
    share: ReactiveShareData;
  };

  let { share }: Props = $props();

  function onClickRatingButton(rating: Rating) {
    if (share.reactiveValue().rating === rating) share.updateRating(undefined);
    else share.updateRating(rating);

    // request...
  }
</script>

<div class="buttons">
  {#each ([[Rating.HighRating, "exposure_plus_1"], [Rating.Rating, "exposure_zero"], [Rating.LowRating, "exposure_neg_1"]] as [Rating, string][]) as data}
    <div
      class="button"
      onclick={() => onClickRatingButton(data[0])}
      onkeydown={makeKeydownHandler(() => onClickRatingButton(data[0]))}>
      <svg class="icon">
        <use href="/src/lib/assets/session/{data[1]}.svg#{data[1]}"></use>
      </svg>
    </div>
    <div class="centered-label">
      <span class="label">{_(`${data[0]}`)}</span>
    </div>
  {/each}
</div>

<style>
  .buttons {
    display: flex;
    width: 11.875rem;
    padding: 0rem 0.25rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .button {
    display: flex;
    height: 2.0625rem;
    padding: 0.25rem 0.5rem;
    align-items: center;
    gap: 0.25rem;
    align-self: stretch;
  }

  .button:hover {
    background-color: var(--dominant-color-hover);
  }

  .icon {
    width: 1.5rem;
    height: 1.5rem;
    fill: var(--light-gray);
  }

  .centered-label {
    display: flex;
    padding-top: 0.0625rem;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    flex: 1 0 0;
  }

  .label {
    color: var(--light-gray);
    font-family: var(--primary-font);
    font-size: 0.875rem;
  }
</style>
