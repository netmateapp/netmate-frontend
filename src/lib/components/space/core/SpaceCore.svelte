<script lang="ts">
  let { apparentX, apparentY }: { apparentX: number, apparentY: number } = $props();
</script>

<div class="space-core" style="top: {apparentY}px; left: {apparentX}px;">
  <div class="shadow-overlay"></div>
  <slot></slot>
</div>

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