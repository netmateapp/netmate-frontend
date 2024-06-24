<script lang="ts">
  import Header, { type Sort } from "./Header.svelte";
  import Pager from "./Pager.svelte";
  import Share from "../share/DatabaseShareCard.svelte";
  import { onMount } from "svelte";
  import type { ShareCard } from "$lib/scripts/domain/shareCard";
  import { generateMockShareCards } from "$lib/scripts/domain/mockShare";

  let resultsCount = 312;
  let initialSort: Sort = "newest";

  let viewSharesData: ShareCard[] = $state([]);
  function leftRowSharesData(): ShareCard[] {
    const sharesData: ShareCard[] = [];
    for (var i = 0; i < viewSharesData.length; i += 2) sharesData.push(viewSharesData[i]);
    return sharesData;
  }

  function rightRowSharesData(): ShareCard[] {
    const sharesData: ShareCard[] = [];
    for (var i = 1; i < viewSharesData.length; i += 2) sharesData.push(viewSharesData[i]);
    return sharesData;
  }

  function generateTestSharesData(): ShareCard[] {
    const data: ShareCard[] = [];
    for (var i = 0; i < 50; i++) {
      data.push(generateMockShareCards());
    }
    return data;
  }

  onMount(() => {
    viewSharesData = generateTestSharesData();
  });
</script>

<div class="shares-list-wrapper">
<div class="shares-list">
  <Header {resultsCount} {initialSort} />
  <div class="shares">
    <div class="left-row">
      {#each leftRowSharesData() as share (share.id)}
        <Share shareCard={share} />
      {/each}
    </div>
    <div class="right-row">
      {#each rightRowSharesData() as share}
        <Share shareCard={share} />
      {/each}
    </div>
  </div>
  <Pager {resultsCount} />
  <div class="spacer"></div>
</div>
</div>

<style>
  .shares-list-wrapper {
    position: fixed;
    width: 100%;
    height: 100%;
    padding-top: 3.9375rem;
    padding-left: 16rem;
    overflow-y: scroll;
  }

  .shares-list {
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

  .spacer {
    width: 1px;
    height: 0.125rem;
  }
</style>
