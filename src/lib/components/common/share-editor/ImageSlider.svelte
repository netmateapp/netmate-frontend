<svelte:options
  customElement={{
    tag: "image-slider",
    shadow: "none",
    props: {
      imagesPaths: { attribute: "images-paths", type: "Array" },
      nodeKey: { attribute: "node-key", type: "String" }
    },
  }}
/>

<script lang="ts">
  import { toast } from "../toast/useToast.svelte";
  import { MEDIA_COUNT, MAX_MEDIA_COUNT } from "./ShareEditor.svelte";
  import { _ } from "./editor.svelte";
  import { dispatchDeleteSlideCommand } from "./lexical-editor";
  import { IDENTITY_ATTRIBUTE, IMAGE_SLIDERS_KEYS_TO_IMAGE_SLIDER_DATA } from "./image-slide-plugin.svelte";
  import { tooltip } from "../tooltip/useTooltip.svelte";
  import type { MaybeHTMLInputElement, InteractEvent } from "$lib/types";
  import { ImageSliderController } from "$lib/scripts/domain/imageSlide.svelte";
  import { NetmateImageId } from "$lib/scripts/domain/share";

  // ※ `imagesPaths` のリアクティブ性は深くない
  let { imagesPaths, nodeKey }: { imagesPaths: string[], nodeKey: string } = $props();

  function mapToIds(paths: string[]): NetmateImageId[] {
    return paths.map(source => new NetmateImageId(source));
  }

  // スライド関連
  const imageSliderController = new ImageSliderController();

  $effect(() => {
    imageSliderController.imagePaths = mapToIds(imagesPaths);
  });

  //画像追加ボタン関連
  function canAddImage(): boolean {
    return MEDIA_COUNT.reactiveValue < MAX_MEDIA_COUNT;
  }

  let imageInputRef: MaybeHTMLInputElement = $state(null);
  function onClickAddImageButton() {
    imageInputRef?.click();

    // 1度目と2度目でvalueが同じであると、onchangeが発火しないのでクリアする
    if (imageInputRef) imageInputRef.value = "";
  }

  function onInputImageFiles(event: Event) {
    const files = (event.target as HTMLInputElement)?.files;
    if (!files) return;

    const count = files.length;
    if (count == 0) return;
    
    if (count <= (MAX_MEDIA_COUNT - MEDIA_COUNT.reactiveValue)) {
      for (var file of files) {
        const filePath = URL.createObjectURL(file);
        imagesPaths.push(filePath);

        // この配列のリアクティブは深くないので、代入で反応させる
        imagesPaths = imagesPaths.slice();
      }
      MEDIA_COUNT.reactiveValue += count;
      const sliderData = IMAGE_SLIDERS_KEYS_TO_IMAGE_SLIDER_DATA.get(nodeKey);
      if (sliderData) sliderData.imagesPaths = imagesPaths.slice().map(source => new NetmateImageId(source));
    } else {
      toast(_("failed-to-add-media", { limit: MAX_MEDIA_COUNT }));
    }
  }

  // 画像削除ボタン関連
  function onClickRemoveImageButton(event: InteractEvent) {
    const imagesCount = imagesPaths.length;
    if (imagesCount == 1) {
      const key = imageSliderController.sliderEditorRef?.parentElement?.getAttribute(IDENTITY_ATTRIBUTE);
      if (key) dispatchDeleteSlideCommand(key);
      event.stopPropagation();
    } else {
      if (imageSliderController.currentIndex == (imagesCount - 1)) {
        imageSliderController.currentIndex--;
        imagesPaths = imagesPaths.filter((v, index, a) => index != (imageSliderController.currentIndex + 1));
        imageSliderController.setPositionByIndex();
      } else {
        imagesPaths = imagesPaths.filter((v, index, a) => index != imageSliderController.currentIndex);
      }
      MEDIA_COUNT.reactiveValue--;
      const sliderData = IMAGE_SLIDERS_KEYS_TO_IMAGE_SLIDER_DATA.get(nodeKey);
      if (sliderData) sliderData.imagesPaths = imagesPaths.slice().map(source => new NetmateImageId(source));
    }
  }
</script>

<div bind:this={imageSliderController.sliderEditorRef} class="slider-editor">
  <div class="edit-slider-buttons">
    <button
      class="edit-slider-button"
      onclick={onClickAddImageButton}
      disabled={!canAddImage()}
      use:tooltip={_("add-image")}>
      <svg class="edit-slider-button-icon">
        <use href="/src/lib/assets/common/add.svg#add"></use>
      </svg>
    </button>
    <input
      bind:this={imageInputRef}
      type="file"
      accept=".jpg, .jpeg, .png, .webp"
      style="display: none;"
      multiple
      onchange={onInputImageFiles} />
    <button
      class="edit-slider-button"
      onclick={onClickRemoveImageButton}
      use:tooltip={_("remove-image")}>
      <svg class="edit-slider-button-icon">
        <use href="/src/lib/assets/common/remove.svg#remove"></use>
      </svg>
    </button>
  </div>
  <div bind:this={imageSliderController.sliderRef} class="slider">
    {#each imagesPaths as imagePath, index}
      <div class="slide">
        <img
          src={imagePath}
          ondragstart={(e) => e.preventDefault()}
          ontouchstart={(event) => imageSliderController.touchStart(event, index)}
          ontouchend={() => imageSliderController.touchEnd()}
          ontouchmove={(event) => imageSliderController.touchMove(event)}
          onmousedown={(event) => imageSliderController.touchStart(event, index)}
          onmouseup={() => imageSliderController.touchEnd()}
          onmouseleave={() => imageSliderController.touchEnd()}
          onmousemove={(event) => imageSliderController.touchMove(event)}
        />
      </div>
    {/each}
  </div>
  {#if imageSliderController.shouldDisplayDotsIndicator()}
    <div class="dots-indicator">
      {#each imagesPaths as _, pageNumber}
        <div
          class="dot"
          class:current-page={imageSliderController.isCurrentPageNumber(pageNumber)}
        ></div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .slider-editor {
    width: 100%;
    max-width: 61.625rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    align-self: stretch;
    overflow-x: hidden;
  }

  .slider {
    height: 85vh;
    display: flex;
    flex-direction: row;
    align-items: center;
    align-self: stretch;
    transition: transform 0.5s ease;
  }

  .slider:hover {
    cursor: pointer;
  }

  .slide {
    width: 61.625rem;
    height: 85vh;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    align-self: stretch;
  }

  .slide img {
    height: 100%;
    max-height: 85vh;
    border-radius: 1rem;
    object-fit: contain;
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

  .edit-slider-buttons {
    position: absolute;
    right: 0rem;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    z-index: 1;
  }

  .edit-slider-button {
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    width: 2.75rem;
    height: 2.75rem;
    padding: 0.375rem;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }

  .edit-slider-button:disabled {
    background-color: rgba(0, 0, 0, 0.5);
    cursor: default;
  }

  .edit-slider-button:not(:disabled):hover {
    background-color: rgba(0, 0, 0, 0.5);
  }

  .edit-slider-button-icon {
    width: 2rem;
    height: 2rem;
    fill: var(--dominant-color);
  }
</style>
