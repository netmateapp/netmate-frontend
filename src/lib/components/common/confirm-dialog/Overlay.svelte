<script lang="ts">
  let { zIndex = 1 }: { zIndex?: number } = $props();
</script>

<div class="overlay" style="z-index: {zIndex};"></div>

<style>
  .overlay {
    position: fixed;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.1);
  }
</style>