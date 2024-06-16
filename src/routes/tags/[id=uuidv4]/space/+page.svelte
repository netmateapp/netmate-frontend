<script lang="ts">
  import Brand from "$lib/components/common/brand/Brand.svelte";
  import LocationDisplay from "$lib/components/common/location-display/LocationDisplay.svelte";
  import Navigation from "$lib/components/common/navigation/Navigation.svelte";
  import SearchBox from "$lib/components/common/search-box/SearchBox.svelte";
  import OpenShareEditorButton from "$lib/components/common/share-editor/OpenShareEditorButton.svelte";
  import ShareEditor from "$lib/components/common/share-editor/ShareEditor.svelte";
  import TagMenu from "$lib/components/tag/TagMenu.svelte";
  import type { InteractEvent, MaybeComponent } from "$lib/types";
  import { interactHandlersEffect } from "$lib/utils.svelte";
  import { Uuid4 } from "$lib/uuid";
  import type { Ok } from "$lib/result";
  import type { PageServerData } from "./$types";
  import Space from "./components/Space.svelte";
  import { Tag, TagName } from "$lib/scripts/domain/tag";
  import type { Option } from "$lib/option";
  import { VirtualCoordinate, VirtualLocation } from "./scripts/coordinateSystem/virtualCoordinateSystem.svelte";
  import { CHUNK_SIDE_LENGTH, ChunkRepository } from "./scripts/chunk/chunk";
    import { TagSpace } from "./scripts/space";
    import { MAX_SCALE, Scale } from "./scripts/scale.svelte";
    import { SpaceCoreData } from "./scripts/chunk/chunkContent";
    import { REAL_COORDINATE_SYSTEM_ORIGIN, RealLocation } from "./scripts/coordinateSystem/realCoordinateSystem";

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

  let { data }: { data: PageServerData } = $props();

  let mockTagNames = ["早瀬ユウカ", "陸八魔アル", "空崎ヒナ"];
  let mockTagNamesPointer = 0;

  let tag = $derived(new Tag(
    (Uuid4.from(data.tag.id) as Ok<{}, Uuid4>).value,
    new TagName(mockTagNamesPointer < mockTagNames.length ? mockTagNames[mockTagNamesPointer++] : mockTagNames[mockTagNamesPointer = 0])
  ));

  let isTransitioning: boolean = $state(false);

  let currentSpace: TagSpace = $state(
    new TagSpace(
      tag,
      new ChunkRepository(),
      defaultInitialViewCenterLocation(),
      new Scale(MAX_SCALE)
    )
  );
  let nextSpace: Option<TagSpace> = $state(undefined);
  let spaceCoreCenterRealLocation: RealLocation = REAL_COORDINATE_SYSTEM_ORIGIN;

  $effect(() => {
    if (currentSpace.tag.id.asHexadecimalRepresentation() !== tag.id.asHexadecimalRepresentation()) {
      let targetSpaceCoreCenter: VirtualLocation = defaultInitialViewCenterLocation();
      for (var chunk of currentSpace.renderedChunks.reactiveValue()) {
        if (chunk.content instanceof SpaceCoreData) {
          if (chunk.content.tag.id.asHexadecimalRepresentation() === tag.id.asHexadecimalRepresentation()) {
            targetSpaceCoreCenter = chunk.centerLocation();
            break;
          }
        }
      }
      
      spaceCoreCenterRealLocation = currentSpace.locationTransformer.transformToRealLocation(
        currentSpace.viewCenterLocation.reactiveValue(),
        targetSpaceCoreCenter,
        currentSpace.viewportWidth.reactiveValue(),
        currentSpace.viewportHeight.reactiveValue(),
        currentSpace.scale.reactiveValue()
      );
      console.log(spaceCoreCenterRealLocation.x.coordinate);

      nextSpace = new TagSpace(
        tag,
        new ChunkRepository(),
        defaultInitialViewCenterLocation(),
        new Scale(currentSpace.scale.reactiveValue().scale)
      )
      startTransition();
    }
  });

  let expandingSpace: Option<HTMLElement> = $state(undefined);
  let spaceCoreOverlayRef: Option<HTMLElement> = $state(undefined);
  function startTransition() {
    isTransitioning = true;

    setTimeout(() => {
      if (expandingSpace !== undefined) {
        expandingSpace.style.width = "183rem";
        expandingSpace.style.height = "183rem";
      }
      if (spaceCoreOverlayRef !== undefined) spaceCoreOverlayRef.style.scale = "3.0";
    }, 0);

    setTimeout(() => {
      currentSpace = nextSpace!;
      console.log(`${currentSpace.tag.name.name}`);
      isTransitioning = false;

      expandingSpace = undefined;
      spaceCoreOverlayRef = undefined;
    }, 1000);
  }

  function defaultInitialViewCenterLocation(): VirtualLocation {
    return VirtualLocation.of(
      VirtualCoordinate.of(CHUNK_SIDE_LENGTH / 2),
      VirtualCoordinate.of(CHUNK_SIDE_LENGTH / 2 + CHUNK_SIDE_LENGTH / 4)
    );
  }
</script>

<title>{tag.name.name}</title>

<Brand x={16} y={8} />
<SearchBox />
<Navigation />
<OpenShareEditorButton bind:this={openShareEditorButton} />
{#if isShareEditorVisible}
  <ShareEditor bind:this={shareEditor} closeEditor={closeShareEditor} />
{/if}

<Space space={currentSpace} />
{#if isTransitioning}
  <div bind:this={expandingSpace} class="expanding-space" style="bottom: {spaceCoreCenterRealLocation.y.coordinate}px; left: {spaceCoreCenterRealLocation.x.coordinate}px;">
    <div bind:this={spaceCoreOverlayRef} class="space-core-overlay"></div>
    <div class="centered-space">
      <Space space={nextSpace!} />
    </div>
  </div>
{/if}

<div class="side-bar">
  <LocationDisplay locationName={tag.name.name} isSpace={true} />
  <TagMenu />
</div>

<style>
  :global(body) {
    overflow: hidden;
  }

  .side-bar {
    position: fixed;
    top: 6rem;
    left: 0.75rem;
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    z-index: 100;
  }

  .expanding-space {
    position: absolute;
    width: 61rem;
    height: 61rem;
    transform: translateX(-50%) translateY(50%);
    border-radius: 50%;
    overflow: hidden;
    z-index: 2;
    background-color: white;
    transition: width 1.0s, height 1.0s;
  }

  .centered-space {
    position: absolute;
    top: 50%;
    left: 50%;
    translate: -50% -50%;
    width: 100vw;
    height: 100vh;
  }

  .space-core-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    translate: -50% -50%;
    width: 61rem;
    height: 61rem;
    border-radius: 50%;
    box-shadow: 1px 2px 8px 0px rgba(0, 0, 0, 0.16) inset;
    pointer-events: none;
    z-index: 2;
    transition: scale 1.0s;
  }

  @keyframes transit {
    from {
      scale: 1.0;
    }
    to {
      scale: 3.0;
    }
  }

  @keyframes expand {
    from {
      width: 61rem;
      height: 61rem;
    }
    to {
      width: 183rem;
      height: 183rem;
    }
  }
</style>