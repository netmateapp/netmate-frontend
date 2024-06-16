<script lang="ts">
  import { TagSpace } from "../scripts/space";
  import Chunk from "./chunk/Chunk.svelte";

  type Props = {
    space: TagSpace;
  };

  let { space }: Props = $props();

  $effect(() => {
    return space.initialize();
  });

  $effect(() => {
    space.dynamicChunkRenderer.startDynamicChunkRendering(space.viewCenterLocation.reactiveValue());
  });
</script>

<div class="space">
  {#each space.renderedChunks.reactiveValue() as chunk}
    <Chunk {space} {chunk} />
  {/each}
</div>

<style>
  .space {
    position: absolute;
    width: 100vw;
    height: 100vh;
    z-index: 1;
  }
</style>