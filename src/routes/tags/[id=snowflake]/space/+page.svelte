<script lang="ts">
  import Brand from "$lib/components/common/brand/Brand.svelte";
  import Navigation from "$lib/components/common/navigation/Navigation.svelte";
  import SearchBox from "$lib/components/common/search-box/SearchBox.svelte";
  import OpenShareEditorButton from "$lib/components/common/share-editor/OpenShareEditorButton.svelte";
  import ShareEditor from "$lib/components/common/share-editor/ShareEditor.svelte";
  import Share, { ImageUrl } from "$lib/components/space/share/Share.svelte";
  import SpaceCore from "$lib/components/space/core/SpaceCore.svelte";
  import TagMenu from "$lib/components/tag/TagMenu.svelte";
  import type { InteractEvent, MaybeComponent } from "$lib/types";
  import { interactHandlersEffect } from "$lib/utils.svelte";
  import { genTestUuid7 } from "$lib/uuid";
  import { ChunkLoader, DynamicChunkLoader, SharesChunk, SpaceCoreChunk } from "$lib/components/space/chunkLoader.svelte";
  import { Position } from "$lib/components/space/movement.svelte";
  import { RenderChunks, fetchChunks } from "./tagSpace.svelte";
  import { centerHtmlX, centerHtmlY, diffX, diffY, toHtmlX, toHtmlY } from "$lib/components/space/coordinate-mapper";
  import Chunk from "$lib/components/space/chunk/Chunk.svelte";
  import { Scaler } from "$lib/components/space/scale.svelte";
    import Location from "$lib/components/space/location/Location.svelte";

  let isShareEditorVisible = $state(false);
  let shareEditor: MaybeComponent = $state(null);
  let openShareEditorButton: MaybeComponent = $state(null);
  function handleInteractEvent(event: InteractEvent) {
    const target = event.target as Element;
    if (isShareEditorVisible) {
      if (!shareEditor?.contains(target)) isShareEditorVisible = false;
    } else {
      if (openShareEditorButton?.contains(target)) {
        isShareEditorVisible = true;
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }
  interactHandlersEffect(handleInteractEvent)();

  function closeShareEditor() {
    isShareEditorVisible = false;
  }

  const position = new Position(512, 512);
  const scaler = new Scaler(position);

  const renderChunks = new RenderChunks();
  const chunkLoader = new DynamicChunkLoader(
    new ChunkLoader(fetchChunks),
    (x, y, map) => renderChunks.updateChunks(x, y, map)
  );
  let isInitialized = false;

  let innerWidth = $state(0);
  let innerHeight = $state(0);

  function onResize() {
    innerWidth = window.innerWidth;
    innerHeight = window.innerHeight;
  }
  
  $effect(() => {
    position.init();
    chunkLoader.initialLoad(0, 0);
    scaler.initScaler();
    isInitialized = true;

    innerWidth = window.innerWidth;
    innerHeight = window.innerHeight;
    window.addEventListener("resize", onResize);
  });

  $effect(() => {
    if (isInitialized) {
      chunkLoader.onPositionUpdate(position.reactiveX(), position.reactiveY());
    }
  });

  function mapToHtmlX(chunkX: number): number {
    return toHtmlX(
      chunkX * 1024,
      diffX(position.reactiveX(), centerHtmlX(innerWidth))
    );
  }

  function mapToHtmlY(chunkY: number): number {
    return toHtmlY(
      chunkY * 1024,
      diffY(position.reactiveY(), centerHtmlY(innerHeight))
    );
  }

  function makeScalableX(htmlX: number): number {
    return htmlX * scaler.scale();
  }

  function makeScalableY(htmlY: number): number {
    return htmlY * scaler.scale();
  }
/**
 * 通常の共有データを流し込む際は、eachで共有のIDをkeyに指定する必要がある
*/
</script>

<title>タグスペース</title>

<Brand x={16} y={8} />
<SearchBox />
<Navigation />
<OpenShareEditorButton bind:this={openShareEditorButton} />
{#if isShareEditorVisible}
  <ShareEditor bind:this={shareEditor} closeEditor={closeShareEditor} />
{/if}
{#each renderChunks.getRenderChunks() as chunk (chunk.getKey())}
  {#if chunk instanceof SharesChunk}
    <Chunk apparentX={makeScalableX(mapToHtmlX(chunk.chunkX))} apparentY={makeScalableY(mapToHtmlY(chunk.chunkY))} scale={scaler.scale()} >
      {#each (chunk as SharesChunk).getShareDataInOrder() as share, index}
        <Share
          apparentX={index === 0 ? 22 : 534}
          apparentY={index === 0 ? 22 : 534}
          id={share.id}
          title={share.title}
          text={share.text}
          mediaKey={share.mediaKey}
          conversationsCount={share.conversationsCount}
          timestamp={share.timestamp} />
      {/each}
    </Chunk>
  {:else}
    <Chunk apparentX={makeScalableX(mapToHtmlX(chunk.chunkX))} apparentY={makeScalableY(mapToHtmlY(chunk.chunkY))} scale={scaler.scale()} >
      <SpaceCore tagId={(chunk as SpaceCoreChunk).subtagId} apparentX={24} apparentY={24} >
        <Location locationName={(chunk as SpaceCoreChunk).subtagName} apparentX={488} apparentY={160} />
        {#each (chunk as SpaceCoreChunk).getShareDataInOrder() as share, index}
        <Share
          apparentX={index === 0 ? -2 : 510}
          apparentY={index === 0 ? 254 : 430}
          id={share.id}
          title={share.title}
          text={share.text}
          mediaKey={share.mediaKey}
          conversationsCount={share.conversationsCount}
          timestamp={share.timestamp} />
        {/each}
      </SpaceCore>
    </Chunk>
  {/if}
{/each}
<TagMenu />

<style>
  :global(body) {
    overflow: hidden;
  }
</style>