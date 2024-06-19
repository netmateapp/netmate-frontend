<script lang="ts">
  import Space from "./Space.svelte";
  import { Tag } from "$lib/scripts/domain/tag";
  import type { Option } from "$lib/option";
  import { VirtualCoordinate, VirtualLocation } from "../scripts/coordinateSystem/virtualCoordinateSystem.svelte";
  import { CHUNK_SIDE_LENGTH, Chunk, ChunkRepository } from "../scripts/chunk/chunk";
  import { TagSpace } from "../scripts/space";
  import { MAX_SCALE, Scale } from "../scripts/scale.svelte";
  import { SpaceCoreData } from "../scripts/chunk/chunkContent";
  import { REAL_COORDINATE_SYSTEM_ORIGIN, RealLocation } from "../scripts/coordinateSystem/realCoordinateSystem";
  import { SessionMemory } from "$lib/scripts/memory/sessionMemory";
  import { SpaceHistory } from "../scripts/cache/spaceHisotry";
    import TransferAnimation from "./TransferAnimation.svelte";
    import type { SvelteComponent } from "svelte";

  type Props = {
    tag: Tag;
  };

  let { tag }: Props = $props();

  const history = SessionMemory.of("space-tag-history", new SpaceHistory());

  $effect(() => {
    return history.initialize();
  });

  let isUserTransferring: boolean = $state(false);

  let currentSpace: TagSpace = $state(
    new TagSpace(
      tag,
      new ChunkRepository(),
      VirtualLocation.of(
        VirtualCoordinate.of(CHUNK_SIDE_LENGTH / 2),
        VirtualCoordinate.of(CHUNK_SIDE_LENGTH / 2 + CHUNK_SIDE_LENGTH / 4)
      ),
      new Scale(MAX_SCALE)
    )
  );
  let transferSpace: Option<TagSpace> = $state(undefined);
  let transferSpaceViewCenterLocation: VirtualLocation;

  function findClickedSpaceCoreChunk(tag: Tag): Option<Chunk> {
    for (var renderdChunk of currentSpace.renderedChunks.reactiveValue()) {
      if (renderdChunk.content instanceof SpaceCoreData && renderdChunk.content.tag.equals(tag)) {
        return renderdChunk;
      }
    }
    return undefined;
  }

  $effect(() => {
    if (isUserTransferring || currentSpace.tag.equals(tag)) return;

    let spaceCoreChunk: Option<Chunk> = findClickedSpaceCoreChunk(tag);
      if (spaceCoreChunk === undefined) return;
      
      const viewCenter = currentSpace.viewCenterLocation.reactiveValue();
      const spaceCoreChunkCenterLocation: VirtualLocation = spaceCoreChunk.centerLocation();
      transferSpaceViewCenterLocation = viewCenter.createOffsetLocation(
        VirtualCoordinate.of(-spaceCoreChunkCenterLocation.x.coordinate),
        VirtualCoordinate.of(-spaceCoreChunkCenterLocation.y.coordinate)
      );

      virtualChunkLocation = currentSpace.locationTransformer.transformToRealLocation(
        currentSpace.viewCenterLocation.reactiveValue(),
        VirtualLocation.fromChunkLocation(spaceCoreChunk.location),
        currentSpace.viewportWidth.reactiveValue(),
        currentSpace.viewportHeight.reactiveValue(),
        currentSpace.scale.reactiveValue()
      );

      transferSpace = new TagSpace(
        tag,
        new ChunkRepository(),
        VirtualLocation.of(VirtualCoordinate.of(CHUNK_SIDE_LENGTH / 2), VirtualCoordinate.of(CHUNK_SIDE_LENGTH / 2)),
        new Scale(MAX_SCALE)
      );

      startTransition();
  });

  let virtualChunkLocation: RealLocation = REAL_COORDINATE_SYSTEM_ORIGIN;
  let transferAnimation: Option<SvelteComponent> = $state(undefined);
  
  function startTransition() {
    isUserTransferring = true;

    setTimeout(() => {
      transferAnimation?.animate();
    }, 0);

    setTimeout(() => {
      transferSpace?.scale.update(currentSpace.scale.reactiveValue());
      currentSpace = transferSpace!;
      const viewCenter = currentSpace.viewCenterLocation.reactiveValue().createOffsetLocation(
        transferSpaceViewCenterLocation.x,
        transferSpaceViewCenterLocation.y
      );
      currentSpace.viewCenterLocation.update(viewCenter);

      isUserTransferring = false;
    }, 200);
  }
</script>

<Space space={currentSpace} />
{#if isUserTransferring}
  <TransferAnimation bind:this={transferAnimation} currentSpaceScale={currentSpace.scale.reactiveValue()} nextSpace={transferSpace!} {virtualChunkLocation} />
{/if}
