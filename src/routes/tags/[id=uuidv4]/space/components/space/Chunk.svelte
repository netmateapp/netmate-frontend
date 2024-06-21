<script lang="ts">
  import SearchBox from "$lib/components/common/search-box/SearchBox.svelte";
  import { CHUNK_SIDE_LENGTH, type Chunk } from "../../scripts/chunk/chunk";
  import { ShareCardsClusterData, SpaceCoreData } from "../../scripts/chunk/chunkContent";
  import { RealCoordinate, RealLocation } from "../../scripts/coordinateSystem/realCoordinateSystem";
  import { VirtualLocation } from "../../scripts/coordinateSystem/virtualCoordinateSystem.svelte";
  import type { TagSpace } from "../../scripts/space";
  import Brand from "../Brand.svelte";
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

  function hasSpaceCore(): boolean {
    return chunk.content instanceof SpaceCoreData;
  }

  function isCenterChunk(): boolean {
    return chunk.location.chunkX.coordinate === 0 && chunk.location.chunkY.coordinate === 0;
  }

  function isTopTag(): boolean {
    return chunk.location.chunkX.coordinate === 0 && chunk.location.chunkY.coordinate === 0;//space.tag.id.asHexadecimalRepresentation() === "";
  }

  const color = Math.floor(Math.random() * 255);
  // background-color: rgba({color}, {color}, {color}, 0.1); 
</script>
<div
  class="chunk"
  style="bottom: {bottomStyle()}px; left: {leftStyle()}px; width: {sizeStyle()}px; height: {sizeStyle()}px; scale: {scaleStyle()};">
  {#if hasSpaceCore()}
    <SpaceCore {space} {chunk} spaceCore={chunk.content as SpaceCoreData} />
  {:else}
    {#if isCenterChunk()}
      {#if isTopTag()}
        <div id="on-top" class="on-top">
          <Brand />
          <SearchBox />
        </div>
      {:else}
        <div class="location-name-wrapper">
          <LocationName tag={space.tag} relativeLocation={RealLocation.of(RealCoordinate.of(512), RealCoordinate.of(184))} />
        </div>
      {/if}
    {/if}
    <div class="share-cards-wrapper">
      <ShareCardsCluster shareCardsCluster={chunk.content as ShareCardsClusterData} applyRandomOffsets={!isCenterChunk()} />
    </div>
    {#if isTopTag()}
      <div class="top-spacer"></div>
    {/if}
  {/if}
</div>

<style>
  .chunk {
    position: absolute;
    display: flex;
    flex-direction: column;
  }

  .on-top {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    padding-top: 12rem;
  }

  .top-spacer {
    width: 1px;
    height: 208px;
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