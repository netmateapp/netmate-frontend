<script lang="ts">
  import type { Reactive } from "$lib/scripts/extension/reactivity";
  import { CHUNK_SIDE_LENGTH, type Chunk } from "../../scripts/chunk/chunk";
  import { ShareCardsClusterData, SpaceCoreData } from "../../scripts/chunk/chunkContent";
  import type { LocationTransformer } from "../../scripts/coordinateSystem/locationTransformer";
  import { REAL_COORDINATE_SYSTEM_ORIGIN, type RealLocation } from "../../scripts/coordinateSystem/realCoordinateSystem";
  import type { ViewportHeight, ViewportWidth } from "../../scripts/coordinateSystem/viewportRelativeCoordinateSystem";
  import { VirtualLocation } from "../../scripts/coordinateSystem/virtualCoordinateSystem";
  import type { Scale } from "../../scripts/scale";
  import ShareCardsCluster from "./content/ShareCardsCluster.svelte";
  import SpaceCore from "./content/SpaceCore.svelte";

  type Props = {
    viewCenterLocation: Reactive<VirtualLocation>;
    viewportWidth: Reactive<ViewportWidth>;
    viewportHeight: Reactive<ViewportHeight>;
    scale: Reactive<Scale>;
    locationTransformer: LocationTransformer;
    chunk: Chunk;
  };

  let { viewCenterLocation, viewportWidth, viewportHeight, scale, locationTransformer, chunk }: Props = $props();

  let realLocation: RealLocation = REAL_COORDINATE_SYSTEM_ORIGIN;

  $effect(() => {
    realLocation = locationTransformer.transformToRealLocation(
      viewCenterLocation,
      VirtualLocation.fromChunkLocation(chunk.location),
      viewportWidth,
      viewportHeight,
      scale
    );
  })

  function bottomStyle(): number {
    return realLocation.y.coordinate;
  }

  function leftStyle(): number {
    return realLocation.x.coordinate;
  }

  function sizeStyle(): number {
    return CHUNK_SIDE_LENGTH;
  }

  function scaleStyle(): number {
    return scale.scale;
  }

  function hasShareCardsCluster(): boolean {
    return chunk.content instanceof ShareCardsCluster;
  }

  function hasSpaceCore(): boolean {
    return chunk.content instanceof SpaceCore;
  }

</script>
<div
  class="chunk"
  style="bottom: {bottomStyle()}px; left: {leftStyle()}px; width: {sizeStyle()}px; height: {sizeStyle()}px; scale: {scaleStyle()};">
  {#if hasShareCardsCluster()}
    <ShareCardsCluster shareCardsCluster={chunk.content as ShareCardsClusterData} />
  {:else if hasSpaceCore()}
    <SpaceCore {viewCenterLocation} {viewportWidth} {viewportHeight} {scale} {locationTransformer} spaceCore={chunk.content as SpaceCoreData} />
  {/if}
</div>

<style>
  .chunk {
    position: fixed;
  }
</style>