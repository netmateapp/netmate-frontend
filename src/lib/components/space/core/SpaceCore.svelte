<script lang="ts">
    import type { Uuid4 } from "$lib/uuid";

  let { tagId, apparentX, apparentY }: { tagId: Uuid4, apparentX: number, apparentY: number } = $props();
</script>

<a href="https://netmate.app/tags/{tagId.asHexadecimalRepresentation()}/space" class="space-core" style="top: {apparentY}px; left: {apparentX}px;">
  <div class="shadow-overlay"></div>
  <slot></slot>
</a>

<style>
  .space-core {
    position: absolute;
    width: 61rem;
    height: 61rem;
    flex-shrink: 0;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.01);
    overflow: hidden;
    cursor: pointer;
  }

  .shadow-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    box-shadow: 1px 2px 8px 0px rgba(0, 0, 0, 0.16) inset;
    z-index: 1;
    pointer-events: none;
  }
</style>