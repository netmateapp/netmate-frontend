<script lang="ts">
  import Brand from "$lib/components/common/brand/Brand.svelte";
  import LocationDisplay from "$lib/components/common/location-display/LocationDisplay.svelte";
  import Navigation from "$lib/components/common/navigation/Navigation.svelte";
  import SearchBox from "$lib/components/common/search-box/SearchBox.svelte";
  import OpenShareEditorButton from "$lib/components/common/share-editor/OpenShareEditorButton.svelte";
  import ShareEditor from "$lib/components/common/share-editor/ShareEditor.svelte";
  import Share from "$lib/components/space/share/Share.svelte";
  import SpaceCore from "$lib/components/space/core/SpaceCore.svelte";
  import TagMenu from "$lib/components/tag/TagMenu.svelte";
  import type { InteractEvent, MaybeComponent } from "$lib/types";
  import { interactHandlersEffect } from "$lib/utils.svelte";
  import { ChunkLoader, DynamicChunkLoader, SharesChunk, SpaceCoreChunk } from "$lib/components/space/chunkLoader.svelte";
  import { Position } from "$lib/components/space/movement.svelte";
  import { RenderChunks, fetchChunks } from "./tagSpace.svelte";
  import { centerHtmlX, centerHtmlY, diffX, diffY, toHtmlX, toHtmlY } from "$lib/components/space/coordinateMapper";
  import Chunk from "$lib/components/space/chunk/Chunk.svelte";
  import { Scaler } from "$lib/components/space/scale.svelte";
  import Location from "$lib/components/space/location-name/LocationName.svelte";
  import { Uuid4 } from "$lib/uuid";
  import type { Ok } from "$lib/result";
  import type { PageServerData } from "./$types";

  let { data }: { data: PageServerData } = $props(); 

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

  let position = new Position(512, 512 + 256);
  const scaler = new Scaler(position);

  let renderChunks = new RenderChunks();
  let chunkLoader = new DynamicChunkLoader(
    new ChunkLoader((i) => fetchChunks(i)),
    (x, y, map) => renderChunks.updateChunks(x, y, map)
  );
  let isInitialized = false;

  let viewportWidth = $state(0);
  let viewportHeight = $state(0);

  function onResize() {
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
  }

  function debugCommand(event: KeyboardEvent) {
    if (event.key === "p") {
      console.log(`x: ${position.reactiveX()}, y: ${position.reactiveY()}`);
    }
  }

  $effect(() => {
    console.log("new position");
    const positionFinalizer = position.init();

    chunkLoader.initialLoad(0, 0);
    const scalerFinalizer = scaler.initScaler();
    isInitialized = true;

    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
    window.addEventListener("resize", onResize);

    document.addEventListener("keydown", debugCommand);

    return () => {
      positionFinalizer();

      console.log("finalize");

      scalerFinalizer();

      window.removeEventListener("resize", onResize);

      document.removeEventListener("keydown", debugCommand);
    };
  });

  $effect(() => {
    if (isInitialized) {
      chunkLoader.onPositionUpdate(position.reactiveX(), position.reactiveY());
    }
  });

  function jump2Center() {
    renderChunks.clearChunks();

    scaler.reset();

    chunkLoader = new DynamicChunkLoader(
      new ChunkLoader((i) => fetchChunks(i)),
      (x, y, map) => renderChunks.updateChunks(x, y, map)
    );

    chunkLoader.initialLoad(0, 0);

    position.set(512, 512 + 256);

    chunkLoader.onPositionUpdate(position.reactiveX(), position.reactiveY());
  }

  function mapToHtmlX(chunkX: number): number {
    return toHtmlX(
      chunkX * 1024,
      diffX(position.reactiveX(), centerHtmlX(viewportWidth))
    );
  }

  function mapToHtmlY(chunkY: number): number {
    return toHtmlY(
      chunkY * 1024,
      diffY(position.reactiveY(), centerHtmlY(viewportHeight))
    );
  }

  function makeScalableX(htmlX: number): number {
    return htmlX * scaler.scale();
  }

  function makeScalableY(htmlY: number): number {
    return htmlY * scaler.scale();
  }

  function isCenterChunk(chunkX: number, chunkY: number): boolean {
    return chunkX === 0 && chunkY === 0;
  }

  function calculateSharePositionX(indexInChunk: number, chunkX: number, chunkY: number): number {
    if (isCenterChunk(chunkX, chunkY)) return indexInChunk === 0 ? 22 : 534;
    else return indexInChunk === 0 ? 22 : 534;
  }

  let pageLocationRef: MaybeComponent = $state(null);
  function calculateSharePositionY(indexInChunk: number, chunkX: number, chunkY: number): number {
    if (isCenterChunk(chunkX, chunkY)) return 40 + (pageLocationRef?.getHeight() ?? 42) + 16;
    else return indexInChunk === 0 ? 22 : 534;
  }

  function tagName(): string {
    return data.tag.name;
  }

  function tagId(): Uuid4 {
    return (Uuid4.from(data.tag.id) as Ok<{}, Uuid4>).value;
  }

  function isSpaceCoreChunkHere(): boolean {
    return false;
  }
</script>

<title>{tagName()}</title>

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
      {#if isCenterChunk(chunk.chunkX, chunk.chunkY)}
        <Location bind:this={pageLocationRef} locationName={tagId().asHexadecimalRepresentation()} isTag={true} id={tagId()} apparentX={512} apparentY={40} />
      {/if}
      {#each (chunk as SharesChunk).getShareDataInOrder() as share, index}
        <Share
          apparentX={calculateSharePositionX(index, chunk.chunkX, chunk.chunkY)}
          apparentY={calculateSharePositionY(index, chunk.chunkX, chunk.chunkY)}
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
      <SpaceCore tagId={(chunk as SpaceCoreChunk).subtagId} apparentX={24} apparentY={24} jump2Center={jump2Center} shouldCancelClick={() => position.getIsCoordinateUpdated()} >
        <Location locationName={(chunk as SpaceCoreChunk).subtagName} isTag={true} id={(chunk as SpaceCoreChunk).subtagId} apparentX={488} apparentY={160} />
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
<div class="side-bar">
  <LocationDisplay locationName={tagName()} isSpace={true} />
  <TagMenu />
</div>

<style>
  .side-bar {
    position: fixed;
    top: 6rem;
    left: 0.75rem;
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
</style>