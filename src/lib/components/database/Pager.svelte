<script lang="ts">
    import { makeKeydownHandler } from "$lib/utils.svelte";
    import { tooltip } from "../common/tooltip/useTooltip.svelte";
    import { _ } from "./database.svelte";

  let { resultsCount }: { resultsCount: number } = $props();

  const SHARES_PER_PAGE = 50;
  const LAST_PAGE_NUMBER = Math.ceil(resultsCount / SHARES_PER_PAGE);
  const MAX_PAGE_NUMBER_BUTTONS_COUNT = 10;
  const FIRST_PAGE_NUMBER = 1;

  let currentPageNumber = $state(1);
  let currentVisiblePagesArray: number[] = $state(calculateVisiblePagesArray());

  function isCurrentPage(pageNumber: number): boolean {
    return currentPageNumber === pageNumber;
  }

  function isFirstPage(pageNumber: number): boolean {
    return pageNumber === FIRST_PAGE_NUMBER;
  }

  function isLastPage(pageNumber: number): boolean {
    return pageNumber === LAST_PAGE_NUMBER;
  }

  function calculateVisiblePagesArray(): number[] {
    const range = calculateVisiblePagesRange(currentPageNumber);
    return inclusiveRange(range[0], range[1]);
  }

  // x1 x2 x3 x4 basePageNumber x6 x7 x8 x9 x10
  function calculateVisiblePagesRange(basePageNumber: number): [number, number] {
    if (LAST_PAGE_NUMBER <= MAX_PAGE_NUMBER_BUTTONS_COUNT) return [FIRST_PAGE_NUMBER, LAST_PAGE_NUMBER];

    let start = basePageNumber - ((MAX_PAGE_NUMBER_BUTTONS_COUNT / 2) - 1);
    let end = basePageNumber + (MAX_PAGE_NUMBER_BUTTONS_COUNT / 2);
    if (start < FIRST_PAGE_NUMBER) {
      end += FIRST_PAGE_NUMBER - start;
    } else if (end > LAST_PAGE_NUMBER) {
      start -= end - LAST_PAGE_NUMBER;
    }

    return [start, end];
  }

  function inclusiveRange(start: number, end: number): number[] {
    const range: number[] = [];
    for (var i = start; i <= end; i++) range.push(i);
    return range;
  }

  function tryGoToNextPage() {
    if (!isLastPage(currentPageNumber)) currentPageNumber++;
  }

  function tryGoBackToPreviousPage() {
    if (!isFirstPage(currentPageNumber)) currentPageNumber--;
  }

  function tryGoToPage(pageNumber: number) {
    if (FIRST_PAGE_NUMBER <= pageNumber && pageNumber <= LAST_PAGE_NUMBER) currentPageNumber = pageNumber;
  }
</script>

<div class="pager">
  <button
    class="page-button"
    onclick={tryGoBackToPreviousPage}
    onkeydown={makeKeydownHandler(tryGoBackToPreviousPage)}
    disabled={isFirstPage(currentPageNumber)}
    use:tooltip={_("previous")}>
    <svg class="search-icon">
      <use href="/src/lib/assets/database/chevron_left.svg#chevron_left"></use>
    </svg>
  </button>
  {#each currentVisiblePagesArray as pageNumber (pageNumber)}
    <button
      class="page-button"
      onclick={() => tryGoToPage(pageNumber)}
      onkeydown={makeKeydownHandler(() => tryGoToPage(pageNumber))}>
      <span
        class="page-number"
        class:current-page={isCurrentPage(pageNumber)}>
        {pageNumber}
      </span>
    </button>
  {/each}
  <button
    class="page-button"
    onclick={tryGoToNextPage}
    onkeydown={makeKeydownHandler(tryGoToNextPage)}
    disabled={isLastPage(currentPageNumber)}
    use:tooltip={_("next")}>
    <svg class="search-icon">
      <use href="/src/lib/assets/database/chevron_right.svg#chevron_right"></use>
    </svg>
  </button>
</div>

<style>
  .pager {
    display: inline-flex;
    align-items: flex-start;
    gap: 0.125rem;
  }

  .page-button {
    width: 2.125rem;
    height: 2.125rem;
    border-radius: 50%;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }

  .page-button:hover {
    background-color: var(--dominant-color-hover);
  }

  .page-button:disabled {
    background-color: var(--dominant-color-hover);
  }

  .page-number {
    color: var(--dark-gray);
    font-family: Roboto;
    font-size: 0.9375rem;
    line-height: 1.25rem;
  }

  .page-number.current-page {
    color: var(--accent-color);
  }
</style>