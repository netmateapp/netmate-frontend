<script lang="ts">
  import Space from "./Space.svelte";
  import { Tag, TagName } from "$lib/scripts/domain/tag";
  import type { Option } from "$lib/option";
  import { VIRTUAL_COORDINATE_SYSTEM_ORIGIN, VirtualCoordinate, VirtualLocation } from "../scripts/coordinateSystem/virtualCoordinateSystem.svelte";
  import { CHUNK_SIDE_LENGTH, ChunkRepository } from "../scripts/chunk/chunk";
  import { TagSpace } from "../scripts/space";
  import { MAX_SCALE, Scale } from "../scripts/scale.svelte";
  import { SpaceCoreData } from "../scripts/chunk/chunkContent";
  import { REAL_COORDINATE_SYSTEM_ORIGIN, RealLocation } from "../scripts/coordinateSystem/realCoordinateSystem";

  type Props = {
    tag: Tag;
  };

  let { tag }: Props = $props();

  let isTransiting: boolean = $state(false);

  let currentSpace: TagSpace = $state(
    new TagSpace(
      tag,
      new ChunkRepository(),
      defaultInitialViewCenterLocation(),
      new Scale(MAX_SCALE)
    )
  );
  let nextSpace: Option<TagSpace> = $state(undefined);
  let spaceCoreRelativeLocation: VirtualLocation;
  let targetSpaceCoreC: VirtualLocation = VIRTUAL_COORDINATE_SYSTEM_ORIGIN;
  let spaceCoreChunkLocaiton: RealLocation = REAL_COORDINATE_SYSTEM_ORIGIN;

  $effect(() => {
    if (currentSpace.tag.id.asHexadecimalRepresentation() !== tag.id.asHexadecimalRepresentation() && !isTransiting) {
      let targetSpaceCoreCenter: VirtualLocation = defaultInitialViewCenterLocation();
      let targetSpaceCoreChunkLoc: VirtualLocation = defaultInitialViewCenterLocation();
      for (var chunk of currentSpace.renderedChunks.reactiveValue()) {
        if (chunk.content instanceof SpaceCoreData) {
          if (chunk.content.tag.id.asHexadecimalRepresentation() === tag.id.asHexadecimalRepresentation()) {
            targetSpaceCoreCenter = chunk.centerLocation();
            targetSpaceCoreChunkLoc = VirtualLocation.fromChunkLocation(chunk.location);
            break;
          }
        }
      }
      
      const viewCenter = currentSpace.viewCenterLocation.reactiveValue();
      spaceCoreRelativeLocation = VirtualLocation.of(
        VirtualCoordinate.of(viewCenter.x.coordinate - targetSpaceCoreCenter.x.coordinate),
        VirtualCoordinate.of(viewCenter.y.coordinate - targetSpaceCoreCenter.y.coordinate)
      );
      targetSpaceCoreC = targetSpaceCoreCenter;

      spaceCoreChunkLocaiton = currentSpace.locationTransformer.transformToRealLocation(
        currentSpace.viewCenterLocation.reactiveValue(),
        targetSpaceCoreChunkLoc,
        currentSpace.viewportWidth.reactiveValue(),
        currentSpace.viewportHeight.reactiveValue(),
        currentSpace.scale.reactiveValue()
      );

      nextSpace = new TagSpace(
        tag,
        new ChunkRepository(),
        VirtualLocation.of(
          VirtualCoordinate.of(CHUNK_SIDE_LENGTH / 2),
          VirtualCoordinate.of(CHUNK_SIDE_LENGTH / 2)
        ),
        new Scale(MAX_SCALE)
      )
      startTransition();
    }
  });

  let clipPathFrom: number = $derived(30.5);
  let clipPathTo: number = $derived(61 * (1 / currentSpace.scale.reactiveValue().scale));
  let scaleTo: number = $derived(2 * (1 / currentSpace.scale.reactiveValue().scale));

  let spaceCoreOverlayRef: Option<HTMLElement> = $state(undefined);
  let centeredSpaceRef: Option<HTMLElement> = $state(undefined);
  let backgroundRef: Option<HTMLElement> = $state(undefined);
  function startTransition() {
    isTransiting = true;

    setTimeout(() => {
      if (centeredSpaceRef !== undefined) centeredSpaceRef.style.clipPath = `circle(${clipPathTo}rem)`;
      if (backgroundRef !== undefined) {
        backgroundRef.style.clipPath = `circle(${clipPathTo}rem)`;
        backgroundRef.style.backgroundColor = "white";
        console.log(clipPathTo);
      }
      if (spaceCoreOverlayRef !== undefined) spaceCoreOverlayRef.style.scale = `${scaleTo}`;
      console.log(scaleTo);
    }, 0);

    setTimeout(() => {
      nextSpace?.scale.update(currentSpace.scale.reactiveValue());
      currentSpace = nextSpace!;
      const viewCenter = currentSpace.viewCenterLocation.reactiveValue().createOffsetLocation(
        spaceCoreRelativeLocation.x,
        spaceCoreRelativeLocation.y
      );
      //currentSpace.viewCenterLocation.update(targetSpaceCoreC);
      currentSpace.viewCenterLocation.update(viewCenter);

      isTransiting = false;
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
{#if isTransiting}
  <div class="virtual-chunk" style="bottom: {spaceCoreChunkLocaiton.y.coordinate}px; left: {spaceCoreChunkLocaiton.x.coordinate}px; scale: {currentSpace.scale.reactiveValue().scale};">
    <div class="expanding-space-wrapper">
      <div bind:this={spaceCoreOverlayRef} class="space-core-overlay" style="--overlay-size: {61}rem; --scale-to: {scaleTo};"></div>
      <div bind:this={centeredSpaceRef} class="centered-space" style="--from-clip-path: {clipPathFrom}rem; --to-clip-path: {clipPathTo}rem;">
        <Space space={nextSpace!} />
        <div bind:this={backgroundRef} class="background" style="--from-clip-path: {clipPathFrom}rem; --to-clip-path: {clipPathTo}rem;"></div>
      </div>
  </div>
</div>
{/if}

<style>
  .virtual-chunk {
    position: absolute;
    width: 1024px;
    height: 1024px;
    display: grid;
    place-content: center;
    z-index: 2;
  }

  .expanding-space-wrapper {
    display: grid;
    place-content: center;
    z-index: 2;
  }

  .centered-space {
    width: 100vw;
    height: 100vh;
    clip-path: circle(var(--from-clip-path));
    transition: clip-path 15.0s linear;
    display: grid;
    place-content: center;
  }

  .background {
    width: 1000vmax;
    height: 1000vmax;
    clip-path: circle(var(--from-clip-path));
    background-color: #fcfcfc;
    transition: clip-path 15.0s linear, background-color 15.0s linear;
  }

  .space-core-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    translate: -50% -50%;
    width: var(--overlay-size);
    height: var(--overlay-size);
    box-shadow: 1px 2px 8px 0px rgba(0, 0, 0, 0.16) inset;
    border-radius: 50%;
    pointer-events: none;
    z-index: 2;
    transition: scale 15.0s linear;
  }

  @keyframes scaleShadowOverlay {
    from {
      transform: scale(1.0);
    }
    to {
      transform: scale(var(--scale-to));
    }
  }

  @keyframes expandNewSpace {
    from {
      clip-path: circle(var(--from-clip-path));
    }
    to {
      clip-path: circle(var(--to-clip-path));
    }
  }

  @keyframes backShadow {
    from {
      background-color: #fcfcfc;
    }
    to {
      background-color: white;
    }
  }
</style>