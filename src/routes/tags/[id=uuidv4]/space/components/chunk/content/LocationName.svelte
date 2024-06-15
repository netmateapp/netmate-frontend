<script lang="ts">
  import { Tag } from "$lib/scripts/domain/tag";
  import type { MaybeHTMLElement } from "$lib/types";
  import { RealLocation } from "../../../scripts/coordinateSystem/realCoordinateSystem";

  type Props = {
    tag: Tag;
    relativeLocation: RealLocation;
  };

  let { tag, relativeLocation }: Props = $props();

  let locationNameElementRef: MaybeHTMLElement;
  const LOCATION_NAME_ELEMENT_MIN_HEIGHT = 42;

  export function locationNameElementHeight(): number {
    return locationNameElementRef?.getBoundingClientRect().height ?? LOCATION_NAME_ELEMENT_MIN_HEIGHT;
  }
</script>

<div
  class="location-wrapper"
  style="top: {relativeLocation.x.coordinate}px; left: {relativeLocation.y.coordinate}px;">
  <a
    href="https://netmate.app/tags/{tag.id.asHexadecimalRepresentation()}/space"
    bind:this={locationNameElementRef}
    class="location-name">
    {tag.name.name}
  </a>
</div>

<style>
  .location-wrapper {
    position: absolute;
    transform: translate(-50%, 0);
    width: 45rem;
    display: flex;
    justify-content: center;
  }

  .location-name {
    max-width: 45rem;
    color: var(--accent-color);
    text-align: center;
    font-family: var(--primary-font);
    font-size: 2.25rem;
    line-height: 2.625rem;
    word-break: break-all;
    z-index: 1;
    cursor: pointer;
  }

  .location-name:hover {
    text-decoration: underline 2px;
  }
</style>