<script lang="ts">
  let buttonRef: MaybeHTMLElement = $state(null);

  export function contains(element: Element): boolean {
    return buttonRef?.contains(element) ?? false;
  }
</script>

<button bind:this={buttonRef} class="open-share-editor-button">
  <svg class="open-share-editor-button-icon">
    <use href="/src/lib/assets/common/add_300.svg#add_300"></use>
  </svg>
</button>

<style>
  .open-share-editor-button {
    position: fixed;
    bottom: 0.5rem;
    right: 1rem;
    width: 3.5rem;
    height: 3.5rem;
    padding: 0.625rem;
    border-radius: 50%;
    background-color: var(--secondary-color);
    box-shadow: var(--soft-shadow);
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }

  .open-share-editor-button:hover {
    background-color: var(--secondary-color-hover);
  }

  .open-share-editor-button-icon {
    width: 2.25rem;
    height: 2.25rem;
    fill: var(--dominant-color);
  }
</style>
