<svelte:options
  customElement={{
    tag: "image-slider",
    shadow: "none",
    props: {
      imagesPaths: { attribute: "images-paths", type: "Array" },
    },
  }}
/>

<script lang="ts">
  let { imagesPaths }: { imagesPaths: string[] } = $props();
  let slidesRefs: HTMLElement[] = [];

  let currentIndex = $state(0);

  let slideCount = $derived(imagesPaths.length);
  let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID: number;

  function isCurrentPageNumber(pageNumber: number) {
    return pageNumber === currentIndex;
  }

  // スライド関連
  function touchStart(index: number) {
      return function (event: TouchEvent | MouseEvent) {
        currentIndex = index;
        startPos = getPositionX(event);
        isDragging = true;

        animationID = requestAnimationFrame(animation);
        //slider.classList.add("grabbing");
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

      //slider.classList.remove("grabbing");
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

    function setSliderPosition() {
      const slider = document.querySelector(".slider") as HTMLElement;
      slider.style.transform = `translateX(${currentTranslate}px)`;
    }

    function setPositionByIndex() {
      //console.log(sliderEditorWidth());
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

  /*$effect(() => {
    const slider = document.querySelector(".slider") as HTMLElement;
    const slides = document.querySelectorAll(
      ".slide",
    ) as NodeListOf<HTMLElement>;
    const slideCount = slides.length;


    slides.forEach((slide, index) => {
      const img = slide as HTMLImageElement;
      img.addEventListener("dragstart", (e) => e.preventDefault());

      slide.addEventListener("touchstart", touchStart(index));
      slide.addEventListener("touchend", touchEnd);
      slide.addEventListener("touchmove", touchMove);

      slide.addEventListener("mousedown", touchStart(index));
      slide.addEventListener("mouseup", touchEnd);
      slide.addEventListener("mouseleave", touchEnd);
      slide.addEventListener("mousemove", touchMove);
    });


  });*/



  //画像追加ボタン関連
  function onClickAddImageButton() {
    document.getElementById("imageInput")?.click();
  }

  function onChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      if (file) {
        const filePath = URL.createObjectURL(file);
        console.log("Selected file path:", filePath);
        imagesPaths.push(filePath);
      }
      console.log("Selected file:", file.name);
      console.log(file);
    }
  }

  //画像削除ボタン関連
  function onClickRemoveImageButton() {
  }
</script>

<div bind:this={sliderEditorRef} class="slider-editor">
  <div class="edit-slider-buttons">
    <button class="edit-slider-button" onclick={onClickAddImageButton}>
      <svg class="edit-slider-button-icon">
        <use href="/src/lib/assets/common/add.svg#add"></use>
      </svg>
    </button>
    <input
      type="file"
      id="imageInput"
      accept=".jpg, .jpeg, .png, .webp"
      style="display: none;"
      onchange={onChange}
    />
    <button class="edit-slider-button">
      <svg class="edit-slider-button-icon">
        <use href="/src/lib/assets/common/remove.svg#remove"></use>
      </svg>
    </button>
  </div>
  <div class="slider">
    {#each imagesPaths as imagePath, index}
      <img
        bind:this={slidesRefs[index]}
        class="slide"
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
    {/each}
  </div>
  <div class="dots-indicator">
    {#each imagesPaths as _, pageNumber}
      <div
        class="dot"
        class:current-page={isCurrentPageNumber(pageNumber)}
      ></div>
    {/each}
  </div>
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
  }

  .slider {
    max-height: 384px;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    align-self: stretch;
    transition: transform 0.5s ease;
  }

  .slider:hover {
    cursor: pointer;
  }

  .slide {
    width: 100%;
    max-width: 61.625rem;
    align-self: stretch;
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
    width: 3rem;
    height: 3rem;
    padding: 0.5rem;
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
