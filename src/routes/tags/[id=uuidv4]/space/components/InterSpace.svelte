<script lang="ts">
  import Space from "./Space.svelte";
  import { Tag, TagName } from "$lib/scripts/domain/tag";
  import type { Option } from "$lib/option";
  import { VirtualCoordinate, VirtualLocation } from "../scripts/coordinateSystem/virtualCoordinateSystem.svelte";
  import { CHUNK_SIDE_LENGTH, ChunkRepository } from "../scripts/chunk/chunk";
  import { TagSpace } from "../scripts/space";
  import { MAX_SCALE, Scale } from "../scripts/scale.svelte";
  import { SpaceCoreData } from "../scripts/chunk/chunkContent";
  import { REAL_COORDINATE_SYSTEM_ORIGIN, RealLocation } from "../scripts/coordinateSystem/realCoordinateSystem";

  type Props = {
    tag: Tag;
  };

  let { tag }: Props = $props();

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
  let spaceCoreRelativeLocation: VirtualLocation;

  $effect(() => {
    if (currentSpace.tag.id.asHexadecimalRepresentation() !== tag.id.asHexadecimalRepresentation() && !isTransitioning) {
      let targetSpaceCoreCenter: VirtualLocation = defaultInitialViewCenterLocation();
      for (var chunk of currentSpace.renderedChunks.reactiveValue()) {
        if (chunk.content instanceof SpaceCoreData) {
          if (chunk.content.tag.id.asHexadecimalRepresentation() === tag.id.asHexadecimalRepresentation()) {
            targetSpaceCoreCenter = chunk.centerLocation();
            break;
          }
        }
      }
      
      const viewCenter = currentSpace.viewCenterLocation.reactiveValue();
      spaceCoreRelativeLocation = VirtualLocation.of(
        VirtualCoordinate.of(viewCenter.x.coordinate - targetSpaceCoreCenter.x.coordinate),
        VirtualCoordinate.of(viewCenter.y.coordinate - targetSpaceCoreCenter.y.coordinate)
      );
      spaceCoreCenterRealLocation = currentSpace.locationTransformer.transformToRealLocation(
        currentSpace.viewCenterLocation.reactiveValue(),
        targetSpaceCoreCenter,
        currentSpace.viewportWidth.reactiveValue(),
        currentSpace.viewportHeight.reactiveValue(),
        currentSpace.scale.reactiveValue()
      );

      nextSpace = new TagSpace(
        tag,
        new ChunkRepository(),
        defaultInitialViewCenterLocation(),
        new Scale(currentSpace.scale.reactiveValue().scale)
      )
      startTransition();
    }
  });

  let spaceCoreOverlayRef: Option<HTMLElement> = $state(undefined);
  let centeredSpaceRef: Option<HTMLElement> = $state(undefined);
  let backgroundRef: Option<HTMLElement> = $state(undefined);
  function startTransition() {
    isTransitioning = true;

    setTimeout(() => {
      if (centeredSpaceRef !== undefined) centeredSpaceRef.style.clipPath = "circle(61rem)";
      if (backgroundRef !== undefined) backgroundRef.style.clipPath = "circle(61rem)";
      if (spaceCoreOverlayRef !== undefined) spaceCoreOverlayRef.style.scale = "2.0";
    }, 0);

    setTimeout(() => {
      currentSpace = nextSpace!;
      const viewCenter = currentSpace.viewCenterLocation.reactiveValue().createOffsetLocation(
        spaceCoreRelativeLocation.x,
        spaceCoreRelativeLocation.y
      );
      currentSpace.viewCenterLocation.update(viewCenter);

      isTransitioning = false;
      spaceCoreOverlayRef = undefined;
    }, 15000);
  }

  function defaultInitialViewCenterLocation(): VirtualLocation {
    return VirtualLocation.of(
      VirtualCoordinate.of(CHUNK_SIDE_LENGTH / 2),
      VirtualCoordinate.of(CHUNK_SIDE_LENGTH / 2 + CHUNK_SIDE_LENGTH / 4)
    );
  }
</script>

<Space space={currentSpace} />
{#if isTransitioning}
  <div class="expanding-space-wrapper" style="bottom: {spaceCoreCenterRealLocation.y.coordinate}px; left: {spaceCoreCenterRealLocation.x.coordinate}px;">
  <div bind:this={spaceCoreOverlayRef} class="space-core-overlay"></div>
  <div bind:this={centeredSpaceRef} class="centered-space">
    <Space space={nextSpace!} />
    <div bind:this={backgroundRef} class="background"></div>
  </div>
</div>
{/if}

<style>
  .expanding-space-wrapper {
    position: absolute;
    transform: translate(-50%, 50%);
    display: grid;
    place-content: center;
    z-index: 2;
  }

  .centered-space {
    width: 100vw;
    height: 100vh;
    clip-path: circle(30.5rem);
    transition: clip-path 15.0s linear;
    display: grid;
    place-content: center;
  }

  .background {
    width: 200vmax;
    height: 200vmax;
    clip-path: circle(30.5rem);
    transition: clip-path 15.0s linear;
    background-color: aqua;
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
    transition: scale 15.0s linear;
  }

  @keyframes scaleShadowOverlay {
    from {
      transform: scale(1.0);
    }
    to {
      transform: scale(2.0);
    }
  }

  @keyframes expandNewSpace {
    from {
      clip-path: circle(30.5rem);
    }
    to {
      clip-path: circle(61rem);
    }
  }
</style>