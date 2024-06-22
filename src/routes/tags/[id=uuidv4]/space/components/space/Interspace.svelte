<script lang="ts">
  import Space from "./Space.svelte";
  import { Tag } from "$lib/scripts/domain/tag";
  import type { Option } from "$lib/option";
  import { VirtualCoordinate, VirtualLocation } from "../../scripts/coordinateSystem/virtualCoordinateSystem.svelte";
  import { CHUNK_SIDE_LENGTH, Chunk, ChunkRepository } from "../../scripts/chunk/chunk";
  import { TagSpace } from "../../scripts/space";
  import { MAX_SCALE, Scale } from "../../scripts/scale.svelte";
  import { SpaceCoreData } from "../../scripts/chunk/chunkContent";
  import { REAL_COORDINATE_SYSTEM_ORIGIN, RealLocation } from "../../scripts/coordinateSystem/realCoordinateSystem";
  import TransferAnimation from "./TransferAnimation.svelte";
  import type { SvelteComponent } from "svelte";
  import { afterNavigate, beforeNavigate, replaceState } from "$app/navigation";
  import { page } from "$app/stores";

  type Props = {
    tag: Tag;
  };

  let { tag }: Props = $props();

  // 遷移時は手動で変えているが、戻る/進むの際に変わらない問題
  let currentSpace: Option<TagSpace> = $state(undefined);

  let isUserTransferring: boolean = $state(false);

  // currentSpaceの更新と記録した座標の適用
  afterNavigate(() => {
    if (!isUserTransferring) {
      const state = $page.state as LastViewCenterLocation;
      if (state && typeof state.x === "number" && typeof state.y === "number") {
        const scale = currentSpace?.scale.reactiveValue() ?? new Scale(MAX_SCALE);
        currentSpace = new TagSpace(
          tag,
          new ChunkRepository(),
          VirtualLocation.of(
            VirtualCoordinate.of(state.x),
            VirtualCoordinate.of(state.y)
          ),
          scale
        );
      } else {
        currentSpace = new TagSpace(
          tag,
          new ChunkRepository(),
          VirtualLocation.of(
            VirtualCoordinate.of(CHUNK_SIDE_LENGTH / 2),
            VirtualCoordinate.of(CHUNK_SIDE_LENGTH / 2 + 328 - 208) // 1024 - 184 = 840, 840 - 512 = 328, 328 - (208)微調整分
          ),
          new Scale(MAX_SCALE)
        );
      }
    }
  });

  $effect(() => {
    console.log(tag.id.asHexadecimalRepresentation());
  });

  $effect(() => {
    document.addEventListener("keydown", (event) => {
      if (event.key === "/") console.log(currentSpace!.tag.id.asHexadecimalRepresentation());
    });
  });

  // 異なるページに移動する際の座標保存処理
  type LastViewCenterLocation = {
    x: number;
    y: number;
  };

  function saveLastViewCenterLocation(lastViewCenterLocation: VirtualLocation) {
    const serialized: LastViewCenterLocation = { x: lastViewCenterLocation.x.coordinate, y: lastViewCenterLocation.y.coordinate };
    replaceState("", serialized);
  }

  beforeNavigate(() => {
    saveLastViewCenterLocation(currentSpace!.viewCenterLocation.reactiveValue());
  });


  let nextSpace: Option<TagSpace> = $state(undefined);
  let nextSpaceInitialViewCenterLocation: VirtualLocation;

  // スペースコアによる遷移に関する処理
  function findClickedSpaceCoreChunk(tag: Tag): Option<Chunk> {
    for (var renderdChunk of currentSpace!.renderedChunks.reactiveValue()) {
      if (renderdChunk.content instanceof SpaceCoreData && renderdChunk.content.tag.equals(tag)) {
        return renderdChunk;
      }
    }
    return undefined;
  }

  $effect(() => {
    if (isUserTransferring || currentSpace === undefined || currentSpace.tag.equals(tag)) return;

    let spaceCoreChunk: Option<Chunk> = findClickedSpaceCoreChunk(tag);
    if (spaceCoreChunk === undefined) return;
          
    const viewCenter: VirtualLocation = currentSpace.viewCenterLocation.reactiveValue();
    const spaceCoreChunkCenterLocation: VirtualLocation = spaceCoreChunk.centerLocation();
    nextSpaceInitialViewCenterLocation = viewCenter.createOffsetLocation(
      VirtualCoordinate.of(-spaceCoreChunkCenterLocation.x.coordinate),
      VirtualCoordinate.of(-spaceCoreChunkCenterLocation.y.coordinate)
    );

    virtualChunkLocation = currentSpace.locationTransformer.transformToRealLocation(
      viewCenter,
      VirtualLocation.fromChunkLocation(spaceCoreChunk.location),
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
      let newViewCenter: VirtualLocation = nextSpace!.viewCenterLocation.reactiveValue().createOffsetLocation(
        nextSpaceInitialViewCenterLocation.x,
        nextSpaceInitialViewCenterLocation.y
      );

      nextSpace?.scale.update(currentSpace!.scale.reactiveValue());
      currentSpace = nextSpace!;
      currentSpace.viewCenterLocation.update(newViewCenter);

      isUserTransferring = false;
    }, 200);
  }
</script>

{#if currentSpace !== undefined}
  <Space space={currentSpace} />
{/if}
{#if isUserTransferring}
  <TransferAnimation bind:this={transferAnimation} currentSpaceScale={currentSpace!.scale.reactiveValue()} nextSpace={nextSpace!} {virtualChunkLocation} />
{/if}
