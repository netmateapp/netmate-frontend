<script lang="ts">
  import Space from "./Space.svelte";
  import type { Option } from "$lib/option";
  import { RealLocation } from "../scripts/coordinateSystem/realCoordinateSystem";
  import type { Scale } from "../scripts/scale.svelte";
  import type { TagSpace } from "../scripts/space";

  type Props = {
    currentSpaceScale: Scale;
    nextSpace: TagSpace;
    virtualChunkLocation: RealLocation;
  };

  let { currentSpaceScale, nextSpace, virtualChunkLocation }: Props = $props();

  let clipPathFrom: number = $derived(30.5);
  let clipPathTo: number = $derived(61 * (1 / currentSpaceScale.scale));
  let scaleFrom: number = $state(1.0);
  let scaleTo: number = $derived(2 * (1 / currentSpaceScale.scale));
  let spaceCoreOverlayRef: Option<HTMLElement> = $state(undefined);
  let centeredSpaceRef: Option<HTMLElement> = $state(undefined);
  let backgroundRef: Option<HTMLElement> = $state(undefined);
  const BACKGROUND_START_COLOR: string = "fcfcfc";
  const BACKGROUND_END_COLOR: string = "ffffff";

  export function animate() {
    if (centeredSpaceRef !== undefined) centeredSpaceRef.style.clipPath = `circle(${clipPathTo}rem)`;
    if (backgroundRef !== undefined) {
      backgroundRef.style.clipPath = `circle(${clipPathTo}rem)`;
      backgroundRef.style.backgroundColor = BACKGROUND_END_COLOR;
    }
    if (spaceCoreOverlayRef !== undefined) spaceCoreOverlayRef.style.scale = `${scaleTo}`;
  }
</script>

<div class="virtual-chunk" style="bottom: {virtualChunkLocation.y.coordinate}px; left: {virtualChunkLocation.x.coordinate}px; scale: {currentSpaceScale.scale};">
  <div class="expanding-space-wrapper">
    <div
      bind:this={spaceCoreOverlayRef}
      class="space-core-overlay"
      style="--scale-from: {scaleFrom}rem; --scale-to: {scaleTo};"></div>
    <div
      bind:this={centeredSpaceRef}
      class="centered-space"
      style="--from-clip-path: {clipPathFrom}rem; --to-clip-path: {clipPathTo}rem;">
      <Space space={nextSpace!} />
      <div
        bind:this={backgroundRef}
        class="background"
        style="--from-clip-path: {clipPathFrom}rem; --to-clip-path: {clipPathTo}rem; --bg-start-color: #{BACKGROUND_START_COLOR}; --bg-end-color: #{BACKGROUND_END_COLOR};"></div>
    </div>
  </div>
</div>

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
    transition: clip-path 0.2s linear;
    display: grid;
    place-content: center;
  }

  .background {
    width: 1000vmax;
    height: 1000vmax;
    clip-path: circle(var(--from-clip-path));
    background-color: var(--bg-start-color);
    transition: clip-path 0.2s linear, background-color 0.2s linear;
  }

  .space-core-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    translate: -50% -50%;
    width: 61rem;
    height: 61rem;
    box-shadow: 1px 2px 8px 0px rgba(0, 0, 0, 0.16) inset;
    border-radius: 50%;
    pointer-events: none;
    z-index: 2;
    scale: var(--scale-from);
    transition: scale 0.2s linear;
  }

  @keyframes scaleShadowOverlay {
    from {
      transform: scale(var(--scale-from));
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
      background-color: var(--bg-start-color);
    }
    to {
      background-color: var(--bg-end-color);
    }
  }
</style>