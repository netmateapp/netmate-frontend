<svelte:options
  customElement={{
    tag: "image-slider",
    shadow: "none",
    props: {
      imagesPaths: { attribute: "images-paths", type: "Array" }
    },
  }}
/>

<script lang="ts">
    import { toast } from "../toast/useToast.svelte";
    import { MEDIA_COUNT, MAX_MEDIA_COUNT } from "./ShareEditor.svelte";
    import { _ } from "./editor.svelte";
    import { dispatchDeleteSlideCommand } from "./lexical-editor";
    import { IDENTITY_ATTRIBUTE } from "./slide-plugin.svelte";

    let { imagesPaths }: { imagesPaths: string[] } = $props();

    let currentIndex = $state(0);

    function isCurrentPageNumber(pageNumber: number) {
      return pageNumber === currentIndex;
    }

  // スライド関連
  let slideCount = $derived(imagesPaths.length);
  let slidesRefs: HTMLElement[] = [];
  let isDragging = false;
  let startPos = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let animationID: number;

  function touchStart(index: number) {
    return function (event: TouchEvent | MouseEvent) {
      currentIndex = index;
      startPos = getPositionX(event);
      isDragging = true;

      animationID = requestAnimationFrame(animation);
    };
  }

  function touchEnd() {
    isDragging = false;
    cancelAnimationFrame(animationID);

    const movedBy = currentTranslate - prevTranslate;

    if (movedBy < -100 && currentIndex < slideCount - 1) {
      currentIndex += 1;
    }

    if (movedBy > 100 && currentIndex > 0) {
      currentIndex -= 1;
    }

    setPositionByIndex();
  }

  function touchMove(event: TouchEvent | MouseEvent) {
    if (isDragging) {
      const currentPosition = getPositionX(event);
      currentTranslate = prevTranslate + currentPosition - startPos;
    }
  }

  function getPositionX(event: TouchEvent | MouseEvent): number {
    return event.type.includes("mouse")
      ? (event as MouseEvent).pageX
      : (event as TouchEvent).touches[0].clientX;
  }

  function animation() {
    setSliderPosition();
    if (isDragging) requestAnimationFrame(animation);
  }

  let sliderRef: MaybeHTMLElement = $state(null);
  function setSliderPosition() {
    if (sliderRef) sliderRef.style.transform = `translateX(${currentTranslate}px)`;
  }

  function setPositionByIndex() {
    currentTranslate = currentIndex * -sliderEditorWidth();
    prevTranslate = currentTranslate;
    setSliderPosition();
  }

  const MAX_SLIDER_WIDTH = 986;
  let sliderEditorRef: MaybeHTMLElement = $state(null);
  function sliderEditorWidth(): number {
    return sliderEditorRef
      ? sliderEditorRef.getBoundingClientRect().width
      : MAX_SLIDER_WIDTH;
  }

  // インジケータ関連
  function shouldDisplayDotsIndicator(): boolean {
    return imagesPaths.length >= 2;
  }

  //画像追加ボタン関連
  function canAddImage(): boolean {
    return MEDIA_COUNT.reactiveValue < MAX_MEDIA_COUNT;
  }

  let imageInputRef: MaybeHTMLElement = $state(null);
  function onClickAddImageButton() {
    imageInputRef?.click();
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
      }
      MEDIA_COUNT.reactiveValue += count;
    } else {
      toast(_("failed-to-add-media", { limit: MAX_MEDIA_COUNT }));
    }
  }

  // 画像削除ボタン関連
  function onClickRemoveImageButton() {
    const imagesCount = imagesPaths.length;
    if (imagesCount == 1) {
      const key = sliderEditorRef?.parentElement?.getAttribute(IDENTITY_ATTRIBUTE);
      if (key) dispatchDeleteSlideCommand(key);
    } else {
      if (currentIndex == (imagesCount - 1)) {
        currentIndex--;
        imagesPaths = imagesPaths.filter((v, index, a) => index != (currentIndex + 1));
        setPositionByIndex();
        MEDIA_COUNT.reactiveValue--;
      } else {
        imagesPaths = imagesPaths.filter((v, index, a) => index != currentIndex);
        MEDIA_COUNT.reactiveValue--;
      }
    }
  }
</script>

<div bind:this={sliderEditorRef} class="slider-editor">
  <div class="edit-slider-buttons">
    <button
      class="edit-slider-button"
      onclick={onClickAddImageButton}
      disabled={!canAddImage()}>
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
      onclick={onClickRemoveImageButton}>
      <svg class="edit-slider-button-icon">
        <use href="/src/lib/assets/common/remove.svg#remove"></use>
      </svg>
    </button>
  </div>
  <div bind:this={sliderRef} class="slider">
    {#each imagesPaths as imagePath, index}
      <div class="slide">
        <img
          bind:this={slidesRefs[index]}
          src={imagePath}
          ondragstart={(e) => e.preventDefault()}
          ontouchstart={touchStart(index)}
          ontouchend={touchEnd}
          ontouchmove={touchMove}
          onmousedown={touchStart(index)}
          onmouseup={touchEnd}
          onmouseleave={touchEnd}
          onmousemove={touchMove}
        />
      </div>
    {/each}
  </div>
  {#if shouldDisplayDotsIndicator()}
    <div class="dots-indicator">
      {#each imagesPaths as _, pageNumber}
        <div
          class="dot"
          class:current-page={isCurrentPageNumber(pageNumber)}
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
  }

  .edit-slider-button:hover {
    background-color: rgba(0, 0, 0, 0.5);
  }

  .edit-slider-button-icon {
    width: 2rem;
    height: 2rem;
    fill: var(--dominant-color);
  }
</style>
