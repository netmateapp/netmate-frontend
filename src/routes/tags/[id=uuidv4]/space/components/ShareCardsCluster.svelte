<script lang="ts">
  import SpaceShareCard from "$lib/components/space/share/SpaceShareCard.svelte";
  import type { ShareCardsClusterData } from "../scripts/chunk/chunkContent";

  type Props = {
    shareCardsCluster: ShareCardsClusterData;
    isInSpaceCore?: boolean;
    applyRandomOffsets?: boolean;
  };

  let { shareCardsCluster, isInSpaceCore = false, applyRandomOffsets = false }: Props = $props();

  function offset(): number {
    return applyRandomOffsets ? 22 - Math.floor(Math.random() * 15) : 22;
  }
</script>

{#each shareCardsCluster.shareCards as shareCard, index}
  <div class="share-card-wrapper share-card-{index}" style="--offset: {offset()}px;">
    <SpaceShareCard {shareCard} {isInSpaceCore} />
  </div>
{/each}

<style>
  .share-card-wrapper {
    display: inline-flex;
    width: 29.25rem;
    height: 29.25rem;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .share-card-0 {
    position: absolute;
    top: var(--offset);
    left: var(--offset);
  }

  .share-card-1 {
    position: absolute;
    right: var(--offset);
    bottom: var(--offset);
  }
</style>