<script lang="ts">
  import SpaceShareCard from "$lib/components/space/share/SpaceShareCard.svelte";
  import { CHUNK_SIDE_LENGTH } from "../scripts/chunk/chunk";
  import type { ShareCardsClusterData } from "../scripts/chunk/chunkContent";
  import { RealCoordinate, RealLocation } from "../scripts/coordinateSystem/realCoordinateSystem";

  type Props = {
    shareCardsCluster: ShareCardsClusterData,
    allocatedHeight: number;
    bottomUp?: number;
  };

  let { shareCardsCluster, allocatedHeight, bottomUp = 0 }: Props = $props();

  const SHARE_SIZE = 468;
  const MARGIN = (CHUNK_SIDE_LENGTH - SHARE_SIZE * 2) / 4;

  function createRealLocation(index: number): RealLocation {
    const xOffset = RealCoordinate.of(index === 0 ? MARGIN : SHARE_SIZE + MARGIN * 3);
    const availableHeight = CHUNK_SIDE_LENGTH - allocatedHeight - bottomUp;
    const yMargin = availableHeight <= 468 + 44 ? availableHeight - SHARE_SIZE : MARGIN;
    let yOffset: number;
    if (availableHeight <= SHARE_SIZE + 44) {
      yOffset = allocatedHeight + (index === 0 ? 0 : yMargin);
    } else {
      yOffset = allocatedHeight + (index === 0 ? yMargin : availableHeight - SHARE_SIZE - yMargin);
    }
    return RealLocation.of(xOffset, RealCoordinate.of(yOffset));
  }
</script>

{#each shareCardsCluster.shareCards as shareCard, index}
  <SpaceShareCard location={createRealLocation(index)} {shareCard} />
{/each}