<script lang="ts">
  let { apparentX, apparentY, scale }: { apparentX: number, apparentY: number, scale: number } = $props();
</script>

<div class="chunk" style="bottom: {apparentY}px; left: {apparentX}px; scale: {scale};">
  <slot></slot>
</div>

<style>
  .chunk {
    position: fixed;
    width: 64rem;
    height: 64rem;
  }
</style>