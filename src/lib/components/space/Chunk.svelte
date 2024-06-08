<script lang="ts">
  let { apparentX, apparentY }: { apparentX: number, apparentY: number } = $props();
</script>

<div class="chunk" style="bottom: {apparentY}px; left: {apparentX}px;">
  <slot></slot>
</div>

<style>
  .chunk {
    position: fixed;
    width: 64rem;
    height: 64rem;
  }
</style>