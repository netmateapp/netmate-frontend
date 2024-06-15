<script lang="ts">
    import type { Reactive } from "$lib/scripts/extension/reactivity";
    import type { SpaceCore } from "../../../scripts/chunk/chunkContent";
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
    spaceCore: SpaceCore;
  };

  let { viewCenterLocation, viewportWidth, viewportHeight, scale, locationTransformer, spaceCore }: Props = $props();
</script>

<a
  href="../../tags/{spaceCore.tag.id.asHexadecimalRepresentation()}/space"
  class="space-core"
  style="top: {22}px; left: {22}px;">
  <div class="shadow-overlay"></div>
  <LocationName tag={spaceCore.tag} relativeLocation={RealLocation.of(RealCoordinate.of(488), RealCoordinate.of(160))} />
</a>