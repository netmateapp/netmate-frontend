<svelte:options customElement={{
  tag: "image-slide",
  shadow: "none",
  props: {
    imagesPaths: { attribute: "images-paths", type: "Array" }
  }
}}/>

<script lang="ts">
  let { imagesPaths }: { imagesPaths: string[] } = $props();

  let currentPageNumber = $state(0);

  function isCurrentPageNumber(pageNumber: number) {
    return pageNumber === currentPageNumber;
  }
</script>

<div class="slide-editor">
  <div class="edit-slide-buttons">
    <div class="edit-slide-button">
      <svg class="edit-slide-button-icon">
        <use href="/src/lib/assets/common/add.svg#add"></use>
      </svg>
    </div>
    <div class="edit-slide-button">
      <svg class="edit-slide-button-icon">
        <use href="/src/lib/assets/common/remove.svg#remove"></use>
      </svg>
    </div>
  </div>
  <div class="slide">
    {#each imagesPaths as imagePath}
      <img class="image" src={imagePath} />
    {/each}
  </div>
  <div class="dots-indicator">
    {#each imagesPaths as _, pageNumber }
      <div class="dot" class:current-page={isCurrentPageNumber(pageNumber)}></div>
    {/each}
  </div>
</div>

<style>
  .slide-editor {
    display: flex;
flex-direction: column;
align-items: center;
gap: 0.5rem;
align-self: stretch;
  }

  .edit-slide-buttons {
    position: absolute;
right: 0rem;
    display: flex;
flex-direction: column;
align-items: flex-start;
gap: 0.5rem;
  }

  .edit-slide-button {
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
width: 3rem;
height: 3rem;
padding: 0.5rem;
justify-content: center;
align-items: center;
  }

  .edit-slide-button:hover {
    background-color: rgba(0, 0, 0, 0.5);
  }

  .edit-slide-button-icon {
    width: 2rem;
height: 2rem;
fill: var(--dominant-color);
  }

  .slide {
    display: flex;
max-height: 28.125rem;
flex-direction: column;
align-items: center;
gap: 0.5rem;
align-self: stretch;
  }

  .image {
    height: 28.125rem;
align-self: stretch;
  }

  .dots-indicator {
    display: flex;
align-items: flex-start;
gap: 1rem;
  }

  .dot {
    width: 0.5rem;
height: 0.5rem;
border-radius: 50%;
background-color: var(--light-gray);
  }

  .current-page {
    background-color: var(--dark-gray);
  }
</style>