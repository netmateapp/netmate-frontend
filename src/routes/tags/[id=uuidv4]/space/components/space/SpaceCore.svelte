<script lang="ts">
  import { goto } from "$app/navigation";
  import type { InteractEvent } from "$lib/types";
  import type { Chunk } from "../../scripts/chunk/chunk";
  import type { SpaceCoreData } from "../../scripts/chunk/chunkContent";
  import { RealCoordinate, RealLocation } from "../../scripts/coordinateSystem/realCoordinateSystem";
  import type { TagSpace } from "../../scripts/space";
  import LocationName from "./LocationName.svelte";
  import ShareCardsCluster from "./ShareCardsCluster.svelte";

  type Props = {
    space: TagSpace;
    chunk: Chunk;
    spaceCore: SpaceCoreData;
  };

  let { space, chunk, spaceCore }: Props = $props();

  // クリック関連の処理
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
  onclick={onInteract}>
  <div class="shadow-overlay"></div>
  <div class="contents-wrapper">
    <div class="location-name-wrapper">
      <LocationName tag={spaceCore.tag} relativeLocation={RealLocation.of(RealCoordinate.of(512), RealCoordinate.of(184))} />
    </div>
    <div class="share-cards-wrapper">
      <ShareCardsCluster shareCardsCluster={spaceCore.shareCardsCluster} isInSpaceCore={true} />
    </div>
  </div>
</a>

<style>
  .space-core {
    position: absolute;
    width: 64rem;
    height: 64rem;
    flex-shrink: 0;
    clip-path: circle(30.5rem);
    cursor: pointer;
  }

  .shadow-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 61rem;
    height: 61rem;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.01);
    box-shadow: 1px 2px 8px 0px rgba(0, 0, 0, 0.16) inset;
    z-index: 1;
    pointer-events: none;
  }

  .contents-wrapper {
    position: absolute;
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: column;
  }

  .location-name-wrapper {
    display: flex;
    justify-content: center;
    width: 100%;
    margin-top: 11.5rem;
    margin-bottom: 1rem;
  }

  .share-cards-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
  }
</style>