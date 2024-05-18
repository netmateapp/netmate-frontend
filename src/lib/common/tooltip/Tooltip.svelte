<script lang="ts">
  import { getTooltipData } from "./useTooltip.svelte.js";
  let tooltipElement: HTMLElement | null;
</script>

{#if getTooltipData().show}
  <div bind:this={tooltipElement} class="tooltip"  style="left: {getTooltipData().x - (tooltipElement?.offsetWidth ?? 0) / 2}px; top: {getTooltipData().y + getTooltipData().targetElementHeight + 2}px;">
    <span class="text">{getTooltipData().text}</span>
  </div>
{/if}


<style>
  .tooltip {
    position: fixed;
    border-radius: 0.375rem;
    background: rgba(0, 0, 0, 0.40);
    backdrop-filter: blur(1px);
    display: flex;
    padding: 0.125rem 0.375rem;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    z-index: 1000;
  }

  .text {
    color: var(--dominant-color);
    font-family: var(--primary-font);
    font-size: 0.75rem;
    line-height: 1rem;
    white-space: nowrap;
  }
</style>
