<script lang="ts">
    import { goto } from "$app/navigation";
  import SpaceShareCard from "$lib/components/space/share/SpaceShareCard.svelte";
  import type { InteractEvent } from "$lib/types";
  import type { Chunk } from "../scripts/chunk/chunk";
  import type { SpaceCoreData } from "../scripts/chunk/chunkContent";
  import { RealCoordinate, RealLocation } from "../scripts/coordinateSystem/realCoordinateSystem";
  import type { TagSpace } from "../scripts/space";
  import LocationName from "./LocationName.svelte";

  type Props = {
    space: TagSpace;
    chunk: Chunk;
    spaceCore: SpaceCoreData;
  };

  let { space, chunk, spaceCore }: Props = $props();

  function createRealLocation(index: number): RealLocation {
    const offsetX = RealCoordinate.of(index === 0 ? -2 : 510);
    const offsetY = RealCoordinate.of(index === 0 ? 254 : 430);
    return RealLocation.of(offsetX, offsetY);
  }

  function onInteract(event: InteractEvent) {
    if (space.viewCenterLocationUpdater.isUserMoved()) {
      event.preventDefault();
      return;
    }

    if (!isBackground(event.target as Element)) {
      event.preventDefault();
      goto(`../../tags/${spaceCore.tag.id.asHexadecimalRepresentation()}/space`);
      return;
    }
  }

  function isBackground(element: Element): boolean {
    return element.classList.contains("space-core");
  }
</script>

<a
  href="../../tags/{spaceCore.tag.id.asHexadecimalRepresentation()}/space"
  class="space-core"
  style="top: {22}px; left: {22}px;"
  onclick={onInteract}>
  <div class="shadow-overlay"></div>
  <LocationName tag={spaceCore.tag} relativeLocation={RealLocation.of(RealCoordinate.of(488), RealCoordinate.of(160))} />
  {#each spaceCore.shareCardsCluster.shareCards as shareCard, index}
    <SpaceShareCard location={createRealLocation(index)} shareCard={shareCard} isInSpaceCore={true} />
  {/each}
</a>

<style>
  .space-core {
    position: absolute;
    width: 61rem;
    height: 61rem;
    flex-shrink: 0;
    border-radius: 50%;
    overflow: hidden;
    cursor: pointer;
  }

  .shadow-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.01);
    box-shadow: 1px 2px 8px 0px rgba(0, 0, 0, 0.16) inset;
    z-index: 1;
    pointer-events: none;
  }
</style>