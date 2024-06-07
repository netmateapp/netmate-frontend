<script lang="ts">
  import Brand from "$lib/components/common/brand/Brand.svelte";
  import Navigation from "$lib/components/common/navigation/Navigation.svelte";
  import SearchBox from "$lib/components/common/search-box/SearchBox.svelte";
  import OpenShareEditorButton from "$lib/components/common/share-editor/OpenShareEditorButton.svelte";
  import ShareEditor from "$lib/components/common/share-editor/ShareEditor.svelte";
  import Share, { ImageUrl } from "$lib/components/space/share/Share.svelte";
  import TagMenu from "$lib/components/tag/TagMenu.svelte";
  import type { InteractEvent, MaybeComponent } from "$lib/types";
  import { interactHandlersEffect } from "$lib/utils.svelte";
  import { Uuid4, Uuid7 } from "$lib/uuid";
  import { ChunkLoader, DynamicChunkLoader, SharesChunk, type Chunk, type ChunkMap, type ChunksContentsRenderer } from "$lib/components/space/chunk.svelte";
  import { Position } from "$lib/components/space/move.svelte";
    import { getChunksAround } from "./tagSpace";

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

  function genTestUuid7(): Uuid7 {
    let maybeUuid = Uuid7.from("018fd2cc-7e27-7dfa-8424-87f58f98bfcc");
    let testUuid: Uuid7;
    if (maybeUuid.isOk()) {
      testUuid = maybeUuid.value;
    }
    return testUuid!;
  }

  function genTestUuid4(): Uuid4 {
    let maybeUuid = Uuid4.from("b220a9f0-be9a-4b32-b65f-f9e1c21cabff");
    let testUuid: Uuid4;
    if (maybeUuid.isOk()) {
      testUuid = maybeUuid.value;
    }
    return testUuid!;
  }

  const position = new Position(0, 0);

  $effect(() => {
    position.init();
  });

  let renderedChunks: Chunk[] = $state([]);

  const tagSpaceRenderer: ChunksContentsRenderer = (reactivePositionX: number, reactivePositionY: number, map: ChunkMap) => {
    renderedChunks = getChunksAround(reactivePositionX, reactivePositionY, map);
  };

</script>

<title>タグスペース</title>

<Brand x={16} y={8} />
<SearchBox />
<Navigation />
<OpenShareEditorButton bind:this={openShareEditorButton} />
{#if isShareEditorVisible}
  <ShareEditor bind:this={shareEditor} closeEditor={closeShareEditor} />
{/if}
{#each chunkSystem.getVisibleChunks() as chunk}
  {#if chunk instanceof SharesChunk}
    {#each (chunk as SharesChunk).getShares() as share}
      <Share
        absoluteX={(chunk.chunkX * 1024) + share[0]}
        absoluteY={(chunk.chunkY * 1024) + share[1]}
        id={genTestUuid7()}
        title={"ネットメイドちゃん"}
        text={"描いたﾖ\nかわわ"}
        mediaKey={new ImageUrl("/src/lib/assets/logo-temp.png")}
        conversationsCount={212}
        timestamp={1717209513416} />
    {/each}
  {/if}
{/each}
<TagMenu />