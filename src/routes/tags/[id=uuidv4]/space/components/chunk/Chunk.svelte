<script lang="ts">
  import type { Option } from "$lib/option";
  import type { SvelteComponent } from "svelte";
  import { CHUNK_SIDE_LENGTH, type Chunk } from "../../scripts/chunk/chunk";
  import { ShareCardsClusterData, SpaceCoreData } from "../../scripts/chunk/chunkContent";
  import { RealCoordinate, RealLocation } from "../../scripts/coordinateSystem/realCoordinateSystem";
  import { VirtualLocation } from "../../scripts/coordinateSystem/virtualCoordinateSystem.svelte";
  import type { TagSpace } from "../../scripts/space";
  import LocationName from "./LocationName.svelte";
  import ShareCardsCluster from "./ShareCardsCluster.svelte";
  import SpaceCore from "./SpaceCore.svelte";

  type Props = {
    space: TagSpace;
    chunk: Chunk;
  };

  let { space, chunk }: Props = $props();

  let realLocation: RealLocation = $derived(space.locationTransformer.transformToRealLocation(
    space.viewCenterLocation.reactiveValue(),
    VirtualLocation.fromChunkLocation(chunk.location),
    space.viewportWidth.reactiveValue(),
    space.viewportHeight.reactiveValue(),
    space.scale.reactiveValue()
  ));

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
    return chunk.content instanceof ShareCardsClusterData;
  }

  function hasSpaceCore(): boolean {
    return chunk.content instanceof SpaceCoreData;
  }

  function isCenterChunk(): boolean {
    return chunk.location.chunkX.coordinate === 0 && chunk.location.chunkY.coordinate === 0;
  }

  function isTopTag(): boolean {
    return space.tag.id.asHexadecimalRepresentation() === "";
  }

  let locationName: Option<SvelteComponent> = $state(undefined);
  
  function allocatedHeight(): number {
    if (isCenterChunk()) {
      if (isTopTag()) {
        return 160;
      } else {
        return locationName?.locationNameElementHeight() + 40 + 16;
      }
    } else {
      return 0;
    }
  }

  const color = Math.floor(Math.random() * 255);
  // background-color: rgba({color}, {color}, {color}, 0.1); 
</script>
<div
  class="chunk"
  style="bottom: {bottomStyle()}px; left: {leftStyle()}px; width: {sizeStyle()}px; height: {sizeStyle()}px; scale: {scaleStyle()};">
  {#if isCenterChunk()}
    <LocationName bind:this={locationName} tag={space.tag} relativeLocation={RealLocation.of(RealCoordinate.of(512), RealCoordinate.of(188))} />
  {/if}
  {#if hasShareCardsCluster()}
    <ShareCardsCluster shareCardsCluster={chunk.content as ShareCardsClusterData} allocatedHeight={allocatedHeight()} />
  {:else if hasSpaceCore()}
    <SpaceCore {space} {chunk} spaceCore={chunk.content as SpaceCoreData} />
  {/if}
</div>

<style>
  .chunk {
    position: absolute;
  }
</style>