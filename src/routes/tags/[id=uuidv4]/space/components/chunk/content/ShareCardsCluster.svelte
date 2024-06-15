<script lang="ts">
  import SpaceShareCard from "$lib/components/space/share/SpaceShareCard.svelte";
  import type { ShareCardsCluster } from "../../../scripts/chunk/chunkContent";
    import { RealCoordinate, RealLocation } from "../../../scripts/coordinateSystem/realCoordinateSystem";

  type Props = {
    shareCardsCluster: ShareCardsCluster
  };

  let { shareCardsCluster }: Props = $props();

  function createRealLocation(index: number): RealLocation {
    const offset = RealCoordinate.of(index === 0 ? 22 : 22 + 468 + 22);
    return RealLocation.of(offset, offset);
  }
</script>

{#each shareCardsCluster.shareCards as shareCard, index}
  <SpaceShareCard location={createRealLocation(index)} shareCard={shareCard} />
{/each}