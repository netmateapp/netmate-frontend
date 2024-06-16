<script lang="ts">
  import type { Tag } from "$lib/scripts/domain/tag";
  import { CHUNK_SIDE_LENGTH, ChunkLocation, ChunkRepository } from "../scripts/chunk/chunk";
  import { VirtualCoordinate, VirtualLocation } from "../scripts/coordinateSystem/virtualCoordinateSystem.svelte";
  import { MAX_SCALE, Scale } from "../scripts/scale.svelte";
  import { TagSpace } from "../scripts/space";
  import CenterChunk from "./chunk/CenterChunk.svelte";
  import Chunk from "./chunk/Chunk.svelte";

  let { tag }: { tag: Tag } = $props();

  const initialLocation = VirtualLocation.of(
    VirtualCoordinate.of(CHUNK_SIDE_LENGTH / 2),
    VirtualCoordinate.of(CHUNK_SIDE_LENGTH / 2)
  );

  const space = new TagSpace(
    tag,
    new ChunkRepository(),
    initialLocation,
    new Scale(MAX_SCALE)
  );

  $effect(() => {
    return space.initialize();
  });

  $effect(() => {
    space.dynamicChunkRenderer.startDynamicChunkRendering(space.viewCenterLocation.reactiveValue());
  });

  function isCenterChunk(chunkLocation: ChunkLocation): boolean {
    return chunkLocation.chunkX.coordinate === 0 && chunkLocation.chunkY.coordinate === 0;
  }
</script>

<div class="space">
  {#each space.renderedChunks.reactiveValue() as chunk}
    {#if isCenterChunk(chunk.location)}
      <CenterChunk {space} {chunk} />
    {:else}
      <Chunk {space} {chunk} />
    {/if}
  {/each}
</div>