<script lang="ts">
  import { getToastData } from "./toast.svelte";
</script>

{#if getToastData().show}
  <span class="toast">{getToastData().text}</span>
{/if}

<style>
  .toast {
    position: fixed;
    left: 50%;
    transform: translate(-50%, 0%);
    padding: 0.25rem 0.5rem;
    border-radius: 0.5rem;
    background-color: var(--secondary-color);
    color: var(--dominant-color);
    font-family: var(--primary-font);
    font-size: 0.875rem;
  }
</style>
