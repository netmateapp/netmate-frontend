<script lang="ts">
  export let text: string;
  export let x: number, y: number;
  export let targetElementHeight: number;
  let tooltipElement: HTMLElement | null;

  $: if (tooltipElement) {
    tooltipElement.style.left = `${x - tooltipElement.offsetWidth / 2}px`; // X座標を中心に調整
    tooltipElement.style.top = `${y + targetElementHeight}px`; // Y座標をそのまま使用
    console.log("Tooltip.s: " + x + ", " + y + ", " + targetElementHeight)
  }
</script>

<div bind:this={tooltipElement} class="tooltip">
  <span class="text">{text}</span>
</div>

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
    pointer-events: none;
  }

  .text {
    color: var(--dominant-color);
    font-family: var(--primary-font);
    font-size: 0.75rem;
    font-weight: 400;
    line-height: 1rem;
  }
</style>
