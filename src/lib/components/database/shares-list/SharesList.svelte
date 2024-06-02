<script lang="ts">
  import Header, { type Sort } from "./Header.svelte";
  import Pager from "./Pager.svelte";

  let resultsCount = 312;
  let initialSort: Sort = "newest";
</script>

<div class="shares-list">
  <Header {resultsCount} {initialSort} />
  <div class="shares">
    <div class="left-row"></div>
    <div class="right-row"></div>
  </div>
  <Pager {resultsCount} />
</div>

<style>
  .shares-list {
    position: fixed;
    top: 3.9375rem;
    left: 16rem;
    width: 59.5rem;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .shares {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }

  .left-row,
  .right-row {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 1rem;
  }
</style>
