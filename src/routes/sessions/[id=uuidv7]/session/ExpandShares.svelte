<script lang="ts">
  import type { SessionShareData } from "$lib/scripts/domain/share";
  import { makeKeydownHandler } from "$lib/utils.svelte";
  import { _ } from "./session.svelte";
  import SessionShare from "./SessionShare.svelte";

  type Props = {
    indexStart: number;
    shares: SessionShareData[];
  };

  let { indexStart, shares }: Props = $props();

  let isExpanded: boolean = $state(false);

  function onClick() {
    isExpanded = true;
  }

  function translationKey(): { unit: string } | { unit: string, startNumber: number, endNumber: number } {
    if (shares.length === 1) return { unit: "one" };
    else return { unit: "more", startNumber: indexStart, endNumber: indexStart + shares.length - 1 };
  }
</script>

{#if isExpanded}
  {#each shares as share, index (share.id.asHexadecimalRepresentation())}
    <SessionShare number={indexStart + index} {share} />
  {/each}
{:else}
  <div class="button" onclick={() => onClick()} onkeydown={makeKeydownHandler(() => onClick())}>
    <span class="label">{_(`show-hidden-shares`, translationKey())}</span>
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