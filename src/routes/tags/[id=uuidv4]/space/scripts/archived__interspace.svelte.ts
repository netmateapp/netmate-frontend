import type { Option } from "$lib/option";
import type { Tag } from "$lib/scripts/domain/tag";
import type { Reactive } from "$lib/scripts/extension/reactivity";
import { CHUNK_SIDE_LENGTH, ChunkRepository, type Chunk } from "./chunk/chunk";
import { SpaceCoreData } from "./chunk/chunkContent";
import type { RealLocation } from "./coordinateSystem/realCoordinateSystem";
import { VirtualCoordinate, VirtualLocation } from "./coordinateSystem/virtualCoordinateSystem.svelte";
import { DEFAULT_SCALE, Scale } from "./scale.svelte";
import { TagSpace } from "./space";

const SPACE_CORE_SIZE = 976;

export class Interspace {
  public currentSpace = $state() as TagSpace;
  public transferring: Option<SpaceTransfer> = $state(undefined);

  constructor(initialSpace: TagSpace) {
    this.currentSpace = initialSpace;
  }

  isUserTrasnferring(): Reactive<boolean> {
    return this.transferring !== undefined;
  }

  startLiveTransferring(newTag: Reactive<Tag>) {
    if (this.isCurrentTag(newTag)) return;

    let chunk: Option<Chunk> = this.findRenderedSpaceCoreChunkBy(newTag);
    if (chunk === undefined) return;

    const currentViewCenter: VirtualLocation = this.currentSpace.viewCenterLocation.reactiveValue();
    const spaceCoreCenterLocation: VirtualLocation = chunk.centerLocation();
    const newViewCenterLocation = currentViewCenter.createOffsetLocation(
      VirtualCoordinate.of(-spaceCoreCenterLocation.x.coordinate),
      VirtualCoordinate.of(-spaceCoreCenterLocation.y.coordinate)
    );

    const virtualChunkCornerLocation: RealLocation = this.currentSpace.locationTransformer.transformToRealLocation(
      currentViewCenter,
      VirtualLocation.fromChunkLocation(chunk.location),
      this.currentSpace.viewportWidth.reactiveValue(),
      this.currentSpace.viewportHeight.reactiveValue(),
      this.currentSpace.scale.reactiveValue()
    );
    
    const transferSpace = new TagSpace(
      newTag,
      new ChunkRepository(),
      VirtualLocation.of(
        VirtualCoordinate.of(CHUNK_SIDE_LENGTH / 2),
        VirtualCoordinate.of(CHUNK_SIDE_LENGTH / 2)
      ),
      new Scale(DEFAULT_SCALE) // 2重にスケールが適用されるのを回避するため遷移中はデフォルト値
    );

    this.transferring = new SpaceTransfer(
      this,
      transferSpace,
      newViewCenterLocation,
      virtualChunkCornerLocation
    );
  }

  private isCurrentTag(tag: Tag) {
    return this.currentSpace.tag.id.asHexadecimalRepresentation() === tag.id.asHexadecimalRepresentation();
  }

  private findRenderedSpaceCoreChunkBy(tag: Tag): Option<Chunk> {
    for (var chunk of this.currentSpace.renderedChunks.reactiveValue()) {
      if (chunk.content instanceof SpaceCoreData) {
        if (chunk.content.tag.id.asHexadecimalRepresentation() === tag.id.asHexadecimalRepresentation()) {
          return chunk;
        }
      }
    }
    return undefined;
  }
}

export class Ref<T> {
  public value: Option<T> = undefined;

  ref(): T {
    return this.value!;
  }
}

export const TRANSFER_DURATION_MILLIS: number = 200;

export class SpaceTransfer {
  private readonly interspace: Interspace;
  public readonly transferSpace: TagSpace;
  public readonly newViewCenterLocation: VirtualLocation;
  public readonly virtualChunkCornerLocation: RealLocation;
  public readonly overlayRef = new Ref<HTMLElement>;
  public readonly spaceRef = new Ref<HTMLElement>;
  public readonly backgroundRef = new Ref<HTMLElement>;
  public animation: Option<TrasnferAnimation> = $state(undefined);

  constructor(interspace: Interspace, transferSpace: TagSpace, newViewCenterLocation: VirtualLocation, virtualChunkCornerLocation: RealLocation) {
    this.interspace = interspace;
    this.transferSpace = transferSpace;
    this.newViewCenterLocation = newViewCenterLocation;
    this.virtualChunkCornerLocation = virtualChunkCornerLocation;
  }

  transfer() {
    setTimeout(() => {
      this.animation = new TrasnferAnimation(
        this.interspace.currentSpace.scale.reactiveValue(),
        this.overlayRef.ref(),
        this.spaceRef.ref(),
        this.backgroundRef.ref()
      );
      this.animation.animate();
    }, 0);

    setTimeout(() => {
      this.animation = undefined;
      this.transferSpace.scale.update(this.interspace.currentSpace.scale.reactiveValue());
      this.interspace.currentSpace = this.transferSpace;
      this.interspace.currentSpace.viewCenterLocation.update(this.newViewCenterLocation);
    }, TRANSFER_DURATION_MILLIS);
  }
}

const SPACE_BACKGROUND_COLOR: string = "white";

export class TrasnferAnimation {
  private finalOverlayScale: number = $derived(0);
  private static readonly initialCircleRadius: number = SPACE_CORE_SIZE / 2;
  private finalCircleRadius: number = $derived(0);
  private readonly overlayRef: HTMLElement;
  private readonly spaceRef: HTMLElement;
  private readonly backgroundRef: HTMLElement;

  constructor(
    scale: Reactive<Scale>,
    overlayRef: HTMLElement,
    spaceRef: HTMLElement,
    backgroundRef: HTMLElement
  ) {
    this.finalOverlayScale = 2 * (1 / scale.scale);
    this.finalCircleRadius = SPACE_CORE_SIZE * (1 / scale.scale);
    this.overlayRef = overlayRef;
    this.spaceRef = spaceRef;
    this.backgroundRef = backgroundRef;
  }

  animate() {
    this.overlayRef.style.scale = `${this.finalOverlayScale}`;
    this.spaceRef.style.clipPath = `circle(${this.finalCircleRadius}px)`;
    this.backgroundRef.style.clipPath = `circle(${this.finalCircleRadius}px)`;
    this.backgroundRef.style.backgroundColor = SPACE_BACKGROUND_COLOR;
  }

  getFinalOverlayScale(): Reactive<number> {
    return this.finalOverlayScale;
  }

  getInitialCircleRadius(): Reactive<number> {
    return TrasnferAnimation.initialCircleRadius;
  }

  getFinalCircleRadius(): Reactive<number> {
    return this.finalCircleRadius;
  }
}
