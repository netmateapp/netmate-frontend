<script lang="ts">
  import SpaceShareCard from "$lib/components/space/share/SpaceShareCard.svelte";
  import { CHUNK_SIDE_LENGTH } from "../../scripts/chunk/chunk";
  import type { ShareCardsClusterData } from "../../scripts/chunk/chunkContent";
  import { RealCoordinate, RealLocation } from "../../scripts/coordinateSystem/realCoordinateSystem";

  type Props = {
    shareCardsCluster: ShareCardsClusterData,
    allocatedHeight: number;
  };

  let { shareCardsCluster, allocatedHeight }: Props = $props();

  const SHARE_SIZE = 468;
  const MARGIN = (CHUNK_SIDE_LENGTH - SHARE_SIZE * 2) / 4;

  function createRealLocation(index: number): RealLocation {
    const xOffset = RealCoordinate.of(index === 0 ? MARGIN : SHARE_SIZE + MARGIN * 3);
    const availableHeight = CHUNK_SIDE_LENGTH - allocatedHeight;
    const yOffset = RealCoordinate.of(allocatedHeight + (index === 0 ? MARGIN : availableHeight - SHARE_SIZE - MARGIN));
    return RealLocation.of(xOffset, yOffset);
  }
</script>

{#each shareCardsCluster.shareCards as shareCard, index}
  <SpaceShareCard location={createRealLocation(index)} {shareCard} />
{/each}