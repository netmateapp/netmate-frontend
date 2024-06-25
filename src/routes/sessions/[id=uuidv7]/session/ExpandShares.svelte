<script lang="ts">
  import { makeKeydownHandler } from "$lib/utils.svelte";
  import { _, HiddenShares } from "./session.svelte";
  import SessionShare from "./SessionShare.svelte";

  type Props = {
    shares: HiddenShares;
  };

  let { shares }: Props = $props();

  let isExpanded: boolean = $state(false);

  function onClick() {
    isExpanded = true;
  }
</script>

{#if isExpanded}
  {#each shares.shares as share}
    <SessionShare {share} />
  {/each}
{:else}
  <div class="button" onclick={() => onClick()} onkeydown={makeKeydownHandler(() => onClick())}>
    <span class="label">{_(`show-hidden-shares`, { sharesCount: shares.shares.length })}</span>
  </div>
{/if}

<style>
  .button {
    display: flex;
    width: 63.125rem;
    padding: 0.5rem 1rem;
    align-items: flex-start;
    gap: 1rem;
  }

  .label {
    color: var(--light-gray);
    font-family: var(--primary-font);
    font-size: 0.9375rem;
  }
</style>