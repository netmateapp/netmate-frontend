<script lang="ts">
  import SpaceShareCard from "$lib/components/space/share/SpaceShareCard.svelte";
  import type { Reactive } from "$lib/scripts/extension/reactivity";
  import type { SpaceCoreData } from "../../../scripts/chunk/chunkContent";
  import type { LocationTransformer } from "../../../scripts/coordinateSystem/locationTransformer";
  import { RealCoordinate, RealLocation } from "../../../scripts/coordinateSystem/realCoordinateSystem";
  import type { ViewportWidth, ViewportHeight } from "../../../scripts/coordinateSystem/viewportRelativeCoordinateSystem";
  import type { VirtualLocation } from "../../../scripts/coordinateSystem/virtualCoordinateSystem";
  import type { Scale } from "../../../scripts/scale";
  import LocationName from "./LocationName.svelte";

  type Props = {
    viewCenterLocation: Reactive<VirtualLocation>;
    viewportWidth: Reactive<ViewportWidth>;
    viewportHeight: Reactive<ViewportHeight>;
    scale: Reactive<Scale>;
    locationTransformer: LocationTransformer;
    spaceCore: SpaceCoreData;
  };

  let { viewCenterLocation, viewportWidth, viewportHeight, scale, locationTransformer, spaceCore }: Props = $props();

  function createRealLocation(index: number): RealLocation {
    const offsetX = RealCoordinate.of(index === 0 ? -2 : 510);
    const offsetY = RealCoordinate.of(index === 0 ? 254 : 430);
    return RealLocation.of(offsetX, offsetX);
  }
</script>

<a
  href="../../tags/{spaceCore.tag.id.asHexadecimalRepresentation()}/space"
  class="space-core"
  style="top: {22}px; left: {22}px;">
  <div class="shadow-overlay"></div>
  <LocationName tag={spaceCore.tag} relativeLocation={RealLocation.of(RealCoordinate.of(488), RealCoordinate.of(160))} />
  {#each spaceCore.shareCardsCluster.shareCards as shareCard, index}
    <SpaceShareCard location={createRealLocation(index)} shareCard={shareCard} />
  {/each}
</a>