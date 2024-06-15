<script lang="ts">
  import { CHUNK_SIDE_LENGTH, type Chunk } from "../../scripts/chunk/chunk";
  import { ShareCardsClusterData } from "../../scripts/chunk/chunkContent";
  import { REAL_COORDINATE_SYSTEM_ORIGIN, RealCoordinate, RealLocation } from "../../scripts/coordinateSystem/realCoordinateSystem";
  import { VirtualLocation } from "../../scripts/coordinateSystem/virtualCoordinateSystem";
  import type { TagSpace } from "../../scripts/space";
  import LocationName from "./content/LocationName.svelte";
  import ShareCardsCluster from "./content/ShareCardsCluster.svelte";
  import SpaceCore from "./content/SpaceCore.svelte";

  type Props = {
    space: TagSpace;
    chunk: Chunk;
  };

  let { space, chunk }: Props = $props();

  let realLocation: RealLocation = REAL_COORDINATE_SYSTEM_ORIGIN;

  $effect(() => {
    realLocation = space.locationTransformer.transformToRealLocation(
      space.viewCenterLocation.reactiveValue(),
      VirtualLocation.fromChunkLocation(chunk.location),
      space.viewportWidth.reactiveValue(),
      space.viewportHeight.reactiveValue(),
      space.scale.reactiveValue()
    );
  });


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
    return space.scale.reactiveValue().scale;
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
  <LocationName tag={space.tag} relativeLocation={RealLocation.of(RealCoordinate.of(512), RealCoordinate.of(40))} />
  {#if hasShareCardsCluster()}
    <ShareCardsCluster shareCardsCluster={chunk.content as ShareCardsClusterData} />
  {/if}
</div>

<style>
  .chunk {
    position: fixed;
  }
</style>