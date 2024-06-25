<script lang="ts">
  import { onMount } from "svelte";
  import Pager from "./Pager.svelte";
  import { SessionShareData } from "$lib/scripts/domain/session";
  import { generateMockSessionShareData } from "$lib/scripts/domain/mockShare";
  import { DeletedSharesCount, HiddenShares, type SessionLine } from "./session.svelte";
  import DeletedSharesLog from "./DeletedSharesLog.svelte";
  import ExpandShares from "./ExpandShares.svelte";
  import SessionShare from "./SessionShare.svelte";

  let lines: SessionLine[] = $state([]);

  function generateMockSessionLines(): SessionLine[] {
    const lines: SessionLine[] = [];
    let i = 0;
    while (i < 50) {
      const rand = Math.floor(Math.random() * 20);
      if (rand === 0) {
        const hiddenSharesCount = Math.floor(Math.random() * 5) + 1;
        const shares: SessionShareData[] = [];
        for (let j = 0; j < hiddenSharesCount; j++) {
          shares.push(generateMockSessionShareData());
        }
        lines.push(new HiddenShares(shares));
        i += hiddenSharesCount;
      } else if (rand === 1) {
        const deletedSharesCount = Math.floor(Math.random() * 5) + 1;
        lines.push(new DeletedSharesCount(deletedSharesCount));
      } else {
        lines.push(generateMockSessionShareData());
        i++;
      }
    }
    return lines;
  }

  onMount(() => {
    lines = generateMockSessionLines();
  });
</script>

<div class="session">
  {#each lines as line}
    {#if line instanceof SessionShareData}
      <SessionShare share={line} />
    {:else if line instanceof HiddenShares}
      <ExpandShares shares={line} />
    {:else if line instanceof DeletedSharesCount}
      <DeletedSharesLog deletedSharesCount={line.count} />
    {/if}
  {/each}
  <Pager resultsCount={0} />
</div>